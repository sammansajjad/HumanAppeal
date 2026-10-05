const menuItemModel = require("../models/menuItemModel");


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


const validateString = (value, fieldName, maxLength, required = false) => {
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


const validateMenuItemIdParam = (req, res, next) => {
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


const validateMenuIdParam = (req, res, next) => {
    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        String(id) !== req.params.id
    ) {
        return res.status(400).json({
            success: false,
            message: "Menu ID must be a positive integer."
        });
    }

    next();
};


const validateMenuTreeIdParam = (req, res, next) => {
    const menuId = Number(req.params.menuId);

    if (
        !Number.isInteger(menuId) ||
        menuId <= 0 ||
        String(menuId) !== req.params.menuId
    ) {
        return res.status(400).json({
            success: false,
            message: "Menu ID must be a positive integer."
        });
    }

    next();
};


// =========================================
// PARENT_ID REFERENTIAL CHECK
// Confirms parent_id (if provided) actually exists, belongs
// to the same menu, and — for updates — doesn't create a
// cycle (an item can't be parented to itself or to one of
// its own descendants).
// currentItemId is only passed on update (from req.params.id).
// =========================================

const validateParentReference = async (
    parent_id,
    menu_id,
    currentItemId
) => {

    if (parent_id === undefined || parent_id === null) {
        return null;
    }

    if (
        currentItemId !== undefined &&
        currentItemId !== null &&
        Number(parent_id) === Number(currentItemId)
    ) {
        return "parent_id cannot reference itself.";
    }

    const parentRows = await menuItemModel.getMenuItemById(parent_id);

    if (!parentRows || parentRows.length === 0) {
        return "parent_id does not reference an existing, active menu item.";
    }

    if (parentRows[0].menu_id !== menu_id) {
        return "parent_id must belong to the same menu.";
    }

    if (currentItemId !== undefined && currentItemId !== null) {
        const wouldCycle = await menuItemModel.isDescendant(
            currentItemId,
            parent_id
        );

        if (wouldCycle) {
            return "parent_id cannot be this item's own descendant (would create a cycle).";
        }
    }

    return null;
};


// =========================================
// Shared sync field checks used by both create and update
// =========================================

const runFieldChecks = (body) => {

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
    } = body;

    const menuIdError = validatePositiveInteger(menu_id, "menu_id");
    if (menuIdError) return menuIdError;

    const parentIdError = validateOptionalPositiveInteger(parent_id, "parent_id");
    if (parentIdError) return parentIdError;

    const labelEnError = validateString(label_en, "label_en", 255, true);
    if (labelEnError) return labelEnError;

    const labelUrError = validateString(label_ur, "label_ur", 255);
    if (labelUrError) return labelUrError;

    const typeError = validateString(type, "type", 100);
    if (typeError) return typeError;

    const urlError = validateString(url, "url", 2048);
    if (urlError) return urlError;

    const targetError = validateString(target, "target", 50);
    if (targetError) return targetError;

    if (sort_order !== undefined && sort_order !== null) {
        const sortOrderError = validateNonNegativeInteger(sort_order, "sort_order");
        if (sortOrderError) return sortOrderError;
    }

    const isActiveError = validateIsActive(is_active);
    if (isActiveError) return isActiveError;

    return null;
};


// ================= Create Menu Item =================

const validateCreateMenuItem = async (req, res, next) => {

    try {

        const body = req.body || {};

        const fieldError = runFieldChecks(body);

        if (fieldError) {
            return res.status(400).json({
                success: false,
                message: fieldError
            });
        }

        const parentError = await validateParentReference(
            body.parent_id,
            body.menu_id,
            null
        );

        if (parentError) {
            return res.status(400).json({
                success: false,
                message: parentError
            });
        }

        next();

    } catch (err) {
        console.error("VALIDATE CREATE MENU ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ================= Update Menu Item =================

const validateUpdateMenuItem = async (req, res, next) => {

    try {

        const body = req.body || {};

        const fieldError = runFieldChecks(body);

        if (fieldError) {
            return res.status(400).json({
                success: false,
                message: fieldError
            });
        }

        const currentItemId = Number(req.params.id);

        const parentError = await validateParentReference(
            body.parent_id,
            body.menu_id,
            currentItemId
        );

        if (parentError) {
            return res.status(400).json({
                success: false,
                message: parentError
            });
        }

        next();

    } catch (err) {
        console.error("VALIDATE UPDATE MENU ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    validateCreateMenuItem,
    validateUpdateMenuItem,
    validateMenuItemIdParam,
    validateMenuIdParam,
    validateMenuTreeIdParam
};