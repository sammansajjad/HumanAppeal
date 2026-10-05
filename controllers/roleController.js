const roleModel = require("../models/roleModel");
const userModel = require("../models/userModel");


// =====================================================
// VALIDATION HELPERS
// =====================================================

const parsePositiveInteger = (value) => {

    const number = Number(value);

    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {
        return null;
    }

    return number;
};


const validateRoleName = (value) => {

    if (typeof value !== "string") {
        return null;
    }

    const name = value.trim();

    if (!name || name.length > 255) {
        return null;
    }

    return name;
};


// =====================================================
// SUPER ADMIN CHECK
// =====================================================

const requireSuperAdmin = (req, res, callback) => {

    userModel.isSuperAdmin(
        req.user.id,
        (err, isSuperAdmin) => {

            if (err) {

                console.error(
                    "Super Admin authorization check error:",
                    err.code || err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Authorization check failed"
                });
            }

            if (!isSuperAdmin) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only a Super Admin can perform this action"
                });
            }

            callback();

        }
    );

};


// =====================================================
// GET ALL ROLES
// =====================================================

const getAllRoles = (req, res) => {

    roleModel.getAllRoles(

        (err, results) => {

            if (err) {

                console.error(
                    "Get roles error:",
                    err.code || err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch roles"
                });

            }

            return res.status(200).json({
                success: true,
                data: results
            });

        }

    );

};


// =====================================================
// GET ROLE BY ID
// =====================================================

const getRoleById = (req, res) => {

    const id =
        parsePositiveInteger(
            req.params.id
        );

    if (!id) {

        return res.status(400).json({
            success: false,
            message: "Invalid role ID"
        });

    }

    roleModel.getRoleById(

        id,

        (err, results) => {

            if (err) {

                console.error(
                    "Get role error:",
                    err.code || err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch role"
                });

            }

            if (
                !results ||
                results.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message: "Role not found"
                });

            }

            return res.status(200).json({
                success: true,
                data: results[0]
            });

        }

    );

};


// =====================================================
// CREATE ROLE
// =====================================================

const createRole = (req, res) => {

    requireSuperAdmin(req, res, () => {

        const name =
            validateRoleName(
                req.body.name
            );

        const permissionIds =
            Array.isArray(req.body.permission_ids)
                ? req.body.permission_ids
                : [];

        if (!name) {

            return res.status(400).json({
                success: false,
                message: "Invalid role name"
            });

        }

        if (permissionIds.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one permission is required"
            });

        }

        const normalizedPermissionIds =
            permissionIds
                .map(parsePositiveInteger)
                .filter(Boolean);

        if (
            normalizedPermissionIds.length !==
            permissionIds.length
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid permission ID"
            });

        }

        // guard_name is ALWAYS controlled by backend.
        const guardName = "web";

        roleModel.createRole(

            name,
            guardName,
            normalizedPermissionIds,

            (err, result) => {

                if (err) {

                    console.error(
                        "Create role error:",
                        err.code || err.message
                    );

                    if (
                        err.code === "ER_DUP_ENTRY"
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "A role with this name already exists"
                        });

                    }

                    return res.status(500).json({
                        success: false,
                        message: "Failed to create role"
                    });

                }

                return res.status(201).json({
                    success: true,
                    message: "Role created successfully",
                    data: {
                        id: result.insertId,
                        name,
                        guard_name: guardName,
                        permission_ids:
                            normalizedPermissionIds
                    }
                });

            }

        );

    });

};


// =====================================================
// UPDATE ROLE
// =====================================================

const updateRole = (req, res) => {

    requireSuperAdmin(req, res, () => {

        const id =
            parsePositiveInteger(
                req.params.id
            );

        if (!id) {

            return res.status(400).json({
                success: false,
                message: "Invalid role ID"
            });

        }

        const name =
            validateRoleName(
                req.body.name
            );

        const permissionIds =
            Array.isArray(req.body.permission_ids)
                ? req.body.permission_ids
                : [];

        if (!name) {

            return res.status(400).json({
                success: false,
                message: "Invalid role name"
            });

        }

        if (permissionIds.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one permission is required"
            });

        }

        const normalizedPermissionIds =
            permissionIds
                .map(parsePositiveInteger)
                .filter(Boolean);

        if (
            normalizedPermissionIds.length !==
            permissionIds.length
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid permission ID"
            });

        }

        // Never accept guard_name from req.body.
        const guardName = "web";

        roleModel.updateRole(

            id,
            name,
            guardName,
            normalizedPermissionIds,

            (err, result) => {

                if (err) {

                    console.error(
                        "Update role error:",
                        err.code || err.message
                    );

                    if (
                        err.code === "ER_DUP_ENTRY"
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "A role with this name already exists"
                        });

                    }

                    return res.status(500).json({
                        success: false,
                        message: "Failed to update role"
                    });

                }

                if (
                    !result ||
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message: "Role not found"
                    });

                }

                return res.status(200).json({
                    success: true,
                    message: "Role updated successfully",
                    data: {
                        id,
                        name,
                        guard_name: guardName,
                        permission_ids:
                            normalizedPermissionIds
                    }
                });

            }

        );

    });

};


// =====================================================
// DELETE ROLE
// =====================================================

const deleteRole = (req, res) => {

    requireSuperAdmin(req, res, () => {

        const id =
            parsePositiveInteger(
                req.params.id
            );

        if (!id) {

            return res.status(400).json({
                success: false,
                message: "Invalid role ID"
            });

        }

        roleModel.countRoleAssignments(

            id,

            (countErr, assignedCount) => {

                if (countErr) {

                    console.error(
                        "Role assignment count error:",
                        countErr.code || countErr.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to verify role usage"
                    });

                }

                if (assignedCount > 0) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Role is currently assigned and cannot be deleted"
                    });

                }

                roleModel.deleteRole(

                    id,

                    (err, result) => {

                        if (err) {

                            console.error(
                                "Delete role error:",
                                err.code || err.message
                            );

                            // Fallback in case the database constraint
                            // is changed from CASCADE to RESTRICT.
                            if (
                                err.code === "ER_ROW_IS_REFERENCED_2" ||
                                err.code === "ER_ROW_IS_REFERENCED"
                            ) {

                                return res.status(409).json({
                                    success: false,
                                    message:
                                        "Role is currently assigned and cannot be deleted"
                                });

                            }

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to delete role"
                            });

                        }

                        if (
                            !result ||
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Role not found"
                            });

                        }

                        return res.status(200).json({
                            success: true,
                            message:
                                "Role deleted successfully"
                        });

                    }

                );

            }

        );

    });

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};