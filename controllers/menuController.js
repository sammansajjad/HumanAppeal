const menuModel = require("../models/menuModel");


// =========================================
// VALIDATE MENU ID
// =========================================

const isValidId = (id) => {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
};


// ================= Create Menu =================

exports.createMenu = async (req, res) => {

    const menuData = {
        name: req.body.name,
        location: req.body.location,
        is_active: req.body.is_active ?? 1
    };

    if (!menuData.name) {
        return res.status(400).json({
            success: false,
            message: "Menu name is required"
        });
    }

    try {

        const insertId = await menuModel.createMenu(menuData);

        res.status(201).json({
            success: true,
            message: "Menu created successfully",
            id: insertId
        });

    } catch (err) {

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A menu with this location already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create menu"
        });

    }

};


// ================= Get All Menus =================

exports.getAllMenus = async (req, res) => {

    try {

        const results = await menuModel.getAllMenus();

        res.json({
            success: true,
            data: results
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch menus"
        });

    }

};


// ================= Get Menu By ID =================

exports.getMenuById = async (req, res) => {

    const id = req.params.id;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    try {

        const results = await menuModel.getMenuById(id);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu not found"
            });
        }

        res.json({
            success: true,
            data: results[0]
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch menu"
        });

    }

};


// ================= Update Menu =================

exports.updateMenu = async (req, res) => {

    const id = req.params.id;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    const menuData = {
        name: req.body.name,
        location: req.body.location,
        is_active: req.body.is_active
    };

    try {

        const result = await menuModel.updateMenu(id, menuData);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu not found"
            });
        }

        res.json({
            success: true,
            message: "Menu updated successfully"
        });

    } catch (err) {

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A menu with this location already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update menu"
        });

    }

};


// ================= Delete Menu =================

exports.deleteMenu = async (req, res) => {

    const id = req.params.id;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    try {

        const result = await menuModel.deleteMenu(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu not found"
            });
        }

        res.json({
            success: true,
            message: "Menu deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Failed to delete menu"
        });

    }

};


// ================= Restore Menu =================

exports.restoreMenu = async (req, res) => {

    const id = req.params.id;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    try {

        const result = await menuModel.restoreMenu(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Deleted menu not found"
            });
        }

        res.json({
            success: true,
            message: "Menu restored successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Failed to restore menu"
        });

    }

};