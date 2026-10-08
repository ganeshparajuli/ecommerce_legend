const express = require("express");
const productController = require("../controller/productController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");
const upload = require("../utils/Upload");

const router = express.Router();

const productUpload = upload.fields([
  { name: "images", maxCount: 10 }, // For new products and general uploads
  { name: "newImages", maxCount: 10 }, // For updating products - new images
  { name: "image", maxCount: 10 }, // For backward compatibility
]);

// ============================
// PUBLIC ROUTES (No auth required)
// Specific literal paths must come before "/:id" or Express will treat them as an id.
// ============================
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/search", productController.searchProducts);
router.get("/sku/:sku", productController.getProductBySKU);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/series/:seriesId", productController.getProductsBySeries);

// ============================
// PROTECTED ROUTES (Admin only) - also placed before "/:id"
// ============================
router.get("/deleted", isAuthenticated, authorizeRoles("admin"), productController.getDeletedProducts);
router.post(
  "/bulk-delete",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.bulkDeleteProducts
);
router.post(
  "/bulk-restore",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.bulkRestoreProducts
);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  productUpload,
  productController.createProduct
);

// Generic "/:id" routes - must come after every literal path above.
router.get("/:id", productController.getProductById);
router.get("/:id/dependencies", isAuthenticated, authorizeRoles("admin"), productController.checkProductDependencies);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  productUpload,
  productController.updateProduct
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.deleteProduct
);

router.post(
  "/:id/restore",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.restoreProduct
);

router.patch(
  "/:id/stock",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.updateProductStock
);

router.patch(
  "/:id/rating",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.updateProductRating
);

module.exports = router;
