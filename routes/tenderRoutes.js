const express = require("express");

const router = express.Router();

const tenderController = require("../controllers/tenderController");

const authenticateToken = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");

const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
    validateId,
    createTender,
    updateTender
} = require("../validators/tenderValidator");


// ================= GET ALL TENDERS =================
// Public: open only. Authenticated + manage_tenders: all statuses.

router.get(
    "/",
    optionalAuth,
    tenderController.getAllTenders
);


// ================= GET TENDER BY ID =================
// Public: open only. Authenticated + manage_tenders: all statuses.

router.get(
    "/:id",
    optionalAuth,
    validateId,
    tenderController.getTenderById
);


// ================= CREATE TENDER =================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_tenders"),
    createTender,
    tenderController.createTender
);


// ================= UPDATE TENDER =================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_tenders"),
    validateId,
    updateTender,
    tenderController.updateTender
);


// ================= DELETE TENDER =================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_tenders"),
    validateId,
    tenderController.deleteTender
);


module.exports = router;