const Category = require("../model/categoryModel");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    console.log("Received category data:", req.body);

    // Extract data from request body - UPDATED to match frontend property names
    const { name, brandId } = req.body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category name is required and must be a non-empty string",
      });
    }

    // Create category data object - UPDATED to use brandId
    const categoryData = {
      name: name.trim(),
      brandId: brandId || null, // Use brandId consistently
    };

    // Create category
    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);

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
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
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
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brandId } = req.body; // UPDATED from brand_id to brandId

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category name is required and must be a non-empty string",
      });
    }

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Create update data object with brandId
    const updateData = {
      name: name.trim(),
      brandId: brandId !== undefined ? brandId : existingCategory.brandId, // UPDATED
    };

    // Update category
    await Category.updateCategory(id, updateData);

    // Get updated category
    const updatedCategory = await Category.findById(id);

    res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update category",
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Delete category
    await Category.deleteCategory(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete category",
    });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findBySlug(slug);

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
    console.error("Error fetching category by slug:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch category",
    });
  }
};

// Get categories by brand ID
exports.getCategoriesByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;
    const categories = await Category.findByBrandId(brandId);

    res.json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.error("Error fetching categories by brand ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

// Debug endpoint to check table structure
exports.getTableStructure = async (req, res) => {
  try {
    const structure = await Category.getTableStructure();
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
