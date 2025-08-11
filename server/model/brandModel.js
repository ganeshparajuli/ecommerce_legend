const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class Brand {
  constructor(brandData) {
    // Handle both string input and object input
    if (typeof brandData === "string") {
      this.name = brandData;
      this.image = null;
    } else {
      this.name = brandData.name;
      this.image = brandData.image || null;
    }

    // Validate name
    if (!this.name || typeof this.name !== "string") {
      throw new Error("Brand name must be a non-empty string");
    }

    this.id = uuidv4();
    this.name = this.name.trim(); // Trim whitespace
    this.slug = this.generateSlug(this.name); // Generate slug for both cases
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  // Save a new brand to the database
  async save() {
    try {
      const query = `INSERT INTO brands (id, name, image, slug) VALUES (?, ?, ?, ?)`;
      const [result] = await db.execute(query, [
        this.id,
        this.name,
        this.image,
        this.slug,
      ]);
      console.log(`✅ Brand "${this.name}" saved successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error saving brand: ${error.message}`);
      throw error;
    }
  }

  // Get all brands
  static async findAll() {
    try {
      const query = `SELECT * FROM brands ORDER BY name`;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching brands: ${error.message}`);
      throw error;
    }
  }

  // Find a brand by ID
  static async findById(id) {
    try {
      const query = `SELECT * FROM brands WHERE id = ?`;
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`❌ Error fetching brand by ID: ${error.message}`);
      throw error;
    }
  }

  // Find a brand by slug
  static async findBySlug(slug) {
    try {
      const query = `SELECT * FROM brands WHERE slug = ?`;
      const [rows] = await db.execute(query, [slug]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`❌ Error fetching brand by slug: ${error.message}`);
      throw error;
    }
  }

  // Update a brand by ID
  static async updateBrand(id, updateData) {
    try {
      // Handle both string input (legacy) and object input
      let updatedName, image, newSlug;

      if (typeof updateData === "string") {
        updatedName = updateData.trim();
        image = undefined;
        newSlug = new Brand({ name: updatedName }).slug;
      } else {
        updatedName = updateData.name ? updateData.name.trim() : undefined;
        image = updateData.image;
        newSlug = updatedName
          ? new Brand({ name: updatedName }).slug
          : undefined;
      }

      // Build dynamic query based on what fields are being updated
      const updates = [];
      const values = [];

      if (updatedName !== undefined) {
        updates.push("name = ?");
        values.push(updatedName);
      }
      if (image !== undefined) {
        updates.push("image = ?");
        values.push(image);
      }
      if (newSlug !== undefined) {
        updates.push("slug = ?");
        values.push(newSlug);
      }

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id); // Add ID for WHERE clause
      const query = `UPDATE brands SET ${updates.join(", ")} WHERE id = ?`;

      const [result] = await db.execute(query, values);
      console.log(`✅ Brand with ID "${id}" updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating brand: ${error.message}`);
      throw error;
    }
  }

  // Update only the image field of a brand
  static async updateBrandImage(id, image) {
    try {
      const query = `UPDATE brands SET image = ? WHERE id = ?`;
      const [result] = await db.execute(query, [image || null, id]);
      console.log(`✅ Brand image with ID "${id}" updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating brand image: ${error.message}`);
      throw error;
    }
  }

  // Remove image from a brand
  static async removeBrandImage(id) {
    try {
      const query = `UPDATE brands SET image = NULL WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      console.log(`✅ Brand image with ID "${id}" removed successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error removing brand image: ${error.message}`);
      throw error;
    }
  }

  // Delete a brand by ID
  static async deleteBrand(id) {
    try {
      const query = `DELETE FROM brands WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      console.log(`✅ Brand with ID "${id}" deleted successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting brand: ${error.message}`);
      throw error;
    }
  }

  // Get all categories for a brand
  static async getBrandCategories(brandId) {
    try {
      const query = `
        SELECT c.* FROM categories c
        WHERE c.brand_id = ?
        ORDER BY c.name
      `;
      const [rows] = await db.execute(query, [brandId]);
      return rows;
    } catch (error) {
      console.error(`❌ Error fetching brand categories: ${error.message}`);
      throw error;
    }
  }

  // Get brand with its categories
  static async getBrandWithCategories(brandId) {
    try {
      // First get the brand
      const brand = await this.findById(brandId);

      if (!brand) {
        return null;
      }

      // Then get its categories
      const categories = await this.getBrandCategories(brandId);

      // Return combined object
      return {
        ...brand,
        categories,
      };
    } catch (error) {
      console.error(
        `❌ Error fetching brand with categories: ${error.message}`
      );
      throw error;
    }
  }

  // Get brand with its categories by slug
  static async getBrandWithCategoriesBySlug(slug) {
    try {
      // First get the brand by slug
      const brand = await this.findBySlug(slug);

      if (!brand) {
        return null;
      }

      // Then get its categories
      const categories = await this.getBrandCategories(brand.id);

      // Return combined object
      return {
        ...brand,
        categories,
      };
    } catch (error) {
      console.error(
        `❌ Error fetching brand with categories by slug: ${error.message}`
      );
      throw error;
    }
  }

  // Create a brand using static method
  static async create(brandData) {
    try {
      const brand = new Brand(brandData);
      await brand.save();
      return {
        id: brand.id,
        name: brand.name,
        image: brand.image,
        slug: brand.slug,
      };
    } catch (error) {
      console.error(`❌ Error creating brand: ${error.message}`);
      throw error;
    }
  }

  // Get brands with images only
  static async findBrandsWithImages() {
    try {
      const query = `SELECT * FROM brands WHERE image IS NOT NULL AND image != '' ORDER BY name`;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching brands with images: ${error.message}`);
      throw error;
    }
  }

  // Check if slug exists (useful for validation)
  static async slugExists(slug, excludeId = null) {
    try {
      let query = `SELECT COUNT(*) as count FROM brands WHERE slug = ?`;
      let params = [slug];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error(`❌ Error checking slug existence: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Brand;
