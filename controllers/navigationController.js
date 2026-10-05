const menuModel = require("../models/menuModel");
const menuItemModel = require("../models/menuItemModel");

// ================= PUBLIC NAVIGATION =================
// Scoped to the "header" menu location only, so other menus
// (e.g. an admin-only sidebar) never leak into the public
// site's nav, and a soft-deleted or deactivated menu stops
// serving immediately instead of silently continuing to.

exports.getPublicNavigation = async (req, res) => {
    try {
        const activeItems = await menuItemModel.getItemsByMenuLocation("header");

        return res.status(200).json({
            success: true,
            items: activeItems
        });

    } catch (error) {
        console.error("PUBLIC NAVIGATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= ADMIN NAVIGATION =================

exports.getAdminNavigation = async (req, res) => {
    try {
        const menus = await menuModel.getAllMenus();
        const items = await menuItemModel.getAllItems();

        return res.status(200).json({
            success: true,
            menus,
            items
        });

    } catch (error) {
        console.error("ADMIN NAVIGATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= CREATE NAVIGATION =================

exports.createNavigation = async (req, res) => {
    try {
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
        } = req.body;

        if (!menu_id || !label_en) {
            return res.status(400).json({
                success: false,
                message: "Menu and English label are required"
            });
        }

        const id = await menuItemModel.createItem({
            menu_id,
            parent_id: parent_id ?? null,
            label_en,
            label_ur: label_ur ?? null,
            type: type ?? "custom",
            url: url ?? null,
            target: target ?? "_self",
            sort_order: sort_order ?? 0,
            is_active: is_active ?? 1
        });

        return res.status(201).json({
            success: true,
            message: "Navigation item created successfully",
            id
        });

    } catch (error) {
        console.error("CREATE NAVIGATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= UPDATE NAVIGATION =================

exports.updateNavigation = async (req, res) => {
    try {
        const { id } = req.params;

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
        } = req.body;

        if (!label_en) {
            return res.status(400).json({
                success: false,
                message: "English label is required"
            });
        }

        const result = await menuItemModel.updateItem(id, {
            menu_id,
            parent_id: parent_id ?? null,
            label_en,
            label_ur: label_ur ?? null,
            type: type ?? "custom",
            url: url ?? null,
            target: target ?? "_self",
            sort_order: sort_order ?? 0,
            is_active: is_active ?? 1
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Navigation item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Navigation item updated successfully"
        });

    } catch (error) {
        console.error("UPDATE NAVIGATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= DELETE NAVIGATION =================

exports.deleteNavigation = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await menuItemModel.deleteItem(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Navigation item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Navigation item deleted successfully"
        });

    } catch (error) {
        console.error("DELETE NAVIGATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};