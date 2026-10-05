


const db = require("./db");


// =========================================
// GET ALL MENUS
// =========================================

exports.getAllMenus = async () => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                id,
                name,
                location,
                is_active,
                created_at,
                updated_at
            FROM menus
            WHERE deleted_at IS NULL
            ORDER BY id ASC
            `,
            (err, results) => {

                if (err) {
                    console.error("GET ALL MENUS ERROR:", err);
                    reject(err);
                    return;
                }

                resolve(results);

            }
        );

    });

};


// =========================================
// GET MENU BY ID
// =========================================

exports.getMenuById = async (id) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                id,
                name,
                location,
                is_active,
                created_at,
                updated_at
            FROM menus
            WHERE id = ?
            AND deleted_at IS NULL
            `,
            [id],
            (err, results) => {

                if (err) {
                    console.error("GET MENU BY ID ERROR:", err);
                    reject(err);
                    return;
                }

                resolve(results);

            }
        );

    });

};


// =========================================
// CREATE MENU
// location is NOT NULL + UNIQUE in the schema, so it's required
// here, not optional. A duplicate location will throw a MySQL
// ER_DUP_ENTRY error — handled in the controller the same
// way createUser handles duplicate emails.
// =========================================

exports.createMenu = async (data) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            INSERT INTO menus
            (name, location, is_active, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
            `,
            [
                data.name,
                data.location,
                data.is_active ?? 1
            ],
            (err, result) => {

                if (err) {
                    console.error("CREATE MENU ERROR:", err);
                    reject(err);
                    return;
                }

                resolve(result.insertId);

            }
        );

    });

};


// =========================================
// UPDATE MENU
// is_active uses COALESCE so an omitted value in the request
// preserves whatever is currently stored, instead of silently
// forcing the menu back to active (previous behavior: data.is_active ?? 1
// meant leaving is_active out of an update request would
// unintentionally reactivate a deactivated menu).
// =========================================

exports.updateMenu = async (id, data) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            UPDATE menus
            SET
                name = ?,
                location = ?,
                is_active = COALESCE(?, is_active),
                updated_at = NOW()
            WHERE id = ?
            AND deleted_at IS NULL
            `,
            [
                data.name,
                data.location,
                data.is_active ?? null,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error("UPDATE MENU ERROR:", err);
                    reject(err);
                    return;
                }

                resolve(result);

            }
        );

    });

};


// =========================================
// DELETE MENU (soft delete via deleted_at)
// Soft-delete only touches the menus table. menu_items rows
// still reference this menu_id and are left untouched, so if
// the menu is restored later its items come back correctly
// linked. No transaction needed — single table write.
// =========================================

exports.deleteMenu = async (id) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            UPDATE menus
            SET deleted_at = NOW()
            WHERE id = ?
            AND deleted_at IS NULL
            `,
            [id],
            (err, result) => {

                if (err) {
                    console.error("DELETE MENU ERROR:", err);
                    reject(err);
                    return;
                }

                resolve(result);

            }
        );

    });

};


// =========================================
// RESTORE MENU
// =========================================

exports.restoreMenu = async (id) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            UPDATE menus
            SET deleted_at = NULL
            WHERE id = ?
            AND deleted_at IS NOT NULL
            `,
            [id],
            (err, result) => {

                if (err) {
                    console.error("RESTORE MENU ERROR:", err);
                    reject(err);
                    return;
                }

                resolve(result);

            }
        );

    });

};