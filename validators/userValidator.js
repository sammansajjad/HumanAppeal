// validators/userValidator.js
//
// Pure request validation for the User module.
// No DB queries.
// No existence checks.
// No authentication/authorization.
// No password hashing.
// No Super Admin checks.

const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;


// =====================================================
// HELPERS
// =====================================================

const isPositiveIntegerString = (value) => {

    return (
        typeof value === "string" &&
        /^\d+$/.test(value) &&
        Number(value) > 0
    );

};


const isValidEmail = (value) => {

    return (
        typeof value === "string" &&
        value.trim().length <= MAX_EMAIL_LENGTH &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value.trim()
        )
    );

};


const validateName = (name) => {

    const errors = [];

    if (
        name === undefined ||
        name === null
    ) {

        errors.push("name is required");

        return errors;

    }


    if (
        typeof name !== "string"
    ) {

        errors.push("name must be a string");

        return errors;

    }


    if (
        name.trim().length === 0
    ) {

        errors.push(
            "name cannot be empty or whitespace only"
        );

        return errors;

    }


    if (
        name.trim().length > MAX_NAME_LENGTH
    ) {

        errors.push(
            `name must be ${MAX_NAME_LENGTH} characters or fewer`
        );

    }


    return errors;

};


const validateEmail = (email) => {

    const errors = [];

    if (
        email === undefined ||
        email === null
    ) {

        errors.push("email is required");

        return errors;

    }


    if (
        typeof email !== "string"
    ) {

        errors.push("email must be a string");

        return errors;

    }


    if (
        email.trim().length === 0
    ) {

        errors.push(
            "email cannot be empty or whitespace only"
        );

        return errors;

    }


    if (
        !isValidEmail(email)
    ) {

        errors.push(
            "email must be a valid email address"
        );

    }


    return errors;

};


const validatePassword = (
    password,
    required = true
) => {

    const errors = [];


    if (
        password === undefined ||
        password === null ||
        password === ""
    ) {

        if (required) {

            errors.push("password is required");

        }

        return errors;

    }


    if (
        typeof password !== "string"
    ) {

        errors.push("password must be a string");

        return errors;

    }


    if (
        password.length < MIN_PASSWORD_LENGTH
    ) {

        errors.push(
            `password must be at least ${MIN_PASSWORD_LENGTH} characters`
        );

    }


    if (
        password.length > MAX_PASSWORD_LENGTH
    ) {

        errors.push(
            `password must be ${MAX_PASSWORD_LENGTH} characters or fewer`
        );

    }


    return errors;

};


const validateRoleIds = (roleIds) => {

    const errors = [];


    if (
        !Array.isArray(roleIds)
    ) {

        errors.push(
            "role_ids must be an array"
        );

        return errors;

    }


    if (
        roleIds.length === 0
    ) {

        errors.push(
            "at least one role is required"
        );

        return errors;

    }


    const invalidRoleId =
        roleIds.some((roleId) => {

            return (
                !Number.isInteger(roleId) ||
                roleId <= 0
            );

        });


    if (
        invalidRoleId
    ) {

        errors.push(
            "role_ids must contain positive integers"
        );

    }


    return errors;

};


const validateActiveValue = (value) => {

    return (
        value === true ||
        value === false ||
        value === 1 ||
        value === 0 ||
        value === "1" ||
        value === "0" ||
        value === "true" ||
        value === "false"
    );

};


const validateIdParam = (id) => {

    const errors = [];


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        errors.push("id is required");

        return errors;

    }


    if (
        !isPositiveIntegerString(
            String(id)
        )
    ) {

        errors.push(
            "id must be a valid positive integer"
        );

    }


    return errors;

};


// =====================================================
// CREATE USER
// POST /api/users
// =====================================================

const validateCreateUser = (
    req,
    res,
    next
) => {

    const nameErrors =
        validateName(
            req.body?.name
        );


    const emailErrors =
        validateEmail(
            req.body?.email
        );


    const passwordErrors =
        validatePassword(
            req.body?.password,
            true
        );


    const roleErrors =
        validateRoleIds(
            req.body?.role_ids
        );


    const errors = [

        ...nameErrors,
        ...emailErrors,
        ...passwordErrors,
        ...roleErrors

    ];


    if (
        errors.length > 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                errors.join(", ")

        });

    }


    next();

};


// =====================================================
// UPDATE USER
// PUT /api/users/:id
// =====================================================

const validateUpdateUser = (
    req,
    res,
    next
) => {

    const idErrors =
        validateIdParam(
            req.params.id
        );


    const nameErrors =
        validateName(
            req.body?.name
        );


    const emailErrors =
        validateEmail(
            req.body?.email
        );


    const passwordErrors =
        validatePassword(
            req.body?.password,
            false
        );


    const roleErrors =
        validateRoleIds(
            req.body?.role_ids
        );


    const activeErrors = [];

    if (
        !validateActiveValue(
            req.body?.is_active
        )
    ) {

        activeErrors.push(
            "is_active must be true or false"
        );

    }


    const errors = [

        ...idErrors,
        ...nameErrors,
        ...emailErrors,
        ...passwordErrors,
        ...roleErrors,
        ...activeErrors

    ];


    if (
        errors.length > 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                errors.join(", ")

        });

    }


    next();

};


// =====================================================
// GET /api/users/:id
// DELETE /api/users/:id
// PATCH /api/users/:id/restore
// =====================================================

const validateUserId = (
    req,
    res,
    next
) => {

    const errors =
        validateIdParam(
            req.params.id
        );


    if (
        errors.length > 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                errors.join(", ")

        });

    }


    next();

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    validateCreateUser,
    validateUpdateUser,
    validateUserId

};