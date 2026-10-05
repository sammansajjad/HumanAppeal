const db = require("./db");

exports.getAllSubscribers = async (page = 1, limit = 20) => {
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

    const [rows] = await db.promise().execute(`
        SELECT
            id,
            email,
            name,
            status,
            subscribed_at,
            unsubscribed_at,
            created_at,
            updated_at
        FROM subscribers
        WHERE deleted_at IS NULL
        ORDER BY subscribed_at DESC, id DESC
        LIMIT ? OFFSET ?
    `, [limit, offset]);

    return rows;
};


exports.getSubscriberById = async (id) => {
    const [rows] = await db.promise().execute(`
        SELECT
            id,
            email,
            name,
            status,
            subscribed_at,
            unsubscribed_at,
            created_at,
            updated_at
        FROM subscribers
        WHERE id = ?
        AND deleted_at IS NULL
        LIMIT 1
    `, [id]);

    return rows[0];
};


exports.getSubscriberByEmail = async (email) => {
    const [rows] = await db.promise().execute(`
        SELECT
            id,
            email,
            name,
            status,
            subscribed_at,
            unsubscribed_at
        FROM subscribers
        WHERE email = ?
        AND deleted_at IS NULL
        LIMIT 1
    `, [email]);

    return rows[0];
};


exports.createSubscriber = async (email, name = null) => {
    const [result] = await db.promise().execute(`
        INSERT INTO subscribers (
            email,
            name,
            status,
            subscribed_at
        )
        VALUES (?, ?, 'active', NOW())
    `, [email, name]);

    return {
        id: result.insertId,
        email,
        name,
        status: "active"
    };
};


exports.updateSubscriberStatus = async (id, status) => {

    if (status === "active") {

        const [result] = await db.promise().execute(`
            UPDATE subscribers
            SET
                status = 'active',
                subscribed_at = NOW(),
                unsubscribed_at = NULL,
                updated_at = NOW()
            WHERE id = ?
            AND deleted_at IS NULL
        `, [id]);

        return result;

    }

    if (status === "unsubscribed") {

        const [result] = await db.promise().execute(`
            UPDATE subscribers
            SET
                status = 'unsubscribed',
                unsubscribed_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
            AND deleted_at IS NULL
        `, [id]);

        return result;
    }
};


exports.deleteSubscriber = async (id) => {
    const [result] = await db.promise().execute(`
        UPDATE subscribers
        SET deleted_at = NOW()
        WHERE id = ?
        AND deleted_at IS NULL
    `, [id]);

    return result;
};