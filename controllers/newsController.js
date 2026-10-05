const newsModel = require("../models/newsModel");


// =====================================================
// VALIDATION HELPERS
// =====================================================

const parsePositiveInteger = (value) => {

    const number = Number(value);

    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {

        return null;

    }

    return number;

};


// =====================================================
// GET ALL NEWS
// =====================================================

const getAllNews = (req, res) => {
    newsModel.getAllNews((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database query failed"
            });
        }

        return res.status(200).json({
            success: true,
            data: results
        });
    });
};


// =====================================================
// GET NEWS BY ID
// =====================================================

const getNewsById = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid news ID"
        });
    }

    newsModel.getNewsById(id, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database query failed"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "News item not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};


// =====================================================
// RESOLVE AUTHOR ID
// =====================================================
// FIX: previously, any author name that didn't match an existing
// user silently fell back to a hardcoded author_id of 1. author_id
// is nullable (ON DELETE SET NULL), so the schema already supports
// "no author" as NULL:
//   - no author provided  -> author_id = null
//   - author provided but not found -> 400 "Invalid author"

const resolveAuthorId = (author, callback) => {

    const trimmedAuthor =
        typeof author === "string"
            ? author.trim()
            : "";

    if (!trimmedAuthor) {
        return callback(null, { ok: true, author_id: null });
    }

    newsModel.findAuthorByName(trimmedAuthor, (err, authorResults) => {

        if (err) {
            return callback(err);
        }

        if (authorResults.length === 0) {
            return callback(null, { ok: false });
        }

        return callback(null, { ok: true, author_id: authorResults[0].id });

    });

};


// =====================================================
// CREATE NEWS
// =====================================================

const createNews = (req, res) => {
    const {
        title,
        excerpt,
        content,
        status,
        coverImage,
        author,
        category
    } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    resolveAuthorId(author, (err, authorResolution) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Author lookup failed"
            });
        }

        if (!authorResolution.ok) {
            return res.status(400).json({
                success: false,
                message: "Invalid author"
            });
        }

        const author_id = authorResolution.author_id;

        newsModel.findCategoryByName(category, (err, categoryResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Category lookup failed"
                });
            }

            if (categoryResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category"
                });
            }

            const news_category_id = categoryResults[0].id;

            newsModel.createNews(
                { news_category_id, author_id, title, slug, excerpt, content, coverImage, status },
                (err, result) => {
                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "A news item with this title already exists"
                            });
                        }

                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: "Insert failed"
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message: "News added successfully",
                        data: { id: result.insertId }
                    });
                }
            );
        });
    });
};


// =====================================================
// UPDATE NEWS
// =====================================================

const updateNews = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid news ID"
        });
    }

    const {
        title,
        excerpt,
        content,
        status,
        coverImage,
        author,
        category
    } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    resolveAuthorId(author, (err, authorResolution) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Author lookup failed"
            });
        }

        if (!authorResolution.ok) {
            return res.status(400).json({
                success: false,
                message: "Invalid author"
            });
        }

        const author_id = authorResolution.author_id;

        newsModel.findCategoryByName(category, (err, categoryResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Category lookup failed"
                });
            }

            if (categoryResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category"
                });
            }

            const news_category_id = categoryResults[0].id;

            newsModel.updateNews(
                id,
                { news_category_id, author_id, title, slug, excerpt, content, coverImage, status },
                (err, result) => {
                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "A news item with this title already exists"
                            });
                        }

                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: "Update failed"
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "News item not found"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "News updated successfully",
                        data: { id }
                    });
                }
            );
        });
    });
};


// =====================================================
// DELETE NEWS
// =====================================================

const deleteNews = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid news ID"
        });
    }

    newsModel.deleteNews(id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Delete failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "News item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "News deleted successfully"
        });
    });
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};