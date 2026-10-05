// validators/pageValidator.js
//
// Pure request validation for the Page module.
// No DB queries, no slug-uniqueness checks, no existence checks, no auth.
// Those responsibilities stay in controller/model/middleware.

const MAX_VARCHAR_255 = 255;

// ASSUMPTION — confirm actual allowed status values with the team.
// DB column is VARCHAR(255) with no enum constraint, so this is app-level only.
// Currently just validated as a non-empty string within length, not restricted
// to a fixed set. Tighten this once real status values are confirmed.

// ASSUMPTION — slug pattern: lowercase letters, numbers, hyphens only.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isPositiveIntegerString(value) {
    return typeof value === "string" && /^\d+$/.test(value) && parseInt(value, 10) > 0;
}

function isValidDate(value) {
    if (value === null || value === undefined || value === "") return true; // nullable
    const parsed = new Date(value);
    return !isNaN(parsed.getTime());
}

function validatePageBody(body, { requireCore }) {
    const errors = [];
    const {
        parent_id,
        title_en,
        title_ur,
        slug,
        template,
        featured_image,
        status,
        published_at,
        sort_order,
        is_homepage
    } = body;

    // title_en — required
    if (requireCore && (title_en === undefined || title_en === null)) {
        errors.push("title_en is required");
    } else if (title_en !== undefined && title_en !== null) {
        if (typeof title_en !== "string") {
            errors.push("title_en must be a string");
        } else if (!isNonEmptyString(title_en)) {
            errors.push("title_en cannot be empty or whitespace only");
        } else if (title_en.trim().length > MAX_VARCHAR_255) {
            errors.push(`title_en must be ${MAX_VARCHAR_255} characters or fewer`);
        }
    }

    // title_ur — optional
    if (title_ur !== undefined && title_ur !== null && title_ur !== "") {
        if (typeof title_ur !== "string") {
            errors.push("title_ur must be a string");
        } else if (title_ur.length > MAX_VARCHAR_255) {
            errors.push(`title_ur must be ${MAX_VARCHAR_255} characters or fewer`);
        }
    }

    // slug — required
    if (requireCore && (slug === undefined || slug === null)) {
        errors.push("slug is required");
    } else if (slug !== undefined && slug !== null) {
        if (typeof slug !== "string") {
            errors.push("slug must be a string");
        } else if (!isNonEmptyString(slug)) {
            errors.push("slug cannot be empty or whitespace only");
        } else if (slug.trim().length > MAX_VARCHAR_255) {
            errors.push(`slug must be ${MAX_VARCHAR_255} characters or fewer`);
        } else if (!SLUG_PATTERN.test(slug.trim())) {
            errors.push("slug may only contain lowercase letters, numbers, and hyphens");
        }
    }

    // template — optional (DB default 'default')
    if (template !== undefined && template !== null && template !== "") {
        if (typeof template !== "string") {
            errors.push("template must be a string");
        } else if (template.length > MAX_VARCHAR_255) {
            errors.push(`template must be ${MAX_VARCHAR_255} characters or fewer`);
        }
    }

    // featured_image — optional
    if (featured_image !== undefined && featured_image !== null && featured_image !== "") {
        if (typeof featured_image !== "string") {
            errors.push("featured_image must be a string");
        } else if (featured_image.length > MAX_VARCHAR_255) {
            errors.push(`featured_image must be ${MAX_VARCHAR_255} characters or fewer`);
        }
    }

    // status — optional (DB default 'draft'); not restricted to enum, see note above
    if (status !== undefined && status !== null && status !== "") {
        if (typeof status !== "string") {
            errors.push("status must be a string");
        } else if (!isNonEmptyString(status)) {
            errors.push("status cannot be whitespace only");
        } else if (status.trim().length > MAX_VARCHAR_255) {
            errors.push(`status must be ${MAX_VARCHAR_255} characters or fewer`);
        }
    }

    // published_at — optional, nullable timestamp
    if (published_at !== undefined && !isValidDate(published_at)) {
        errors.push("published_at must be a valid date");
    }

    // sort_order — optional, non-negative integer
    if (sort_order !== undefined && sort_order !== null && sort_order !== "") {
        const n = Number(sort_order);
        if (!Number.isInteger(n) || n < 0) {
            errors.push("sort_order must be a non-negative integer");
        }
    }

    // is_homepage — optional, 0/1 or boolean
    if (is_homepage !== undefined && is_homepage !== null && is_homepage !== "") {
        const valid =
            is_homepage === 0 ||
            is_homepage === 1 ||
            is_homepage === "0" ||
            is_homepage === "1" ||
            is_homepage === true ||
            is_homepage === false;
        if (!valid) {
            errors.push("is_homepage must be 0 or 1");
        }
    }

    // parent_id — optional, nullable FK, positive integer if present
    if (parent_id !== undefined && parent_id !== null && parent_id !== "") {
        const n = Number(parent_id);
        if (!Number.isInteger(n) || n <= 0) {
            errors.push("parent_id must be a positive integer");
        }
    }

    return errors;
}

function validateIdParam(id) {
    const errors = [];

    if (id === undefined || id === null || id === "") {
        errors.push("id is required");
    } else if (!isPositiveIntegerString(String(id))) {
        errors.push("id must be a valid positive integer");
    }

    return errors;
}

// POST /api/pages
const validateCreatePage = (req, res, next) => {
    const errors = validatePageBody(req.body || {}, { requireCore: true });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

// PUT /api/pages/:id
// NOTE: pageController.updatePage rebuilds the full pageData object from
// req.body (not a partial patch), so title_en/slug are required here too —
// otherwise an incomplete body would null out existing data on save.
const validateUpdatePage = (req, res, next) => {
    const idErrors = validateIdParam(req.params.id);
    const bodyErrors = validatePageBody(req.body || {}, { requireCore: true });
    const errors = [...idErrors, ...bodyErrors];

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

// GET /api/pages/:id, DELETE /api/pages/:id, PATCH /api/pages/:id/restore
const validatePageId = (req, res, next) => {
    const errors = validateIdParam(req.params.id);

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors.join(", ")
        });
    }

    next();
};

module.exports = {
    validateCreatePage,
    validateUpdatePage,
    validatePageId
};