const express = require("express");
const router = express.Router();
const promoCodeController = require("../controller/promoController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

// Admin routes (protected) - Now accessible by admin and finance
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin", "finance","sub-admin", "sales"),
  promoCodeController.createPromoCode
);

router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin", "finance","sub-admin", "sales"),
  promoCodeController.getAllPromoCodes
);

router.get(
  "/admin/:id",
  isAuthenticated,
  authorizeRoles("admin", "finance","sub-admin", "sales"  ),
  promoCodeController.getPromoCodeById
);

router.put(
  "/admin/:id",
  isAuthenticated,
  authorizeRoles("admin", "finance","sub-admin", "sales"),
  promoCodeController.updatePromoCode
);

router.delete(
  "/admin/:id",
  isAuthenticated,
  authorizeRoles("admin", "finance","sub-admin", "sales"),
  promoCodeController.deletePromoCode
);

router.post(
  "/expire",
  isAuthenticated,
  authorizeRoles("admin", "finance","sub-admin", "sales"),
  promoCodeController.runAutoExpiration
);

// User routes
router.get("/active", promoCodeController.getActivePromoCodes); // Public route to get active promo codes

router.post(
  "/validate",
  isAuthenticated,
  promoCodeController.validatePromoCode
); // Protected route for user to validate a promo code

module.exports = router;