const express = require("express");

const router = express.Router();

const postController = require("../controllers/postController");

const authenticateToken =
    require("../middleware/authMiddleware");

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const {
    validatePost,
    validatePostId
} = require("../validators/postValidator");


// ================= GET ALL POSTS (PUBLIC) =================

router.get(

    "/",

    postController.getAllPosts

);


// ================= GET POST BY ID (PUBLIC) =================

router.get(

    "/:id",

    validatePostId,

    postController.getPostById

);


// ================= CREATE POST =================

router.post(

    "/",

    authenticateToken,

    permissionMiddleware("manage_posts"),

    validatePost,

    postController.createPost

);


// ================= UPDATE POST =================

router.put(

    "/:id",

    authenticateToken,

    permissionMiddleware("manage_posts"),

    validatePostId,

    validatePost,

    postController.updatePost

);


// ================= DELETE POST =================

router.delete(

    "/:id",

    authenticateToken,

    permissionMiddleware("manage_posts"),

    validatePostId,

    postController.deletePost

);


module.exports = router;