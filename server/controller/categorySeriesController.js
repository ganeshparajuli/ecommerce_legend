const CategorySeries = require("../model/categorySeriesModel");

// Create a new category
exports.createCategorySeries = async (req, res) => {
  try {
    console.log("Received category data series:", req.body);

    // Extract data from request body - UPDATED to match frontend property names
    const { series_name, category_id, is_active } = req.body;

    // Validate input
    if (!series_name || typeof series_name !== "string" || series_name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category Series name is required and must be a non-empty string",
      });
    }

    // Create category data object - UPDATED to use brandId
    const categorySeriesData = {
      series_name: series_name.trim(),
      category_id: category_id || null, // Use categoryId consistently
      is_active: is_active || false,
    };

    // Create category series
    const category = await CategorySeries.create(categorySeriesData);

    res.status(201).json({
      success: true,
      message: "CategorySeries created successfully",
      category: category,
    });
  } catch (error) {
    console.error("Error creating category series:", error);

    // Handle specific errors
    if (error.message.includes("name must be")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all categories
exports.getAllCategoriesSeries = async (req, res) => {
  try {
    const categories = await CategorySeries.findAll();
    res.json({
      success: true,
      category: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.json({
      success: true,
      category: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch category",
    });
  }
};

// Update category
exports.updateCategorySeries = async (req, res) => {
  try {
    const { id } = req.params;
    const { series_name, category_id, is_active } = req.body; // UPDATED from brand_id to brandId

    // Validate input
    if (!series_name || typeof series_name !== "string" || series_name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category name is required and must be a non-empty string",
      });
    }

    // Check if category exists
    const existingCategorySeries = await CategorySeries.findById(id);
    console.log("Existing category series:", existingCategorySeries);
    
    if (!existingCategorySeries) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Create update data object with brandId
    const updateData = {
      series_name: series_name.trim(),
      category_id: category_id !== undefined ? category_id : existingCategory.category_id, // UPDATED
    };

    // Update category
    await CategorySeries.updateCategorySeries(id, updateData);

    // Get updated category
    const updatedCategory = await CategorySeries.findById(id);
    console.log("Updated category series:", updatedCategory);
    

    res.json({
      success: true,
      message: "Category Series updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category Series:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update category Series",
    });
  }
};

// Delete category
exports.deleteCategorySeries = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategorySeries = await CategorySeries.findById(id);
    if (!existingCategorySeries) {
      return res.status(404).json({
        success: false,
        error: "Category Series not found",
      });
    }

    // Delete category
    await CategorySeries.deleteCategorySeries(id);

    res.json({
      success: true,
      message: "Category Series deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category series :", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete category series",
    });
  }
};

// Debug endpoint to check table structure
exports.getTableStructure = async (req, res) => {
  try {
    const structure = await CategorySeries.getTableStructure();
    res.json({
      success: true,
      structure: structure,
    });
  } catch (error) {
    console.error("Error getting table structure:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get table structure",
    });
  }
};
