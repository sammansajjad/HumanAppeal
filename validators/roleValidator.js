// validators/roleValidator.js
//
// Pure request validation for the Role module.
// No DB queries.
// No existence checks.
// No uniqueness checks.
// No authentication/authorization.
//
// IMPORTANT:
// guard_name is NOT accepted from the client.
// The controller controls it internally.

const MAX_NAME_LENGTH = 255;


// =====================================================
// HELPERS
// =====================================================

const isNonEmptyString = (value) => {

    return (
        typeof value === "string" &&
        value.trim().length > 0
    );

};


const isPositiveIntegerString = (value) => {

    return (
        typeof value === "string" &&
        /^\d+$/.test(value) &&
        Number(value) > 0
    );

};


// =====================================================
// VALIDATE ROLE NAME
// =====================================================

const validateRoleName = (name) => {

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
        !isNonEmptyString(name)
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


// =====================================================
// VALIDATE ROLE ID
// =====================================================

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
// CREATE ROLE
// POST /api/roles
// =====================================================

const validateCreateRole = (
    req,
    res,
    next
) => {

    const errors =
        validateRoleName(
            req.body?.name
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
// UPDATE ROLE
// PUT /api/roles/:id
// =====================================================

const validateUpdateRole = (
    req,
    res,
    next
) => {

    const idErrors =
        validateIdParam(
            req.params.id
        );


    const nameErrors =
        validateRoleName(
            req.body?.name
        );


    const errors = [
        ...idErrors,
        ...nameErrors
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
// GET /api/roles/:id
// DELETE /api/roles/:id
// =====================================================

const validateRoleId = (
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

    validateCreateRole,
    validateUpdateRole,
    validateRoleId

};