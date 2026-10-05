// ============================================
// HELPERS
// ============================================
const isValidId = (id) => {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_VALUES = ["draft", "published", "closed"];


// ============================================
// VALIDATE JOB POSTING ID (params.id)
// ============================================
const validateJobPostingId = (req, res, next) => {

    const { id } = req.params;

    if (!isValidId(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid job posting ID"
        });

    }

    next();

};


// ============================================
// VALIDATE CREATE / UPDATE BODY
// ============================================
const validateJobPostingBody = (req, res, next) => {

    const {
        title,
        slug,
        reference_no,
        department,
        location,
        employment_type,
        application_url,
        application_email,
        status,
        featured,
        opening_date,
        closing_date,
        published_at
    } = req.body;


    // --- title (required) ---
    if (typeof title !== "string" || !title.trim()) {

        return res.status(400).json({
            success: false,
            message: "Title is required"
        });

    }

    if (title.trim().length > 255) {

        return res.status(400).json({
            success: false,
            message: "Title must not exceed 255 characters"
        });

    }


    // --- slug (required, lowercase-hyphenated) ---
    if (typeof slug !== "string" || !slug.trim()) {

        return res.status(400).json({
            success: false,
            message: "Slug is required"
        });

    }

    if (slug.trim().length > 255) {

        return res.status(400).json({
            success: false,
            message: "Slug must not exceed 255 characters"
        });

    }

    if (!SLUG_PATTERN.test(slug.trim())) {

        return res.status(400).json({
            success: false,
            message:
                "Slug must be lowercase, alphanumeric, and hyphen-separated (e.g. 'senior-developer')"
        });

    }


    // --- reference_no (optional, varchar(100)) ---
    if (
        reference_no !== undefined &&
        reference_no !== null &&
        reference_no !== ""
    ) {

        if (typeof reference_no !== "string") {

            return res.status(400).json({
                success: false,
                message: "Reference number must be a string"
            });

        }

        if (reference_no.trim().length > 100) {

            return res.status(400).json({
                success: false,
                message:
                    "Reference number must not exceed 100 characters"
            });

        }

    }


    // --- department (optional, varchar(255)) ---
    if (
        department !== undefined &&
        department !== null &&
        department !== ""
    ) {

        if (typeof department !== "string") {

            return res.status(400).json({
                success: false,
                message: "Department must be a string"
            });

        }

        if (department.trim().length > 255) {

            return res.status(400).json({
                success: false,
                message: "Department must not exceed 255 characters"
            });

        }

    }


    // --- location (optional, varchar(255)) ---
    if (
        location !== undefined &&
        location !== null &&
        location !== ""
    ) {

        if (typeof location !== "string") {

            return res.status(400).json({
                success: false,
                message: "Location must be a string"
            });

        }

        if (location.trim().length > 255) {

            return res.status(400).json({
                success: false,
                message: "Location must not exceed 255 characters"
            });

        }

    }


    // --- employment_type (optional, varchar(100), free text) ---
    if (
        employment_type !== undefined &&
        employment_type !== null &&
        employment_type !== ""
    ) {

        if (typeof employment_type !== "string") {

            return res.status(400).json({
                success: false,
                message: "Employment type must be a string"
            });

        }

        if (employment_type.trim().length > 100) {

            return res.status(400).json({
                success: false,
                message:
                    "Employment type must not exceed 100 characters"
            });

        }

    }


    // --- application_url (optional, varchar(500)) ---
    if (
        application_url !== undefined &&
        application_url !== null &&
        application_url !== ""
    ) {

        if (typeof application_url !== "string") {

            return res.status(400).json({
                success: false,
                message: "Application URL must be a string"
            });

        }

        if (application_url.trim().length > 500) {

            return res.status(400).json({
                success: false,
                message:
                    "Application URL must not exceed 500 characters"
            });

        }

    }


    // --- application_email (optional, varchar(255), email format) ---
    if (
        application_email !== undefined &&
        application_email !== null &&
        application_email !== ""
    ) {

        if (typeof application_email !== "string") {

            return res.status(400).json({
                success: false,
                message: "Application email must be a string"
            });

        }

        if (application_email.trim().length > 255) {

            return res.status(400).json({
                success: false,
                message:
                    "Application email must not exceed 255 characters"
            });

        }

        if (!EMAIL_PATTERN.test(application_email.trim())) {

            return res.status(400).json({
                success: false,
                message: "Application email must be a valid email address"
            });

        }

    }


    // --- status (optional, enum) ---
    if (status !== undefined && status !== null && status !== "") {

        if (!STATUS_VALUES.includes(status)) {

            return res.status(400).json({
                success: false,
                message:
                    "Status must be one of: " + STATUS_VALUES.join(", ")
            });

        }

    }


    // --- featured (optional, boolean-ish) ---
    if (featured !== undefined && featured !== null) {

        const validFeatured =
            featured === 0 ||
            featured === 1 ||
            featured === true ||
            featured === false ||
            featured === "0" ||
            featured === "1";

        if (!validFeatured) {

            return res.status(400).json({
                success: false,
                message: "Featured must be a boolean (0, 1, true, or false)"
            });

        }

    }


    // --- opening_date (optional, date string) ---
    if (
        opening_date !== undefined &&
        opening_date !== null &&
        opening_date !== ""
    ) {

        if (isNaN(Date.parse(opening_date))) {

            return res.status(400).json({
                success: false,
                message: "Opening date must be a valid date"
            });

        }

    }


    // --- closing_date (optional, date string) ---
    if (
        closing_date !== undefined &&
        closing_date !== null &&
        closing_date !== ""
    ) {

        if (isNaN(Date.parse(closing_date))) {

            return res.status(400).json({
                success: false,
                message: "Closing date must be a valid date"
            });

        }

    }


    // --- published_at (optional, date/timestamp string) ---
    if (
        published_at !== undefined &&
        published_at !== null &&
        published_at !== ""
    ) {

        if (isNaN(Date.parse(published_at))) {

            return res.status(400).json({
                success: false,
                message: "Published date must be a valid date"
            });

        }

    }


    next();

};


// ============================================
// EXPORT
// ============================================
module.exports = {
    validateJobPostingId,
    validateJobPostingBody
};
