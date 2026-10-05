const db = require("./db");

// =====================================================
// MODEL TYPE
// =====================================================

const MODEL_TYPE_USER = "App\\Models\\User";

// ================= Get All Permissions =================

const getAllPermissions = (callback) => {

    const sql = `
        SELECT
            id,
            name,
            guard_name,
            created_at,
            updated_at
        FROM permissions
        ORDER BY id ASC
    `;

    db.query(sql, callback);
};

// ================= Get Permission By ID =================

const getPermissionById = (id, callback) => {

    const sql = `
        SELECT
            id,
            name,
            guard_name,
            created_at,
            updated_at
        FROM permissions
        WHERE id = ?
    `;

    db.query(sql, [id], callback);
};

// ================= Create Permission =================

const createPermission = (name, callback) => {

  const sql = `
    INSERT INTO permissions
    (name, guard_name, created_at, updated_at)
    VALUES (?, ?, NOW(), NOW())
`;

    db.query(sql, [name, "web"], callback);
};

// ================= Update Permission =================

const updatePermission = (id, name, callback) => {

   const sql = `
    UPDATE permissions
    SET
        name = ?,
        guard_name = ?,
        updated_at = NOW()
    WHERE id = ?
`;
    db.query(sql, [name, "web", id], callback);
};

// ================= Delete Permission =================

const deletePermission = (id, callback) => {

    const sql = `
        DELETE FROM permissions
        WHERE id = ?
    `;

    db.query(sql, [id], callback);
};


// ================= Assign Permissions To Role (TRANSACTIONAL) =================

const assignPermissionsToRole = (
    roleId,
    permissionIds,
    callback
) => {

    db.getConnection((connectionErr, connection) => {

        if (connectionErr) {
            return callback(connectionErr);
        }

        connection.beginTransaction((transactionErr) => {

            if (transactionErr) {
                connection.release();
                return callback(transactionErr);
            }

            // =================================================
            // 1. VERIFY ROLE EXISTS
            // =================================================

            const roleCheckSql = `
                SELECT id
FROM roles
WHERE id = ?
AND guard_name = 'web'
LIMIT 1
            `;

            connection.query(
                roleCheckSql,
                [roleId],
                (roleErr, roleResults) => {

                    if (roleErr) {

                        return connection.rollback(() => {
                            connection.release();
                            callback(roleErr);
                        });

                    }

                    if (
                        !roleResults ||
                        roleResults.length === 0
                    ) {

                        const error =
                            new Error("Role not found");

                        error.code =
                            "ROLE_NOT_FOUND";

                        return connection.rollback(() => {
                            connection.release();
                            callback(error);
                        });

                    }

                    // =================================================
                    // 2. VERIFY ALL PERMISSIONS EXIST
                    // =================================================

                    if (permissionIds.length === 0) {
                        return deleteExistingPermissions();
                    }

                    const placeholders =
                        permissionIds
                            .map(() => "?")
                            .join(",");

                    const permissionCheckSql = `
                        SELECT id
                        FROM permissions
                        WHERE id IN (${placeholders})
                        AND guard_name = 'web'
                    `;

                    connection.query(
                        permissionCheckSql,
                        permissionIds,
                        (permissionErr, permissionResults) => {

                            if (permissionErr) {

                                return connection.rollback(() => {
                                    connection.release();
                                    callback(permissionErr);
                                });

                            }

                            const existingPermissionIds =
                                new Set(
                                    permissionResults.map(
                                        permission => permission.id
                                    )
                                );

                            const missingPermission =
                                permissionIds.some(
                                    permissionId =>
                                        !existingPermissionIds.has(
                                            permissionId
                                        )
                                );

                            if (missingPermission) {

                                const error =
                                    new Error(
                                        "One or more permissions do not exist"
                                    );

                                error.code =
                                    "PERMISSION_NOT_FOUND";

                                return connection.rollback(
                                    () => {
                                        connection.release();
                                        callback(error);
                                    }
                                );

                            }

                            deleteExistingPermissions();

                        }
                    );

                }
            );

            // =================================================
            // 3. DELETE EXISTING ROLE PERMISSIONS
            // =================================================

            function deleteExistingPermissions() {

                const deleteSql = `
                    DELETE FROM role_has_permissions
                    WHERE role_id = ?
                `;

                connection.query(
                    deleteSql,
                    [roleId],
                    (deleteErr) => {

                        if (deleteErr) {

                            return connection.rollback(() => {
                                connection.release();
                                callback(deleteErr);
                            });

                        }

                        // =================================================
                        // 4. NOTHING TO INSERT
                        // =================================================

                        if (permissionIds.length === 0) {
                            return commitTransaction();
                        }

                        // =================================================
                        // 5. INSERT NEW PERMISSIONS
                        // =================================================

                        const values =
                            permissionIds.map(
                                permissionId => [
                                    permissionId,
                                    roleId
                                ]
                            );

                        const insertSql = `
                            INSERT INTO role_has_permissions (
                                permission_id,
                                role_id
                            )
                            VALUES ?
                        `;

                        connection.query(
                            insertSql,
                            [values],
                            (insertErr, insertResult) => {

                                if (insertErr) {

                                    return connection.rollback(
                                        () => {
                                            connection.release();
                                            callback(insertErr);
                                        }
                                    );

                                }

                                commitTransaction(insertResult);

                            }
                        );

                    }
                );

            }

            // =================================================
            // 6. COMMIT
            // =================================================

            function commitTransaction(result) {

                connection.commit(
                    (commitErr) => {

                        if (commitErr) {

                            return connection.rollback(
                                () => {
                                    connection.release();
                                    callback(commitErr);
                                }
                            );

                        }

                        connection.release();
                        callback(null, result);

                    }
                );

            }

        });

    });

};


// ================= Get Role Permissions =================

const getRolePermissions = (roleId, callback) => {

    const roleSql = `
        SELECT id
        FROM roles
        WHERE id = ?
        AND guard_name = 'web'
        LIMIT 1
    `;

    db.query(roleSql, [roleId], (err, roleResults) => {

        if (err) {
            return callback(err);
        }

        if (roleResults.length === 0) {
            const error = new Error("Role not found");
            error.code = "ROLE_NOT_FOUND";
            return callback(error);
        }

        const sql = `
            SELECT
                p.id,
                p.name
            FROM permissions p
            INNER JOIN role_has_permissions rp
                ON rp.permission_id = p.id
            WHERE rp.role_id = ?
            ORDER BY p.id ASC
        `;

        db.query(sql, [roleId], callback);
    });
};


// ================= Check User Permission =================
// Checks:
// 1. User exists
// 2. User is active
// 3. User is not soft-deleted
// 4. User has the requested permission

const checkUserPermission = (
    userId,
    permissionName,
    callback
) => {

    const sql = `
        SELECT p.id
        FROM permissions p

        INNER JOIN role_has_permissions rp
            ON rp.permission_id = p.id

        INNER JOIN model_has_roles mr
            ON mr.role_id = rp.role_id

        INNER JOIN users u
            ON u.id = mr.model_id

        WHERE mr.model_id = ?
        AND mr.model_type = ?
        AND u.is_active = 1
        AND u.deleted_at IS NULL
        AND p.name = ?
        AND p.guard_name = 'web'

        LIMIT 1
    `;

    db.query(
        sql,
        [
            userId,
            MODEL_TYPE_USER,
            permissionName
        ],
        callback
    );

};


// ================= Get User Permissions =================
// Returns permissions only for an active, non-deleted user.

const getUserPermissions = (userId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT DISTINCT p.name
            FROM permissions p

            INNER JOIN role_has_permissions rhp
                ON p.id = rhp.permission_id

            INNER JOIN model_has_roles mhr
                ON rhp.role_id = mhr.role_id

            INNER JOIN users u
                ON u.id = mhr.model_id

            WHERE mhr.model_id = ?
            AND mhr.model_type = ?
            AND u.is_active = 1
            AND u.deleted_at IS NULL

            ORDER BY p.name ASC
        `;

        db.query(
            sql,
            [userId, MODEL_TYPE_USER],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(
                    result.map(
                        item => item.name
                    )
                );

            }
        );

    });

};


module.exports = {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionsToRole,
    getRolePermissions,
    checkUserPermission,
    getUserPermissions
};