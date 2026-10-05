const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/authController");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    validateLogin
} = require("../validators/authValidator");

// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    validateLogin,
    authController.login
);

// =====================================================
// CURRENT AUTHENTICATED USER
// =====================================================

router.get(
    "/me",
    authMiddleware,
    authController.me
);

module.exports = router;