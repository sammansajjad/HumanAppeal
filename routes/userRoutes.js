const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const userValidator = require("../validators/userValidator");


// =====================================================
// GET ALL USERS
// =====================================================

router.get(
    "/",
    authenticateToken,
    permissionMiddleware("manage_users"),
    userController.getAllUsers
);


// =====================================================
// GET USER BY ID
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_users"),
    userValidator.validateUserId,
    userController.getUserById
);


// =====================================================
// CREATE USER
// =====================================================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_users"),
    userValidator.validateCreateUser,
    userController.createUser
);


// =====================================================
// UPDATE USER
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_users"),
    userValidator.validateUpdateUser,
    userController.updateUser
);


// =====================================================
// DELETE USER
// =====================================================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_users"),
    userValidator.validateUserId,
    userController.deleteUser
);


// =====================================================
// RESTORE USER
// =====================================================

router.patch(
    "/:id/restore",
    authenticateToken,
    permissionMiddleware("manage_users"),
    userValidator.validateUserId,
    userController.restoreUser
);


module.exports = router;