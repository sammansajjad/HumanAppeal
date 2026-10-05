const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");

const authenticateToken = require("../middleware/authMiddleware");

const permissionMiddleware = require("../middleware/permissionMiddleware");

const { validateProject, validateProjectId } = require("../validators/projectValidator");


// ================= Get All Projects (PUBLIC) =================

router.get(
    "/",
    projectController.getAllProjects
);


// ================= Get Project By ID (PUBLIC) =================

router.get(
    "/:id",
    validateProjectId,
    projectController.getProjectById
);


// ================= Create Project =================

router.post(
    "/",
    authenticateToken,
    permissionMiddleware("manage_projects"),
    validateProject,
    projectController.createProject
);


// ================= Update Project =================

router.put(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_projects"),
    validateProjectId,
    validateProject,
    projectController.updateProject
);


// ================= Delete Project =================

router.delete(
    "/:id",
    authenticateToken,
    permissionMiddleware("manage_projects"),
    validateProjectId,
    projectController.deleteProject
);


module.exports = router;