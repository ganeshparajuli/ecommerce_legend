const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class Splash {
  constructor(splashData) {
    console.log("Splash constructor received:", JSON.stringify(splashData));

    // Validate required fields
    if (!splashData.title || typeof splashData.title !== "string") {
      throw new Error("Splash title must be a non-empty string");
    }

    this.id = uuidv4();
    this.title = splashData.title.trim();
    this.description = splashData.description
      ? splashData.description.trim()
      : null;
    this.imageUrl = splashData.imageUrl || null;
    this.productId = splashData.productId || null;
    this.isActive =
      splashData.isActive !== undefined ? Boolean(splashData.isActive) : true;
    this.displayOrder = splashData.displayOrder || 0;
    this.startDate = splashData.startDate || null;
    this.endDate = splashData.endDate || null;
    this.buttonText = splashData.buttonText || null;
    this.buttonLink = splashData.buttonLink || null;
    this.backgroundColor = splashData.backgroundColor || null;
    this.textColor = splashData.textColor || null;
  }

  // Save a new splash screen to the database
  async save() {
    try {
      console.log("Saving splash with values:", {
        id: this.id,
        title: this.title,
        description: this.description,
        imageUrl: this.imageUrl,
        productId: this.productId,
        isActive: this.isActive,
        displayOrder: this.displayOrder,
        startDate: this.startDate,
        endDate: this.endDate,
        buttonText: this.buttonText,
        buttonLink: this.buttonLink,
        backgroundColor: this.backgroundColor,
        textColor: this.textColor,
      });

      const query = `
        INSERT INTO splash_screens 
        (id, title, description, image_url, product_id, is_active, display_order, 
         start_date, end_date, button_text, button_link, background_color, text_color, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.execute(query, [
        this.id,
        this.title,
        this.description,
        this.imageUrl,
        this.productId,
        this.isActive,
        this.displayOrder,
        this.startDate,
        this.endDate,
        this.buttonText,
        this.buttonLink,
        this.backgroundColor,
        this.textColor,
      ]);

      // Verify what was actually inserted
      const verifyQuery = `SELECT * FROM splash_screens WHERE id = ?`;
      const [rows] = await db.execute(verifyQuery, [this.id]);
      console.log("Verified inserted splash:", rows[0]);

      console.log(`✅ Splash screen "${this.title}" saved successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error saving splash screen: ${error.message}`);
      console.error("SQL Error State:", error.sqlState);
      console.error("SQL Error Code:", error.code);
      console.error("SQL Error Number:", error.errno);
      throw error;
    }
  }

  static async create(splashData) {
    console.log("Create method received:", JSON.stringify(splashData));

    try {
      const splash = new Splash(splashData);
      await splash.save();

      // Fetch the actual saved splash to confirm what's in the database
      const savedSplash = await this.findById(splash.id);
      console.log("Splash after save in DB:", savedSplash);

      return savedSplash;
    } catch (error) {
      console.error(`❌ Error creating splash screen: ${error.message}`);
      if (error.code) {
        console.error("SQL Error Code:", error.code);
      }
      throw error;
    }
  }

  // Get all splash screens - FIXED: Use correct column names from your database
  static async findAll() {
    try {
      const query = `
        SELECT s.*, 
               p.name as product_name, 
               p.sku as product_sku,
               p.finalPrice as product_price,
               p.actualPrice as product_actual_price,
               p.discountPrice as product_discount_price
        FROM splash_screens s 
        LEFT JOIN products p ON s.product_id = p.id 
        ORDER BY s.display_order ASC, s.created_at DESC
      `;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching splash screens: ${error.message}`);
      throw error;
    }
  }

  // Get only active splash screens - FIXED: Use correct column names from your database
  static async findActive() {
    try {
      const query = `
        SELECT s.*, 
               p.name as product_name, 
               p.sku as product_sku,
               p.finalPrice as product_price,
               p.actualPrice as product_actual_price,
               p.discountPrice as product_discount_price,
               p.image as product_image
        FROM splash_screens s 
        LEFT JOIN products p ON s.product_id = p.id 
        WHERE s.is_active = true 
        AND (s.start_date IS NULL OR s.start_date <= NOW()) 
        AND (s.end_date IS NULL OR s.end_date >= NOW())
        ORDER BY s.display_order ASC, s.created_at DESC
      `;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(
        `❌ Error fetching active splash screens: ${error.message}`
      );
      throw error;
    }
  }

  // Find a splash screen by ID - FIXED: Use correct column names from your database
  static async findById(id) {
    try {
      const query = `
        SELECT s.*, 
               p.name as product_name, 
               p.sku as product_sku,
               p.finalPrice as product_price,
               p.actualPrice as product_actual_price,
               p.discountPrice as product_discount_price,
               p.image as product_image
        FROM splash_screens s 
        LEFT JOIN products p ON s.product_id = p.id 
        WHERE s.id = ?
      `;
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`❌ Error fetching splash screen by ID: ${error.message}`);
      throw error;
    }
  }

  // Update a splash screen by ID
  static async updateSplash(id, splashData) {
    try {
      console.log("Updating splash with data:", splashData);

      // Build dynamic query based on provided fields
      const fields = [];
      const values = [];

      if (splashData.title !== undefined) {
        fields.push("title = ?");
        values.push(splashData.title.trim());
      }

      if (splashData.description !== undefined) {
        fields.push("description = ?");
        values.push(
          splashData.description ? splashData.description.trim() : null
        );
      }

      if (splashData.imageUrl !== undefined) {
        fields.push("image_url = ?");
        values.push(splashData.imageUrl);
      }

      if (splashData.productId !== undefined) {
        fields.push("product_id = ?");
        values.push(splashData.productId);
      }

      if (splashData.isActive !== undefined) {
        fields.push("is_active = ?");
        values.push(Boolean(splashData.isActive));
      }

      if (splashData.displayOrder !== undefined) {
        fields.push("display_order = ?");
        values.push(splashData.displayOrder);
      }

      if (splashData.startDate !== undefined) {
        fields.push("start_date = ?");
        values.push(splashData.startDate);
      }

      if (splashData.endDate !== undefined) {
        fields.push("end_date = ?");
        values.push(splashData.endDate);
      }

      if (splashData.buttonText !== undefined) {
        fields.push("button_text = ?");
        values.push(splashData.buttonText);
      }

      if (splashData.buttonLink !== undefined) {
        fields.push("button_link = ?");
        values.push(splashData.buttonLink);
      }

      if (splashData.backgroundColor !== undefined) {
        fields.push("background_color = ?");
        values.push(splashData.backgroundColor);
      }

      if (splashData.textColor !== undefined) {
        fields.push("text_color = ?");
        values.push(splashData.textColor);
      }

      // Always update the updated_at field
      fields.push("updated_at = NOW()");
      values.push(id);

      const query = `UPDATE splash_screens SET ${fields.join(
        ", "
      )} WHERE id = ?`;
      const [result] = await db.execute(query, values);

      console.log(`✅ Splash screen with ID "${id}" updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating splash screen: ${error.message}`);
      throw error;
    }
  }

  // Delete a splash screen by ID
  static async deleteSplash(id) {
    try {
      const query = `DELETE FROM splash_screens WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      console.log(`✅ Splash screen with ID "${id}" deleted successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting splash screen: ${error.message}`);
      throw error;
    }
  }

  // Toggle active status
  static async toggleActiveStatus(id) {
    try {
      const query = `UPDATE splash_screens SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      console.log(`✅ Splash screen active status toggled for ID "${id}".`);
      return result;
    } catch (error) {
      console.error(`❌ Error toggling splash screen status: ${error.message}`);
      throw error;
    }
  }

  // Get splash screens by product ID - FIXED: Use correct column names from your database
  static async findByProductId(productId) {
    try {
      const query = `
        SELECT s.*, 
               p.name as product_name, 
               p.sku as product_sku,
               p.finalPrice as product_price,
               p.actualPrice as product_actual_price,
               p.discountPrice as product_discount_price
        FROM splash_screens s 
        LEFT JOIN products p ON s.product_id = p.id 
        WHERE s.product_id = ? 
        ORDER BY s.display_order ASC
      `;
      const [rows] = await db.execute(query, [productId]);
      return rows;
    } catch (error) {
      console.error(
        `❌ Error fetching splash screens by product ID: ${error.message}`
      );
      throw error;
    }
  }

  // Update display order for multiple splash screens
  static async updateDisplayOrders(orderUpdates) {
    try {
      const queries = orderUpdates.map((update) => ({
        query:
          "UPDATE splash_screens SET display_order = ?, updated_at = NOW() WHERE id = ?",
        values: [update.displayOrder, update.id],
      }));

      // Execute all updates in a transaction
      await db.beginTransaction();

      for (const { query, values } of queries) {
        await db.execute(query, values);
      }

      await db.commit();
      console.log(
        `✅ Display orders updated for ${orderUpdates.length} splash screens.`
      );
      return true;
    } catch (error) {
      await db.rollback();
      console.error(`❌ Error updating display orders: ${error.message}`);
      throw error;
    }
  }

  // Bulk update status for multiple splash screens - NEW METHOD
  static async bulkUpdateStatus(ids, isActive) {
    try {
      // Convert array to comma-separated string of placeholders
      const placeholders = ids.map(() => "?").join(",");
      const query = `UPDATE splash_screens SET is_active = ?, updated_at = NOW() WHERE id IN (${placeholders})`;

      // Prepare values array: [isActive, ...ids]
      const values = [Boolean(isActive), ...ids];

      const [result] = await db.execute(query, values);
      console.log(
        `✅ Bulk status update completed for ${ids.length} splash screens.`
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Error bulk updating splash screen status: ${error.message}`
      );
      throw error;
    }
  }

  // Get splash screen statistics - NEW METHOD
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) as withProducts,
          SUM(CASE WHEN (start_date IS NOT NULL OR end_date IS NOT NULL) THEN 1 ELSE 0 END) as scheduled
        FROM splash_screens
      `;

      const [rows] = await db.execute(query);
      const stats = rows[0];

      // Convert BigInt to Number for JSON serialization
      return {
        total: Number(stats.total),
        active: Number(stats.active),
        inactive: Number(stats.inactive),
        withProducts: Number(stats.withProducts),
        scheduled: Number(stats.scheduled),
      };
    } catch (error) {
      console.error(
        `❌ Error fetching splash screen statistics: ${error.message}`
      );
      throw error;
    }
  }

  // Get table structure (helper method for debugging)
  static async getTableStructure() {
    try {
      const query = `DESCRIBE splash_screens`;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error getting table structure: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Splash;
