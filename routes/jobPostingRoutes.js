const express = require("express");
const router = express.Router();

const jobPostingController = require("../controllers/jobPostingController");

const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
    validateJobPostingId,
    validateJobPostingBody
} = require("../validators/jobPostingValidator");


// GET ALL JOB POSTINGS
// Public: published only. Authenticated + manage_jobs: all statuses.
router.get(
    "/",
    optionalAuth,
    jobPostingController.getAllJobPostings
);


// GET JOB POSTING BY ID
// Public: published only. Authenticated + manage_jobs: all statuses.
router.get(
    "/:id",
    optionalAuth,
    validateJobPostingId,
    jobPostingController.getJobPostingById
);


// CREATE JOB POSTING
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("manage_jobs"),
    validateJobPostingBody,
    jobPostingController.createJobPosting
);


// UPDATE JOB POSTING
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("manage_jobs"),
    validateJobPostingId,
    validateJobPostingBody,
    jobPostingController.updateJobPosting
);


// DELETE JOB POSTING
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("manage_jobs"),
    validateJobPostingId,
    jobPostingController.deleteJobPosting
);


// RESTORE JOB POSTING
router.patch(
    "/:id/restore",
    authMiddleware,
    permissionMiddleware("manage_jobs"),
    validateJobPostingId,
    jobPostingController.restoreJobPosting
);


module.exports = router;