// ============================================================
// STATIC REFERENCE DATA
// (Category metadata is still hardcoded client-side, not pulled
// from the DB — see open question in project notes.)
// ============================================================

const CATEGORY_COLORS = {
  "Emergency Relief": "#E10032",
  "Water & Sanitation": "#64B4E6",
  "Education": "#FAD241",
  "Health & Medical": "#009B78",
  "Child Welfare & Orphans": "#F096C8",
  "Livelihoods & Food Security": "#C8D700"
};

const CATEGORIES_INFO = {
  "Emergency Relief": {
    color: "#E10032",
    icon: "emergency",
    description: "Responding swiftly to floods, earthquakes, and winter crises in Pakistan with life-saving aid."
  },
  "Water & Sanitation": {
    color: "#64B4E6",
    icon: "water",
    description: "Building solar water wells, hand pumps, and hygiene stations in arid regions of Balochistan and Sindh."
  },
  "Education": {
    color: "#FAD241",
    icon: "education",
    description: "Supporting primary schools, girls' education, and vocational scholarships across KPK and Punjab."
  },
  "Health & Medical": {
    color: "#009B78",
    icon: "health",
    description: "Running mobile medical camps, supporting local clinics, and providing maternal healthcare in remote villages."
  },
  "Child Welfare & Orphans": {
    color: "#F096C8",
    icon: "orphan",
    description: "Sponsoring vulnerable orphans, providing education, food, and emotional support to secure their future."
  },
  "Livelihoods & Food Security": {
    color: "#C8D700",
    icon: "livelihood",
    description: "Empowering widows, providing agricultural training, livestock, and distributing essential food packs."
  }
};

// Real backend — cross-origin (frontend on 127.0.0.1:5500, backend on localhost:3001).
// Uses window.API_BASE_URL from config.js when available; falls back to the
// hardcoded value only if config.js hasn't been loaded on this page yet.
const API_BASE = window.API_BASE_URL || "http://localhost:3001/api";

// ============================================================
// INTERNAL HELPERS
// ============================================================

/**
 * Fetch a JSON list from the backend. Returns [] on any failure
 * so callers never have to null-check before iterating.
 *
 * Backend responses are wrapped as { success, data: [...] },
 * so this unwraps .data before handing the array back to callers.
 */
async function fetchJsonList(endpoint, label) {
  let response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`);
  } catch (err) {
    console.error(`Failed to reach ${label}:`, err);
    return [];
  }

  if (!response.ok) {
    console.error(`Failed to load ${label}:`, response.status);
    return [];
  }

  const body = await response.json();

  if (Array.isArray(body)) {
    return body;
  }

  if (body && Array.isArray(body.data)) {
    return body.data;
  }

  console.error(`Unexpected response shape for ${label}:`, body);
  return [];
}

/**
 * Fetch a single JSON record from the backend. Returns null on
 * any failure (including 404).
 *
 * Backend responses are wrapped as { success, data: {...} },
 * so this unwraps .data before handing the record back to callers.
 */
async function fetchJsonSingle(endpoint, label) {
  let response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`);
  } catch (err) {
    console.error(`Failed to reach ${label}:`, err);
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const body = await response.json();

  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }

  return body;
}

function sortByDateDesc(items, dateField) {
  return [...items].sort(
    (a, b) => new Date(b[dateField]) - new Date(a[dateField])
  );
}

// ============================================================
// DATA MANAGER
// Read-only public API layer. Writes belong to the admin panel
// (content-admin.js / api.js), which already talks to the
// authenticated POST/PUT/DELETE routes. This bundle must never
// carry write logic or fall back to localStorage as if it were
// a database.
// ============================================================

const DataManager = {

  // ---------------- News ----------------

  async getArticles(includeDrafts = false) {
    let articles = await fetchJsonList("/news", "news");

    if (!includeDrafts) {
      articles = articles.filter(article => article.status === "published");
    }

    return sortByDateDesc(articles, "date");
  },

  async getArticleById(id) {
    return fetchJsonSingle(`/news/${id}`, "article");
  },

  async getArticlesByCategory(category, includeDrafts = false) {
    const articles = await this.getArticles(includeDrafts);
    return articles.filter(article => article.category === category);
  },

  async getRecentArticles(limit = 3, includeDrafts = false) {
    const articles = await this.getArticles(includeDrafts);
    return articles.slice(0, limit);
  },

  // ---------------- Job postings ----------------

  /**
   * Public job postings, read from the real job_postings table via
   * /api/job-postings. The GET routes are public (optionalAuth) and
   * return published-only postings to anonymous callers, so the
   * includeClosed filter here just narrows further to non-closed
   * postings for the public listing page.
   */
  async getJobAlerts(includeClosed = false) {
    let jobs = await fetchJsonList("/job-postings", "job postings");

    if (!includeClosed) {
      jobs = jobs.filter(job => job.status === "published");
    }

    return sortByDateDesc(jobs, "closing_date");
  },

  async getJobAlertById(id) {
    return fetchJsonSingle(`/job-postings/${id}`, "job posting");
  },

  // ---------------- Tenders ----------------

  /**
   * Public tenders, read from the tenders table via /api/tenders.
   * GET routes are public (no authenticateToken on the router),
   * and the controller now returns the standard {success, data}
   * shape, so fetchJsonList/fetchJsonSingle can unwrap it directly.
   */
  async getTenderAlerts(includeClosed = false) {
    let tenders = await fetchJsonList("/tenders", "tenders");

    if (!includeClosed) {
      tenders = tenders.filter(tender => tender.status === "open");
    }

    return sortByDateDesc(tenders, "datePosted");
  },

  async getTenderAlertById(id) {
    return fetchJsonSingle(`/tenders/${id}`, "tender");
  },

  // ---------------- Static reference data ----------------

  getCategoryColors() {
    return CATEGORY_COLORS;
  },

  getCategoriesInfo() {
    return CATEGORIES_INFO;
  }

};

window.DataManager = DataManager;