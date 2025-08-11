const express = require("express");
const saleController = require("../controller/saleController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// ✅ CORRECT ORDER: Specific routes FIRST, generic routes LAST

// Most specific routes first
router.get("/analytics", saleController.getSalesAnalytics);
router.get("/status/:status", saleController.getSalesByStatus);
router.get("/:id/products", saleController.getSaleProducts);

// Generic routes last (these catch everything else)
router.get("/:id", saleController.getSaleById);
router.get("/", saleController.getAllSales);

// Protected routes (admin only)
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin"),
  saleController.createSale
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  saleController.updateSale
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  saleController.deleteSale
);

router.post(
  "/:id/products",
  isAuthenticated,
  authorizeRoles("admin"),
  saleController.addProductsToSale
);

router.get("/:id/gifts", saleController.getSaleGifts);
router.post("/:saleId/calculate-gifts", saleController.calculateCartGifts);

// Protected gift management routes
router.put(
  "/:id/gifts",
  isAuthenticated,
  authorizeRoles("admin"),
  saleController.updateSaleGifts
);

module.exports = router;
