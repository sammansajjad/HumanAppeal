const db = require("./db");

// =========================================
// GET ALL MENU ITEMS
// =========================================

exports.getAllItems = async () => {
    return new Promise((resolve, reject) => {
        db.query(
            `
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
                is_active,
                created_at,
                updated_at
            FROM menu_items
            WHERE deleted_at IS NULL
            ORDER BY
                menu_id ASC,
                sort_order ASC,
                id ASC
            `,
            (err, results) => {
                if (err) {
                    console.error(
                        "GET ALL MENU ITEMS ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(results);
            }
        );
    });
};

// =========================================
// GET ITEMS BY MENU
// =========================================

exports.getMenuItems = async (menu_id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            SELECT
                id,
                menu_id,
                parent_id,
                label_en,
                label_ur,
                type,
                url,
                target,
                permission,
                sort_order,
                is_active,
                created_at,
                updated_at,
                deleted_at
            FROM menu_items
            WHERE menu_id = ?
              AND deleted_at IS NULL
            ORDER BY sort_order ASC, id ASC
            `,
            [menu_id],
            (err, results) => {
                if (err) {
                    console.error(
                        "GET MENU ITEMS ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(results);
            }
        );
    });
};


// =========================================
// GET ITEM BY ID
// =========================================
exports.getMenuItemById = async (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            SELECT
                id,
                menu_id,
                parent_id,
                label_en,
                label_ur,
                type,
                url,
                target,
                permission,
                sort_order,
                is_active,
                created_at,
                updated_at,
                deleted_at
            FROM menu_items
            WHERE id = ?
              AND deleted_at IS NULL
            `,
            [id],
            (err, results) => {
                if (err) {
                    console.error(
                        "GET MENU ITEM BY ID ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(results);
            }
        );
    });
};

// =========================================
// CREATE MENU ITEM
// =========================================

exports.createItem = async (data) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
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
            `,
            [
                data.menu_id,
                data.parent_id ?? null,
                data.label_en,
                data.label_ur ?? null,
                data.type ?? "custom",
                data.url ?? null,
                data.target ?? "_self",
                data.sort_order ?? 0,
                data.is_active ?? 1
            ],
            (err, result) => {
                if (err) {
                    console.error(
                        "CREATE MENU ITEM ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(result.insertId);
            }
        );
    });
};

// =========================================
// UPDATE MENU ITEM
// =========================================

exports.updateItem = async (id, data) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            UPDATE menu_items
            SET
                menu_id = ?,
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
            `,
            [
                data.menu_id,
                data.parent_id ?? null,
                data.label_en,
                data.label_ur ?? null,
                data.type ?? "custom",
                data.url ?? null,
                data.target ?? "_self",
                data.sort_order ?? 0,
                data.is_active ?? 1,
                id
            ],
            (err, result) => {
                if (err) {
                    console.error(
                        "UPDATE MENU ITEM ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(result);
            }
        );
    });
};

// =========================================
// DELETE MENU ITEM
// Soft delete via deleted_at, CASCADING to all descendants.
// Uses a recursive CTE to find this item plus every item
// below it in the parent_id tree, then soft-deletes all of
// them in one statement. Requires MySQL 8.0+ (WITH RECURSIVE).
// =========================================

exports.deleteItem = async (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            UPDATE menu_items
            SET deleted_at = NOW()
            WHERE deleted_at IS NULL
              AND id IN (
                SELECT id FROM (
                    WITH RECURSIVE descendants AS (
                        SELECT id FROM menu_items WHERE id = ?
                        UNION ALL
                        SELECT mi.id
                        FROM menu_items mi
                        INNER JOIN descendants d
                            ON mi.parent_id = d.id
                    )
                    SELECT id FROM descendants
                ) AS to_delete
              )
            `,
            [id],
            (err, result) => {
                if (err) {
                    console.error(
                        "DELETE MENU ITEM ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(result);
            }
        );
    });
};

// =========================================
// RESTORE MENU ITEM
// Note: only restores the single item, NOT its former
// children (they were cascade-deleted separately and may
// have their own restore needs — restoring a whole subtree
// is a deliberate future decision, not done implicitly here).
// =========================================

exports.restoreMenuItem = async (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            UPDATE menu_items
            SET
                deleted_at = NULL,
                updated_at = NOW()
            WHERE id = ?
              AND deleted_at IS NOT NULL
            `,
            [id],
            (err, result) => {
                if (err) {
                    console.error(
                        "RESTORE MENU ITEM ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(result);
            }
        );
    });
};

// =========================================
// GET MENU TREE
// Active + non-deleted rows for one menu
// =========================================

exports.getMenuTree = async (menu_id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            SELECT
                id,
                menu_id,
                parent_id,
                label_en,
                label_ur,
                type,
                url,
                target,
                permission,
                sort_order,
                is_active,
                created_at,
                updated_at,
                deleted_at
            FROM menu_items
            WHERE menu_id = ?
              AND is_active = 1
              AND deleted_at IS NULL
            ORDER BY sort_order ASC, id ASC
            `,
            [menu_id],
            (err, results) => {
                if (err) {
                    console.error(
                        "GET MENU TREE ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(results);
            }
        );
    });
};


// =========================================
// GET ITEMS BY MENU LOCATION (public-safe)
// =========================================

exports.getItemsByMenuLocation = async (location) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            SELECT mi.*
            FROM menu_items mi
            JOIN menus m
                ON m.id = mi.menu_id
            WHERE m.location = ?
              AND m.is_active = 1
              AND m.deleted_at IS NULL
              AND mi.is_active = 1
              AND mi.deleted_at IS NULL
            ORDER BY mi.sort_order ASC, mi.id ASC
            `,
            [location],
            (err, results) => {
                if (err) {
                    console.error(
                        "GET ITEMS BY MENU LOCATION ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(results);
            }
        );
    });
};

// =========================================
// IS DESCENDANT (cycle check)
// Returns true if candidateId is the same as ancestorId or
// is anywhere below ancestorId in the parent_id tree. Used
// to reject a parent_id change that would create a cycle
// (an item can't become a descendant of its own descendant).
// Requires MySQL 8.0+ (WITH RECURSIVE).
// =========================================

exports.isDescendant = async (ancestorId, candidateId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `
            WITH RECURSIVE descendants AS (
                SELECT id FROM menu_items WHERE id = ?
                UNION ALL
                SELECT mi.id
                FROM menu_items mi
                INNER JOIN descendants d
                    ON mi.parent_id = d.id
            )
            SELECT COUNT(*) AS cnt
            FROM descendants
            WHERE id = ?
            `,
            [ancestorId, candidateId],
            (err, results) => {
                if (err) {
                    console.error(
                        "IS DESCENDANT CHECK ERROR:",
                        err
                    );
                    return reject(err);
                }

                resolve(results[0].cnt > 0);
            }
        );
    });
};

// =========================================
// REORDER
// Transactional
// =========================================

exports.reorder = (items, callback) => {
    if (!Array.isArray(items) || items.length === 0) {
        return callback(null);
    }

    db.getConnection((connErr, connection) => {
        if (connErr) {
            return callback(connErr);
        }

        connection.beginTransaction((txErr) => {
            if (txErr) {
                connection.release();
                return callback(txErr);
            }

            const runNext = (index) => {
                if (index === items.length) {
                    return connection.commit((commitErr) => {
                        if (commitErr) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(commitErr);
                            });
                        }

                        connection.release();
                        callback(null);
                    });
                }

                const item = items[index];

                connection.query(
                    `
                    UPDATE menu_items
                    SET sort_order = ?
                    WHERE id = ?
                    `,
                    [item.sort_order, item.id],
                    (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        runNext(index + 1);
                    }
                );
            };

            runNext(0);
        });
    });
};