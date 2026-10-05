const express = require("express");

const router = express.Router();

const subscriberController =
require("../controllers/subscriberController");

const authenticateToken =
require("../middleware/authMiddleware");

const permissionMiddleware =
require("../middleware/permissionMiddleware");

const {
validateSubscriberId
} = require("../validators/subscriberValidator");

// PUBLIC

// Newsletter signup

router.post(
"/",
subscriberController.createSubscriber
);

// ADMIN

router.get(
"/",
authenticateToken,
permissionMiddleware("manage_subscribers"),
subscriberController.getAllSubscribers
);

router.get(
"/:id",
authenticateToken,
permissionMiddleware("manage_subscribers"),
validateSubscriberId,
subscriberController.getSubscriber
);

router.patch(
"/:id/status",
authenticateToken,
permissionMiddleware("manage_subscribers"),
validateSubscriberId,
subscriberController.updateStatus
);

router.delete(
"/:id",
authenticateToken,
permissionMiddleware("manage_subscribers"),
validateSubscriberId,
subscriberController.deleteSubscriber
);

module.exports = router;
