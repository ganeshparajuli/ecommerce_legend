const express = require("express");
const router = express.Router();
const splashController = require("../controller/splashController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

// ============= PUBLIC ROUTES =============
// Get active splash screens (for displaying to users)
router.get("/active", splashController.getActiveSplash);

// ============= ADMIN ROUTES - ORDER MATTERS! =============
// IMPORTANT: More specific routes must come BEFORE generic ones

// Get splash screen statistics (admin dashboard) - MUST come before /:id
router.get(
  "/admin/stats",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.getSplashStats
);

// Update display orders for multiple splash screens (admin only)
router.patch(
  "/update-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.updateDisplayOrders
);

// Bulk update status for multiple splash screens (admin only)
router.patch(
  "/bulk-status",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.bulkUpdateStatus
);

// Get all splash screens (admin only)
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.getAllSplash
);

// Create new splash screen (admin only)
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.createSplash
);

// Get splash screens by product ID (can be public or admin)
router.get("/product/:productId", splashController.getSplashByProductId);

// Toggle splash screen active status (admin only) - MUST come before /:id
router.patch(
  "/:id/toggle-status",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.toggleSplashStatus
);

// Get splash screen by ID (public view) - MUST come after more specific routes
router.get("/:id", splashController.getSplashById);

// Update splash screen (admin only)
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.updateSplash
);

// Delete splash screen (admin only)
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.deleteSplash
);

// ============= DEBUG ROUTES =============
// Debug route to check table structure (admin only)
router.get(
  "/debug/table-structure",
  isAuthenticated,
  authorizeRoles("admin"),
  splashController.getTableStructure
);

module.exports = router;
