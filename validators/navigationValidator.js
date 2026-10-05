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


const validateOptionalPositiveInteger = (value, fieldName) => {
    if (value === undefined || value === null) {
        return null;
    }

    return validatePositiveInteger(value, fieldName);
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


const validateNonNegativeInteger = (value, fieldName) => {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0
    ) {
        return `${fieldName} must be a non-negative integer.`;
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


// ================= Navigation ID =================

const validateNavigationIdParam = (req, res, next) => {
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


// ================= Create Navigation =================

const validateCreateNavigation = (req, res, next) => {
    const {
        menu_id,
        parent_id,
        label_en,
        label_ur,
        type,
        url,
        target,
        sort_order,
        is_active
    } = req.body || {};


    const menuIdError = validatePositiveInteger(
        menu_id,
        "menu_id"
    );

    if (menuIdError) {
        return res.status(400).json({
            success: false,
            message: menuIdError
        });
    }


    const parentIdError = validateOptionalPositiveInteger(
        parent_id,
        "parent_id"
    );

    if (parentIdError) {
        return res.status(400).json({
            success: false,
            message: parentIdError
        });
    }


    const labelEnError = validateString(
        label_en,
        "label_en",
        255,
        true
    );

    if (labelEnError) {
        return res.status(400).json({
            success: false,
            message: labelEnError
        });
    }


    const labelUrError = validateString(
        label_ur,
        "label_ur",
        255
    );

    if (labelUrError) {
        return res.status(400).json({
            success: false,
            message: labelUrError
        });
    }


    const typeError = validateString(
        type,
        "type",
        100
    );

    if (typeError) {
        return res.status(400).json({
            success: false,
            message: typeError
        });
    }


    const urlError = validateString(
        url,
        "url",
        2048
    );

    if (urlError) {
        return res.status(400).json({
            success: false,
            message: urlError
        });
    }


    const targetError = validateString(
        target,
        "target",
        50
    );

    if (targetError) {
        return res.status(400).json({
            success: false,
            message: targetError
        });
    }


    if (sort_order !== undefined && sort_order !== null) {
        const sortOrderError = validateNonNegativeInteger(
            sort_order,
            "sort_order"
        );

        if (sortOrderError) {
            return res.status(400).json({
                success: false,
                message: sortOrderError
            });
        }
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


// ================= Update Navigation =================

const validateUpdateNavigation = (req, res, next) => {
    // PUT replaces the full menu-item data,
    // so menu_id and label_en are required.

    return validateCreateNavigation(req, res, next);
};


module.exports = {
    validateCreateNavigation,
    validateUpdateNavigation,
    validateNavigationIdParam
};