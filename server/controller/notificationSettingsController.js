const { NotificationSettings } = require("../model/storeSettingsModel");

// Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.getSettings();
    
    // If no settings exist, initialize with defaults
    if (!settings) {
      settings = await NotificationSettings.initializeDefaults();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification settings",
    });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const updateData = req.body;

    // Validate boolean fields
    const booleanFields = [
      'orderConfirmation', 'orderDelivery', 'lowStockAlert', 'newUserRegistration',
      'orderCancellation', 'paymentConfirmation', 'newsletterSubscription',
      'promotionalEmails', 'smsNotifications', 'emailNotifications'
    ];

    booleanFields.forEach(field => {
      if (updateData[field] !== undefined && typeof updateData[field] !== 'boolean') {
        updateData[field] = updateData[field] === 'true' || updateData[field] === true;
      }
    });

    // Check if settings exist
    const existingSettings = await NotificationSettings.getSettings();
    
    if (existingSettings) {
      // Update existing settings
      await NotificationSettings.updateFields(updateData);
    } else {
      // Create new settings
      const newSettings = new NotificationSettings(updateData);
      await newSettings.save();
    }

    // Get updated settings
    const updatedSettings = await NotificationSettings.getSettings();

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update notification settings",
    });
  }
};

// Reset notification settings to defaults
exports.resetNotificationSettings = async (req, res) => {
  try {
    const defaultSettings = new NotificationSettings({});
    await defaultSettings.update();
    
    const updatedSettings = await NotificationSettings.getSettings();

    res.json({
      success: true,
      message: "Notification settings reset to defaults",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error resetting notification settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset notification settings",
    });
  }
};
