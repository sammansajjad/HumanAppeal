const projectModel = require("../models/projectModel");


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
// GET ALL PROJECTS
// =====================================================

const getAllProjects = (req, res) => {
    projectModel.getAllProjects((err, results) => {
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
// GET PROJECT BY ID
// =====================================================

const getProjectById = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID"
        });
    }

    projectModel.getProjectById(id, (err, results) => {
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
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};


// =====================================================
// CREATE PROJECT
// =====================================================

const createProject = (req, res) => {
    const {
        title,
        content,
        status,
        coverImage,
        category,
        location
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

    projectModel.findCategoryByName(category, (err, categoryResults) => {
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

        const project_category_id = categoryResults[0].id;

        projectModel.createProject(
            { project_category_id, title, slug, location, content, coverImage, status },
            (err, result) => {
                if (err) {

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            success: false,
                            message: "A project with this title already exists"
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
                    message: "Project added successfully",
                    data: { id: result.insertId }
                });
            }
        );
    });
};


// =====================================================
// UPDATE PROJECT
// =====================================================

const updateProject = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID"
        });
    }

    const {
        title,
        content,
        status,
        coverImage,
        category,
        location
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

    projectModel.findCategoryByName(category, (err, categoryResults) => {
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

        const project_category_id = categoryResults[0].id;

        projectModel.updateProject(
            id,
            { project_category_id, title, slug, location, content, coverImage, status },
            (err, result) => {
                if (err) {

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            success: false,
                            message: "A project with this title already exists"
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
                        message: "Project not found"
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "Project updated successfully",
                    data: { id }
                });
            }
        );
    });
};


// =====================================================
// DELETE PROJECT
// =====================================================

const deleteProject = (req, res) => {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID"
        });
    }

    projectModel.deleteProject(id, (err, result) => {
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
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    });
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};