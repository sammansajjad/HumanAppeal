const express = require("express");

const router = express.Router();

const blogController = require("../controllers/blogController");

const authenticateToken = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
    validateCreateBlog,
    validateUpdateBlog,
    validateBlogIdParam
} = require("../validators/blogValidator");


// =====================================================
// GET ALL BLOGS (PUBLIC)
// GET /api/blogs
// =====================================================

router.get(
    "/",
    blogController.getAllBlogs
);


// =====================================================
// GET BLOG BY ID (PUBLIC)
// GET /api/blogs/:id
// =====================================================

router.get(
    "/:id",
    validateBlogIdParam,
    blogController.getBlogById
);


// =====================================================
// CREATE BLOG
// POST /api/blogs
// =====================================================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_posts"),
    validateCreateBlog,
    blogController.createBlog
);


// =====================================================
// UPDATE BLOG
// PUT /api/blogs/:id
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_posts"),
    validateUpdateBlog,
    blogController.updateBlog
);


// =====================================================
// DELETE BLOG
// DELETE /api/blogs/:id
// =====================================================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_posts"),
    validateBlogIdParam,
    blogController.deleteBlog
);


module.exports = router;