const blogModel = require("../models/blogModel");


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
// GET ALL BLOGS
// =====================================================

const getAllBlogs = (req, res) => {
    blogModel.getAllBlogs((err, results) => {
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
// GET BLOG BY ID
// =====================================================

const getBlogById = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog ID"
        });
    }

    blogModel.getBlogById(id, (err, results) => {
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
                message: "Blog item not found"
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
// user silently fell back to a hardcoded author_id of 1 — meaning a
// typo, a deleted user's name, or a blank field would misattribute
// the blog to whichever user happens to have ID 1, with no error
// and no indication anything went wrong.
//
// author_id is a nullable column (ON DELETE SET NULL), so the schema
// already supports "no author" as NULL. This now mirrors that:
//   - no author provided  -> author_id = null (valid, explicit)
//   - author provided but not found -> 400 "Invalid author"
//     (same pattern as the existing category validation)

const resolveAuthorId = (author, callback) => {

    const trimmedAuthor =
        typeof author === "string"
            ? author.trim()
            : "";

    if (!trimmedAuthor) {
        return callback(null, { ok: true, author_id: null });
    }

    blogModel.findAuthorByName(trimmedAuthor, (err, authorResults) => {

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
// CREATE BLOG
// =====================================================

const createBlog = (req, res) => {
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

        blogModel.findCategoryByName(category, (err, categoryResults) => {
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

            const blog_category_id = categoryResults[0].id;

            blogModel.createBlog(
                { blog_category_id, author_id, title, slug, excerpt, content, coverImage, status },
                (err, result) => {
                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "A blog with this title already exists"
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
                        message: "Blog added successfully",
                        data: { id: result.insertId }
                    });
                }
            );
        });
    });
};


// =====================================================
// UPDATE BLOG
// =====================================================

const updateBlog = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog ID"
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

        blogModel.findCategoryByName(category, (err, categoryResults) => {
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

            const blog_category_id = categoryResults[0].id;

            blogModel.updateBlog(
                id,
                { blog_category_id, author_id, title, slug, excerpt, content, coverImage, status },
                (err, result) => {
                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "A blog with this title already exists"
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
                            message: "Blog item not found"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Blog updated successfully",
                        data: { id }
                    });
                }
            );
        });
    });
};


// =====================================================
// DELETE BLOG
// =====================================================

const deleteBlog = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog ID"
        });
    }

    blogModel.deleteBlog(id, (err, result) => {
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
                message: "Blog item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    });
};

module.exports = {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
};