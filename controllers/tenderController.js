const tenderModel = require("../models/tenderModel");
const userModel = require("../models/userModel");
const permissionModel = require("../models/permissionModel");

// ============================================
// VALIDATE TENDER ID
// ============================================
const isValidId = (id) => {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
};


// ============================================
// CAN VIEW ALL STATUSES?
// Mirrors jobPostingController.js's canViewAllStatuses.
// Super admins and users with manage_tenders see every
// status. Anonymous visitors and everyone else only see
// open tenders.
// ============================================
const canViewAllStatuses = (req, callback) => {

    if (!req.user || !req.user.id) {
        return callback(null, false);
    }

    userModel.isSuperAdmin(req.user.id, (err, isSuperAdmin) => {

        if (err) {
            return callback(err);
        }

        if (isSuperAdmin) {
            return callback(null, true);
        }

        permissionModel.checkUserPermission(
            req.user.id,
            "manage_tenders",
            (err, results) => {

                if (err) {
                    return callback(err);
                }

                callback(
                    null,
                    Array.isArray(results) && results.length > 0
                );
            }
        );
    });

};


// ============================================
// GET ALL TENDERS
// FIX: previously always filtered to status='open' for
// every caller, including authenticated admins — meaning
// the admin panel could never see draft/closed tenders.
// Now branches on canViewAllStatuses.
// ============================================
const getAllTenders = (req, res) => {

    canViewAllStatuses(req, (err, canViewAll) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch tenders"
            });
        }

        const fetchFn = canViewAll
            ? tenderModel.getAllTenders
            : tenderModel.getAllOpenTenders;

        fetchFn((err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch tenders"
                });
            }

            res.status(200).json({
                success: true,
                count: results.length,
                data: results
            });
        });

    });

};


// ============================================
// GET TENDER BY ID
// Same fix as above.
// ============================================
const getTenderById = (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid tender ID"
        });
    }

    canViewAllStatuses(req, (err, canViewAll) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch tender"
            });
        }

        const fetchFn = canViewAll
            ? tenderModel.getTenderById
            : tenderModel.getOpenTenderById;

        fetchFn(id, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch tender"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tender not found"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });

    });

};


// ============================================
// CREATE TENDER
// ============================================
const createTender = (req, res) => {
    const {
        title,
        tenderNumber,
        category,
        deadline,
        postedBy,
        datePosted,
        description,
        status,
        featured,
        documentUrl,
        submissionEmail,
        submissionUrl,
        publishedAt
    } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }

    if (title.trim().length > 255) {
        return res.status(400).json({
            success: false,
            message: "Title must not exceed 255 characters"
        });
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    tenderModel.createTender(
        {
            title,
            slug,
            tenderNumber,
            category,
            deadline,
            postedBy,
            datePosted,
            description,
            status,
            featured,
            documentUrl,
            submissionEmail,
            submissionUrl,
            publishedAt
        },
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to create tender"
                });
            }

            res.status(201).json({
                success: true,
                message: "Tender added successfully",
                id: result.insertId
            });
        }
    );
};


// ============================================
// UPDATE TENDER
// ============================================
const updateTender = (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid tender ID"
        });
    }

    const {
        title,
        tenderNumber,
        category,
        deadline,
        postedBy,
        datePosted,
        description,
        status,
        featured,
        documentUrl,
        submissionEmail,
        submissionUrl,
        publishedAt
    } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }

    if (title.trim().length > 255) {
        return res.status(400).json({
            success: false,
            message: "Title must not exceed 255 characters"
        });
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    tenderModel.updateTender(
        id,
        {
            title,
            slug,
            tenderNumber,
            category,
            deadline,
            postedBy,
            datePosted,
            description,
            status,
            featured,
            documentUrl,
            submissionEmail,
            submissionUrl,
            publishedAt
        },
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update tender"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tender not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Tender updated successfully",
                id
            });
        }
    );
};


// ============================================
// DELETE TENDER
// ============================================
const deleteTender = (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid tender ID"
        });
    }

    tenderModel.deleteTender(id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete tender"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Tender not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Tender deleted successfully"
        });
    });
};


// ============================================
// EXPORT
// ============================================
module.exports = {
    getAllTenders,
    getTenderById,
    createTender,
    updateTender,
    deleteTender
};