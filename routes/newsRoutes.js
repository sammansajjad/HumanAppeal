const express = require("express");

const router = express.Router();

const newsController = require("../controllers/newsController");

const authenticateToken =
    require("../middleware/authMiddleware");

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const {
    validateCreateNews,
    validateUpdateNews,
    validateNewsIdParam
} = require("../validators/newsValidator");


const requireNewsPermission = [
    authenticateToken,
    permissionMiddleware("manage_news")
];


// -----------------------------------------------------
// PUBLIC ROUTES
// -----------------------------------------------------
// GET routes are intentionally public (no auth/permission
// middleware) — the public-facing site reads news without
// a login. Only create/update/delete require manage_news.
// -----------------------------------------------------

router.get(
    "/",
    newsController.getAllNews
);


router.get(
    "/:id",
    validateNewsIdParam,
    newsController.getNewsById
);


// -----------------------------------------------------
// PROTECTED ROUTES
// -----------------------------------------------------

router.post(
    "/",
    ...requireNewsPermission,
    validateCreateNews,
    newsController.createNews
);


router.put(
    "/:id",
    ...requireNewsPermission,
    validateNewsIdParam,
    validateUpdateNews,
    newsController.updateNews
);


router.delete(
    "/:id",
    ...requireNewsPermission,
    validateNewsIdParam,
    newsController.deleteNews
);


module.exports = router;