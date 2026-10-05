
const db = require("./db");

// ============================================
// GET ALL JOB POSTINGS (admin — all statuses)
// ============================================
const getAllJobPostings = (callback) => {
    const sql = `
        SELECT
            id,
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
            published_at,
            created_at,
            updated_at,
            deleted_at
        FROM job_postings
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    `;

    db.query(sql, (error, rows) => {
        if (error) {
            return callback(error);
        }

        callback(null, rows);
    });
};


// ============================================
// GET JOB POSTING BY ID (admin — all statuses)
// ============================================
const getJobPostingById = (id, callback) => {
    const sql = `
        SELECT
            id,
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
            published_at,
            created_at,
            updated_at,
            deleted_at
        FROM job_postings
        WHERE id = ?
        AND deleted_at IS NULL
        LIMIT 1
    `;

    db.query(sql, [id], (error, rows) => {
        if (error) {
            return callback(error);
        }

        callback(null, rows[0] || null);
    });
};


// ============================================
// GET ALL PUBLISHED JOB POSTINGS (public)
// ============================================
const getAllPublishedJobPostings = (callback) => {
    const sql = `
        SELECT *
        FROM job_postings
        WHERE deleted_at IS NULL
        AND status = 'published'
        ORDER BY created_at DESC
    `;

    db.query(sql, (error, rows) => {
        if (error) {
            return callback(error);
        }

        callback(null, rows);
    });
};


// ============================================
// GET PUBLISHED JOB POSTING BY ID (public)
// ============================================
const getPublishedJobPostingById = (id, callback) => {
    const sql = `
        SELECT *
        FROM job_postings
        WHERE id = ?
        AND deleted_at IS NULL
        AND status = 'published'
        LIMIT 1
    `;

    db.query(sql, [id], (error, rows) => {
        if (error) {
            return callback(error);
        }

        callback(null, rows[0] || null);
    });
};


// ============================================
// CREATE JOB POSTING
// ============================================
const createJobPosting = (data, callback) => {

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
    } = data;

    const sql = `
        INSERT INTO job_postings (
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
            published_at,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
        title,
        slug,
        reference_no || null,
        department || null,
        location || null,
        employment_type || null,
        description || null,
        requirements || null,
        application_url || null,
        application_email || null,
        status || "draft",
        featured || 0,
        opening_date || null,
        closing_date || null,
        published_at || null
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            return callback(error);
        }

        callback(null, result.insertId);
    });
};


// ============================================
// UPDATE JOB POSTING
// ============================================
const updateJobPosting = (id, data, callback) => {

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
    } = data;

    const sql = `
        UPDATE job_postings
        SET
            title = ?,
            slug = ?,
            reference_no = ?,
            department = ?,
            location = ?,
            employment_type = ?,
            description = ?,
            requirements = ?,
            application_url = ?,
            application_email = ?,
            status = ?,
            featured = ?,
            opening_date = ?,
            closing_date = ?,
            published_at = ?,
            updated_at = NOW()
        WHERE id = ?
        AND deleted_at IS NULL
    `;

    const values = [
        title,
        slug,
        reference_no || null,
        department || null,
        location || null,
        employment_type || null,
        description || null,
        requirements || null,
        application_url || null,
        application_email || null,
        status || "draft",
        featured || 0,
        opening_date || null,
        closing_date || null,
        published_at || null,
        id
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            return callback(error);
        }

        callback(null, result.affectedRows);
    });
};


// ============================================
// SOFT DELETE JOB POSTING
// ============================================
const deleteJobPosting = (id, callback) => {

    const sql = `
        UPDATE job_postings
        SET deleted_at = NOW()
        WHERE id = ?
        AND deleted_at IS NULL
    `;

    db.query(sql, [id], (error, result) => {
        if (error) {
            return callback(error);
        }

        callback(null, result.affectedRows);
    });
};


// ============================================
// RESTORE JOB POSTING
// ============================================
const restoreJobPosting = (id, callback) => {

    const sql = `
        UPDATE job_postings
        SET
            deleted_at = NULL,
            updated_at = NOW()
        WHERE id = ?
        AND deleted_at IS NOT NULL
    `;

    db.query(sql, [id], (error, result) => {
        if (error) {
            return callback(error);
        }

        callback(null, result.affectedRows);
    });
};


// ============================================
// EXPORT
// ============================================
module.exports = {
    getAllJobPostings,
    getJobPostingById,
    getAllPublishedJobPostings,
    getPublishedJobPostingById,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    restoreJobPosting
};
