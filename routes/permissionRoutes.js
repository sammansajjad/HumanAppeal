const express = require("express");
const router = express.Router();

const permissionController = require("../controllers/permissionController");
const authenticateToken = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const {
    validatePermissionId,
    validateCreatePermission,
    validateUpdatePermission,
    validateRoleIdParam,
    validateAssignPermissions
} = require("../validators/permissionValidator");


// ================= Permissions CRUD =================


// Get all permissions
router.get(
    "/",
    authenticateToken,
    permissionMiddleware("permissions.view"),
    permissionController.getAllPermissions
);


// Get single permission by ID
router.get(
    "/:id",
    authenticateToken,
    permissionMiddleware("permissions.view"),
    validatePermissionId,
    permissionController.getPermissionById
);


// Create permission
router.post(
    "/",
    authenticateToken,
    permissionMiddleware("permissions.create"),
    validateCreatePermission,
    permissionController.createPermission
);


// Update permission
router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("permissions.update"),
    validateUpdatePermission,
    permissionController.updatePermission
);


// Delete permission
router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("permissions.delete"),
    validatePermissionId,
    permissionController.deletePermission
);


// ================= Role Permissions =================


// Get permissions assigned to a role
router.get(
    "/roles/:roleId/permissions",
    authenticateToken,
    permissionMiddleware("roles.permissions.view"),
    validateRoleIdParam,
    permissionController.getRolePermissions
);


// Assign permissions to a role
router.post(
    "/roles/:roleId/permissions",
    authenticateToken,
    permissionMiddleware("roles.permissions.assign"),
    validateAssignPermissions,
    permissionController.assignPermissionsToRole
);


// Update/Sync permissions of a role
router.patch(
    "/roles/:roleId/permissions",
    authenticateToken,
    permissionMiddleware("roles.permissions.assign"),
    validateAssignPermissions,
    permissionController.assignPermissionsToRole
);


module.exports = router;