const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const pageController = require("../controllers/pageController");
const {
    validateCreatePage,
    validateUpdatePage,
    validatePageId
} = require("../validators/pageValidator");


// Get All Pages
router.get(
    "/",
    authenticateToken,
    permissionMiddleware("manage_pages"),
    pageController.getAllPages
);


// Get Single Page
router.get(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_pages"),
    validatePageId,
    pageController.getPageById
);


// Create Page
router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_pages"),
    validateCreatePage,
    pageController.createPage
);


// Update Page
router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_pages"),
    validateUpdatePage,
    pageController.updatePage
);


// Delete Page
router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_pages"),
    validatePageId,
    pageController.deletePage
);


// Restore Page
router.patch(
    "/:id/restore",
    authenticateToken,
    permissionMiddleware("manage_pages"),
    validatePageId,
    pageController.restorePage
);


module.exports = router;