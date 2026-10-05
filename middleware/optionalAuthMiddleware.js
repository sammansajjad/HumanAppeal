const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// =====================================================
// OPTIONAL AUTHENTICATION MIDDLEWARE
// -------------------------------------------------------
// Same token verification as authMiddleware.js, but never
// blocks the request. If a valid token is present, req.user
// is set (same shape: { id, role }). If no token, a malformed
// token, or an expired/invalid token is present, req.user is
// left undefined and the request continues as anonymous.
//
// Used for routes that must serve different data to admins
// vs. the public (e.g. job postings: drafts for admins,
// published-only for anonymous visitors) without requiring
// login to view the public-facing data at all.
// =====================================================

const optionalAuth = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            typeof authHeader !== "string" ||
            !authHeader.startsWith("Bearer ")
        ) {
            return next();
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return next();
        }

        const tokenParts = token.split(".");

        if (tokenParts.length !== 3) {
            return next();
        }

        const decoded = jwt.verify(
            token,
            JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !decoded.id
        ) {
            return next();
        }

        const userId = Number(decoded.id);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return next();
        }

        if (
            decoded.role !== undefined &&
            (
                typeof decoded.role !== "string" ||
                decoded.role.length > 100
            )
        ) {
            return next();
        }

        req.user = {
            id: userId,
            role: decoded.role
        };

        next();

    }

    catch (error) {
        // Any verification failure (expired, malformed, wrong
        // signature) just falls back to anonymous instead of
        // blocking the request.
        next();
    }

};

module.exports = optionalAuth;