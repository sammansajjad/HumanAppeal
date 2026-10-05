const { body, param, validationResult } = require("express-validator");


// ================= VALIDATION ERROR HANDLER =================

const handleValidationErrors = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }

    next();
};


// ================= VALIDATE ID =================

const validateId = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("ID must be a positive integer"),

    handleValidationErrors

];


// ================= CREATE TENDER =================

const createTender = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 255 })
        .withMessage("Title must not exceed 255 characters"),

    body("tenderNumber")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Tender number must not exceed 100 characters"),

    body("category")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Category must not exceed 100 characters"),

    body("deadline")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Deadline must be a valid date"),

    body("postedBy")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage("Posted by must not exceed 255 characters"),

    body("datePosted")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Date posted must be a valid date"),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Description must be a string"),

    body("status")
        .optional()
        .isIn(["open", "closed", "draft"])
        .withMessage("Status must be open, closed, or draft"),

    handleValidationErrors

];


// ================= UPDATE TENDER =================

const updateTender = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 255 })
        .withMessage("Title must not exceed 255 characters"),

    body("tenderNumber")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Tender number must not exceed 100 characters"),

    body("category")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Category must not exceed 100 characters"),

    body("deadline")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Deadline must be a valid date"),

    body("postedBy")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage("Posted by must not exceed 255 characters"),

    body("datePosted")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Date posted must be a valid date"),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Description must be a string"),

    body("status")
        .optional()
        .isIn(["open", "closed", "draft"])
        .withMessage("Status must be open, closed, or draft"),

    handleValidationErrors

];


module.exports = {
    validateId,
    createTender,
    updateTender
};