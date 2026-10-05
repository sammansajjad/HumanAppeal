const db = require("./db");

// =====================================================
// GET ALL ROLES
// =====================================================

const getAllRoles = (
    callback
) => {

    const sql = `
        SELECT
            r.id,
            r.name,
            r.guard_name,
            r.created_at,

            p.id AS permission_id,
            p.name AS permission_name

        FROM roles r

        LEFT JOIN role_has_permissions rhp
            ON rhp.role_id = r.id

        LEFT JOIN permissions p
            ON p.id = rhp.permission_id

        ORDER BY
            r.id ASC,
            p.id ASC
    `;


    db.query(
        sql,
        (err, rows) => {

            if (err) {

                return callback(
                    err
                );

            }


            const rolesMap = new Map();


            rows.forEach(row => {

                if (
                    !rolesMap.has(row.id)
                ) {

                    rolesMap.set(
                        row.id,
                        {
                            id: row.id,
                            name: row.name,
                            guard_name: row.guard_name,
                            created_at: row.created_at,
                            permissions: []
                        }
                    );

                }


                /*
                 * Add permission only when
                 * the role actually has one.
                 */

                if (
                    row.permission_id !== null &&
                    row.permission_id !== undefined
                ) {

                    rolesMap
                        .get(row.id)
                        .permissions
                        .push({
                            id: row.permission_id,
                            name: row.permission_name
                        });

                }

            });


            callback(
                null,
                Array.from(
                    rolesMap.values()
                )
            );

        }
    );

};


// =====================================================
// GET ROLE BY ID
// =====================================================
const getRoleById = (
    id,
    callback
) => {

    const sql = `
        SELECT
            r.id,
            r.name,
            r.guard_name,

            p.id AS permission_id,
            p.name AS permission_name

        FROM roles r

        LEFT JOIN role_has_permissions rhp
            ON rhp.role_id = r.id

        LEFT JOIN permissions p
            ON p.id = rhp.permission_id

        WHERE r.id = ?

        ORDER BY
            p.id ASC
    `;


    db.query(
        sql,
        [id],
        (err, rows) => {

            if (err) {
                return callback(err);
            }


            if (
                !rows ||
                rows.length === 0
            ) {
                return callback(
                    null,
                    []
                );
            }


            const role = {
                id: rows[0].id,
                name: rows[0].name,
                guard_name: rows[0].guard_name,
                permissions: []
            };


            rows.forEach(row => {

                if (
                    row.permission_id !== null &&
                    row.permission_id !== undefined
                ) {

                    role.permissions.push({
                        id: row.permission_id,
                        name: row.permission_name
                    });

                }

            });


            callback(
                null,
                [role]
            );

        }
    );

};


// =====================================================
// CREATE ROLE
// =====================================================

const createRole = (
    name,
    guardName,
    permissionIds,
    callback
) => {

    const sql = `
    INSERT INTO roles
    (name, guard_name, created_at, updated_at)
    VALUES (?, ?, NOW(), NOW())
`;


    db.query(
        sql,
        [
            name,
            guardName
        ],
        (err, result) => {

            if (err) {
                return callback(err);
            }


            const roleId =
                result.insertId;


            if (
                !Array.isArray(permissionIds) ||
                permissionIds.length === 0
            ) {

                return callback(
                    null,
                    result
                );

            }


            const values =
                permissionIds.map(
                    permissionId => [
                        roleId,
                        permissionId
                    ]
                );


            const permissionSql = `
                INSERT INTO role_has_permissions
                (
                    role_id,
                    permission_id
                )
                VALUES ?
            `;


            db.query(
                permissionSql,
                [values],
                (permissionError) => {

                    if (permissionError) {
                        return callback(
                            permissionError
                        );
                    }


                    callback(
                        null,
                        result
                    );

                }
            );

        }
    );

};


// =====================================================
// UPDATE ROLE
// =====================================================
const updateRole = (
    id,
    name,
    guardName,
    permissionIds,
    callback
) => {

    db.getConnection((connectionError, connection) => {

        if (connectionError) {
            return callback(connectionError);
        }

        connection.beginTransaction((transactionError) => {

            if (transactionError) {
                connection.release();
                return callback(transactionError);
            }

            const sql = `
                UPDATE roles
                SET
                    name = ?,
                    guard_name = ?,
                    updated_at = NOW()
                WHERE id = ?
            `;

            connection.query(
                sql,
                [
                    name,
                    guardName,
                    id
                ],
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
                            callback(null, result);
                        });
                    }

                    connection.query(
                        `
                            DELETE FROM role_has_permissions
                            WHERE role_id = ?
                        `,
                        [id],
                        (deleteError) => {

                            if (deleteError) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(deleteError);
                                });
                            }

                            if (
                                !Array.isArray(permissionIds) ||
                                permissionIds.length === 0
                            ) {

                                return connection.commit((commitError) => {

                                    if (commitError) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback(commitError);
                                        });
                                    }

                                    connection.release();
                                    callback(null, result);

                                });
                            }

                            const values =
                                permissionIds.map(
                                    permissionId => [
                                        id,
                                        permissionId
                                    ]
                                );

                            connection.query(
                                `
                                    INSERT INTO role_has_permissions
                                    (
                                        role_id,
                                        permission_id
                                    )
                                    VALUES ?
                                `,
                                [values],
                                (insertError) => {

                                    if (insertError) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback(insertError);
                                        });
                                    }

                                    connection.commit((commitError) => {

                                        if (commitError) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                callback(commitError);
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


// =====================================================
// COUNT ROLE ASSIGNMENTS (NEW)
// =====================================================


const countRoleAssignments = (
    id,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS count
        FROM model_has_roles
        WHERE role_id = ?
    `;


    db.query(
        sql,
        [id],
        (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(
                null,
                results[0].count
            );

        }
    );

};


// =====================================================
// DELETE ROLE
// =====================================================

const deleteRole = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM roles
        WHERE id = ?
    `;


    db.query(
        sql,
        [id],
        callback
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    countRoleAssignments,
    deleteRole

};