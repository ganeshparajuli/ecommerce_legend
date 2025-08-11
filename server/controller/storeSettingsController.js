const { StoreSettings } = require("../model/storeSettingsModel");

// Get store settings
exports.getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.getSettings();
    
    // If no settings exist, initialize with defaults
    if (!settings) {
      settings = await StoreSettings.initializeDefaults();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching store settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch store settings",
    });
  }
};

// Update store settings
exports.updateStoreSettings = async (req, res) => {
  try {
    console.log('=== UPDATE STORE SETTINGS REQUEST ===');
    console.log('req.body keys:', Object.keys(req.body));
    console.log('req.files:', req.files);
    console.log('subStoreLocations in body:', req.body.subStoreLocations);
    
    const updateData = { ...req.body };

    // ✅ Handle sub-store locations from request body
    if (updateData.subStoreLocations) {
      console.log('Raw subStoreLocations:', updateData.subStoreLocations);
      console.log('Type of subStoreLocations:', typeof updateData.subStoreLocations);
      
      try {
        // Parse if it's a string (from FormData)
        if (typeof updateData.subStoreLocations === 'string') {
          updateData.subStoreLocations = JSON.parse(updateData.subStoreLocations);
          console.log('Parsed subStoreLocations:', updateData.subStoreLocations);
        }
        // Validate it's an array
        if (!Array.isArray(updateData.subStoreLocations)) {
          console.log('subStoreLocations is not an array, setting to empty array');
          updateData.subStoreLocations = [];
        }
        console.log('Final subStoreLocations to save:', updateData.subStoreLocations);
      } catch (parseError) {
        console.error("Error parsing subStoreLocations:", parseError);
        updateData.subStoreLocations = [];
      }
    } else {
      console.log('No subStoreLocations in request body');
    }

    // Handle uploaded files
    if (req.files) {
      if (req.files.logo) {
        updateData.logo = req.files.logo[0].filename;
      }
      if (req.files.footerLogo) {
        updateData.footerLogo = req.files.footerLogo[0].filename;
      }
    } else if (req.file) {
      // Handle single file upload (for backward compatibility)
      updateData.logo = req.file.filename;
    }

    // Validate required fields if provided
    if (updateData.storeEmail && !updateData.storeEmail.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Check if settings exist
    const existingSettings = await StoreSettings.getSettings();
    
    if (existingSettings) {
      // Update existing settings
      await StoreSettings.updateFields(updateData);
    } else {
      // Create new settings with provided data
      const newSettings = new StoreSettings({
        storeName: updateData.storeName || 'Joy Electronics',
        storeEmail: updateData.storeEmail || 'contact@joyelectronics.com',
        storePhone: updateData.storePhone || '+977-01-4123456',
        storeAddress: updateData.storeAddress || 'Kathmandu, Nepal',
        ...updateData
      });
      await newSettings.save();
    }

    // Get updated settings
    const updatedSettings = await StoreSettings.getSettings();

    res.json({
      success: true,
      message: "Store settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating store settings:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update store settings",
    });
  }
};

// Update store logo
exports.updateStoreLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No logo file provided",
      });
    }

    await StoreSettings.updateFields({ logo: req.file.filename });
    const updatedSettings = await StoreSettings.getSettings();

    res.json({
      success: true,
      message: "Store logo updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating store logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update store logo",
    });
  }
};

// Update footer logo
exports.updateFooterLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No footer logo file provided",
      });
    }

    await StoreSettings.updateFields({ footerLogo: req.file.filename });
    const updatedSettings = await StoreSettings.getSettings();

    res.json({
      success: true,
      message: "Footer logo updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating footer logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update footer logo",
    });
  }
};

// Remove store logo
exports.removeStoreLogo = async (req, res) => {
  try {
    await StoreSettings.updateFields({ logo: null });
    const updatedSettings = await StoreSettings.getSettings();

    res.json({
      success: true,
      message: "Store logo removed successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error removing store logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove store logo",
    });
  }
};

// Remove footer logo
exports.removeFooterLogo = async (req, res) => {
  try {
    await StoreSettings.updateFields({ footerLogo: null });
    const updatedSettings = await StoreSettings.getSettings();

    res.json({
      success: true,
      message: "Footer logo removed successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error removing footer logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove footer logo",
    });
  }
};

// ✅ NEW SUB-STORE LOCATIONS CONTROLLERS

// Get all sub-store locations
exports.getSubStoreLocations = async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const locations = await StoreSettings.getSubStoreLocations(activeOnly);

    res.json({
      success: true,
      data: locations,
      count: locations.length,
    });
  } catch (error) {
    console.error("Error fetching sub-store locations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch sub-store locations",
    });
  }
};

// Get specific sub-store location
exports.getSubStoreLocationById = async (req, res) => {
  try {
    const { locationId } = req.params;
    const location = await StoreSettings.getSubStoreLocationById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: "Sub-store location not found",
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Error fetching sub-store location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch sub-store location",
    });
  }
};

// Add new sub-store location
exports.addSubStoreLocation = async (req, res) => {
  try {
    const { locationName, address, phone, email, isActive } = req.body;

    // Validate required fields
    if (!locationName || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: "Location name, address, and phone are required",
      });
    }

    // Validate email format if provided
    if (email && !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    const locationData = {
      locationName: locationName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    const newLocation = await StoreSettings.addSubStoreLocation(locationData);

    res.status(201).json({
      success: true,
      message: "Sub-store location added successfully",
      data: newLocation,
    });
  } catch (error) {
    console.error("Error adding sub-store location:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add sub-store location",
    });
  }
};

// Update sub-store location
exports.updateSubStoreLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const updateData = req.body;

    // Validate email format if provided
    if (updateData.email && !updateData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Clean up the update data
    const cleanUpdateData = {};
    if (updateData.locationName) cleanUpdateData.locationName = updateData.locationName.trim();
    if (updateData.address) cleanUpdateData.address = updateData.address.trim();
    if (updateData.phone) cleanUpdateData.phone = updateData.phone.trim();
    if (updateData.email !== undefined) cleanUpdateData.email = updateData.email ? updateData.email.trim() : '';
    if (updateData.isActive !== undefined) cleanUpdateData.isActive = Boolean(updateData.isActive);

    const updatedLocation = await StoreSettings.updateSubStoreLocation(locationId, cleanUpdateData);

    res.json({
      success: true,
      message: "Sub-store location updated successfully",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating sub-store location:", error);
    if (error.message === "Sub-store location not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update sub-store location",
    });
  }
};

// Delete sub-store location
exports.deleteSubStoreLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    await StoreSettings.deleteSubStoreLocation(locationId);

    res.json({
      success: true,
      message: "Sub-store location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sub-store location:", error);
    if (error.message === "Sub-store location not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete sub-store location",
    });
  }
};

// Toggle sub-store location status (active/inactive)
exports.toggleSubStoreLocationStatus = async (req, res) => {
  try {
    const { locationId } = req.params;

    const updatedLocation = await StoreSettings.toggleSubStoreLocationStatus(locationId);

    res.json({
      success: true,
      message: `Sub-store location ${updatedLocation.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error toggling sub-store location status:", error);
    if (error.message === "Sub-store location not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to toggle sub-store location status",
    });
  }
};

// Bulk update sub-store locations (useful for frontend operations)
exports.bulkUpdateSubStoreLocations = async (req, res) => {
  try {
    const { locations } = req.body;

    if (!Array.isArray(locations)) {
      return res.status(400).json({
        success: false,
        error: "Locations must be an array",
      });
    }

    // Validate each location
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      if (!location.locationName || !location.address || !location.phone) {
        return res.status(400).json({
          success: false,
          error: `Location ${i + 1}: Name, address, and phone are required`,
        });
      }
      if (location.email && !location.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.status(400).json({
          success: false,
          error: `Location ${i + 1}: Invalid email format`,
        });
      }
    }

    // Update the sub-store locations
    await StoreSettings.updateFields({ subStoreLocations: locations });
    
    // Get updated settings to return
    const updatedSettings = await StoreSettings.getSettings();

    res.json({
      success: true,
      message: "Sub-store locations updated successfully",
      data: updatedSettings.sub_store_locations || [],
    });
  } catch (error) {
    console.error("Error bulk updating sub-store locations:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update sub-store locations",
    });
  }
};