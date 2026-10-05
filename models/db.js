const mysql = require("mysql2");
require("dotenv").config();

// =====================================================
// ENVIRONMENT
// =====================================================

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

// =====================================================
// REQUIRED DATABASE CONFIGURATION
// =====================================================

const requiredEnv = [
    "DB_HOST",
    "DB_USER",
    "DB_NAME"
];

if (IS_PRODUCTION) {
    requiredEnv.push("DB_PASSWORD");
}

const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
);

if (missingEnv.length > 0) {
    console.error(
        `Missing required database environment variables: ${missingEnv.join(", ")}`
    );

    process.exit(1);
}

// =====================================================
// DATABASE CONFIGURATION
// =====================================================

const DB_PORT = Number(process.env.DB_PORT || 3306);

const DB_CONNECTION_LIMIT = Number(
    process.env.DB_CONNECTION_LIMIT || 10
);

// =====================================================
// DATABASE POOL
// =====================================================

const db = mysql.createPool({

    host: process.env.DB_HOST,

    port: DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: DB_CONNECTION_LIMIT,

    queueLimit: 0,

    enableKeepAlive: true,

    keepAliveInitialDelay: 10000,

    connectTimeout: 10000
});

// =====================================================
// POOL ERROR HANDLING
// =====================================================

db.on("error", (err) => {

    console.error(
        "MySQL pool error:",
        err.code || "UNKNOWN_ERROR"
    );

    if (
        err.code === "PROTOCOL_CONNECTION_LOST" ||
        err.code === "ECONNRESET"
    ) {

        console.log(
            "Database connection lost. Pool will reconnect automatically."
        );

    }

});

// =====================================================
// INITIAL DATABASE CONNECTION TEST
// =====================================================

db.getConnection((err, connection) => {

    if (err) {

        console.error(
            "Database connection failed:",
            err.code || "UNKNOWN_ERROR"
        );

        if (!IS_PRODUCTION) {
            console.error(err.message);
        }

        return;
    }

    console.log("Database connected successfully.");

    connection.release();

});

// =====================================================
// EXPORT
// =====================================================

module.exports = db;