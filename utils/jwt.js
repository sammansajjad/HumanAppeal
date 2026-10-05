const jwt = require("jsonwebtoken");

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
// GENERATE TOKEN
// =====================================================

const generateToken = (user) => {

    return jwt.sign(

        {
            id: user.id,
            role: user.role
        },

        JWT_SECRET,

        {
            expiresIn: "1h"
        }

    );

};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    generateToken
};