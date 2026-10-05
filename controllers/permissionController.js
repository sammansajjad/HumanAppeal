const permissionModel = require("../models/permissionModel");
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
// GET ALL PERMISSIONS
// =====================================================

const getAllPermissions = (req, res) => {

    permissionModel.getAllPermissions((err, results) => {

        if (err) {

            console.error(
                "Get permissions error:",
                err.code || err.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch permissions"
            });

        }

        return res.status(200).json({
            success: true,
            data: results
        });

    });

};

// =====================================================
// GET PERMISSION BY ID
// =====================================================

const getPermissionById = (req, res) => {

    const id =
        parsePositiveInteger(req.params.id);

    if (!id) {

        return res.status(400).json({
            success: false,
            message: "Invalid permission ID"
        });

    }

    permissionModel.getPermissionById(
        id,
        (err, results) => {

            if (err) {

                console.error(
                    "Get permission error:",
                    err.code || err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch permission"
                });

            }

            if (
                !results ||
                results.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message: "Permission not found"
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
// CREATE PERMISSION
// =====================================================

const createPermission = (req, res) => {
return requireSuperAdmin(req, res, () => {
    let { name } = req.body;

    if (typeof name !== "string") {

        return res.status(400).json({
            success: false,
            message: "Permission name is required"
        });

    }

    name = name.trim();

    if (!name) {

        return res.status(400).json({
            success: false,
            message: "Permission name is required"
        });

    }

    if (name.length > 100) {

        return res.status(400).json({
            success: false,
            message:
                "Permission name must not exceed 100 characters"
        });

    }

    permissionModel.createPermission(
        name,
        (err, results) => {

            if (err) {

                console.error(
                    "Create permission error:",
                    err.code || err.message
                );

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        success: false,
                        message: "Permission already exists"
                    });

                }

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to create permission"
                });

            }

            return res.status(201).json({
                success: true,
                message:
                    "Permission created successfully",
                permission_id:
                    results.insertId
            });

        }
    );
    });

};

// =====================================================
// UPDATE PERMISSION
// =====================================================

const updatePermission = (req, res) => {
return requireSuperAdmin(req, res, () => {
    const id =
        parsePositiveInteger(req.params.id);

    if (!id) {

        return res.status(400).json({
            success: false,
            message: "Invalid permission ID"
        });

    }

    let { name } = req.body;

    if (typeof name !== "string") {

        return res.status(400).json({
            success: false,
            message:
                "Permission name is required"
        });

    }

    name = name.trim();

    if (!name) {

        return res.status(400).json({
            success: false,
            message:
                "Permission name is required"
        });

    }

    if (name.length > 100) {

        return res.status(400).json({
            success: false,
            message:
                "Permission name must not exceed 100 characters"
        });

    }

    permissionModel.updatePermission(
        id,
        name,
        (err, results) => {

            if (err) {

                console.error(
                    "Update permission error:",
                    err.code || err.message
                );

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Permission already exists"
                    });

                }

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update permission"
                });

            }

            if (
                !results ||
                results.affectedRows === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Permission not found"
                });

            }

            return res.status(200).json({
                success: true,
                message:
                    "Permission updated successfully"
            });

        }
    );
});

};

// =====================================================
// DELETE PERMISSION
// =====================================================

const deletePermission = (req, res) => {
return requireSuperAdmin(req, res, () => {
    const id =
        parsePositiveInteger(req.params.id);

    if (!id) {

        return res.status(400).json({
            success: false,
            message: "Invalid permission ID"
        });

    }

    permissionModel.deletePermission(
        id,
        (err, results) => {

            if (err) {

                console.error(
                    "Delete permission error:",
                    err.code || err.message
                );

                // Foreign-key restriction
                if (
                    err.code === "ER_ROW_IS_REFERENCED_2" ||
                    err.code === "ER_ROW_IS_REFERENCED"
                ) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Permission is currently assigned to a role and cannot be deleted"
                    });

                }

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete permission"
                });

            }

            if (
                !results ||
                results.affectedRows === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Permission not found"
                });

            }

            return res.status(200).json({
                success: true,
                message:
                    "Permission deleted successfully"
            });

        }
    );
});

};

// =====================================================
// ASSIGN PERMISSIONS TO ROLE
// =====================================================
// =====================================================
// ASSIGN PERMISSIONS TO ROLE
// SUPER ADMIN ONLY
// =====================================================

const assignPermissionsToRole = (req, res) => {

    const roleId =
        parsePositiveInteger(req.params.roleId);

    if (!roleId) {

        return res.status(400).json({
            success: false,
            message: "Invalid role ID"
        });

    }

    const { permission_ids } = req.body;

    if (!Array.isArray(permission_ids)) {

        return res.status(400).json({
            success: false,
            message: "permission_ids must be an array"
        });

    }

    // -------------------------------------------------
    // LIMIT REQUEST SIZE
    // -------------------------------------------------

    if (permission_ids.length > 100) {

        return res.status(400).json({
            success: false,
            message: "Too many permissions supplied"
        });

    }

    // -------------------------------------------------
    // VALIDATE IDS
    // -------------------------------------------------

    const invalidPermissionId =
        permission_ids.some(
            id =>
                !Number.isInteger(id) ||
                id <= 0
        );

    if (invalidPermissionId) {

        return res.status(400).json({
            success: false,
            message:
                "permission_ids must contain only positive integers"
        });

    }

    // -------------------------------------------------
    // REMOVE DUPLICATES
    // -------------------------------------------------

    const permissionIds = [
        ...new Set(permission_ids)
    ];

    // -------------------------------------------------
    // SUPER ADMIN ONLY
    // -------------------------------------------------

    return requireSuperAdmin(
        req,
        res,
        () => {

            // -------------------------------------------------
            // ASSIGN PERMISSIONS
            // -------------------------------------------------

            permissionModel.assignPermissionsToRole(
                roleId,
                permissionIds,
                (err) => {

                    if (err) {

                        console.error(
                            "Assign permissions error:",
                            err.code ||
                            err.message
                        );

                        // -----------------------------------------
                        // ROLE DOES NOT EXIST
                        // -----------------------------------------

                        if (
                            err.code ===
                            "ROLE_NOT_FOUND"
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Role not found"
                            });

                        }

                        // -----------------------------------------
                        // PERMISSION DOES NOT EXIST
                        // -----------------------------------------

                        if (
                            err.code ===
                            "PERMISSION_NOT_FOUND"
                        ) {

                            return res.status(400).json({
                                success: false,
                                message:
                                    "One or more permissions do not exist"
                            });

                        }

                        // -----------------------------------------
                        // DATABASE / SERVER ERROR
                        // -----------------------------------------

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to assign permissions"
                        });

                    }

                    // ---------------------------------------------
                    // SUCCESS
                    // ---------------------------------------------

                    return res.status(200).json({
                        success: true,
                        message:
                            "Permissions assigned successfully"
                    });

                }
            );

        }
    );

};
// =====================================================
// GET ROLE PERMISSIONS
// =====================================================

const getRolePermissions = (req, res) => {

    const roleId =
        parsePositiveInteger(req.params.roleId);

    if (!roleId) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid role ID"
        });

    }

    permissionModel.getRolePermissions(
    roleId,
    (err, results) => {

        if (err) {

            if (err.code === "ROLE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Role not found"
                });
            }

            console.error(
                "Get role permissions error:",
                err.code || err.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch role permissions"
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
// EXPORT
// =====================================================

module.exports = {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionsToRole,
    getRolePermissions
};