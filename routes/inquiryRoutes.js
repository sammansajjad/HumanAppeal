const express = require("express");

const router = express.Router();

const inquiryController = require("../controllers/inquiryController");
const authenticateToken = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
    validateCreateInquiry
} = require("../validators/inquiryValidator");


// Create inquiry
router.post(
    "/",
    validateCreateInquiry,
    inquiryController.createInquiry
);


// Get all inquiries
router.get(
    "/",
    authenticateToken,
    permissionMiddleware("manage_inquiries"),
    inquiryController.getAllInquiries
);


module.exports = router;