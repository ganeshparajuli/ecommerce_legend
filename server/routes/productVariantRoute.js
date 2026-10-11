const express = require("express");
const productVariantController = require("../controller/productVariantController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// ============================
// PUBLIC ROUTES (No auth required)
// ============================
router.get("/", productVariantController.getAllProductVariants);
router.get("/:id", productVariantController.getProductVariantById);

// ============================
// PROTECTED ROUTES (Admin only)
// ============================

// Must come before "/:id" to avoid Express treating "generate"/"bulk" as an id
router.post(
  "/generate",
  isAuthenticated,
  authorizeRoles("admin"),
  productVariantController.generateVariants
);

router.patch(
  "/bulk",
  isAuthenticated,
  authorizeRoles("admin"),
  productVariantController.bulkUpdateVariants
);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  productVariantController.createProductVariant
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  productVariantController.updateProductVariant
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  productVariantController.deleteProductVariant
);

router.post(
  "/:id/restore",
  isAuthenticated,
  authorizeRoles("admin"),
  productVariantController.restoreProductVariant
);

module.exports = router;
