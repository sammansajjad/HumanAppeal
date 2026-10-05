
const validateString = (
    value,
    fieldName,
    maxLength,
    required = false
) => {
    if (value === undefined || value === null || value === "") {
        if (required) {
            return `${fieldName} is required.`;
        }

        return null;
    }

    if (typeof value !== "string") {
        return `${fieldName} must be a string.`;
    }

    if (value.trim().length === 0) {
        if (required) {
            return `${fieldName} is required.`;
        }

        return null;
    }

    if (value.length > maxLength) {
        return `${fieldName} must not exceed ${maxLength} characters.`;
    }

    return null;
};


const validateNewsIdParam = (req, res, next) => {
    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        String(id) !== req.params.id
    ) {
        return res.status(400).json({
            success: false,
            message: "ID must be a positive integer."
        });
    }

    next();
};


const validateCreateNews = (req, res, next) => {
    const {
        title,
        excerpt,
        content,
        status,
        coverImage,
        author,
        category
    } = req.body || {};


    const titleError = validateString(
        title,
        "title",
        255,
        true
    );

    if (titleError) {
        return res.status(400).json({
            success: false,
            message: titleError
        });
    }


    const excerptError = validateString(
        excerpt,
        "excerpt",
        1000
    );

    if (excerptError) {
        return res.status(400).json({
            success: false,
            message: excerptError
        });
    }


    const contentError = validateString(
        content,
        "content",
        50000
    );

    if (contentError) {
        return res.status(400).json({
            success: false,
            message: contentError
        });
    }


    const statusError = validateString(
        status,
        "status",
        50
    );

    if (statusError) {
        return res.status(400).json({
            success: false,
            message: statusError
        });
    }


    if (
        status !== undefined &&
        status !== null &&
        status !== "" &&
        !["draft", "published"].includes(status)
    ) {
        return res.status(400).json({
            success: false,
            message: "status must be one of: draft, published."
        });
    }


    const coverImageError = validateString(
        coverImage,
        "coverImage",
        2048
    );

    if (coverImageError) {
        return res.status(400).json({
            success: false,
            message: coverImageError
        });
    }


    const authorError = validateString(
        author,
        "author",
        255,
        true
    );

    if (authorError) {
        return res.status(400).json({
            success: false,
            message: authorError
        });
    }


    const categoryError = validateString(
        category,
        "category",
        255,
        true
    );

    if (categoryError) {
        return res.status(400).json({
            success: false,
            message: categoryError
        });
    }


    next();
};


const validateUpdateNews = (req, res, next) => {
    return validateCreateNews(req, res, next);
};


module.exports = {
    validateCreateNews,
    validateUpdateNews,
    validateNewsIdParam
};
