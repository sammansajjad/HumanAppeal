const express = require("express");

const router = express.Router();

const menuItemController = require("../controllers/menuItemController");

const authenticateToken =
    require("../middleware/authMiddleware");

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const {
    validateCreateMenuItem,
    validateUpdateMenuItem,
    validateMenuItemIdParam,
    validateMenuIdParam,
    validateMenuTreeIdParam
} = require("../validators/menuItemValidator");


// ================= Get All Menu Items =================

router.get(
    "/",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    menuItemController.getAllMenuItems
);


// ================= Get Items By Menu =================

router.get(
    "/menu/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuIdParam,
    menuItemController.getMenuItems
);


// ================= Get Menu Tree =================

router.get(
    "/tree/:menuId",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuTreeIdParam,
    menuItemController.getMenuTree
);


// ================= Get Item By ID =================

router.get(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuItemIdParam,
    menuItemController.getMenuItemById
);


// ================= Create Menu Item =================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateCreateMenuItem,
    menuItemController.createMenuItem
);


// ================= Update Menu Item =================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuItemIdParam,
    validateUpdateMenuItem,
    menuItemController.updateMenuItem
);


// ================= Delete Menu Item =================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuItemIdParam,
    menuItemController.deleteMenuItem
);


// ================= Restore Menu Item =================

router.patch(
    "/:id/restore",
    authenticateToken,
    permissionMiddleware("manage_navigation"),
    validateMenuItemIdParam,
    menuItemController.restoreMenuItem
);


module.exports = router;