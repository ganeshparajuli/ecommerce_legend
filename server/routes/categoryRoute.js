const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

// Existing routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  categoryController.createCategory
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  categoryController.deleteCategory
);

router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/brand/:brandId", categoryController.getCategoriesByBrandId);

// Debug route to check table structure
// router.get("/debug/table-structure", categoryController.getTableStructure);

module.exports = router;