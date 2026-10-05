const express = require("express");

const router = express.Router();

const programController =
    require("../controllers/programController");

const authenticateToken =
    require("../middleware/authMiddleware");

const permissionMiddleware =
    require("../middleware/permissionMiddleware");

const {
    validateProgram,
    validateProgramId
} = require("../validators/programValidator");


// ================= GET ALL PROGRAMS (PUBLIC) =================

router.get(
    "/",
    programController.getAllPrograms
);


// ================= GET PROGRAM BY ID (PUBLIC) =================

router.get(
    "/:id",
    validateProgramId,
    programController.getProgramById
);


// ================= CREATE PROGRAM =================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_programs"),
    validateProgram,
    programController.createProgram
);


// ================= UPDATE PROGRAM =================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_programs"),
    validateProgramId,
    validateProgram,
    programController.updateProgram
);


// ================= DELETE PROGRAM =================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_programs"),
    validateProgramId,
    programController.deleteProgram
);


module.exports = router;