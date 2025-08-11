const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class StoreSettings {
  constructor(settingsData) {
    this.id = settingsData.id || uuidv4();
    this.storeName = settingsData.storeName || "";
    this.storeEmail = settingsData.storeEmail || "";
    this.storePhone = settingsData.storePhone || "";
    this.storeAddress = settingsData.storeAddress || "";
    this.logo = settingsData.logo || null;
    this.footerLogo = settingsData.footerLogo || null;
    this.storeDescription = settingsData.storeDescription || null;
    this.website = settingsData.website || null;
    this.socialMedia = settingsData.socialMedia || {};
    this.businessHours = settingsData.businessHours || {};
    this.currency = settingsData.currency || "NPR";
    this.timezone = settingsData.timezone || "Asia/Kathmandu";
    this.subStoreLocations = settingsData.subStoreLocations || [];
    
    // Validate required fields
    this.validate();
  }

  validate() {
    if (!this.storeName || typeof this.storeName !== "string") {
      throw new Error("Store name is required and must be a string");
    }
    if (!this.storeEmail || !this.isValidEmail(this.storeEmail)) {
      throw new Error("Valid store email is required");
    }
    if (!this.storePhone || typeof this.storePhone !== "string") {
      throw new Error("Store phone is required");
    }
    if (!this.storeAddress || typeof this.storeAddress !== "string") {
      throw new Error("Store address is required");
    }

    // Validate sub-store locations if provided
    if (this.subStoreLocations && Array.isArray(this.subStoreLocations)) {
      this.subStoreLocations.forEach((location, index) => {
        if (!location.locationName || typeof location.locationName !== "string") {
          throw new Error(`Sub-store location ${index + 1}: Location name is required`);
        }
        if (!location.address || typeof location.address !== "string") {
          throw new Error(`Sub-store location ${index + 1}: Address is required`);
        }
        if (!location.phone || typeof location.phone !== "string") {
          throw new Error(`Sub-store location ${index + 1}: Phone is required`);
        }
        if (location.email && !this.isValidEmail(location.email)) {
          throw new Error(`Sub-store location ${index + 1}: Invalid email format`);
        }
      });
    }
  }

  isValidEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  // Save or update store settings (singleton pattern - only one record)
  async save() {
    try {
      // Check if settings already exist
      const existing = await StoreSettings.getSettings();
      
      if (existing) {
        // Update existing settings
        return await this.update();
      } else {
        // Create new settings
        const query = `
          INSERT INTO store_settings 
          (id, store_name, store_email, store_phone, store_address, logo, footer_logo, 
           store_description, website, social_media, business_hours, currency, timezone, sub_store_locations) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
          this.id,
          this.storeName,
          this.storeEmail,
          this.storePhone,
          this.storeAddress,
          this.logo,
          this.footerLogo,
          this.storeDescription,
          this.website,
          JSON.stringify(this.socialMedia),
          JSON.stringify(this.businessHours),
          this.currency,
          this.timezone,
          JSON.stringify(this.subStoreLocations)
        ]);
        
        console.log(`✅ Store settings saved successfully.`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Error saving store settings: ${error.message}`);
      throw error;
    }
  }

  // Update existing settings
  async update() {
    try {
      const query = `
        UPDATE store_settings SET 
        store_name = ?, store_email = ?, store_phone = ?, store_address = ?, 
        logo = ?, footer_logo = ?, store_description = ?, website = ?, 
        social_media = ?, business_hours = ?, currency = ?, timezone = ?,
        sub_store_locations = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [
        this.storeName,
        this.storeEmail,
        this.storePhone,
        this.storeAddress,
        this.logo,
        this.footerLogo,
        this.storeDescription,
        this.website,
        JSON.stringify(this.socialMedia),
        JSON.stringify(this.businessHours),
        this.currency,
        this.timezone,
        JSON.stringify(this.subStoreLocations),
        this.id
      ]);
      
      console.log(`✅ Store settings updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating store settings: ${error.message}`);
      throw error;
    }
  }

  // Get store settings (singleton)
  static async getSettings() {
    try {
      const query = `SELECT * FROM store_settings LIMIT 1`;
      const [rows] = await db.execute(query);
      
      if (rows.length > 0) {
        const settings = rows[0];
        // Parse JSON fields
        settings.social_media = settings.social_media ? JSON.parse(settings.social_media) : {};
        settings.business_hours = settings.business_hours ? JSON.parse(settings.business_hours) : {};
        settings.sub_store_locations = settings.sub_store_locations ? JSON.parse(settings.sub_store_locations) : [];
        return settings;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching store settings: ${error.message}`);
      throw error;
    }
  }

  // Update specific fields
  static async updateFields(updateData) {
    try {
      console.log('=== StoreSettings.updateFields called ===');
      console.log('updateData:', updateData);
      
      const updates = [];
      const values = [];

      // Build dynamic query
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          console.log(`Processing field: ${key}, value:`, updateData[key]);
          switch(key) {
            case 'storeName':
              updates.push("store_name = ?");
              values.push(updateData[key]);
              break;
            case 'storeEmail':
              updates.push("store_email = ?");
              values.push(updateData[key]);
              break;
            case 'storePhone':
              updates.push("store_phone = ?");
              values.push(updateData[key]);
              break;
            case 'storeAddress':
              updates.push("store_address = ?");
              values.push(updateData[key]);
              break;
            case 'logo':
              updates.push("logo = ?");
              values.push(updateData[key]);
              break;
            case 'footerLogo':
              updates.push("footer_logo = ?");
              values.push(updateData[key]);
              break;
            case 'storeDescription':
              updates.push("store_description = ?");
              values.push(updateData[key]);
              break;
            case 'website':
              updates.push("website = ?");
              values.push(updateData[key]);
              break;
            case 'socialMedia':
              updates.push("social_media = ?");
              values.push(JSON.stringify(updateData[key]));
              break;
            case 'businessHours':
              updates.push("business_hours = ?");
              values.push(JSON.stringify(updateData[key]));
              break;
            case 'currency':
              updates.push("currency = ?");
              values.push(updateData[key]);
              break;
            case 'timezone':
              updates.push("timezone = ?");
              values.push(updateData[key]);
              break;
            case 'subStoreLocations':
              console.log('Adding sub_store_locations to query with value:', updateData[key]);
              updates.push("sub_store_locations = ?");
              values.push(JSON.stringify(updateData[key]));
              break;
            default:
              console.log(`Unknown field ignored: ${key}`);
          }
        }
      });

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      const query = `UPDATE store_settings SET ${updates.join(", ")}`;
      
      console.log('Final SQL query:', query);
      console.log('Query values:', values);
      
      const [result] = await db.execute(query, values);
      
      console.log(`✅ Store settings updated successfully. Affected rows: ${result.affectedRows}`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating store settings: ${error.message}`);
      throw error;
    }
  }

  // ✅ New methods for sub-store locations management
  static async addSubStoreLocation(locationData) {
    try {
      // Validate location data
      if (!locationData.locationName || !locationData.address || !locationData.phone) {
        throw new Error("Location name, address, and phone are required");
      }

      // Get current settings
      const currentSettings = await this.getSettings();
      if (!currentSettings) {
        throw new Error("Store settings not found. Please initialize store settings first.");
      }

      // Get current locations
      const currentLocations = currentSettings.sub_store_locations || [];
      
      // Add new location with generated ID
      const newLocation = {
        id: 'loc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        locationName: locationData.locationName,
        address: locationData.address,
        phone: locationData.phone,
        email: locationData.email || '',
        isActive: locationData.isActive !== undefined ? locationData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      currentLocations.push(newLocation);

      // Update settings with new locations
      await this.updateFields({ subStoreLocations: currentLocations });
      
      console.log(`✅ Sub-store location added successfully: ${newLocation.locationName}`);
      return newLocation;
    } catch (error) {
      console.error(`❌ Error adding sub-store location: ${error.message}`);
      throw error;
    }
  }

  static async updateSubStoreLocation(locationId, updateData) {
    try {
      // Get current settings
      const currentSettings = await this.getSettings();
      if (!currentSettings) {
        throw new Error("Store settings not found");
      }

      // Get current locations
      const currentLocations = currentSettings.sub_store_locations || [];
      
      // Find and update the location
      const locationIndex = currentLocations.findIndex(loc => loc.id === locationId);
      if (locationIndex === -1) {
        throw new Error("Sub-store location not found");
      }

      // Update the location
      currentLocations[locationIndex] = {
        ...currentLocations[locationIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Update settings with modified locations
      await this.updateFields({ subStoreLocations: currentLocations });
      
      console.log(`✅ Sub-store location updated successfully: ${locationId}`);
      return currentLocations[locationIndex];
    } catch (error) {
      console.error(`❌ Error updating sub-store location: ${error.message}`);
      throw error;
    }
  }

  static async deleteSubStoreLocation(locationId) {
    try {
      // Get current settings
      const currentSettings = await this.getSettings();
      if (!currentSettings) {
        throw new Error("Store settings not found");
      }

      // Get current locations
      const currentLocations = currentSettings.sub_store_locations || [];
      
      // Filter out the location to delete
      const updatedLocations = currentLocations.filter(loc => loc.id !== locationId);
      
      if (updatedLocations.length === currentLocations.length) {
        throw new Error("Sub-store location not found");
      }

      // Update settings with filtered locations
      await this.updateFields({ subStoreLocations: updatedLocations });
      
      console.log(`✅ Sub-store location deleted successfully: ${locationId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting sub-store location: ${error.message}`);
      throw error;
    }
  }

  static async toggleSubStoreLocationStatus(locationId) {
    try {
      // Get current settings
      const currentSettings = await this.getSettings();
      if (!currentSettings) {
        throw new Error("Store settings not found");
      }

      // Get current locations
      const currentLocations = currentSettings.sub_store_locations || [];
      
      // Find and toggle the location status
      const locationIndex = currentLocations.findIndex(loc => loc.id === locationId);
      if (locationIndex === -1) {
        throw new Error("Sub-store location not found");
      }

      // Toggle active status
      currentLocations[locationIndex].isActive = !currentLocations[locationIndex].isActive;
      currentLocations[locationIndex].updatedAt = new Date().toISOString();

      // Update settings with modified locations
      await this.updateFields({ subStoreLocations: currentLocations });
      
      console.log(`✅ Sub-store location status toggled: ${locationId} -> ${currentLocations[locationIndex].isActive ? 'Active' : 'Inactive'}`);
      return currentLocations[locationIndex];
    } catch (error) {
      console.error(`❌ Error toggling sub-store location status: ${error.message}`);
      throw error;
    }
  }

  static async getSubStoreLocations(activeOnly = false) {
    try {
      const currentSettings = await this.getSettings();
      if (!currentSettings) {
        return [];
      }

      const locations = currentSettings.sub_store_locations || [];
      
      if (activeOnly) {
        return locations.filter(loc => loc.isActive);
      }
      
      return locations;
    } catch (error) {
      console.error(`❌ Error fetching sub-store locations: ${error.message}`);
      throw error;
    }
  }

  static async getSubStoreLocationById(locationId) {
    try {
      const locations = await this.getSubStoreLocations();
      return locations.find(loc => loc.id === locationId) || null;
    } catch (error) {
      console.error(`❌ Error fetching sub-store location: ${error.message}`);
      throw error;
    }
  }

  // Initialize default settings
  static async initializeDefaults() {
    try {
      const existing = await this.getSettings();
      if (!existing) {
        const defaultSettings = new StoreSettings({
          storeName: 'Joy Electronics',
          storeEmail: 'contact@joyelectronics.com',
          storePhone: '+977-01-4123456',
          storeAddress: 'Kathmandu, Nepal',
          logo: '/joy-finalogo-1-1-1.png',
          footerLogo: '/joy-finalogo-1-1-1.png',
          subStoreLocations: []
        });
        await defaultSettings.save();
        return defaultSettings;
      }
      return existing;
    } catch (error) {
      console.error(`❌ Error initializing default settings: ${error.message}`);
      throw error;
    }
  }
}

// model/notificationSettingsModel.js
class NotificationSettings {
  constructor(settingsData) {
    this.id = settingsData.id || uuidv4();
    this.orderConfirmation = settingsData.orderConfirmation !== undefined ? settingsData.orderConfirmation : true;
    this.orderDelivery = settingsData.orderDelivery !== undefined ? settingsData.orderDelivery : true;
    this.lowStockAlert = settingsData.lowStockAlert !== undefined ? settingsData.lowStockAlert : true;
    this.newUserRegistration = settingsData.newUserRegistration !== undefined ? settingsData.newUserRegistration : true;
    this.orderCancellation = settingsData.orderCancellation !== undefined ? settingsData.orderCancellation : true;
    this.paymentConfirmation = settingsData.paymentConfirmation !== undefined ? settingsData.paymentConfirmation : true;
    this.newsletterSubscription = settingsData.newsletterSubscription !== undefined ? settingsData.newsletterSubscription : false;
    this.promotionalEmails = settingsData.promotionalEmails !== undefined ? settingsData.promotionalEmails : false;
    this.smsNotifications = settingsData.smsNotifications !== undefined ? settingsData.smsNotifications : false;
    this.emailNotifications = settingsData.emailNotifications !== undefined ? settingsData.emailNotifications : true;
  }

  // Save or update notification settings (singleton pattern)
  async save() {
    try {
      const existing = await NotificationSettings.getSettings();
      
      if (existing) {
        return await this.update();
      } else {
        const query = `
          INSERT INTO notification_settings 
          (id, order_confirmation, order_delivery, low_stock_alert, new_user_registration,
           order_cancellation, payment_confirmation, newsletter_subscription, promotional_emails,
           sms_notifications, email_notifications) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
          this.id,
          this.orderConfirmation,
          this.orderDelivery,
          this.lowStockAlert,
          this.newUserRegistration,
          this.orderCancellation,
          this.paymentConfirmation,
          this.newsletterSubscription,
          this.promotionalEmails,
          this.smsNotifications,
          this.emailNotifications
        ]);
        
        console.log(`✅ Notification settings saved successfully.`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Error saving notification settings: ${error.message}`);
      throw error;
    }
  }

  // Update existing notification settings
  async update() {
    try {
      const query = `
        UPDATE notification_settings SET 
        order_confirmation = ?, order_delivery = ?, low_stock_alert = ?, 
        new_user_registration = ?, order_cancellation = ?, payment_confirmation = ?,
        newsletter_subscription = ?, promotional_emails = ?, sms_notifications = ?,
        email_notifications = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [
        this.orderConfirmation,
        this.orderDelivery,
        this.lowStockAlert,
        this.newUserRegistration,
        this.orderCancellation,
        this.paymentConfirmation,
        this.newsletterSubscription,
        this.promotionalEmails,
        this.smsNotifications,
        this.emailNotifications,
        this.id
      ]);
      
      console.log(`✅ Notification settings updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating notification settings: ${error.message}`);
      throw error;
    }
  }

  // Get notification settings (singleton)
  static async getSettings() {
    try {
      const query = `SELECT * FROM notification_settings LIMIT 1`;
      const [rows] = await db.execute(query);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`❌ Error fetching notification settings: ${error.message}`);
      throw error;
    }
  }

  // Update specific notification fields
  static async updateFields(updateData) {
    try {
      const updates = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          updates.push(`${this.camelToSnake(key)} = ?`);
          values.push(updateData[key]);
        }
      });

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      const query = `UPDATE notification_settings SET ${updates.join(", ")}`;
      const [result] = await db.execute(query, values);
      
      console.log(`✅ Notification settings updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating notification settings: ${error.message}`);
      throw error;
    }
  }

  // Helper method to convert camelCase to snake_case
  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // Initialize default notification settings
  static async initializeDefaults() {
    try {
      const existing = await this.getSettings();
      if (!existing) {
        const defaultSettings = new NotificationSettings({});
        await defaultSettings.save();
        return defaultSettings;
      }
      return existing;
    } catch (error) {
      console.error(`❌ Error initializing default notification settings: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { StoreSettings, NotificationSettings };