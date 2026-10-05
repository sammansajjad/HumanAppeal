document.addEventListener("DOMContentLoaded", () => {
  renderHeaderFooter();
  loadNavigation();
  setupNavigation();
  animateStats();
  setupNewsletter();
});

function renderHeaderFooter() {
  const headerElement = document.querySelector("header");
  const footerElement = document.querySelector("footer");

  const pathname = window.location.pathname;
  const isInsideAdmin = pathname.includes("/admin/");
  const pathPrefix = "./";

  if (headerElement) {
    headerElement.innerHTML = `
      <div class="container">
        <nav class="nav-container">
          <a href="${pathPrefix}index.html" class="logo-wrapper" aria-label="Human Appeal Home" style="display: flex; align-items: center; gap: 5px;">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width: 70px; height: 70px; fill: var(--ha-purple); color: var(--ha-purple); flex-shrink: 0;">
              <g transform="rotate(-45 56 56)" fill="currentColor" font-family="'Outfit', sans-serif" font-weight="900">
                <rect x="32" y="15" width="16" height="50" rx="2" />
                <rect x="64" y="15" width="16" height="50" rx="2" />
                <rect x="48" y="32" width="16" height="16" />
                <circle cx="72" cy="2" r="9" />
                <text x="56" y="79" text-anchor="middle" font-size="11.5" letter-spacing="0.5">HUMAN</text>
                <text x="56" y="92" text-anchor="middle" font-size="11.5" letter-spacing="0.5">APPEAL</text>
              </g>
            </svg>
          </a>
          <ul class="nav-menu" id="nav-menu">
</ul>
          <div class="nav-actions">
            <button class="burger-menu" id="burger-menu" aria-label="Toggle Menu" aria-expanded="false">
              <span class="burger-line"></span>
              <span class="burger-line"></span>
              <span class="burger-line"></span>
            </button>
          </div>
        </nav>
      </div>
    `;
  }

  if (footerElement) {
    const newsletterHtml = `
      <div class="footer-col">
        <h4>Newsletter</h4>
        <p style="opacity: 0.8; font-size: 0.9rem; margin-bottom: 15px;">
          Subscribe to stay updated on our emergency operations and campaigns.
        </p>
        <form class="newsletter-form" id="newsletter-form">
          <input type="email" placeholder="Your Email Address" required aria-label="Email Address">
          <button type="submit" class="btn btn-secondary">Subscribe</button>
        </form>
      </div>
    `;

    footerElement.innerHTML = `
      <div class="container">
        <div class="footer-grid" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 50px; margin-bottom: 50px;">
          <div class="footer-about">
            <div class="footer-logo">
              <a href="${pathPrefix}index.html" style="display: flex; align-items: center; gap: 5px;">
                <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width: 70px; height: 70px; fill: #FFFFFF; color: #FFFFFF; flex-shrink: 0;">
                  <g transform="rotate(-45 56 56)" fill="currentColor" font-family="'Outfit', sans-serif" font-weight="900">
                    <rect x="32" y="15" width="16" height="50" rx="2" />
                    <rect x="64" y="15" width="16" height="50" rx="2" />
                    <rect x="48" y="32" width="16" height="16" />
                    <circle cx="72" cy="2" r="9" />
                    <text x="56" y="79" text-anchor="middle" font-size="11.5" letter-spacing="0.5">HUMAN</text>
                    <text x="56" y="92" text-anchor="middle" font-size="11.5" letter-spacing="0.5">APPEAL</text>
                  </g>
                </svg>
              </a>
            </div>
            <p style="margin-top: 10px;">An international faith-based humanitarian charity organization working across Pakistan to alleviate poverty, invest in sustainable development, and respond to natural disasters.</p>
            <div class="social-links" style="margin-top: 15px;">
              <a href="https://www.facebook.com/HumanAppeal.Pakistan/" class="social-icon" target="_blank" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="https://twitter.com/HumanAppeal" class="social-icon" target="_blank" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
              <a href="https://www.instagram.com/humanappealpk/" class="social-icon" target="_blank" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
              <a href="https://www.youtube.com/@HumanAppealPakistan" class="social-icon" target="_blank" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3z"/></svg></a>
            </div>
          </div>
          <div class="footer-col">
    <h4>Quick Links</h4>
    <ul class="footer-links">
        <li><a href="${pathPrefix}index.html">Home</a></li>
        <li><a href="${pathPrefix}about.html">About Us</a></li>
        <li><a href="${pathPrefix}categories.html">Our Projects</a></li>
        <li><a href="${pathPrefix}news.html">News & Blogs</a></li>
        <li><a href="${pathPrefix}jobs-tenders.html">Jobs & Tenders</a></li>
        <li><a href="${pathPrefix}contact.html">Contact Us</a></li>
        <li><a href="${pathPrefix}login.html">Login</a></li>
    </ul>
</div>
          <div class="footer-col">
            <h4>Our Offices</h4>
            <ul class="footer-contact-info">
              <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span>Plot 12-A, Park Road, Chak Shahzad, Islamabad, Pakistan</span></li>
              <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>+92 51 111 222 333</span></li>
              <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg><span>info@humanappeal.org.pk</span></li>
            </ul>
          </div>
          ${newsletterHtml}
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Human Appeal Pakistan. All rights reserved.</p>
          <p class="footer-trust-line">Human Appeal Pakistan is a registered NGO under registration number PCP-2026/0897.</p>
        </div>
      </div>
    `;
  }
} 
 function convertNavigationUrl(url){

    const map = {
        "/": "./index.html",
        "/about": "./about.html",
        "/projects": "./categories.html",
        "/projects/education": `./category.html?id=${encodeURIComponent("Education")}`,
        "/projects/healthcare": `./category.html?id=${encodeURIComponent("Health & Medical")}`,
        "/projects/livelihood": `./category.html?id=${encodeURIComponent("Livelihoods & Food Security")}`,
        "/news": "./news.html",
        "/jobs-tenders": "./jobs-tenders.html",
        "/contact-us": "./contact.html",
        "/contact": "./contact.html"
    };

    return map[url] || url;

}    
const NAV_CACHE_KEY = "ha_nav_cache_v1";

function renderNavItems(items) {
    const navMenu = document.getElementById("nav-menu");
    if (!navMenu) return;

    navMenu.innerHTML = "";

    items
        .filter(item => Number(item.is_active) === 1)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .forEach(item => {

            const li = document.createElement("li");
            const a = document.createElement("a");

            a.href = convertNavigationUrl(item.url);
            a.className = "nav-link";
            a.target = item.target || "_self";

            a.dataset.page =
                item.url === "/"
                    ? "home"
                    : item.url.replace("/", "");

            a.textContent = item.label_en;

            li.appendChild(a);
            navMenu.appendChild(li);
        });

    setupActiveNavigation();
}

async function loadNavigation() {
    const navMenu = document.getElementById("nav-menu");

    if (!navMenu) return;

    // 1. Render instantly from cache if we have it, so there's no blank-header wait
    const cachedRaw = sessionStorage.getItem(NAV_CACHE_KEY);
    let hadCache = false;

    if (cachedRaw) {
        try {
            const cachedItems = JSON.parse(cachedRaw);
            if (Array.isArray(cachedItems) && cachedItems.length > 0) {
                renderNavItems(cachedItems);
                hadCache = true;
            }
        } catch (e) {
            // corrupted cache, ignore and fall through to fetch
        }
    }

    // 2. Always fetch fresh in the background to keep nav in sync with the DB.
    //    If we already rendered from cache, this is silent (no flicker) unless it fails.
    try {
        // Uses window.API_BASE_URL from config.js when available; falls back to the
        // hardcoded value only if config.js hasn't been loaded on this page yet.
        const response = await fetch(`${window.API_BASE_URL || "http://localhost:3001/api"}/navigation`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const items = Array.isArray(data.items) ? data.items : [];

        if (items.length === 0) {
            throw new Error("No navigation items returned");
        }

        sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify(items));
        renderNavItems(items);

    } catch (error) {

        console.error("Navigation loading failed:", error);

        // Only fall back to the hardcoded list if we had nothing cached to show
        if (!hadCache) {
            navMenu.innerHTML = `
                <li><a href="./index.html" class="nav-link">Home</a></li>
                <li><a href="./about.html" class="nav-link">About Us</a></li>
                <li><a href="./categories.html" class="nav-link">Our Projects</a></li>
                <li><a href="./news.html" class="nav-link">News & Blogs</a></li>
                <li><a href="./jobs-tenders.html" class="nav-link">Jobs & Tenders</a></li>
                <li><a href="./contact.html" class="nav-link">Contact</a></li>
            `;
        }
    }
}

function setupNavigation() {
  const burgerBtn = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");
  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener("click", () => {
      const expanded = burgerBtn.getAttribute("aria-expanded") === "true" || false;
      burgerBtn.setAttribute("aria-expanded", !expanded);
      navMenu.classList.toggle("nav-menu-active");
    });
  }
}
function setupActiveNavigation(){

    const links = document.querySelectorAll(".nav-link");
    const pathname = window.location.pathname;

    links.forEach(link => {

        const page = link.dataset.page;

        if(
            (page === "home" && pathname.endsWith("index.html")) ||
            pathname.includes(page)
        ){
            link.classList.add("active");
        }

    });

}

window.animateStats = function() {
  const stats = document.querySelectorAll(".stat-number");
  if (stats.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseInt(target.getAttribute("data-target"));
        let current = 0;
        const duration = 1500;
        const increment = targetVal / (duration / 16);
        const count = () => {
          current += increment;
          if (current < targetVal) {
            target.innerText = Math.ceil(current).toLocaleString();
            requestAnimationFrame(count);
          } else {
            target.innerText = targetVal.toLocaleString() + (target.getAttribute("data-suffix") || "");
          }
        };
        count();
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.1 });
  stats.forEach(stat => observer.observe(stat));
};

function animateStats() { window.animateStats(); }

/* Writes to the same "ha_subscribers" localStorage key that the admin
   panel reads via SubscribersAPI (js/api.js), so signups here immediately
   show up in Admin > Subscribers. When the SQL backend is live, swap this
   for a POST to your /subscribers endpoint. */
function saveSubscriberLocally(email) {
  const KEY = "ha_subscribers";
  const raw = localStorage.getItem(KEY);
  const subs = raw ? JSON.parse(raw) : [];
  if (subs.some(s => s.email.toLowerCase() === email.toLowerCase())) return false;
  subs.push({ id: "sub-" + Date.now(), email, registeredDate: new Date().toISOString().split("T")[0], status: "subscribed" });
  localStorage.setItem(KEY, JSON.stringify(subs));
  return true;
}

function setupNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = form.querySelector("input[type='email']");
    if (emailInput && emailInput.value) {
      saveSubscriberLocally(emailInput.value.trim());
      showToast(`JazakAllah! Thank you for subscribing to our newsletter with: ${emailInput.value}`, "success");
      emailInput.value = "";
    }
  });
}

window.showToast = function(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  let icon = "";
  if (type === "success") {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
  }
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) container.remove();
  }, 3000);
};

window.getIconSvg = function(key, accentColor = "") {
  const strokeColor = accentColor ? accentColor : "currentColor";
  const iconMap = {
    emergency: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    water: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    education: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`,
    health: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
    orphan: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    livelihood: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
  };
  return iconMap[key] || "";
};