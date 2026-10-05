/* =========================================================================
   HUMAN APPEAL PAKISTAN — ADMIN DATA LAYER (api.js)
   -------------------------------------------------------------------------
   SQL BACKEND IS ENABLED.

   Current backend sources:
   - Jobs    -> /api/job-postings
   - Tenders -> /api/tender_alerts
   - Users   -> /api/users
   - Subscribers -> /api/subscribers

   IMPORTANT:
   - job_alerts is NO LONGER USED.
   - job_postings is the official jobs table.
   - Backend user.permissions is the source of truth.
   ========================================================================= */

const USE_SQL_BACKEND = true;

/*
 * Backend API location.
 *
 * If the frontend and backend are served from the same origin,
 * this automatically uses the current origin.
 *
 * During local development, set window.HA_API_ORIGIN before
 * loading this file if the backend is on another origin.
 *
 * Example:
 * window.HA_API_ORIGIN = "http://localhost:3001";
 */

const API_ORIGIN =
    window.HA_API_ORIGIN ||
    window.location.origin;

const API_BASE_URL =
    `${API_ORIGIN}/api`;

// =========================================================================
// PATH HELPER
// =========================================================================

function apiPathFor(storageKey) {
    return storageKey.replace(/^ha_/, "");
}


// =========================================================================
// CONTENT TYPES
// =========================================================================

const CONTENT_TYPES = {

    news: {
        label: "News",
        storageKey: "ha_news",
        icon: "news",

        fields: [
            "title",
            "category",
            "author",
            "date",
            "coverImage",
            "excerpt",
            "content",
            "status"
        ],

        categories: [
            "Emergency Relief",
            "Water & Sanitation",
            "Education",
            "Health & Medical",
            "Child Welfare & Orphans",
            "Livelihoods & Food Security",
            "Announcements"
        ]
    },

    blogs: {
        label: "Blogs",
        storageKey: "ha_blogs",
        icon: "education",

        fields: [
            "title",
            "category",
            "author",
            "date",
            "coverImage",
            "excerpt",
            "content",
            "status"
        ],

        categories: [
            "Field Stories",
            "Opinion",
            "Donor Spotlight",
            "Volunteer Diaries",
            "Impact Reports"
        ]
    },

    posts: {
        label: "Posts",
        storageKey: "ha_posts",
        icon: "livelihood",

        fields: [
            "title",
            "category",
            "author",
            "date",
            "coverImage",
            "excerpt",
            "content",
            "status"
        ],

        categories: [
            "General Update",
            "Event",
            "Media Release",
            "Community"
        ]
    },

    projects: {
        label: "Projects",
        storageKey: "ha_projects",
        icon: "water",

        fields: [
            "title",
            "category",
            "author",
            "date",
            "location",
            "coverImage",
            "excerpt",
            "content",
            "status"
        ],

        categories: [
            "Emergency Relief",
            "Water & Sanitation",
            "Education",
            "Health & Medical",
            "Child Welfare & Orphans",
            "Livelihoods & Food Security"
        ]
    },

    programs: {
        label: "Programs",
        storageKey: "ha_programs",
        icon: "orphan",

        fields: [
            "title",
            "category",
            "author",
            "date",
            "coverImage",
            "excerpt",
            "content",
            "status"
        ],

        categories: [
            "Sponsorship Program",
            "Seasonal Program (Ramadan/Qurbani)",
            "Scholarship Program",
            "Skills & Training Program"
        ]
    }
};


// =========================================================================
// ALERT TYPES
// -------------------------------------------------------------------------
// IMPORTANT:
// Jobs now use job_postings.
// job_alerts is intentionally NOT referenced anywhere.
// =========================================================================

const ALERT_TYPES = {

    job: {
        label: "Job Postings",
        storageKey: "ha_job_postings",

        fields: [
            "title",
            "reference_no",
            "department",
            "location",
            "employment_type",
            "description",
            "requirements",
            "application_url",
            "application_email",
            "status",
            "featured",
            "opening_date",
            "closing_date",
            "published_at"
        ]
    },

    tender: {
        label: "Tender Alerts",
        storageKey: "ha_tender_alerts",

        fields: [
            "title",
            "tenderNumber",
            "category",
            "deadline",
            "postedBy",
            "datePosted",
            "description",
            "status"
        ]
    }
};


// =========================================================================
// PERMISSIONS
// -------------------------------------------------------------------------
// Backend is the single source of truth.
// =========================================================================

function roleHasPermission(user, permission) {

    if (!user) {
        return false;
    }

    if (!Array.isArray(user.permissions)) {
        return false;
    }

    // Optional wildcard support
    if (user.permissions.includes("*")) {
        return true;
    }

    return user.permissions.includes(permission);
}


// =========================================================================
// LOCAL STORAGE SEED DATA
// -------------------------------------------------------------------------
// Only used if USE_SQL_BACKEND is changed to false.
// =========================================================================

const SEED_USERS = [
    {
        id: "usr-1",
        name: "Ayesha Siddiqui",
        email: "superadmin@humanappeal.org.pk",
        password: "SuperAdmin@123",
        role: "superadmin",
        status: "active",
        createdAt: "2026-01-05"
    },

    {
        id: "usr-2",
        name: "Bilal Ahmed",
        email: "admin@humanappeal.org.pk",
        password: "Admin@123",
        role: "admin",
        status: "active",
        createdAt: "2026-02-10"
    }
];


const SEED_CONTENT = {

    news: [
        {
            id: "news-1",
            title: "Flood Relief Operations Expand in Sindh",
            category: "Emergency Relief",
            author: "Tariq Mahmood",
            date: "2026-07-20",
            coverImage:
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
            excerpt:
                "Teams are scaling up relief distribution as monsoon rains continue.",
            content:
                "Full report on relief operations across affected districts of Sindh, including shelter and food distribution figures.",
            status: "published"
        }
    ],

    blogs: [
        {
            id: "blog-1",
            title: "A Day With Our Mobile Health Team",
            category: "Field Stories",
            author: "Dr. Farhan Qureshi",
            date: "2026-07-12",
            coverImage:
                "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800",
            excerpt:
                "Riding along with our clinic van through rural Punjab.",
            content:
                "A first-person account of a mobile health camp visit, patients treated, and challenges faced on the road.",
            status: "published"
        }
    ],

    posts: [
        {
            id: "post-1",
            title: "Ramadan Food Pack Drive Kicks Off",
            category: "Event",
            author: "Sadia Khan",
            date: "2026-07-05",
            coverImage:
                "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800",
            excerpt:
                "Volunteers gather to prepare 5,000 food packs.",
            content:
                "Details on the seasonal food pack distribution drive and how the community can get involved.",
            status: "draft"
        }
    ],

    projects: [
        {
            id: "proj-1",
            title: "Solar Water Wells — Lasbela District",
            category: "Water & Sanitation",
            author: "Zainab Malik",
            date: "2026-06-01",
            location: "Lasbela, Balochistan",
            coverImage:
                "https://images.unsplash.com/photo-1541913757956-49daaa43fa36?q=80&w=800",
            excerpt:
                "Solar-powered wells bringing clean water to 500+ families.",
            content:
                "Full project brief including budget, timeline, and beneficiary counts.",
            status: "published"
        }
    ],

    programs: [
        {
            id: "prog-1",
            title: "Orphan Sponsorship Program",
            category: "Sponsorship Program",
            author: "Fatima Ali",
            date: "2026-05-15",
            coverImage:
                "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800",
            excerpt:
                "Monthly sponsorship supporting 1,200+ orphans nationwide.",
            content:
                "Program structure, sponsorship tiers, and impact overview.",
            status: "published"
        }
    ]
};


// =========================================================================
// LOCAL ALERT SEEDS
// -------------------------------------------------------------------------
// These are only fallback data.
// =========================================================================

const SEED_ALERTS = {

    job: [
        {
            id: "job-1",
            title: "Field Program Officer — Balochistan",
            reference_no: "HAP-J-2026-001",
            department: "Programs",
            location: "Quetta, Balochistan",
            employment_type: "Full-time",
            description:
                "Seeking a Field Program Officer to oversee water & sanitation projects in Balochistan.",
            requirements: "",
            application_url: "",
            application_email: "",
            status: "published",
            featured: 0,
            opening_date: "2026-07-18",
            closing_date: "2026-08-15",
            published_at: "2026-07-18T00:00:00.000Z"
        }
    ],

    tender: [
        {
            id: "tender-1",
            title: "Supply of Winterization Kits",
            tenderNumber: "HAP-T-2026-014",
            category: "Procurement",
            deadline: "2026-08-10",
            postedBy: "Ayesha Siddiqui",
            datePosted: "2026-07-15",
            description:
                "Invitation for bids to supply 1,000 winterization kits for Gilgit-Baltistan operations.",
            status: "open"
        }
    ]
};


const SEED_SUBSCRIBERS = [
    {
        id: "sub-1",
        email: "reader1@example.com",
        registeredDate: "2026-06-01",
        status: "subscribed"
    },

    {
        id: "sub-2",
        email: "reader2@example.com",
        registeredDate: "2026-06-20",
        status: "subscribed"
    }
];


// =========================================================================
// SEED HELPERS
// =========================================================================

function seedIfEmpty(key, seed) {

    if (!localStorage.getItem(key)) {
        localStorage.setItem(
            key,
            JSON.stringify(seed)
        );
    }
}


function seedAll() {

    seedIfEmpty(
        "ha_users",
        SEED_USERS
    );

    Object.keys(CONTENT_TYPES).forEach(type => {

        seedIfEmpty(
            CONTENT_TYPES[type].storageKey,
            SEED_CONTENT[type] || []
        );

    });

    Object.keys(ALERT_TYPES).forEach(type => {

        seedIfEmpty(
            ALERT_TYPES[type].storageKey,
            SEED_ALERTS[type] || []
        );

    });

    seedIfEmpty(
        "ha_subscribers",
        SEED_SUBSCRIBERS
    );
}


seedAll();


// =========================================================================
// LOCAL STORE
// =========================================================================

const LocalStore = {

    _read(key) {

        const raw =
            localStorage.getItem(key);

        return raw
            ? JSON.parse(raw)
            : [];
    },


    _write(key, arr) {

        localStorage.setItem(
            key,
            JSON.stringify(arr)
        );
    },


    list(key) {

        return this
            ._read(key)
            .sort(
                (a, b) =>
                    new Date(
                        b.date ||
                        b.datePosted ||
                        b.createdAt ||
                        b.opening_date ||
                        0
                    )
                    -
                    new Date(
                        a.date ||
                        a.datePosted ||
                        a.createdAt ||
                        a.opening_date ||
                        0
                    )
            );
    },


    getById(key, id) {

        return this
            ._read(key)
            .find(
                item =>
                    String(item.id) ===
                    String(id)
            ) || null;
    },


    create(key, prefix, data) {

        const arr =
            this._read(key);

        const record = {
            id: `${prefix}-${Date.now()}`,
            ...data
        };

        arr.push(record);

        this._write(
            key,
            arr
        );

        return record;
    },


    update(key, id, data) {

        const arr =
            this._read(key);

        const index =
            arr.findIndex(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (index === -1) {
            return false;
        }

        arr[index] = {
            ...arr[index],
            ...data
        };

        this._write(
            key,
            arr
        );

        return true;
    },


    remove(key, id) {

        const arr =
            this._read(key);

        const filtered =
            arr.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

        if (
            filtered.length ===
            arr.length
        ) {
            return false;
        }

        this._write(
            key,
            filtered
        );

        return true;
    }
};


// =========================================================================
// REMOTE REQUEST
// =========================================================================

async function remoteRequest(
    method,
    path,
    body
) {

    const token =
        sessionStorage.getItem(
            "ha_auth_token"
        ) || "";


    const options = {
        method,

        headers: {
            "Content-Type":
                "application/json",

            ...(token
                ? {
                    "Authorization":
                        `Bearer ${token}`
                }
                : {})
        }
    };


    if (body !== undefined) {

        options.body =
            JSON.stringify(body);
    }


    const response =
        await fetch(
            `${API_BASE_URL}${path}`,
            options
        );


    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        data = null;
    }


    if (
        response.status === 401
    ) {

        AuthAPI.logout();

        throw new Error(
            "Session expired. Please login again."
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.error ||
            `API error ${response.status} on ${method} ${path}`
        );
    }


    return data;
}


// =========================================================================
// GENERIC API REQUEST
// =========================================================================

async function apiRequest(
    method,
    endpoint,
    body
) {

    return remoteRequest(
        method,
        endpoint,
        body
    );
}


const API = {

    get(endpoint) {

        return apiRequest(
            "GET",
            endpoint
        );
    },


    post(endpoint, body) {

        return apiRequest(
            "POST",
            endpoint,
            body
        );
    },


    put(endpoint, body) {

        return apiRequest(
            "PUT",
            endpoint,
            body
        );
    },


    patch(endpoint, body) {

        return apiRequest(
            "PATCH",
            endpoint,
            body
        );
    },


    delete(endpoint) {

        return apiRequest(
            "DELETE",
            endpoint
        );
    }
};


window.API = API;


// =========================================================================
// GENERIC COLLECTION API
// =========================================================================

const CollectionAPI = {

    async list(storageKey) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "GET",
                `/${apiPathFor(storageKey)}`
            );
        }

        return LocalStore.list(
            storageKey
        );
    },


    async get(storageKey, id) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "GET",
                `/${apiPathFor(storageKey)}/${id}`
            );
        }

        return LocalStore.getById(
            storageKey,
            id
        );
    },


    async create(
        storageKey,
        idPrefix,
        data
    ) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "POST",
                `/${apiPathFor(storageKey)}`,
                data
            );
        }

        return LocalStore.create(
            storageKey,
            idPrefix,
            data
        );
    },


    async update(
        storageKey,
        id,
        data
    ) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "PUT",
                `/${apiPathFor(storageKey)}/${id}`,
                data
            );
        }

        return LocalStore.update(
            storageKey,
            id,
            data
        );
    },


    async remove(
        storageKey,
        id
    ) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "DELETE",
                `/${apiPathFor(storageKey)}/${id}`
            );
        }

        return LocalStore.remove(
            storageKey,
            id
        );
    }
};


// =========================================================================
// AUTH API
// =========================================================================

// =========================================================================
// AUTH API
// =========================================================================

const AuthAPI = {

    async login(
        email,
        password
    ) {

        const response =
            await fetch(
                `${API_ORIGIN}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        let data = {};

        try {

            data =
                await response.json();

        } catch (error) {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                `API error ${response.status} on POST /auth/login`
            );

        }


        sessionStorage.setItem(
            "ha_auth_token",
            data.token
        );


        sessionStorage.setItem(
            "ha_current_user",
            JSON.stringify(
                data.user
            )
        );


        return data.user;
    },


    getCurrentUser() {

        const raw =
            sessionStorage.getItem(
                "ha_current_user"
            );

        if (!raw) {
            return null;
        }

        try {

            return JSON.parse(raw);

        } catch (error) {

            return null;
        }
    },


    getToken() {

        return sessionStorage.getItem(
            "ha_auth_token"
        );
    },


    logout() {

        sessionStorage.removeItem(
            "ha_current_user"
        );

        sessionStorage.removeItem(
            "ha_auth_token"
        );
    },


    requireLogin(
        redirectTo = "./login.html"
    ) {

        const user =
            this.getCurrentUser();


        if (!user) {

            window.location.href =
                redirectTo;

            return null;
        }


        return user;
    },


    requirePermission(
        permission,
        redirectTo = "./dashboard.html"
    ) {

        const user =
            this.requireLogin();


        if (!user) {
            return null;
        }


        if (
            !roleHasPermission(
                user,
                permission
            )
        ) {

            window.location.href =
                redirectTo;

            return null;
        }


        return user;
    }
};


// =========================================================================
// USERS API
// =========================================================================

const UsersAPI = {

    async list() {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "GET",
                "/users"
            );
        }

        return LocalStore
            ._read("ha_users")
            .map(
                ({
                    password,
                    ...rest
                }) => rest
            );
    },


    async create(data) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "POST",
                "/users",
                data
            );
        }


        const users =
            LocalStore._read(
                "ha_users"
            );


        if (
            users.some(
                user =>
                    user.email
                        .toLowerCase() ===
                    data.email
                        .toLowerCase()
            )
        ) {

            throw new Error(
                "A user with this email already exists."
            );
        }


        const record = {

            id: `usr-${Date.now()}`,

            status: "active",

            createdAt:
                new Date()
                    .toISOString()
                    .split("T")[0],

            ...data
        };


        users.push(record);


        LocalStore._write(
            "ha_users",
            users
        );


        return record;
    },


    async update(
        id,
        data
    ) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "PUT",
                `/users/${id}`,
                data
            );
        }

        return LocalStore.update(
            "ha_users",
            id,
            data
        );
    },


    async remove(id) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "DELETE",
                `/users/${id}`
            );
        }

        return LocalStore.remove(
            "ha_users",
            id
        );
    }
};


// =========================================================================
// SUBSCRIBERS API
// =========================================================================

const SubscribersAPI = {

    async list() {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "GET",
                "/subscribers"
            );
        }

        return LocalStore.list(
            "ha_subscribers"
        );
    },


    async add(email) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "POST",
                "/subscribers",
                {
                    email
                }
            );
        }


        const subscribers =
            LocalStore._read(
                "ha_subscribers"
            );


        if (
            subscribers.some(
                subscriber =>
                    subscriber.email
                        .toLowerCase() ===
                    email.toLowerCase()
            )
        ) {

            return null;
        }


        const record = {

            id:
                `sub-${Date.now()}`,

            email,

            registeredDate:
                new Date()
                    .toISOString()
                    .split("T")[0],

            status:
                "subscribed"
        };


        subscribers.push(record);


        LocalStore._write(
            "ha_subscribers",
            subscribers
        );


        return record;
    },


    async remove(id) {

        if (USE_SQL_BACKEND) {

            return remoteRequest(
                "DELETE",
                `/subscribers/${id}`
            );
        }

        return LocalStore.remove(
            "ha_subscribers",
            id
        );
    }
};


// =========================================================================
// GLOBAL EXPORTS
// =========================================================================

window.CONTENT_TYPES =
    CONTENT_TYPES;

window.ALERT_TYPES =
    ALERT_TYPES;

window.roleHasPermission =
    roleHasPermission;

window.CollectionAPI =
    CollectionAPI;

window.AuthAPI =
    AuthAPI;

window.UsersAPI =
    UsersAPI;

window.SubscribersAPI =
    SubscribersAPI;