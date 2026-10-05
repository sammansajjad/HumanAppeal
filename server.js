const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

// =====================================================
// ENVIRONMENT
// =====================================================

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

// =====================================================
// DATABASE CONNECTION
// =====================================================

require("./models/db");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const pageRoutes = require("./routes/pageRoutes");
const menuRoutes = require("./routes/menuRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const navigationRoutes = require("./routes/navigationRoutes");

const jobPostingRoutes = require("./routes/jobPostingRoutes");
const projectRoutes = require("./routes/projectRoutes");
const programRoutes = require("./routes/programRoutes");
const postRoutes = require("./routes/postRoutes");
const blogRoutes = require("./routes/blogRoutes");
const tenderRoutes = require("./routes/tenderRoutes");
const newsRoutes = require("./routes/newsRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// PRODUCTION VALIDATION
// =====================================================

if (IS_PRODUCTION) {
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not configured.");
        process.exit(1);
    }

    if (!process.env.FRONTEND_URL) {
        console.error("FATAL ERROR: FRONTEND_URL is not configured.");
        process.exit(1);
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.error(
            "FATAL ERROR: JWT_SECRET must be at least 32 characters long."
        );
        process.exit(1);
    }
}

// =====================================================
// TRUST PROXY
// =====================================================
//
// Required when the application is behind a reverse proxy
// such as Nginx, Apache, or a cloud load balancer.
//
// This allows Express to correctly determine client IPs
// for rate limiting and secure production deployments.
//

if (IS_PRODUCTION) {
    app.set("trust proxy", 1);
}

// =====================================================
// SECURITY HEADERS
// =====================================================

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// =====================================================
// CORS
// =====================================================

const developmentOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
];

const productionOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const allowedOrigins = IS_PRODUCTION
    ? productionOrigins
    : developmentOrigins;

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests with no Origin header.
            // This includes some server-to-server requests
            // and development tools.

            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            const corsError = new Error("Origin not allowed");
            corsError.statusCode = 403;

            return callback(corsError);
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: false,

        optionsSuccessStatus: 204
    })
);

// =====================================================
// REQUEST BODY LIMITS
// =====================================================
//
// Prevent excessively large request bodies.
//

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

// =====================================================
// RATE LIMITING
// =====================================================

// -----------------------------------------------------
// Authentication Rate Limiter
// -----------------------------------------------------
//
// Protects login/authentication endpoints against
// brute-force attempts.
//

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        error: "Too many authentication attempts. Please try again later."
    },

    skipSuccessfulRequests: false
});

// -----------------------------------------------------
// General API Rate Limiter
// -----------------------------------------------------
//
// Prevents abusive traffic across the API.
//
// Authentication has a stricter limiter above.
//

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        error: "Too many requests. Please try again later."
    }
});

// =====================================================
// RATE LIMIT MIDDLEWARE
// =====================================================

app.use("/auth", authLimiter);

app.use("/api", apiLimiter);

// =====================================================
// REQUEST LOGGING
// =====================================================
//
// IMPORTANT:
// Never log request bodies in production because they can
// contain passwords, tokens, personal information, etc.
//

if (!IS_PRODUCTION) {

    app.use((req, res, next) => {

        console.log("================================");
        console.log(req.method, req.originalUrl);
        console.log("Content-Type:", req.headers["content-type"]);
        console.log("================================");

        next();
    });

}

// =====================================================
// ROUTES
// =====================================================

// -----------------------------------------------------
// Authentication
// -----------------------------------------------------

app.use("/auth", authRoutes);

// -----------------------------------------------------
// Users
// -----------------------------------------------------

app.use("/api/users", userRoutes);

// -----------------------------------------------------
// Roles
// -----------------------------------------------------

app.use("/api/roles", roleRoutes);

// -----------------------------------------------------
// Permissions
// -----------------------------------------------------

app.use("/api/permissions", permissionRoutes);

// -----------------------------------------------------
// Pages
// -----------------------------------------------------

app.use("/api/pages", pageRoutes);

// -----------------------------------------------------
// Menus
// -----------------------------------------------------

app.use("/api/menus", menuRoutes);

// -----------------------------------------------------
// Menu Items
// -----------------------------------------------------

app.use("/api/menu-items", menuItemRoutes);

// -----------------------------------------------------
// Navigation
// -----------------------------------------------------

app.use("/api/navigation", navigationRoutes);

// -----------------------------------------------------
// Job Postings
// -----------------------------------------------------

app.use("/api/job-postings", jobPostingRoutes);

// -----------------------------------------------------
// Projects
// -----------------------------------------------------

app.use("/api/projects", projectRoutes);

// -----------------------------------------------------
// Posts
// -----------------------------------------------------

app.use("/api/posts", postRoutes);

// -----------------------------------------------------
// Programs
// -----------------------------------------------------

app.use("/api/programs", programRoutes);

// -----------------------------------------------------
// Blogs
// -----------------------------------------------------

app.use("/api/blogs", blogRoutes);

// -----------------------------------------------------
// Tender Alerts
// -----------------------------------------------------

app.use("/api/tenders", tenderRoutes);

// -----------------------------------------------------
// News
// -----------------------------------------------------

app.use("/api/news", newsRoutes);

// -----------------------------------------------------
// Inquiries
// -----------------------------------------------------

app.use("/api/inquiries", inquiryRoutes);

// -----------------------------------------------------
// Subscribers
// -----------------------------------------------------

app.use("/api/subscribers", subscriberRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {

    res.status(200).json({
        status: "ok"
    });

});

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.status(200).json({
        status: "ok",
        message: "Human Appeal Pakistan API Server Running"
    });

});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
//
// Delegated to ./middleware/errorMiddleware, which respects a
// statusCode attached to the error (see the CORS origin callback
// above, which now sets err.statusCode = 403) and otherwise masks
// details behind a generic 500.
//

app.use(errorMiddleware);

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {

    console.log("==========================================");
    console.log("Human Appeal Pakistan API");
    console.log("==========================================");
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log("Security middleware: ENABLED");
    console.log("Rate limiting: ENABLED");
    console.log("==========================================");

});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const shutdown = (signal) => {

    console.log(`${signal} received. Shutting down server...`);

    server.close(() => {

        console.log("HTTP server closed.");

        process.exit(0);

    });

};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));