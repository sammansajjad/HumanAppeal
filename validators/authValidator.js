// validators/authValidator.js
//
// Pure request validation for the Auth module.
// No DB queries, no credential checks, no JWT verification,
// no role/permission checks.
// Those responsibilities stay in controller/model/middleware.

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function validateLoginBody(body) {
    const errors = [];

    const {
        email,
        password
    } = body;

    // -------------------------------------------------
    // email — required
    // -------------------------------------------------

    if (email === undefined || email === null) {

        errors.push("email is required");

    } else if (typeof email !== "string") {

        errors.push("email must be a string");

    } else if (!isNonEmptyString(email)) {

        errors.push("email cannot be empty or whitespace only");

    } else if (email.trim().length > MAX_EMAIL_LENGTH) {

        errors.push(
            `email must be ${MAX_EMAIL_LENGTH} characters or fewer`
        );

    } else if (!EMAIL_PATTERN.test(email.trim())) {

        errors.push("email must be a valid email address");
    }

    // -------------------------------------------------
    // password — required
    // -------------------------------------------------

    if (password === undefined || password === null) {

        errors.push("password is required");

    } else if (typeof password !== "string") {

        errors.push("password must be a string");

    } else if (!isNonEmptyString(password)) {

        errors.push("password cannot be empty or whitespace only");

    } else if (password.length > MAX_PASSWORD_LENGTH) {

        errors.push(
            `password must be ${MAX_PASSWORD_LENGTH} characters or fewer`
        );
    }

    return errors;
}

// =====================================================
// POST /api/auth/login
// =====================================================

const validateLogin = (req, res, next) => {

    const errors =
        validateLoginBody(req.body || {});

    if (errors.length > 0) {

        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });

    }

    next();
};

module.exports = {
    validateLogin
};