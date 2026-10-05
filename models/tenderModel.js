const db = require("./db");

const TENDER_SELECT_FIELDS = `
    id,
    title,
    slug,
    reference_no AS tenderNumber,
    category,
    closing_date AS deadline,
    posted_by AS postedBy,
    opening_date AS datePosted,
    description,
    status,
    featured,
    document_url AS documentUrl,
    submission_email AS submissionEmail,
    submission_url AS submissionUrl,
    published_at AS publishedAt
`;

// ============================================
// GET ALL TENDERS (admin — all statuses)
// ============================================
const getAllTenders = (callback) => {
    const query = `
        SELECT ${TENDER_SELECT_FIELDS}
        FROM tenders
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    `;

    db.query(query, callback);
};

// ============================================
// GET TENDER BY ID (admin — all statuses)
// ============================================
const getTenderById = (id, callback) => {
    const query = `
        SELECT ${TENDER_SELECT_FIELDS}
        FROM tenders
        WHERE id = ?
        AND deleted_at IS NULL
        LIMIT 1
    `;

    db.query(query, [id], callback);
};

// ============================================
// GET ALL OPEN TENDERS (public)
// ============================================
const getAllOpenTenders = (callback) => {
    const query = `
        SELECT ${TENDER_SELECT_FIELDS}
        FROM tenders
        WHERE deleted_at IS NULL
        AND status = 'open'
        ORDER BY created_at DESC
    `;

    db.query(query, callback);
};

// ============================================
// GET OPEN TENDER BY ID (public)
// ============================================
const getOpenTenderById = (id, callback) => {
    const query = `
        SELECT ${TENDER_SELECT_FIELDS}
        FROM tenders
        WHERE id = ?
        AND deleted_at IS NULL
        AND status = 'open'
        LIMIT 1
    `;

    db.query(query, [id], callback);
};

const createTender = (data, callback) => {
    const query = `
        INSERT INTO tenders
        (
            title,
            slug,
            reference_no,
            category,
            closing_date,
            posted_by,
            opening_date,
            description,
            status,
            featured,
            document_url,
            submission_email,
            submission_url,
            published_at,
            created_at,
            updated_at
        )

        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
    `;

    const values = [
        data.title,
        data.slug,
        data.tenderNumber || null,
        data.category || null,
        data.deadline || null,
        data.postedBy || null,
        data.datePosted || null,
        data.description || null,
        data.status || "open",
        data.featured || 0,
        data.documentUrl || null,
        data.submissionEmail || null,
        data.submissionUrl || null,
        data.publishedAt || null
    ];

    db.query(query, values, callback);
};

const updateTender = (id, data, callback) => {
    const query = `
        UPDATE tenders

        SET

        title=?,
        slug=?,
        reference_no=?,
        category=?,
        closing_date=?,
        posted_by=?,
        opening_date=?,
        description=?,
        status=?,
        featured=?,
        document_url=?,
        submission_email=?,
        submission_url=?,
        published_at=?,
        updated_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    const values = [
        data.title,
        data.slug,
        data.tenderNumber || null,
        data.category || null,
        data.deadline || null,
        data.postedBy || null,
        data.datePosted || null,
        data.description || null,
        data.status || "open",
        data.featured || 0,
        data.documentUrl || null,
        data.submissionEmail || null,
        data.submissionUrl || null,
        data.publishedAt || null,
        id
    ];

    db.query(query, values, callback);
};

const deleteTender = (id, callback) => {
    const query = `
        UPDATE tenders

        SET deleted_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    db.query(query, [id], callback);
};

module.exports = {
    getAllTenders,
    getTenderById,
    getAllOpenTenders,
    getOpenTenderById,
    createTender,
    updateTender,
    deleteTender
};