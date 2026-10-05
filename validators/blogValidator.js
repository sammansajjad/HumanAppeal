// validators/blogValidator.js
//
// Pure request validation for the Blog module.
// No DB queries.
// No existence checks.
// No authentication/authorization.
//
// The controller/model handles:
// - author existence
// - category existence
// - database operations
// - slug generation

const MAX_TITLE_LENGTH = 255;
const MAX_EXCERPT_LENGTH = 1000;
const MAX_CONTENT_LENGTH = 100000;
const MAX_COVER_IMAGE_LENGTH = 2048;
const MAX_AUTHOR_LENGTH = 255;
const MAX_CATEGORY_LENGTH = 255;

const ALLOWED_STATUS = [
    "draft",
    "published"
];


// =====================================================
// HELPERS
// =====================================================

const isNonEmptyString = (value) => {

    return (
        typeof value === "string" &&
        value.trim().length > 0
    );

};


const isPositiveIntegerString = (value) => {

    return (
        typeof value === "string" &&
        /^\d+$/.test(value) &&
        Number(value) > 0
    );

};


// =====================================================
// ID VALIDATION
// =====================================================

const validateBlogId = (id) => {

    const errors = [];

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        errors.push("id is required");

        return errors;

    }

    if (
        !isPositiveIntegerString(String(id))
    ) {

        errors.push(
            "id must be a valid positive integer"
        );

    }

    return errors;

};


// =====================================================
// CREATE / UPDATE BLOG BODY
// =====================================================

const validateBlogBody = (body) => {

    const errors = [];

    const {
        title,
        excerpt,
        content,
        status,
        coverImage,
        author,
        category
    } = body || {};


    // ---------------- TITLE ----------------

    if (
        title === undefined ||
        title === null
    ) {

        errors.push("title is required");

    } else if (
        typeof title !== "string"
    ) {

        errors.push("title must be a string");

    } else if (
        !isNonEmptyString(title)
    ) {

        errors.push(
            "title cannot be empty or whitespace only"
        );

    } else if (
        title.trim().length > MAX_TITLE_LENGTH
    ) {

        errors.push(
            `title must be ${MAX_TITLE_LENGTH} characters or fewer`
        );

    }


    // ---------------- EXCERPT ----------------

    if (
        excerpt !== undefined &&
        excerpt !== null
    ) {

        if (
            typeof excerpt !== "string"
        ) {

            errors.push(
                "excerpt must be a string"
            );

        } else if (
            excerpt.length > MAX_EXCERPT_LENGTH
        ) {

            errors.push(
                `excerpt must be ${MAX_EXCERPT_LENGTH} characters or fewer`
            );

        }

    }


    // ---------------- CONTENT ----------------

    if (
        content !== undefined &&
        content !== null
    ) {

        if (
            typeof content !== "string"
        ) {

            errors.push(
                "content must be a string"
            );

        } else if (
            content.length > MAX_CONTENT_LENGTH
        ) {

            errors.push(
                `content must be ${MAX_CONTENT_LENGTH} characters or fewer`
            );

        }

    }


    // ---------------- STATUS ----------------

    if (
        status !== undefined &&
        status !== null
    ) {

        if (
            typeof status !== "string"
        ) {

            errors.push(
                "status must be a string"
            );

        } else if (
            !ALLOWED_STATUS.includes(
                status.toLowerCase()
            )
        ) {

            errors.push(
                `status must be one of: ${ALLOWED_STATUS.join(", ")}`
            );

        }

    }


    // ---------------- COVER IMAGE ----------------

    if (
        coverImage !== undefined &&
        coverImage !== null
    ) {

        if (
            typeof coverImage !== "string"
        ) {

            errors.push(
                "coverImage must be a string"
            );

        } else if (
            coverImage.length > MAX_COVER_IMAGE_LENGTH
        ) {

            errors.push(
                `coverImage must be ${MAX_COVER_IMAGE_LENGTH} characters or fewer`
            );

        }

    }


    // ---------------- AUTHOR ----------------

    if (
        author === undefined ||
        author === null
    ) {

        errors.push("author is required");

    } else if (
        typeof author !== "string"
    ) {

        errors.push(
            "author must be a string"
        );

    } else if (
        !isNonEmptyString(author)
    ) {

        errors.push(
            "author cannot be empty or whitespace only"
        );

    } else if (
        author.trim().length > MAX_AUTHOR_LENGTH
    ) {

        errors.push(
            `author must be ${MAX_AUTHOR_LENGTH} characters or fewer`
        );

    }


    // ---------------- CATEGORY ----------------

    if (
        category === undefined ||
        category === null
    ) {

        errors.push("category is required");

    } else if (
        typeof category !== "string"
    ) {

        errors.push(
            "category must be a string"
        );

    } else if (
        !isNonEmptyString(category)
    ) {

        errors.push(
            "category cannot be empty or whitespace only"
        );

    } else if (
        category.trim().length > MAX_CATEGORY_LENGTH
    ) {

        errors.push(
            `category must be ${MAX_CATEGORY_LENGTH} characters or fewer`
        );

    }


    return errors;

};


// =====================================================
// CREATE BLOG
// POST /api/blogs
// =====================================================

const validateCreateBlog = (
    req,
    res,
    next
) => {

    const errors =
        validateBlogBody(req.body);

    if (
        errors.length > 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                errors.join(", ")

        });

    }

    next();

};


// =====================================================
// UPDATE BLOG
// PUT /api/blogs/:id
// =====================================================

const validateUpdateBlog = (
    req,
    res,
    next
) => {

    const idErrors =
        validateBlogId(
            req.params.id
        );

    const bodyErrors =
        validateBlogBody(
            req.body
        );

    const errors = [
        ...idErrors,
        ...bodyErrors
    ];

    if (
        errors.length > 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                errors.join(", ")

        });

    }

    next();

};


// =====================================================
// GET /:id
// DELETE /:id
// =====================================================

const validateBlogIdParam = (
    req,
    res,
    next
) => {

    const errors =
        validateBlogId(
            req.params.id
        );

    if (
        errors.length > 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                errors.join(", ")

        });

    }

    next();

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    validateCreateBlog,
    validateUpdateBlog,
    validateBlogIdParam

};