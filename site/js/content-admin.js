let allItems = [];

const urlParams = new URLSearchParams(window.location.search);
const contentType = urlParams.get("type");

const CONTENT_PERMISSION_MAP = {
  news: "manage_news",
  blogs: "manage_pages",
  posts: "manage_pages",
  projects: "manage_projects",
  programs: "manage_programs"
};

const currentUser = AuthAPI.requirePermission(CONTENT_PERMISSION_MAP[contentType], "./dashboard.html");

const config = CONTENT_TYPES[contentType];

let currentEditId = null;
let base64ImageString = "";

(function init() {
  if (!currentUser) return;

  // Neutralize any hover/active transform or transition on action buttons
  // that could shift them under the cursor between mousedown and mouseup —
  // that mismatch silently kills the native click event.
  const styleOverride = document.createElement("style");
  styleOverride.textContent = `
    .action-btn, .action-btn:hover, .action-btn:active, .action-btn:focus {
      transform: none !important;
      transition: none !important;
      scale: 1 !important;
    }
  `;
  document.head.appendChild(styleOverride);

  if (!config) {
    document.querySelector("main").innerHTML = `<p style="padding:40px; text-align:center;">Unknown content type. <a href="dashboard.html">Return to dashboard</a>.</p>`;
    return;
  }

  document.title = `${config.label} | Human Appeal Pakistan Admin`;
  document.getElementById("section-heading").innerText = `Manage ${config.label}`;
  document.getElementById("btn-add-label").innerText = `Add New ${config.label.replace(/s$/, "")}`;
  document.getElementById("modal-title").innerText = `Add New ${config.label.replace(/s$/, "")}`;
  document.getElementById("location-group").style.display = config.fields.includes("location") ? "block" : "none";

  renderAdminSidebar(currentUser, `content.html?type=${contentType}`);

  document.getElementById("search-icon-holder").innerHTML = window.getIconSvg("search");
  document.getElementById("plus-icon-holder").innerHTML = window.getIconSvg("plus", "#FFFFFF");

  populateCategorySelects();
  refresh();

  document.getElementById("search-input").addEventListener("input", renderTable);
  document.getElementById("filter-category").addEventListener("change", renderTable);
  document.getElementById("filter-status").addEventListener("change", renderTable);
  document.getElementById("btn-add-item").addEventListener("click", () => openModal());
  document.getElementById("modal-close-x").addEventListener("click", closeModal);
  document.getElementById("btn-cancel-form").addEventListener("click", closeModal);
  document.getElementById("item-form").addEventListener("submit", handleSubmit);

  // Delegated handler for edit/delete buttons — more robust than inline
  // onclick, and only needs to be attached once instead of on every render.
  document.getElementById("table-body").addEventListener("click", (e) => {
    const btn = e.target.closest(".action-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "edit") editItem(id);
    if (btn.dataset.action === "delete") deleteItem(id);
  });

  const coverUrlInput = document.getElementById("form-cover-url");
  const fileInput = document.getElementById("form-cover-file");
  const previewImg = document.getElementById("preview-img");

  coverUrlInput.addEventListener("input", (e) => {
    if (e.target.value) {
      previewImg.src = e.target.value;
      base64ImageString = "";
      fileInput.value = "";
    }
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      base64ImageString = ev.target.result;
      previewImg.src = base64ImageString;
      coverUrlInput.value = "";
    };
    reader.readAsDataURL(file);
  });
})();

function populateCategorySelects() {
  const filterSelect = document.getElementById("filter-category");
  const formSelect = document.getElementById("form-category");
  filterSelect.innerHTML = `<option value="all">All Categories</option>`;
  formSelect.innerHTML = `<option value="" disabled selected>Select Category</option>`;
  config.categories.forEach(cat => {
    filterSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    formSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

async function refresh() {
  allItems = await CollectionAPI.list(config.storageKey);
  renderMetrics();
  renderTable();
}

function renderMetrics() {
  const total = allItems.length;
  const published = allItems.filter(i => i.status === "published").length;
  const drafts = total - published;
  document.getElementById("metrics-grid").innerHTML = `
    <div class="metric-card"><div><div class="metric-value">${total}</div><div class="metric-label">Total ${config.label}</div></div></div>
    <div class="metric-card"><div><div class="metric-value" style="color:var(--ha-green);">${published}</div><div class="metric-label">Published</div></div></div>
    <div class="metric-card"><div><div class="metric-value" style="color:var(--ha-orange);">${drafts}</div><div class="metric-label">Drafts</div></div></div>
  `;
}

function renderTable() {
  const searchQuery = document.getElementById("search-input").value.toLowerCase();
  const categoryFilter = document.getElementById("filter-category").value;
  const statusFilter = document.getElementById("filter-status").value;

  let items = [...allItems];
  if (searchQuery) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(searchQuery) ||
      (i.excerpt || "").toLowerCase().includes(searchQuery) ||
      (i.author || "").toLowerCase().includes(searchQuery)
    );
  }
  if (categoryFilter && categoryFilter !== "all") items = items.filter(i => i.category === categoryFilter);
  if (statusFilter !== "all") items = items.filter(i => i.status === statusFilter);

  const tbody = document.getElementById("table-body");
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No matching ${config.label.toLowerCase()} found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td><strong>${item.title}</strong></td>
      <td>${item.category || "—"}</td>
      <td>${item.author || "—"}</td>
      <td>${new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
      <td><span class="status-badge status-${item.status}">${item.status}</span></td>
      <td class="actions-cell">
        <button class="action-btn edit" data-action="edit" data-id="${item.id}" title="Edit">${window.getIconSvg("edit", "var(--ha-purple)")}</button>
        <button class="action-btn delete" data-action="delete" data-id="${item.id}" title="Delete">${window.getIconSvg("trash", "var(--ha-red)")}</button>
      </td>
    </tr>
  `).join("");
}

function openModal(item = null) {
  const form = document.getElementById("item-form");
  form.reset();
  base64ImageString = "";
  document.getElementById("preview-img").src = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800";

  if (item) {
    currentEditId = item.id;
    document.getElementById("modal-title").innerText = `Edit ${config.label.replace(/s$/, "")}`;
    document.getElementById("form-title").value = item.title;
    document.getElementById("form-category").value = item.category || "";
    document.getElementById("form-author").value = item.author || "";
    document.getElementById("form-date").value = item.date;
    document.getElementById("form-excerpt").value = item.excerpt || "";
    document.getElementById("form-content").value = item.content || "";
    document.getElementById("form-status").value = item.status;
    if (config.fields.includes("location")) document.getElementById("form-location").value = item.location || "";

    if ((item.coverImage || "").startsWith("data:image")) {
      base64ImageString = item.coverImage;
      document.getElementById("preview-img").src = base64ImageString;
    } else if (item.coverImage) {
      document.getElementById("form-cover-url").value = item.coverImage;
      document.getElementById("preview-img").src = item.coverImage;
    }
  } else {
    currentEditId = null;
    document.getElementById("modal-title").innerText = `Add New ${config.label.replace(/s$/, "")}`;
    document.getElementById("form-date").value = new Date().toISOString().split("T")[0];
    document.getElementById("form-author").value = currentUser.name;
  }

  document.getElementById("item-modal").classList.add("show");
}

function closeModal() {
  document.getElementById("item-modal").classList.remove("show");
}

async function handleSubmit(e) {
  e.preventDefault();

  const coverUrl = document.getElementById("form-cover-url").value.trim();
  let coverImage = coverUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800";
  if (base64ImageString) coverImage = base64ImageString;

  const data = {
    title: document.getElementById("form-title").value.trim(),
    category: document.getElementById("form-category").value,
    author: document.getElementById("form-author").value.trim(),
    date: document.getElementById("form-date").value,
    excerpt: document.getElementById("form-excerpt").value.trim(),
    content: document.getElementById("form-content").value.trim(),
    status: document.getElementById("form-status").value,
    coverImage
  };
  if (config.fields.includes("location")) data.location = document.getElementById("form-location").value.trim();

  try {
    if (currentEditId) {
      await CollectionAPI.update(config.storageKey, currentEditId, data);
      window.showToast(`${config.label.replace(/s$/, "")} updated successfully!`, "success");
    } else {
      await CollectionAPI.create(config.storageKey, contentType, data);
      window.showToast(`New ${config.label.toLowerCase().replace(/s$/, "")} saved successfully!`, "success");
    }
    closeModal();
    await refresh();
  } catch (err) {
    window.showToast(err.message || "Something went wrong.", "error");
  }
}

window.editItem = async function (id) {
  const item = await CollectionAPI.get(config.storageKey, id);
  if (item) openModal(item);
};

window.deleteItem = async function (id) {
  const item = allItems.find(i => String(i.id) === String(id));
  if (!item) return;
  if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
  const success = await CollectionAPI.remove(config.storageKey, id);
  if (success) {
    window.showToast(`${config.label.replace(/s$/, "")} deleted.`, "success");
    await refresh();
  } else {
    window.showToast("Failed to delete.", "error");
  }
};