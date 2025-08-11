const express = require("express");
const brandController = require("../controller/brandController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const upload = require("../utils/Upload");

const router = express.Router();

// ✅ Create a new brand (Admin only)
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  brandController.createBrand
);

// ✅ Get all brands (Public)
router.get("/", brandController.getAllBrands);

// ✅ Get brands with images only (Public)
router.get("/with-images", brandController.getBrandsWithImages);

// ✅ Get a single brand by ID (Public)
router.get("/:id", brandController.getBrandById);

// ✅ Get a single brand by slug (Public)
router.get("/slug/:slug", brandController.getBrandBySlug);

// ✅ Update a brand by ID (Admin only)
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  brandController.updateBrand
);

// ✅ Update only brand image (Admin only)
router.patch(
  "/:id/image",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  brandController.updateBrandImage
);

// ✅ Remove brand image (Admin only)
router.delete(
  "/:id/image",
  isAuthenticated,
  authorizeRoles("admin"),
  brandController.removeBrandImage
);

// ✅ Delete a brand by ID (Admin only)
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  brandController.deleteBrand
);

// ✅ Get brand with its categories by ID (Public)
router.get("/:id/categories", brandController.getBrandWithCategories);

// ✅ Get brand with its categories by slug (Public)
router.get(
  "/slug/:slug/categories",
  brandController.getBrandWithCategoriesBySlug
);

module.exports = router;
