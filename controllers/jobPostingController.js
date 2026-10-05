const jobPostingModel = require("../models/jobPostingModel");
const userModel = require("../models/userModel");
const permissionModel = require("../models/permissionModel");

// ============================================
// VALIDATE JOB POSTING ID
// ============================================
const isValidId = (id) => {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
};


// ============================================
// CAN VIEW ALL STATUSES?
// Super admins and users with manage_jobs can see every
// status (draft, closed, etc). Anonymous visitors and
// authenticated users without the permission only see
// published postings.
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
            "manage_jobs",
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
// GET ALL JOB POSTINGS
// FIX: previously always called the all-statuses model
// function regardless of who was asking — anonymous public
// visitors could see draft/closed postings. Now branches on
// canViewAllStatuses, matching the route's documented intent.
// ============================================
const getAllJobPostings = (req, res) => {

    canViewAllStatuses(req, (err, canViewAll) => {

        if (err) {

            console.error(
                "PERMISSION CHECK ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch job postings"
            });
        }

        const fetchFn = canViewAll
            ? jobPostingModel.getAllJobPostings
            : jobPostingModel.getAllPublishedJobPostings;

        fetchFn((error, jobPostings) => {

            if (error) {

                console.error(
                    "GET JOB POSTINGS ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch job postings"
                });
            }

            res.status(200).json({
                success: true,
                count: jobPostings.length,
                data: jobPostings
            });

        });

    });

};


// ============================================
// GET JOB POSTING BY ID
// Same fix as above, applied to the single-record fetch.
// ============================================
const getJobPostingById = (req, res) => {

    const { id } = req.params;

    if (!isValidId(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid job posting ID"
        });

    }

    canViewAllStatuses(req, (err, canViewAll) => {

        if (err) {

            console.error(
                "PERMISSION CHECK ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch job posting"
            });
        }

        const fetchFn = canViewAll
            ? jobPostingModel.getJobPostingById
            : jobPostingModel.getPublishedJobPostingById;

        fetchFn(id, (error, jobPosting) => {

            if (error) {

                console.error(
                    "GET JOB POSTING ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch job posting"
                });

            }

            if (!jobPosting) {

                return res.status(404).json({
                    success: false,
                    message: "Job posting not found"
                });

            }

            res.status(200).json({
                success: true,
                data: jobPosting
            });

        });

    });

};


// ============================================
// CREATE JOB POSTING
// ============================================
const createJobPosting = (req, res) => {

   const {
    title,
    slug,
    reference_no,
    department,
    location,
    employment_type,
    description,
    requirements,
    application_url,
    application_email,
    status,
    featured,
    opening_date,
    closing_date,
    published_at
} = req.body;


    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof slug !== "string" ||
        !slug.trim()
    ) {

        return res.status(400).json({
            success: false,
            message: "Title and slug are required"
        });

    }


    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();


    if (trimmedTitle.length > 255) {

        return res.status(400).json({
            success: false,
            message: "Title must not exceed 255 characters"
        });

    }


    if (trimmedSlug.length > 255) {

        return res.status(400).json({
            success: false,
            message: "Slug must not exceed 255 characters"
        });

    }


 const jobPostingData = {
    title: trimmedTitle,
    slug: trimmedSlug,
    reference_no,
    department,
    location,
    employment_type,
    description,
    requirements,
    application_url,
    application_email,
    status,
    featured,
    opening_date,
    closing_date,
    published_at
};


    jobPostingModel.createJobPosting(
        jobPostingData,
        (error, id) => {

            if (error) {

                console.error(
                    "CREATE JOB POSTING ERROR:",
                    error
                );


                if (error.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        success: false,
                        message:
                            "A job posting with this slug already exists"
                    });

                }


                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to create job posting"
                });

            }


            res.status(201).json({
                success: true,
                message:
                    "Job posting created successfully",
                id
            });

        }
    );

};


// ============================================
// UPDATE JOB POSTING
// ============================================
const updateJobPosting = (req, res) => {

    const { id } = req.params;


    if (!isValidId(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid job posting ID"
        });

    }


    jobPostingModel.getJobPostingById(
        id,
        (error, existingJob) => {

            if (error) {

                console.error(
                    "CHECK JOB POSTING ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to fetch job posting"
                });

            }


            if (!existingJob) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Job posting not found"
                });

            }


          const {
    title,
    slug,
    reference_no,
    department,
    location,
    employment_type,
    description,
    requirements,
    application_url,
    application_email,
    status,
    featured,
    opening_date,
    closing_date,
    published_at
} = req.body;


            if (
                typeof title !== "string" ||
                !title.trim() ||
                typeof slug !== "string" ||
                !slug.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title and slug are required"
                });

            }


            const trimmedTitle = title.trim();
            const trimmedSlug = slug.trim();


            if (trimmedTitle.length > 255) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title must not exceed 255 characters"
                });

            }


            if (trimmedSlug.length > 255) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Slug must not exceed 255 characters"
                });

            }


            const jobPostingData = {
    title: trimmedTitle,
    slug: trimmedSlug,
    reference_no,
    department,
    location,
    employment_type,
    description,
    requirements,
    application_url,
    application_email,
    status,
    featured,
    opening_date,
    closing_date,
    published_at
};


            jobPostingModel.updateJobPosting(
                id,
                jobPostingData,
                (error, affectedRows) => {

                    if (error) {

                        console.error(
                            "UPDATE JOB POSTING ERROR:",
                            error
                        );


                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {

                            return res.status(409).json({
                                success: false,
                                message:
                                    "A job posting with this slug already exists"
                            });

                        }


                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to update job posting"
                        });

                    }


                    res.status(200).json({
                        success: true,
                        message:
                            "Job posting updated successfully",
                        affectedRows
                    });

                }
            );

        }
    );

};


// ============================================
// DELETE JOB POSTING
// ============================================
const deleteJobPosting = (req, res) => {

    const { id } = req.params;


    if (!isValidId(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid job posting ID"
        });

    }


    jobPostingModel.getJobPostingById(
        id,
        (error, existingJob) => {

            if (error) {

                console.error(
                    "CHECK JOB POSTING ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to fetch job posting"
                });

            }


            if (!existingJob) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Job posting not found"
                });

            }


            jobPostingModel.deleteJobPosting(
                id,
                (error, affectedRows) => {

                    if (error) {

                        console.error(
                            "DELETE JOB POSTING ERROR:",
                            error
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to delete job posting"
                        });

                    }


                    res.status(200).json({
                        success: true,
                        message:
                            "Job posting deleted successfully",
                        affectedRows
                    });

                }
            );

        }
    );

};


// ============================================
// RESTORE JOB POSTING
// ============================================
const restoreJobPosting = (req, res) => {

    const { id } = req.params;


    if (!isValidId(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid job posting ID"
        });

    }


    jobPostingModel.restoreJobPosting(
        id,
        (error, affectedRows) => {

            if (error) {

                console.error(
                    "RESTORE JOB POSTING ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to restore job posting"
                });

            }


            if (!affectedRows) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Deleted job posting not found"
                });

            }


            res.status(200).json({
                success: true,
                message:
                    "Job posting restored successfully",
                affectedRows
            });

        }
    );

};


// ============================================
// EXPORT
// ============================================
module.exports = {
    getAllJobPostings,
    getJobPostingById,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    restoreJobPosting
};