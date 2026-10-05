const validateProject = (req, res, next) => {

    const {
        title,
        content,
        status,
        coverImage,
        category,
        location
    } = req.body;

    const errors = {};

    // Title
    if (!title || typeof title !== "string" || !title.trim()) {

        errors.title = "Title is required";

    } else if (title.trim().length > 255) {

        errors.title = "Title must not exceed 255 characters";

    }


    // Content
    if (content !== undefined && content !== null) {

        if (typeof content !== "string") {

            errors.content = "Content must be a string";

        }

    }


    // Status
    if (status !== undefined && status !== null) {

        const allowedStatuses = [
            "draft",
            "published"
        ];

        if (!allowedStatuses.includes(status)) {

            errors.status = "Status must be either draft or published";

        }

    }


    // Cover Image
    if (
        coverImage !== undefined &&
        coverImage !== null &&
        typeof coverImage !== "string"
    ) {

        errors.coverImage = "Cover image must be a string";

    }


    // Category
    if (
        !category ||
        typeof category !== "string" ||
        !category.trim()
    ) {

        errors.category = "Category is required";

    }


    // Location
    if (location !== undefined && location !== null) {

        if (typeof location !== "string") {

            errors.location = "Location must be a string";

        } else if (location.length > 255) {

            errors.location = "Location must not exceed 255 characters";

        }

    }


    // Validation response
    if (Object.keys(errors).length > 0) {

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });

    }


    next();

};


// =====================================================
// PROJECT ID PARAM VALIDATION
// GET /:id, PUT /:id, DELETE /:id
// =====================================================

const validateProjectId = (req, res, next) => {

    const { id } = req.params;

    if (
        !id ||
        !/^\d+$/.test(id) ||
        Number(id) <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "ID must be a positive integer"
        });

    }

    next();

};


module.exports = {
    validateProject,
    validateProjectId
};