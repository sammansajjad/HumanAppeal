const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// =====================================================
// JWT CONFIGURATION
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {

    console.error(
        "FATAL ERROR: JWT_SECRET is not configured."
    );

    process.exit(1);
}

if (JWT_SECRET.length < 32) {

    console.error(
        "FATAL ERROR: JWT_SECRET must be at least 32 characters long."
    );

    process.exit(1);
}

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const authenticateToken = (req, res, next) => {

    try {

        // -------------------------------------------------
        // AUTHORIZATION HEADER
        // -------------------------------------------------

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            typeof authHeader !== "string" ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        // -------------------------------------------------
        // EXTRACT TOKEN
        // -------------------------------------------------

        const token =
            authHeader.substring(7).trim();

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        // -------------------------------------------------
        // BASIC JWT FORMAT CHECK
        // -------------------------------------------------

        const tokenParts = token.split(".");

        if (tokenParts.length !== 3) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

        // -------------------------------------------------
        // VERIFY TOKEN
        // -------------------------------------------------

        const decoded = jwt.verify(
            token,
            JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );
     

        // -------------------------------------------------
        // VALIDATE PAYLOAD
        // -------------------------------------------------

  if (
    !decoded ||
    typeof decoded !== "object" ||
    !decoded.id ||
    !Number.isInteger(decoded.exp) ||
    decoded.exp <= Math.floor(Date.now() / 1000)
) {
    return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
    });
}

        // -------------------------------------------------
        // VALIDATE USER ID
        // -------------------------------------------------

        const userId =
            Number(decoded.id);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

        // -------------------------------------------------
        // VALIDATE ROLE
        // -------------------------------------------------

        if (
            decoded.role !== undefined &&
            (
                typeof decoded.role !== "string" ||
                decoded.role.length > 100
            )
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

// -------------------------------------------------
// CHECK USER STATUS
// -------------------------------------------------

        userModel.isUserActive(
            userId,
            (err, isActive) => {

                if (err) {

                    console.error(
                        "User status check failed:",
                        err.code || err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Authentication service unavailable"
                    });

                }

                if (!isActive) {

                    return res.status(401).json({
                        success: false,
                        message: "Authentication required"
                    });

                }

                // -------------------------------------------------
                // AUTHENTICATED USER
                // -------------------------------------------------

                req.user = {
                    id: userId,
                    role: decoded.role
                };

                next();

            }
        );

    }

    catch (error) {
     

    


        // -------------------------------------------------
        // EXPIRED TOKEN
        // -------------------------------------------------

        if (
            error.name === "TokenExpiredError"
        ) {

            return res.status(401).json({
                success: false,
                message: "Authentication token expired"
            });

        }

        // -------------------------------------------------
        // INVALID TOKEN
        // -------------------------------------------------

        if (
            error.name === "JsonWebTokenError"
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

        // -------------------------------------------------
        // OTHER AUTHENTICATION ERROR
        // -------------------------------------------------

        console.error(
            "Authentication error:",
            error.code || error.name || "UNKNOWN_ERROR"
        );

        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });

    }

};

// =====================================================
// EXPORT
// =====================================================

module.exports = authenticateToken;