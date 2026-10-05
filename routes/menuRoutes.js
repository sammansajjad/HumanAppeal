const express = require("express");

const router = express.Router();

const menuController = require("../controllers/menuController");

const authenticateToken =
    require("../middleware/authMiddleware");

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const {
    validateCreateMenu,
    validateUpdateMenu,
    validateMenuIdParam
} = require("../validators/menuValidator");


// ================= Get All Menus =================

router.get(
    "/",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    menuController.getAllMenus
);


// ================= Get Menu By ID =================

router.get(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuIdParam,
    menuController.getMenuById
);


// ================= Create Menu =================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateCreateMenu,
    menuController.createMenu
);


// ================= Update Menu =================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuIdParam,
    validateUpdateMenu,
    menuController.updateMenu
);


// ================= Delete Menu =================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuIdParam,
    menuController.deleteMenu
);


// ================= Restore Menu =================

router.patch(
    "/:id/restore",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuIdParam,
    menuController.restoreMenu
);


module.exports = router;