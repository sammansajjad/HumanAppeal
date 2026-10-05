const express = require("express");

const router = express.Router();

const roleController =
    require("../controllers/roleController");


const authenticateToken =
    require("../middleware/authMiddleware");


const permissionMiddleware =
    require("../middleware/permissionMiddleware");


const {
    validateCreateRole,
    validateUpdateRole,
    validateRoleId
} =
    require("../validators/roleValidator");


// =====================================================
// GET ALL ROLES
// =====================================================

router.get(

    "/",

    authenticateToken,

    permissionMiddleware(
        "roles.permissions.view"
    ),

    roleController.getAllRoles

);


// =====================================================
// GET ROLE BY ID
// =====================================================

router.get(

    "/:id",

    authenticateToken,

    permissionMiddleware(
        "roles.permissions.view"
    ),

    validateRoleId,

    roleController.getRoleById

);


// =====================================================
// CREATE ROLE
// =====================================================

router.post(

    "/",

    authenticateToken,

    permissionMiddleware(
        "roles.permissions.assign"
    ),

    validateCreateRole,

    roleController.createRole

);


// =====================================================
// UPDATE ROLE
// =====================================================

router.put(

    "/:id",

    authenticateToken,

    permissionMiddleware(
        "roles.permissions.assign"
    ),

    validateUpdateRole,

    roleController.updateRole

);


// =====================================================
// DELETE ROLE
// =====================================================

router.delete(

    "/:id",

    authenticateToken,

    permissionMiddleware(
        "roles.permissions.assign"
    ),

    validateRoleId,

    roleController.deleteRole

);


module.exports = router;