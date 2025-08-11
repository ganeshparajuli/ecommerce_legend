const Brand = require("../model/brandModel");

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Brand name is required and must be a non-empty string",
      });
    }

    // Prepare brand data
    const brandData = {
      name: name.trim(),
      image: req.file ? req.file.filename : null, // Use filename from upload
    };

    // Create brand
    const brand = await Brand.create(brandData);

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      brand: brand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json({
      success: true,
      brands: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brands",
    });
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    res.json({
      success: true,
      brand: brand,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brand",
    });
  }
};

// Get brand by slug
exports.getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findBySlug(slug);

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    res.json({
      success: true,
      brand: brand,
    });
  } catch (error) {
    console.error("Error fetching brand by slug:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brand",
    });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    // Prepare update data
    const updateData = {};

    // Update name if provided
    if (name && typeof name === "string" && name.trim() !== "") {
      updateData.name = name.trim();
    }

    // Update image if uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update",
      });
    }

    // Update brand
    await Brand.updateBrand(id, updateData);

    // Get updated brand
    const updatedBrand = await Brand.findById(id);

    res.json({
      success: true,
      message: "Brand updated successfully",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update brand",
    });
  }
};

// Update only brand image
exports.updateBrandImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    // Update only image
    await Brand.updateBrandImage(id, req.file.filename);

    // Get updated brand
    const updatedBrand = await Brand.findById(id);

    res.json({
      success: true,
      message: "Brand image updated successfully",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update brand image",
    });
  }
};

// Remove brand image
exports.removeBrandImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    // Remove image
    await Brand.removeBrandImage(id);

    // Get updated brand
    const updatedBrand = await Brand.findById(id);

    res.json({
      success: true,
      message: "Brand image removed successfully",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error("Error removing brand image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove brand image",
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    // Delete brand
    await Brand.deleteBrand(id);

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete brand",
    });
  }
};

// Get brand with its categories
exports.getBrandWithCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const brandWithCategories = await Brand.getBrandWithCategories(id);

    if (!brandWithCategories) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    res.json({
      success: true,
      brand: brandWithCategories,
    });
  } catch (error) {
    console.error("Error fetching brand with categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brand with categories",
    });
  }
};

// Get brand with its categories by slug
exports.getBrandWithCategoriesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const brandWithCategories = await Brand.getBrandWithCategoriesBySlug(slug);

    if (!brandWithCategories) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    res.json({
      success: true,
      brand: brandWithCategories,
    });
  } catch (error) {
    console.error("Error fetching brand with categories by slug:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brand with categories",
    });
  }
};

// Get brands with images only
exports.getBrandsWithImages = async (req, res) => {
  try {
    const brands = await Brand.findBrandsWithImages();
    res.json({
      success: true,
      brands: brands,
    });
  } catch (error) {
    console.error("Error fetching brands with images:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brands with images",
    });
  }
};
