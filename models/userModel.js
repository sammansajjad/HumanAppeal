const db = require("./db");

// ================= Find User By Email =================

const findByEmail = (email, callback) => {

    const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.password,
            u.is_active,

            GROUP_CONCAT(
                DISTINCT r.id
                ORDER BY r.id
                SEPARATOR ','
            ) AS role_ids,

            GROUP_CONCAT(
                DISTINCT r.name
                ORDER BY r.name
                SEPARATOR ', '
            ) AS roles

        FROM users u

        LEFT JOIN model_has_roles mr
            ON mr.model_id = u.id
            AND mr.model_type = 'App\\\\Models\\\\User'

        LEFT JOIN roles r
            ON mr.role_id = r.id

        WHERE u.email = ?
        AND u.is_active = 1
        AND u.deleted_at IS NULL

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.password,
            u.is_active
    `;

    db.query(sql, [email], (err, results) => {

        if (err) {
            return callback(err);
        }

        if (results.length > 0) {

            results[0].role_ids =
                results[0].role_ids
                    ? results[0].role_ids
                        .split(",")
                        .map(Number)
                    : [];

            results[0].roles =
                results[0].roles
                    ? results[0].roles
                        .split(", ")
                    : [];

        }

        callback(null, results);

    });
};


// ================= Get All Users =================

const getAllUsers = (
    page,
    limit,
    search,
    role,
    is_active,
    sort_by,
    sort_order,
    deleted,
    callback
) => {

    const offset = (page - 1) * limit;

    const allowedSortColumns = [
        "id",
        "name",
        "email",
        "is_active"
    ];

    const sortColumn =
        allowedSortColumns.includes(sort_by)
            ? `u.${sort_by}`
            : "u.id";

    const sortDirection =
        sort_order &&
        sort_order.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";


    let sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.is_active,
            u.created_at,

            GROUP_CONCAT(
                DISTINCT r.id
                ORDER BY r.id
                SEPARATOR ','
            ) AS role_ids,

            GROUP_CONCAT(
                DISTINCT r.name
                ORDER BY r.name
                SEPARATOR ', '
            ) AS roles

        FROM users u

        LEFT JOIN model_has_roles mr
            ON mr.model_id = u.id
            AND mr.model_type = 'App\\\\Models\\\\User'

        LEFT JOIN roles r
            ON r.id = mr.role_id

        WHERE 1=1
    `;


    let countSql = `
        SELECT COUNT(DISTINCT u.id) AS total
        FROM users u

        LEFT JOIN model_has_roles mr
            ON mr.model_id = u.id
            AND mr.model_type = 'App\\\\Models\\\\User'

        LEFT JOIN roles r
            ON r.id = mr.role_id

        WHERE 1=1
    `;


    const params = [];
    const countParams = [];


    if (deleted === "true") {

        sql += ` AND u.deleted_at IS NOT NULL`;
        countSql += ` AND u.deleted_at IS NOT NULL`;

    } else {

        sql += ` AND u.deleted_at IS NULL`;
        countSql += ` AND u.deleted_at IS NULL`;

    }


    if (search) {

        sql += `
            AND (
                u.name LIKE ?
                OR u.email LIKE ?
            )
        `;

        countSql += `
            AND (
                u.name LIKE ?
                OR u.email LIKE ?
            )
        `;

        params.push(
            `%${search}%`,
            `%${search}%`
        );

        countParams.push(
            `%${search}%`,
            `%${search}%`
        );

    }


    // FIX: role filter now uses an EXISTS subquery instead of a
    // direct WHERE r.name = ? on the joined roles alias. The old
    // version filtered the joined role ROWS before GROUP_CONCAT ran,
    // which meant a user's OTHER roles silently disappeared from the
    // returned "roles" list whenever a role filter was active.
    // EXISTS only restricts which USERS match, leaving the main
    // LEFT JOIN roles r / GROUP_CONCAT untouched so the full role
    // list for each matched user is still returned correctly.
    if (role) {

        sql += `
            AND EXISTS (
                SELECT 1
                FROM model_has_roles mr2
                INNER JOIN roles r2
                    ON r2.id = mr2.role_id
                WHERE mr2.model_id = u.id
                AND mr2.model_type = 'App\\\\Models\\\\User'
                AND r2.name = ?
            )
        `;

        countSql += `
            AND EXISTS (
                SELECT 1
                FROM model_has_roles mr2
                INNER JOIN roles r2
                    ON r2.id = mr2.role_id
                WHERE mr2.model_id = u.id
                AND mr2.model_type = 'App\\\\Models\\\\User'
                AND r2.name = ?
            )
        `;

        params.push(role);
        countParams.push(role);

    }


    if (
        is_active !== "" &&
        is_active !== undefined
    ) {

        sql += ` AND u.is_active = ?`;
        countSql += ` AND u.is_active = ?`;

        params.push(is_active);
        countParams.push(is_active);

    }


    sql += `
        GROUP BY
            u.id,
            u.name,
            u.email,
            u.is_active,
            u.created_at

        ORDER BY ${sortColumn} ${sortDirection}

        LIMIT ? OFFSET ?
    `;


    params.push(limit, offset);


    db.query(
        countSql,
        countParams,
        (countErr, countResult) => {

            if (countErr) {
                return callback(countErr);
            }


            const total =
                countResult[0].total;


            db.query(
                sql,
                params,
                (err, results) => {

                    if (err) {
                        return callback(err);
                    }


                    results.forEach(user => {

                        user.role_ids =
                            user.role_ids
                                ? user.role_ids
                                    .split(",")
                                    .map(Number)
                                : [];

                        user.roles =
                            user.roles
                                ? user.roles
                                    .split(", ")
                                : [];

                    });


                    callback(null, {

                        data: results,

                        pagination: {

                            current_page: page,

                            per_page: limit,

                            total_records: total,

                            total_pages:
                                Math.ceil(
                                    total / limit
                                )

                        }

                    });

                }
            );

        }
    );

};


// ================= Get User By ID =================

const getUserById = (id, callback) => {

    const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.is_active,

            GROUP_CONCAT(
                DISTINCT r.id
                ORDER BY r.id
                SEPARATOR ','
            ) AS role_ids,

            GROUP_CONCAT(
                DISTINCT r.name
                ORDER BY r.name
                SEPARATOR ', '
            ) AS roles

        FROM users u

        LEFT JOIN model_has_roles mr
            ON mr.model_id = u.id
            AND mr.model_type = 'App\\\\Models\\\\User'

        LEFT JOIN roles r
            ON r.id = mr.role_id

        WHERE u.id = ?
        AND u.deleted_at IS NULL

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.is_active
    `;


    db.query(
        sql,
        [id],
        (err, results) => {

            if (err) {
                return callback(err);
            }


            if (results.length > 0) {

                results[0].role_ids =
                    results[0].role_ids
                        ? results[0].role_ids
                            .split(",")
                            .map(Number)
                        : [];

                results[0].roles =
                    results[0].roles
                        ? results[0].roles
                            .split(", ")
                        : [];

            }


            callback(null, results);

        }
    );

};


// ================= Create User (TRANSACTIONAL) =================
// signature: accepts roleIds and does the user INSERT + role
// assignment INSERT in a single transaction, rolling back the
// user row if role assignment fails.

const createUser = (
    name,
    email,
    password,
    roleIds,
    callback
) => {

    db.getConnection((connErr, connection) => {

        if (connErr) {
            return callback(connErr);
        }

        connection.beginTransaction(txErr => {

            if (txErr) {
                connection.release();
                return callback(txErr);
            }

            const insertUserSql = `
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    is_active,
                    created_at,
                    updated_at
                )

                VALUES (?, ?, ?, 1, NOW(), NOW())
            `;

            connection.query(
                insertUserSql,
                [name, email, password],
                (err, result) => {

                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    const newUserId = result.insertId;

                    if (
                        !Array.isArray(roleIds) ||
                        roleIds.length === 0
                    ) {
                        return connection.commit(commitErr => {

                            connection.release();

                            if (commitErr) {
                                return callback(commitErr);
                            }

                            callback(null, result);

                        });
                    }

                    const roleValues = roleIds.map(
                        roleId => [
                            roleId,
                            "App\\Models\\User",
                            newUserId
                        ]
                    );

                    const insertRolesSql = `
                        INSERT INTO model_has_roles
                        (
                            role_id,
                            model_type,
                            model_id
                        )

                        VALUES ?
                    `;

                    connection.query(
                        insertRolesSql,
                        [roleValues],
                        roleErr => {

                            if (roleErr) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(roleErr);
                                });
                            }

                            connection.commit(commitErr => {

                                if (commitErr) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(commitErr);
                                    });
                                }

                                connection.release();
                                callback(null, result);

                            });

                        }
                    );

                }
            );

        });

    });

};


// ================= Assign Roles (still used standalone elsewhere) =================

const assignRoles = (
    roleIds,
    userId,
    callback
) => {

    if (
        !Array.isArray(roleIds) ||
        roleIds.length === 0
    ) {

        return callback(null);

    }


    const values = roleIds.map(
        roleId => [
            roleId,
            "App\\Models\\User",
            userId
        ]
    );


    const sql = `
        INSERT INTO model_has_roles
        (
            role_id,
            model_type,
            model_id
        )

        VALUES ?
    `;


    db.query(
        sql,
        [values],
        callback
    );

};


// ================= Check Email =================

const checkEmailExists = (
    email,
    id,
    callback
) => {

    const sql = `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
        AND deleted_at IS NULL
    `;


    db.query(
        sql,
        [email, id],
        callback
    );

};


// ================= Update User (TRANSACTIONAL) =================
// Signature unchanged — controller does not need to change for this one.

const updateUser = (
    id,
    name,
    email,
    password,
    is_active,
    roleIds,
    callback
) => {

    db.getConnection((connErr, connection) => {

        if (connErr) {
            return callback(connErr);
        }

        connection.beginTransaction(txErr => {

            if (txErr) {
                connection.release();
                return callback(txErr);
            }

            let sql = `
                UPDATE users

                SET
                    name = ?,
                    email = ?,
                    is_active = ?,
                    updated_at = NOW()
            `;

            const params = [
                name,
                email,
                is_active
            ];

            if (password) {
                sql += `, password = ?`;
                params.push(password);
            }

            sql += `
                WHERE id = ?
                AND deleted_at IS NULL
            `;

            params.push(id);

            connection.query(
                sql,
                params,
                (err, result) => {

                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    if (result.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(null, result, "NOT_FOUND");
                        });
                    }

                    const deleteRolesSql = `
                        DELETE FROM model_has_roles

                        WHERE model_id = ?
                        AND model_type = 'App\\\\Models\\\\User'
                    `;

                    connection.query(
                        deleteRolesSql,
                        [id],
                        deleteErr => {

                            if (deleteErr) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(deleteErr);
                                });
                            }

                            if (
                                !Array.isArray(roleIds) ||
                                roleIds.length === 0
                            ) {
                                return connection.commit(commitErr => {

                                    connection.release();

                                    if (commitErr) {
                                        return callback(commitErr);
                                    }

                                    callback(null, result);

                                });
                            }

                            const roleValues = roleIds.map(
                                roleId => [
                                    roleId,
                                    "App\\Models\\User",
                                    id
                                ]
                            );

                            const insertRolesSql = `
                                INSERT INTO model_has_roles
                                (
                                    role_id,
                                    model_type,
                                    model_id
                                )

                                VALUES ?
                            `;

                            connection.query(
                                insertRolesSql,
                                [roleValues],
                                insertErr => {

                                    if (insertErr) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback(insertErr);
                                        });
                                    }

                                    connection.commit(commitErr => {

                                        if (commitErr) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                callback(commitErr);
                                            });
                                        }

                                        connection.release();
                                        callback(null, result);

                                    });

                                }
                            );

                        }
                    );

                }
            );

        });

    });

};


// ================= Delete User =================

const deleteUser = (
    id,
    callback
) => {

    const sql = `
        UPDATE users

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


// ================= Restore User =================

const restoreUser = (
    id,
    callback
) => {

    const sql = `
        UPDATE users

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


// ================= Check Super Admin =================

const isSuperAdmin = (userId, callback) => {

    const sql = `
        SELECT 1
        FROM model_has_roles mr
        INNER JOIN roles r
            ON r.id = mr.role_id
        WHERE mr.model_id = ?
        AND mr.model_type = 'App\\\\Models\\\\User'
        AND r.name = 'Super Admin'
        AND r.guard_name = 'web'
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(
                null,
                results.length > 0
            );

        }
    );

};


// ================= Check If Assigning Super Admin =================

const isAssigningSuperAdmin = (roleIds, callback) => {

    if (
        !Array.isArray(roleIds) ||
        roleIds.length === 0
    ) {

        return callback(null, false);

    }

    const placeholders =
        roleIds.map(() => "?").join(",");

    const sql = `
        SELECT id
        FROM roles
        WHERE id IN (${placeholders})
        AND name = 'Super Admin'
        AND guard_name = 'web'
        LIMIT 1
    `;

    db.query(
        sql,
        roleIds,

        (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(
                null,
                results.length > 0
            );

        }
    );

};


// ================= Check If User Has Role =================

const hasRole = (userId, roleId, callback) => {

    const sql = `
        SELECT 1
        FROM model_has_roles mr
        WHERE mr.model_id = ?
        AND mr.role_id = ?
        AND mr.model_type = 'App\\\\Models\\\\User'
        LIMIT 1
    `;

    db.query(
        sql,
        [userId, roleId],
        (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(
                null,
                results.length > 0
            );

        }
    );

};


// ================= Check If Role Is Super Admin =================

const isSuperAdminRole = (roleId, callback) => {

    const sql = `
        SELECT 1
        FROM roles
        WHERE id = ?
        AND name = 'Super Admin'
        AND guard_name = 'web'
        LIMIT 1
    `;

    db.query(
        sql,
        [roleId],
        (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(
                null,
                results.length > 0
            );

        }
    );

};


// ================= Check If User Is Active =================

const isUserActive = (userId, callback) => {

    const sql = `
        SELECT 1
        FROM users
        WHERE id = ?
        AND is_active = 1
        AND deleted_at IS NULL
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(
                null,
                results.length > 0
            );

        }
    );

};


// ================= Exports =================

module.exports = {

    findByEmail,
    getAllUsers,
    getUserById,
    createUser,
    assignRoles,
    checkEmailExists,
    updateUser,
    deleteUser,
    restoreUser,
    isSuperAdmin,
    isAssigningSuperAdmin,
    hasRole,
    isSuperAdminRole,
    isUserActive

};