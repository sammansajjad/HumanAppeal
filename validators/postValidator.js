const validatePost = (req, res, next) => {

    const {
        title,
        excerpt,
        content,
        status,
        coverImage,
        author,
        category
    } = req.body;

    const errors = {};

    // ================= TITLE =================

    if (
        !title ||
        typeof title !== "string" ||
        !title.trim()
    ) {
        errors.title = "Title is required";

    } else if (
        title.trim().length > 255
    ) {
        errors.title = "Title must not exceed 255 characters";
    }


    // ================= EXCERPT =================

    if (
        excerpt !== undefined &&
        excerpt !== null
    ) {

        if (typeof excerpt !== "string") {

            errors.excerpt = "Excerpt must be a string";

        } else if (excerpt.length > 1000) {

            errors.excerpt =
                "Excerpt must not exceed 1000 characters";
        }
    }


    // ================= CONTENT =================

    if (
        !content ||
        typeof content !== "string" ||
        !content.trim()
    ) {
        errors.content = "Content is required";
    }


    // ================= STATUS =================

    if (
        status !== undefined &&
        status !== null
    ) {

        const allowedStatuses = [
            "draft",
            "published"
        ];

        if (!allowedStatuses.includes(status)) {

            errors.status =
                "Status must be either draft or published";
        }
    }


    // ================= COVER IMAGE =================

    if (
        coverImage !== undefined &&
        coverImage !== null &&
        typeof coverImage !== "string"
    ) {

        errors.coverImage =
            "Cover image must be a string";
    }


    // ================= AUTHOR =================

    if (
        !author ||
        typeof author !== "string" ||
        !author.trim()
    ) {
        errors.author = "Author is required";
    }


    // ================= CATEGORY =================

    if (
        !category ||
        typeof category !== "string" ||
        !category.trim()
    ) {
        errors.category = "Category is required";
    }


    // ================= RETURN ERRORS =================

    if (Object.keys(errors).length > 0) {

        return res.status(400).json({

            success: false,

            message: "Validation failed",

            errors

        });
    }


    next();

};


// ================= VALIDATE POST ID =================

const validatePostId = (req, res, next) => {

    const id = req.params.id;

    if (
        !id ||
        !/^\d+$/.test(id) ||
        Number(id) <= 0
    ) {

        return res.status(400).json({

            success: false,

            message: "ID must be a valid positive integer"

        });
    }

    next();

};


module.exports = {
    validatePost,
    validatePostId
};