const validatePositiveInteger = (value, fieldName) => {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value <= 0
    ) {
        return `${fieldName} must be a positive integer.`;
    }

    return null;
};


const validateString = (
    value,
    fieldName,
    maxLength,
    required = false
) => {
    if (value === undefined || value === null) {

        if (required) {
            return `${fieldName} is required.`;
        }

        return null;
    }

    if (typeof value !== "string") {
        return `${fieldName} must be a string.`;
    }

    if (!value.trim()) {
        return `${fieldName} cannot be empty.`;
    }

    if (value.length > maxLength) {
        return `${fieldName} must not exceed ${maxLength} characters.`;
    }

    return null;
};


const validateIsActive = (value) => {

    if (value === undefined || value === null) {
        return null;
    }

    if (value !== 0 && value !== 1) {
        return "is_active must be either 0 or 1.";
    }

    return null;
};


// ================= Menu ID =================

const validateMenuIdParam = (req, res, next) => {

    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        String(id) !== req.params.id
    ) {
        return res.status(400).json({
            success: false,
            message: "ID must be a positive integer."
        });
    }

    next();
};


// ================= Create Menu =================

const validateCreateMenu = (req, res, next) => {

    const {
        name,
        location,
        is_active
    } = req.body || {};


    const nameError = validateString(
        name,
        "name",
        255,
        true
    );

    if (nameError) {
        return res.status(400).json({
            success: false,
            message: nameError
        });
    }


    const locationError = validateString(
        location,
        "location",
        255,
        true
    );

    if (locationError) {
        return res.status(400).json({
            success: false,
            message: locationError
        });
    }


    const isActiveError = validateIsActive(is_active);

    if (isActiveError) {
        return res.status(400).json({
            success: false,
            message: isActiveError
        });
    }


    next();
};


// ================= Update Menu =================

const validateUpdateMenu = (req, res, next) => {

    return validateCreateMenu(req, res, next);

};


module.exports = {
    validateCreateMenu,
    validateUpdateMenu,
    validateMenuIdParam
};