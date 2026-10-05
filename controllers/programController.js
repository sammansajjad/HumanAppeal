const programModel = require("../models/programModel");


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
// GET ALL PROGRAMS
// =====================================================

const getAllPrograms = (req, res) => {
    programModel.getAllPrograms((err, results) => {
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
// GET PROGRAM BY ID
// =====================================================

const getProgramById = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid program ID"
        });
    }

    programModel.getProgramById(id, (err, results) => {
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
                message: "Program not found"
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
// Mirrors blogController.js's resolveAuthorId exactly:
//   - no author provided -> author_id = null (valid, explicit)
//   - author provided but not found -> 400 "Invalid author"

const resolveAuthorId = (author, callback) => {

    const trimmedAuthor =
        typeof author === "string"
            ? author.trim()
            : "";

    if (!trimmedAuthor) {
        return callback(null, { ok: true, author_id: null });
    }

    programModel.findAuthorByName(trimmedAuthor, (err, authorResults) => {

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
// CREATE PROGRAM
// =====================================================

const createProgram = (req, res) => {
    const {
        title,
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

        programModel.findCategoryByName(category, (err, categoryResults) => {
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

            const program_category_id = categoryResults[0].id;

            programModel.createProgram(
                { program_category_id, author_id, title, slug, content, coverImage, status },
                (err, result) => {
                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "A program with this title already exists"
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
                        message: "Program added successfully",
                        data: { id: result.insertId }
                    });
                }
            );
        });
    });
};


// =====================================================
// UPDATE PROGRAM
// =====================================================

const updateProgram = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid program ID"
        });
    }

    const {
        title,
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

        programModel.findCategoryByName(category, (err, categoryResults) => {
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

            const program_category_id = categoryResults[0].id;

            programModel.updateProgram(
                id,
                { program_category_id, author_id, title, slug, content, coverImage, status },
                (err, result) => {
                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "A program with this title already exists"
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
                            message: "Program not found"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Program updated successfully",
                        data: { id }
                    });
                }
            );
        });
    });
};


// =====================================================
// DELETE PROGRAM
// =====================================================

const deleteProgram = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid program ID"
        });
    }

    programModel.deleteProgram(id, (err, result) => {
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
                message: "Program not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Program deleted successfully"
        });
    });
};

module.exports = {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram
};