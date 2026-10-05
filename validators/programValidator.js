const validateProgram = (req, res, next) => {

    const {
        title,
        content,
        status,
        coverImage
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

        errors.title =
            "Title must not exceed 255 characters";

    }


    // ================= CONTENT =================

    if (
        content !== undefined &&
        content !== null
    ) {

        if (typeof content !== "string") {

            errors.content =
                "Content must be a string";

        }

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


// ================= VALIDATE PROGRAM ID =================

const validateProgramId = (req, res, next) => {

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
    validateProgram,
    validateProgramId
};