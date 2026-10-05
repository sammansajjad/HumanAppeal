const menuItemModel = require("../models/menuItemModel");

// ================= Get All Menu Items =================

exports.getAllMenuItems = async (req, res) => {
    try {
        const results = await menuItemModel.getAllItems();

        return res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        console.error("GET ALL MENU ITEMS CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Create Menu Item =================

exports.createMenuItem = async (req, res) => {
    const itemData = {
        menu_id: req.body.menu_id,
        parent_id: req.body.parent_id,
        label_en: req.body.label_en,
        label_ur: req.body.label_ur,
        type: req.body.type || "custom",
        url: req.body.url,
        target: req.body.target,
        sort_order: req.body.sort_order,
        is_active: req.body.is_active
    };

    if (!itemData.menu_id || !itemData.label_en) {
        return res.status(400).json({
            success: false,
            message: "menu_id and label_en are required"
        });
    }

    try {
        const insertId = await menuItemModel.createItem(itemData);

        return res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            id: insertId
        });
    } catch (err) {
        console.error("CREATE MENU ITEM CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Get Items By Menu =================

exports.getMenuItems = async (req, res) => {
    const menu_id = req.params.id;

    try {
        const results = await menuItemModel.getMenuItems(menu_id);

        return res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        console.error("GET MENU ITEMS CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Get Item By ID =================

exports.getMenuItemById = async (req, res) => {
    const id = req.params.id;

    try {
        const results = await menuItemModel.getMenuItemById(id);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: results[0]
        });
    } catch (err) {
        console.error("GET MENU ITEM BY ID CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Update Menu Item =================

exports.updateMenuItem = async (req, res) => {
    const id = req.params.id;

    const itemData = {
        menu_id: req.body.menu_id,
        parent_id: req.body.parent_id,
        label_en: req.body.label_en,
        label_ur: req.body.label_ur,
        type: req.body.type,
        url: req.body.url,
        target: req.body.target,
        sort_order: req.body.sort_order,
        is_active: req.body.is_active
    };

    try {
        const result = await menuItemModel.updateItem(id, itemData);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully"
        });
    } catch (err) {
        console.error("UPDATE MENU ITEM CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Delete Menu Item =================

exports.deleteMenuItem = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await menuItemModel.deleteItem(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Menu item deleted successfully"
        });
    } catch (err) {
        console.error("DELETE MENU ITEM CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Restore Menu Item =================

exports.restoreMenuItem = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await menuItemModel.restoreMenuItem(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Deleted menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Menu item restored successfully"
        });
    } catch (err) {
        console.error("RESTORE MENU ITEM CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ================= Get Menu Tree =================

exports.getMenuTree = async (req, res) => {
    const menu_id = req.params.menuId;

    try {
        const items = await menuItemModel.getMenuTree(menu_id);

        const buildTree = (items, parentId = null) => {
            return items
                .filter((item) => item.parent_id === parentId)
                .map((item) => {
                    return {
                        id: item.id,
                        label_en: item.label_en,
                        label_ur: item.label_ur,
                        type: item.type,
                        url: item.url,
                        target: item.target,
                        sort_order: item.sort_order,
                        children: buildTree(items, item.id)
                    };
                });
        };

        const tree = buildTree(items);

        return res.status(200).json({
            success: true,
            data: tree
        });
    } catch (err) {
        console.error("GET MENU TREE CONTROLLER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};