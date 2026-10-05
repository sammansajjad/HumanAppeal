const express = require("express");

const router = express.Router();

const navigationController =
    require("../controllers/navigationController");

const authMiddleware =
    require("../middleware/authMiddleware");

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const {
    validateCreateNavigation,
    validateUpdateNavigation,
    validateNavigationIdParam
} = require("../validators/navigationValidator");


// ================= PUBLIC NAVIGATION =================

router.get(
    "/",
    navigationController.getPublicNavigation
);


// ================= ADMIN NAVIGATION =================

router.get(
    "/admin",
    authMiddleware,
    permissionMiddleware("manage_navigation"),
    navigationController.getAdminNavigation
);


// ================= CREATE =================

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("manage_navigation"),
    validateCreateNavigation,
    navigationController.createNavigation
);


// ================= UPDATE =================

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("manage_navigation"),
    validateNavigationIdParam,
    validateUpdateNavigation,
    navigationController.updateNavigation
);


// ================= DELETE =================

router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("manage_navigation"),
    validateNavigationIdParam,
    navigationController.deleteNavigation
);


module.exports = router;