const express = require("express");
const router = express.Router();
const newsletterController = require("../controller/newsletterController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");

// Public subscription endpoint
router.post("/", newsletterController.subscribe);

// Admin-only management
router.get("/", isAuthenticated, authorizeRoles("admin", "sub-admin", "sales"), newsletterController.getAllSubscriptions);
router.get("/:id", isAuthenticated, authorizeRoles("admin", "sub-admin", "sales"), newsletterController.getSubscriptionById);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), newsletterController.updateSubscription);
router.delete("/:id", isAuthenticated, authorizeRoles("admin", "sub-admin"), newsletterController.unsubscribe);

module.exports = router;
