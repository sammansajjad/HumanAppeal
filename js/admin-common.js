/* Shared UI helpers for every page inside /admin. */

window.getIconSvg = window.getIconSvg || function (key, accentColor = "") {
  const c = accentColor || "currentColor";
  const icons = {
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="10" rx="1"/><rect width="7" height="5" x="3" y="14" rx="1"/></svg>`,
    news: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`,
    education: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`,
    livelihood: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    water: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    orphan: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
  };
  return icons[key] || "";
};

window.showToast = window.showToast || function (message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) container.remove();
  }, 3000);
};

// Role display labels only (NOT permissions — those live on the user
// object from the backend and are checked via window.roleHasPermission).
const ROLE_LABELS = {
  "Super Admin": "Super Admin",
  "Admin": "Administrator",
  "Content Manager": "Content Manager",
  "Project Manager": "Project Manager",
  "Media Manager": "Media Manager",
  "SEO Manager": "SEO Manager",
  "Editor": "Editor",
  "Viewer": "Viewer"
};

function renderAdminSidebar(user, activeHref) {
  const nav = [
    { section: null, items: [
      { href: "dashboard.html", label: "Dashboard", icon: "dashboard" }
    ]},
    { section: "Content", items: [
      { href: "content.html?type=news", label: "News", icon: "news", permission: "manage_news" },
      { href: "content.html?type=blogs", label: "Blogs", icon: "education", permission: "manage_pages" },
      { href: "content.html?type=posts", label: "Posts", icon: "livelihood", permission: "manage_pages" },
      { href: "content.html?type=projects", label: "Projects", icon: "water", permission: "manage_projects" },
      { href: "content.html?type=programs", label: "Programs", icon: "orphan", permission: "manage_programs" }
    ]},
   {
  section: "Alerts",
  items: [
    {
      href: "alerts.html?type=job",
      label: "Jobs",
      icon: "briefcase",
      permission: "manage_jobs"
    },
    {
      href: "alerts.html?type=tender",
      label: "Tenders",
      icon: "fileText",
      permission: "manage_tenders"
    }
  ]
},
{
    section: "People",
    items: [
        {
            href: "subscribers.html",
            label: "Subscribers",
            icon: "mail",
            permission: "manage_subscribers"
        },
        {
            href: "users.html",
            label: "Manage Users",
            icon: "users",
            permission: "manage_users"
        },
        {
            href: "roles.html",
            label: "Manage Roles",
            icon: "users",
            permission: "roles.permissions.view"
        },
        {
            href: "permissions.html",
            label: "Manage Permissions",
            icon: "fileText",
            permission: "permissions.view"
        }
    ]
},
    { section: "System", items: [
      { href: "navigation.html", label: "Navigation", icon: "externalLink", permission: "manage_navigation" }
    ]}
  ];

  let html = `<ul class="admin-sidebar-menu">`;
  nav.forEach(group => {
    const visibleItems = group.items.filter(item => !item.permission || window.roleHasPermission(user, item.permission));
    if (visibleItems.length === 0) return;
    if (group.section) {
      html += `<li class="admin-sidebar-heading">${group.section}</li>`;
    }
    visibleItems.forEach(item => {
      const isActive = activeHref === item.href;
      html += `
        <li>
          <a href="${item.href}" class="admin-sidebar-link${isActive ? " active" : ""}">
            ${window.getIconSvg(item.icon)}
            <span>${item.label}</span>
          </a>
        </li>`;
    });
  });
  html += `
    <li class="admin-sidebar-heading">&nbsp;</li>
    <li><a href="./index.html" class="admin-sidebar-link">${window.getIconSvg("externalLink")}<span>View Website</span></a></li>
  </ul>`;

  document.getElementById("admin-sidebar-menu-holder").innerHTML = html;
  document.getElementById("current-user-name").innerText = user.name;
  document.getElementById("current-user-role").innerText = ROLE_LABELS[user.role] || user.role;
}

function adminLogout() {
  AuthAPI.logout();
  window.showToast("Logged out successfully.", "success");
  setTimeout(() => { window.location.href = "./login.html"; }, 700);
}

document.addEventListener("DOMContentLoaded", function () {
  const user = AuthAPI.requireLogin();
  if (!user) return;

  const sidebar = document.getElementById("admin-sidebar-menu-holder");
  if (sidebar) {
    const currentPage = window.location.pathname.split("/").pop();
    renderAdminSidebar(user, currentPage);
  }

  const username = document.getElementById("current-user-name");
  const role = document.getElementById("current-user-role");
  if (username) username.innerText = user.name || "Admin";
  if (role) role.innerText = ROLE_LABELS[user.role] || user.role;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", adminLogout);
});

window.adminLogout = adminLogout;
window.renderAdminSidebar = renderAdminSidebar;