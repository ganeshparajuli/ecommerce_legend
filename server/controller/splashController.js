const Splash = require("../model/splashModel");

// Create a new splash screen
exports.createSplash = async (req, res) => {
  try {
    console.log("Received splash data:", req.body);

    const {
      title,
      description,
      imageUrl,
      productId,
      isActive,
      displayOrder,
      startDate,
      endDate,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor,
    } = req.body;

    // Validate required input
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Splash title is required and must be a non-empty string",
      });
    }

    // Create splash data object
    const splashData = {
      title: title.trim(),
      description,
      imageUrl,
      productId,
      isActive,
      displayOrder,
      startDate,
      endDate,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor,
    };

    // Create splash screen
    const splash = await Splash.create(splashData);

    res.status(201).json({
      success: true,
      message: "Splash screen created successfully",
      splash: splash,
    });
  } catch (error) {
    console.error("Error creating splash screen:", error);

    // Handle specific errors
    if (error.message.includes("title must be")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// Get all splash screens (admin)
exports.getAllSplash = async (req, res) => {
  try {
    const splashScreens = await Splash.findAll();
    res.json({
      success: true,
      splash: splashScreens,
      count: splashScreens.length,
    });
  } catch (error) {
    console.error("Error fetching splash screens:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch splash screens",
    });
  }
};

// Get only active splash screens (public)
exports.getActiveSplash = async (req, res) => {
  try {
    const activeSplashScreens = await Splash.findActive();
    res.json({
      success: true,
      splash: activeSplashScreens,
      count: activeSplashScreens.length,
    });
  } catch (error) {
    console.error("Error fetching active splash screens:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active splash screens",
    });
  }
};

// Get splash screen by ID
exports.getSplashById = async (req, res) => {
  try {
    const { id } = req.params;
    const splash = await Splash.findById(id);

    if (!splash) {
      return res.status(404).json({
        success: false,
        error: "Splash screen not found",
      });
    }

    res.json({
      success: true,
      splash: splash,
    });
  } catch (error) {
    console.error("Error fetching splash screen:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch splash screen",
    });
  }
};

// Update splash screen
exports.updateSplash = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate title if provided
    if (updateData.title !== undefined) {
      if (
        !updateData.title ||
        typeof updateData.title !== "string" ||
        updateData.title.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          error: "Splash title must be a non-empty string",
        });
      }
    }

    // Check if splash screen exists
    const existingSplash = await Splash.findById(id);
    if (!existingSplash) {
      return res.status(404).json({
        success: false,
        error: "Splash screen not found",
      });
    }

    // Update splash screen
    await Splash.updateSplash(id, updateData);

    // Get updated splash screen
    const updatedSplash = await Splash.findById(id);

    res.json({
      success: true,
      message: "Splash screen updated successfully",
      splash: updatedSplash,
    });
  } catch (error) {
    console.error("Error updating splash screen:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update splash screen",
    });
  }
};

// Delete splash screen
exports.deleteSplash = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if splash screen exists
    const existingSplash = await Splash.findById(id);
    if (!existingSplash) {
      return res.status(404).json({
        success: false,
        error: "Splash screen not found",
      });
    }

    // Delete splash screen
    await Splash.deleteSplash(id);

    res.json({
      success: true,
      message: "Splash screen deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting splash screen:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete splash screen",
    });
  }
};

// Toggle active status
exports.toggleSplashStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if splash screen exists
    const existingSplash = await Splash.findById(id);
    if (!existingSplash) {
      return res.status(404).json({
        success: false,
        error: "Splash screen not found",
      });
    }

    // Toggle status
    await Splash.toggleActiveStatus(id);

    // Get updated splash screen
    const updatedSplash = await Splash.findById(id);

    res.json({
      success: true,
      message: `Splash screen ${
        updatedSplash.is_active ? "activated" : "deactivated"
      } successfully`,
      splash: updatedSplash,
    });
  } catch (error) {
    console.error("Error toggling splash screen status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle splash screen status",
    });
  }
};

// Get splash screens by product ID
exports.getSplashByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const splashScreens = await Splash.findByProductId(productId);

    res.json({
      success: true,
      splash: splashScreens,
      count: splashScreens.length,
    });
  } catch (error) {
    console.error("Error fetching splash screens by product ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch splash screens",
    });
  }
};

// Update display orders for multiple splash screens
exports.updateDisplayOrders = async (req, res) => {
  try {
    const { orderUpdates } = req.body;

    // Validate input
    if (!Array.isArray(orderUpdates) || orderUpdates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "orderUpdates must be a non-empty array",
      });
    }

    // Validate each update object
    for (const update of orderUpdates) {
      if (!update.id || update.displayOrder === undefined) {
        return res.status(400).json({
          success: false,
          error: "Each update must have id and displayOrder properties",
        });
      }
    }

    // Update display orders
    await Splash.updateDisplayOrders(orderUpdates);

    res.json({
      success: true,
      message: "Display orders updated successfully",
    });
  } catch (error) {
    console.error("Error updating display orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update display orders",
    });
  }
};

// Bulk operations - FIXED: Use the new bulkUpdateStatus method
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "ids must be a non-empty array",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "isActive must be a boolean value",
      });
    }

    // Use the new bulk update method
    await Splash.bulkUpdateStatus(ids, isActive);

    res.json({
      success: true,
      message: `${ids.length} splash screens ${
        isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Error bulk updating splash screen status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk update splash screen status",
    });
  }
};

// Get splash screen statistics (admin dashboard) - FIXED: Use the new getStats method
exports.getSplashStats = async (req, res) => {
  try {
    const stats = await Splash.getStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Error fetching splash screen statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch splash screen statistics",
    });
  }
};

// Debug endpoint to check table structure
exports.getTableStructure = async (req, res) => {
  try {
    const structure = await Splash.getTableStructure();
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
