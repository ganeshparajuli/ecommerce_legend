const express = require("express");
const router = express.Router();
const categorySeriesController = require("../controller/categorySeriesController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

// Existing routes
router.get("/", categorySeriesController.getAllCategoriesSeries);
router.get("/:id", categorySeriesController.getCategorySeriesById);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  categorySeriesController.createCategorySeries
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"), 
  categorySeriesController.updateCategorySeries
);
 
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  categorySeriesController.deleteCategorySeries
);

// router.get("/slug/:slug", categoryController.getCategoryBySlug);
// router.get("/brand/:brandId", categoryController.getCategoriesByBrandId);

// Debug route to check table structure
// router.get("/debug/table-structure", categoryController.getTableStructure);

module.exports = router;