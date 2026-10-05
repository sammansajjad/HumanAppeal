const db = require("./db");


// ================= GET ALL NAVIGATION =================

exports.getAll = (callback) => {

    const sql = `
        SELECT
            id,
            menu_id,
            parent_id,
            label_en,
            label_ur,
            type,
            url,
            target,
            sort_order,
            is_active
        FROM menu_items
        WHERE deleted_at IS NULL
        ORDER BY sort_order ASC
    `;

    db.query(sql, callback);

};


// ================= CREATE =================

exports.create = (data, callback) => {

    const {
        menu_id,
        parent_id,
        label_en,
        label_ur,
        type,
        url,
        target,
        sort_order,
        is_active
    } = data;

    const sql = `
        INSERT INTO menu_items
        (
            menu_id,
            parent_id,
            label_en,
            label_ur,
            type,
            url,
            target,
            sort_order,
            is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            menu_id,
            parent_id || null,
            label_en,
            label_ur || null,
            type || "custom",
            url || null,
            target || "_self",
            sort_order || 0,
            is_active ?? 1
        ],
        callback
    );

};


// ================= UPDATE =================

exports.update = (id, data, callback) => {

    const {
        parent_id,
        label_en,
        label_ur,
        type,
        url,
        target,
        sort_order,
        is_active
    } = data;

    const sql = `
        UPDATE menu_items
        SET
            parent_id = ?,
            label_en = ?,
            label_ur = ?,
            type = ?,
            url = ?,
            target = ?,
            sort_order = ?,
            is_active = ?,
            updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
    `;

    db.query(
        sql,
        [
            parent_id || null,
            label_en,
            label_ur || null,
            type || "custom",
            url || null,
            target || "_self",
            sort_order || 0,
            is_active ?? 1,
            id
        ],
        callback
    );

};


// ================= SOFT DELETE =================

exports.delete = (id, callback) => {

    const sql = `
        UPDATE menu_items
        SET deleted_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
    `;

    db.query(
        sql,
        [id],
        callback
    );

};


// ================= RESTORE =================

exports.restore = (id, callback) => {

    const sql = `
        UPDATE menu_items
        SET
            deleted_at = NULL,
            updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NOT NULL
    `;

    db.query(
        sql,
        [id],
        callback
    );

};


// ================= REORDER =================

exports.reorder = (items, callback) => {

    db.getConnection((err, connection) => {

        if (err) {
            return callback(err);
        }

        connection.beginTransaction((err) => {

            if (err) {
                connection.release();
                return callback(err);
            }

            let completed = 0;

            if (items.length === 0) {
                return connection.commit((err) => {

                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    connection.release();
                    callback(null);

                });
            }

            items.forEach(item => {

                connection.query(
                    `
                    UPDATE menu_items
                    SET sort_order = ?
                    WHERE id = ?
                      AND deleted_at IS NULL
                    `,
                    [
                        item.sort_order,
                        item.id
                    ],
                    (err) => {

                        if (err) {

                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });

                        }

                        completed++;

                        if (completed === items.length) {

                            connection.commit((err) => {

                                if (err) {

                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(err);
                                    });

                                }

                                connection.release();
                                callback(null);

                            });

                        }

                    }
                );

            });

        });

    });

};