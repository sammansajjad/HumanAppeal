// validators/permissionValidator.js
//
// Pure request validation for the Permission module.
// No DB queries, no existence checks (role exists, permission exists),
// no duplicate-name checks, no auth. Those stay in controller/model.

const MAX_NAME_LENGTH = 100; // matches existing controller-enforced cap
const MAX_PERMISSION_IDS = 100; // matches existing controller-enforced cap

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isPositiveIntegerString(value) {
    return typeof value === "string" && /^\d+$/.test(value) && parseInt(value, 10) > 0;
}

function validateIdParam(id) {
    const errors = [];

    if (id === undefined || id === null || id === "") {
        errors.push("id is required");
    } else if (!isPositiveIntegerString(String(id))) {
        errors.push("id must be a valid positive integer");
    }

    return errors;
}

function validateNameBody(body) {
    const errors = [];
    const { name } = body;

    if (name === undefined || name === null) {
        errors.push("name is required");
    } else if (typeof name !== "string") {
        errors.push("name must be a string");
    } else if (!isNonEmptyString(name)) {
        errors.push("name cannot be empty or whitespace only");
    } else if (name.trim().length > MAX_NAME_LENGTH) {
        errors.push(`name must be ${MAX_NAME_LENGTH} characters or fewer`);
    }

    return errors;
}

// GET /api/permissions/:id, DELETE /api/permissions/:id
const validatePermissionId = (req, res, next) => {
    const errors = validateIdParam(req.params.id);

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

// POST /api/permissions
const validateCreatePermission = (req, res, next) => {
    const errors = validateNameBody(req.body || {});

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

// PUT /api/permissions/:id
const validateUpdatePermission = (req, res, next) => {
    const idErrors = validateIdParam(req.params.id);
    const bodyErrors = validateNameBody(req.body || {});
    const errors = [...idErrors, ...bodyErrors];

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

// GET /api/permissions/roles/:roleId/permissions
const validateRoleIdParam = (req, res, next) => {
    const errors = validateIdParam(req.params.roleId);

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

// POST /api/permissions/roles/:roleId/permissions
// PATCH /api/permissions/roles/:roleId/permissions
//
// NOTE: an empty permission_ids array is intentionally valid — it's how
// the model clears all permissions from a role. Do not require non-empty.
const validateAssignPermissions = (req, res, next) => {
    const errors = validateIdParam(req.params.roleId);

    const { permission_ids } = req.body || {};

    if (!Array.isArray(permission_ids)) {
        errors.push("permission_ids must be an array");
    } else {
        if (permission_ids.length > MAX_PERMISSION_IDS) {
            errors.push(`permission_ids must contain ${MAX_PERMISSION_IDS} or fewer items`);
        }

        const hasInvalidId = permission_ids.some(
            (permissionId) => !Number.isInteger(permissionId) || permissionId <= 0
        );

        if (hasInvalidId) {
            errors.push("permission_ids must contain only positive integers");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

module.exports = {
    validatePermissionId,
    validateCreatePermission,
    validateUpdatePermission,
    validateRoleIdParam,
    validateAssignPermissions
};