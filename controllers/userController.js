
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");


// ============================================================
// Validation Helpers
// ============================================================

const isValidUserId = (id) => {

    return (
        /^\d+$/.test(String(id)) &&
        Number(id) > 0
    );

};


const normalizeRoleIds = (roleIds) => {

    if (!Array.isArray(roleIds)) {
        return null;
    }

    const normalized = [
        ...new Set(
            roleIds.map(Number)
        )
    ];

    if (
        normalized.length === 0 ||
        normalized.some(
            roleId =>
                !Number.isInteger(roleId) ||
                roleId <= 0
        )
    ) {
        return null;
    }

    return normalized;

};


const normalizeName = (name) => {

    if (typeof name !== "string") {
        return null;
    }

    const normalized = name.trim();

    if (
        normalized.length < 2 ||
        normalized.length > 255
    ) {
        return null;
    }

    return normalized;

};


const normalizeEmail = (email) => {

    if (typeof email !== "string") {
        return null;
    }

    const normalized = email
        .trim()
        .toLowerCase();

    if (
        normalized.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ) {
        return null;
    }

    return normalized;

};


const isValidActiveValue = (value) => {

    return (
        value === true ||
        value === false ||
        value === 1 ||
        value === 0 ||
        value === "1" ||
        value === "0" ||
        value === "true" ||
        value === "false"
    );

};


const normalizeActiveValue = (value) => {

    if (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true"
    ) {
        return 1;
    }

    return 0;

};


// ============================================================
// Get All Users
// ============================================================

const getAllUsers = (req, res) => {

    let page =
        parseInt(req.query.page, 10) || 1;

    let limit =
        parseInt(req.query.limit, 10) || 10;


    // Security limits

    page = Math.max(page, 1);

    limit = Math.min(
        Math.max(limit, 1),
        100
    );


    const search =
        typeof req.query.search === "string"
            ? req.query.search.trim()
            : "";


    const role =
        typeof req.query.role === "string"
            ? req.query.role.trim()
            : "";


    const is_active =
        req.query.is_active !== undefined
            ? req.query.is_active
            : "";


    const sort_by =
        typeof req.query.sort_by === "string"
            ? req.query.sort_by
            : "id";


    const sort_order =
        typeof req.query.sort_order === "string"
            ? req.query.sort_order
            : "DESC";


    const deleted =
        req.query.deleted === "true"
            ? "true"
            : "false";


    userModel.getAllUsers(

        page,
        limit,
        search,
        role,
        is_active,
        sort_by,
        sort_order,
        deleted,

        (err, results) => {

            if (err) {

                console.error(
                    "Get all users error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Something went wrong."

                });

            }


            return res.status(200).json({

                success: true,

                ...results

            });

        }

    );

};


// ============================================================
// Get User By ID
// ============================================================

const getUserById = (
    req,
    res
) => {

    const { id } =
        req.params;


    if (!isValidUserId(id)) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid user ID"

        });

    }


    userModel.getUserById(

        Number(id),

        (err, results) => {

            if (err) {

                console.error(
                    "Get user error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            return res.status(200).json({

                success: true,

                data: results[0]

            });

        }

    );

};


// ============================================================
// Create User
// ============================================================

const createUser = (
    req,
    res
) => {

    const name =
        normalizeName(req.body.name);

    const email =
        normalizeEmail(req.body.email);

    const password =
        typeof req.body.password === "string"
            ? req.body.password
            : null;

    const roleIds =
        normalizeRoleIds(req.body.role_ids);


    // ---------------- Validation ----------------

    if (!name) {

        return res.status(400).json({

            success: false,

            message:
                "Name must be between 2 and 255 characters"

        });

    }


    if (!email) {

        return res.status(400).json({

            success: false,

            message:
                "A valid email address is required"

        });

    }


    if (
        !password ||
        password.length < 8 ||
        password.length > 255
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be between 8 and 255 characters"

        });

    }


    if (!roleIds) {

        return res.status(400).json({

            success: false,

            message:
                "At least one valid role is required"

        });

    }


    // ========================================================
    // Super Admin Protection
    // ========================================================

    userModel.isSuperAdmin(

        req.user.id,

        (superAdminErr, requesterIsSuperAdmin) => {

            if (superAdminErr) {

                console.error(
                    "Super Admin verification error:",
                    superAdminErr
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to verify administrator privileges"

                });

            }


            userModel.isAssigningSuperAdmin(

                roleIds,

                (assignErr, assigningSuperAdmin) => {

                    if (assignErr) {

                        console.error(
                            "Role verification error:",
                            assignErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to verify role assignment"

                        });

                    }


                    if (
                        assigningSuperAdmin &&
                        !requesterIsSuperAdmin
                    ) {

                        return res.status(403).json({

                            success: false,

                            message:
                                "Only Super Admin can assign the Super Admin role"

                        });

                    }


                    // ====================================================
                    // Hash Password
                    // ====================================================

                    bcrypt.hash(

                        password,
                        10,

                        (err, hash) => {

                            if (err) {

                                console.error(
                                    "Password hashing error:",
                                    err
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to hash password"

                                });

                            }


                            // ====================================================
                            // Transactional Create
                            // ====================================================

                            userModel.createUser(

                                name,
                                email,
                                hash,
                                roleIds,

                                (err, result) => {

                                    if (err) {

                                        if (
                                            err.code ===
                                            "ER_DUP_ENTRY"
                                        ) {

                                            return res.status(409).json({

                                                success: false,

                                                message:
                                                    "Email already exists"

                                            });

                                        }


                                        console.error(
                                            "Create user error:",
                                            err
                                        );

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Failed to create user"

                                        });

                                    }


                                    return res.status(201).json({

                                        success: true,

                                        message:
                                            "User created successfully",

                                        data: {

                                            id:
                                                result.insertId

                                        }

                                    });

                                }

                            );

                        }

                    );

                }

            );

        }

    );

};


// ============================================================
// Update User
// ============================================================

const updateUser = (
    req,
    res
) => {

    const { id } =
        req.params;


    // ---------------- Validate ID ----------------

    if (!isValidUserId(id)) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid user ID"

        });

    }


    const userId =
        Number(id);


    const name =
        normalizeName(req.body.name);

    const email =
        normalizeEmail(req.body.email);

    const roleIds =
        normalizeRoleIds(req.body.role_ids);

    const password =
        typeof req.body.password === "string"
            ? req.body.password
            : "";


    const { is_active } =
        req.body;


    // ---------------- Validation ----------------

    if (!name) {

        return res.status(400).json({

            success: false,

            message:
                "Name must be between 2 and 255 characters"

        });

    }


    if (!email) {

        return res.status(400).json({

            success: false,

            message:
                "A valid email address is required"

        });

    }


    if (!roleIds) {

        return res.status(400).json({

            success: false,

            message:
                "At least one valid role is required"

        });

    }


    if (
        !isValidActiveValue(is_active)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "is_active must be true or false"

        });

    }


    if (
        password &&
        (
            password.length < 8 ||
            password.length > 255
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be between 8 and 255 characters"

        });

    }


    const normalizedActive =
        normalizeActiveValue(is_active);


    // ========================================================
    // Requester Super Admin Check
    // ========================================================

    userModel.isSuperAdmin(

        req.user.id,

        (superAdminErr, requesterIsSuperAdmin) => {

            if (superAdminErr) {

                console.error(
                    "Super Admin verification error:",
                    superAdminErr
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to verify administrator privileges"

                });

            }


            // ====================================================
            // Prevent Self Deactivation
            // ====================================================

            if (
                userId === Number(req.user.id) &&
                normalizedActive === 0
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You cannot deactivate your own account"

                });

            }


            // ====================================================
            // Check Target User Super Admin Status
            // ====================================================

            userModel.isSuperAdmin(

                userId,

                (targetErr, targetIsSuperAdmin) => {

                    if (targetErr) {

                        console.error(
                            "Target Super Admin verification error:",
                            targetErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to verify target user privileges"

                        });

                    }


                    // Non-Super Admin cannot modify Super Admin

                    if (
                        targetIsSuperAdmin &&
                        !requesterIsSuperAdmin
                    ) {

                        return res.status(403).json({

                            success: false,

                            message:
                                "Only Super Admin can modify a Super Admin"

                        });

                    }


                    // ====================================================
                    // Check Requested Roles
                    // ====================================================

                    userModel.isAssigningSuperAdmin(

                        roleIds,

                        (assignErr, assigningSuperAdmin) => {

                            if (assignErr) {

                                console.error(
                                    "Role verification error:",
                                    assignErr
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to verify role assignment"

                                });

                            }


                            if (
                                assigningSuperAdmin &&
                                !requesterIsSuperAdmin
                            ) {

                                return res.status(403).json({

                                    success: false,

                                    message:
                                        "Only Super Admin can assign the Super Admin role"

                                });

                            }


                            // ====================================================
                            // Check Email
                            // ====================================================

                            userModel.checkEmailExists(

                                email,
                                userId,

                                (err, emailResult) => {

                                    if (err) {

                                        console.error(
                                            "Email check error:",
                                            err
                                        );

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Database Error"

                                        });

                                    }


                                    if (
                                        emailResult.length > 0
                                    ) {

                                        return res.status(409).json({

                                            success: false,

                                            message:
                                                "Email already exists"

                                        });

                                    }


                                    // ====================================================
                                    // Update Helper
                                    // ====================================================

                                    const executeUpdate =
                                        hashedPassword => {

                                            userModel.updateUser(

                                                userId,
                                                name,
                                                email,
                                                hashedPassword,
                                                normalizedActive,
                                                roleIds,

                                                (
                                                    err,
                                                    result,
                                                    status
                                                ) => {

                                                    if (err) {

                                                        console.error(
                                                            "Update user error:",
                                                            err
                                                        );

                                                        return res.status(500).json({

                                                            success: false,

                                                            message:
                                                                "Database Error"

                                                        });

                                                    }


                                                    if (
                                                        status ===
                                                        "NOT_FOUND"
                                                    ) {

                                                        return res.status(404).json({

                                                            success: false,

                                                            message:
                                                                "User not found"

                                                        });

                                                    }


                                                    return res.status(200).json({

                                                        success: true,

                                                        message:
                                                            "User updated successfully"

                                                    });

                                                }

                                            );

                                        };


                                    // ====================================================
                                    // Optional Password Update
                                    // ====================================================

                                    if (password) {

                                        bcrypt.hash(

                                            password,
                                            10,

                                            (err, hash) => {

                                                if (err) {

                                                    console.error(
                                                        "Password hashing error:",
                                                        err
                                                    );

                                                    return res.status(500).json({

                                                        success: false,

                                                        message:
                                                            "Password hashing failed"

                                                    });

                                                }


                                                executeUpdate(hash);

                                            }

                                        );

                                    } else {

                                        executeUpdate(null);

                                    }

                                }

                            );

                        }

                    );

                }

            );

        }

    );

};


// ============================================================
// Delete User
// ============================================================

const deleteUser = (
    req,
    res
) => {

    const { id } =
        req.params;


    if (!isValidUserId(id)) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid user ID"

        });

    }


    const userId =
        Number(id);


    // Prevent self-delete

    if (
        userId === Number(req.user.id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "You cannot delete your own account"

        });

    }


    userModel.isSuperAdmin(

        req.user.id,

        (requesterErr, requesterIsSuperAdmin) => {

            if (requesterErr) {

                console.error(
                    "Requester Super Admin check error:",
                    requesterErr
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to verify administrator privileges"

                });

            }


            userModel.isSuperAdmin(

                userId,

                (targetErr, targetIsSuperAdmin) => {

                    if (targetErr) {

                        console.error(
                            "Target Super Admin check error:",
                            targetErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to verify target user privileges"

                        });

                    }


                    if (
                        targetIsSuperAdmin &&
                        !requesterIsSuperAdmin
                    ) {

                        return res.status(403).json({

                            success: false,

                            message:
                                "Only Super Admin can delete a Super Admin"

                        });

                    }


                    userModel.deleteUser(

                        userId,

                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Delete user error:",
                                    err
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Database Error"

                                });

                            }


                            if (
                                result.affectedRows === 0
                            ) {

                                return res.status(404).json({

                                    success: false,

                                    message:
                                        "User not found"

                                });

                            }


                            return res.status(200).json({

                                success: true,

                                message:
                                    "User deleted successfully"

                            });

                        }

                    );

                }

            );

        }

    );

};


// ============================================================
// Restore User
// ============================================================

const restoreUser = (
    req,
    res
) => {

    const { id } = req.params;

    if (!isValidUserId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    const userId = Number(id);

    userModel.isSuperAdmin(
        req.user.id,
        (requesterErr, requesterIsSuperAdmin) => {

            if (requesterErr) {
                console.error(
                    "Requester Super Admin check error:",
                    requesterErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to verify administrator privileges"
                });
            }

            userModel.isSuperAdmin(
                userId,
                (targetErr, targetIsSuperAdmin) => {

                    if (targetErr) {
                        console.error(
                            "Target Super Admin check error:",
                            targetErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to verify target user privileges"
                        });
                    }

                    if (
                        targetIsSuperAdmin &&
                        !requesterIsSuperAdmin
                    ) {
                        return res.status(403).json({
                            success: false,
                            message:
                                "Only Super Admin can restore a Super Admin"
                        });
                    }

                    userModel.restoreUser(
                        userId,
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Restore user error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Database Error"
                                });
                            }

                            if (result.affectedRows === 0) {
                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "User not found or already restored"
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message:
                                    "User restored successfully"
                            });
                        }
                    );
                }
            );
        }
    );
};


// ============================================================
// Exports
// ============================================================

module.exports = {

    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    restoreUser

};