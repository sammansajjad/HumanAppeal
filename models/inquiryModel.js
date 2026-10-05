
const db = require("./db");

const createInquiry = (data, callback) => {
    const query = `
        INSERT INTO inquiries
        (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        query,
        [
            data.name,
            data.email,
            data.subject,
            data.message
        ],
        callback
    );
};

const getAllInquiries = (page = 1, limit = 20, callback) => {
    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = 20;
    }

    if (limit > 100) {
        limit = 100;
    }

    const offset = (page - 1) * limit;

    const query = `
        SELECT
            id,
            assigned_to,
            name,
            email,
            phone,
            subject,
            message,
            status,
            internal_notes,
            read_at,
            replied_at,
            created_at,
            updated_at,
            deleted_at
        FROM inquiries
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `;

    db.query(
        query,
        [limit, offset],
        callback
    );
};

module.exports = {
    createInquiry,
    getAllInquiries
};
