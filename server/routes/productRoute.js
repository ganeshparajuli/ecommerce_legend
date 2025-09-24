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
// ============================    

// Basic product retrieval
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProductById);
router.get("/sku/:sku", productController.getProductBySKU);

// Note: These routes are commented out because the controller methods aren't implemented yet
// But you can uncomment them when you add these methods to your controller
// router.get("/category/:category", productController.getProductsByCategory);
// router.get("/color/:color", productController.getProductsByColor);
// router.get("/size/:size", productController.getProductsBySize);
// router.get("/price-range", productController.getProductsByPriceRange);

// ============================
// PROTECTED ROUTES (Admin only)
// ============================

// Create new product
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  productUpload,
  productController.createProduct
);

// Update entire product
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  productUpload,
  productController.updateProduct
);

// Delete product
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  productController.deleteProduct
);

// NEW: Routes for soft delete functionality
router.get('/deleted', isAuthenticated, authorizeRoles("admin"), productController.getDeletedProducts);
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

// Partial updates (PATCH routes)
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

// Note: This route is commented out because updateProductImage isn't in the controller
// You can implement it if needed for updating only images
// router.patch(
//   "/:id/image",
//   isAuthenticated,
//   authorizeRoles("admin"),
//   upload.array("images", 10),
//   productController.updateProductImage
// );

module.exports = router;
