const express = require("express");
const notificationSettingsController = require("../controller/notificationSettingsController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

// ✅ Get notification settings (Admin only)
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  notificationSettingsController.getNotificationSettings
);

// ✅ Update notification settings (Admin only)
router.put(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  notificationSettingsController.updateNotificationSettings
);

// ✅ Reset notification settings to defaults (Admin only)
router.post(
  "/reset",
  isAuthenticated,
  authorizeRoles("admin"),
  notificationSettingsController.resetNotificationSettings
);

module.exports = router;