const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class Category {
  constructor(categoryData) {
    console.log("Category constructor received:", JSON.stringify(categoryData));

    // Handle both string input and object input
    if (typeof categoryData === "string") {
      this.name = categoryData;
      this.brandId = null;
    } else {
      this.name = categoryData.name;
      // Debug the brandId value
      console.log("brandId in data:", categoryData.brandId);
      console.log("brand_id in data:", categoryData.brand_id);

      this.brandId = categoryData.brandId || categoryData.brand_id || null;
      console.log("Final brandId set to:", this.brandId);
    }

    // Validate name
    if (!this.name || typeof this.name !== "string") {
      throw new Error("Category name must be a non-empty string");
    }

    this.id = uuidv4();
    this.name = this.name.trim(); // Trim whitespace
    this.slug = this.generateSlug(this.name);
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  // Save a new category to the database (with brandId)
  async save() {
    try {
      console.log("Saving category with values:", {
        id: this.id,
        name: this.name,
        slug: this.slug,
        brandId: this.brandId,
      });

      const query = `INSERT INTO categories (id, name, slug, brandId) VALUES (?, ?, ?, ?)`;
      console.log("SQL query:", query);
      console.log("Query parameters:", [
        this.id,
        this.name,
        this.slug,
        this.brandId,
      ]);

      const [result] = await db.execute(query, [
        this.id,
        this.name,
        this.slug,
        this.brandId,
      ]);

      // Verify what was actually inserted
      const verifyQuery = `SELECT * FROM categories WHERE id = ?`;
      const [rows] = await db.execute(verifyQuery, [this.id]);
      console.log("Verified inserted category:", rows[0]);

      console.log(`✅ Category "${this.name}" saved successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error saving category: ${error.message}`);
      console.error("SQL Error State:", error.sqlState);
      console.error("SQL Error Code:", error.code);
      console.error("SQL Error Number:", error.errno);
      throw error;
    }
  }

  static async create(categoryData) {
    console.log("Create method received:", JSON.stringify(categoryData));

    try {
      const category = new Category(categoryData);
      await category.save();

      // Fetch the actual saved category to confirm what's in the database
      const savedCategory = await this.findById(category.id);
      console.log("Category after save in DB:", savedCategory);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        brandId: category.brandId,
      };
    } catch (error) {
      console.error(`❌ Error creating category: ${error.message}`);
      if (error.code) {
        // Log SQL-specific error details
        console.error("SQL Error Code:", error.code);
      }
      throw error;
    }
  }

  // Get all categories
  static async findAll() {
    try {
      // const query = `SELECT c.*, b.name as brand_name FROM categories c 
      //                LEFT JOIN brands b ON c.brandId = b.id 
      //                LEFT JOIN category_series d ON d.id = c.categoryId 
      //                ORDER BY c.name`;

      const query = `
      SELECT c.*, 
             b.name AS brand_name, 
             d.series_name
      FROM categories c
      LEFT JOIN brands b ON c.brandId = b.id
      LEFT JOIN category_series d ON d.category_id = c.id
      ORDER BY c.name;
      `;

      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching categories: ${error.message}`);
      throw error;
    }
  }

  // Find a category by ID
  static async findById(id) {
    try {
      const query = `SELECT c.*, b.name as brand_name FROM categories c 
                     LEFT JOIN brands b ON c.brandId = b.id 
                     WHERE c.id = ?`;
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`❌ Error fetching category by ID: ${error.message}`);
      throw error;
    }
  }

  // Update a category by ID
  static async updateCategory(id, categoryData) {
    try {
      // Handle both string and object inputs
      let updatedName;
      let brandId = null;

      if (typeof categoryData === "string") {
        updatedName = categoryData;
      } else {
        updatedName = categoryData.name;
        brandId = categoryData.brandId || null; // Use brandId consistently
      }

      if (!updatedName || typeof updatedName !== "string") {
        throw new Error("Updated name must be a non-empty string");
      }

      // Create new slug from updated name
      const newSlug = new Category({ name: updatedName }).generateSlug(
        updatedName
      );

      const query = `UPDATE categories SET name = ?, slug = ?, brandId = ? WHERE id = ?`;
      const [result] = await db.execute(query, [
        updatedName.trim(),
        newSlug,
        brandId,
        id,
      ]);
      console.log(`✅ Category with ID "${id}" updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating category: ${error.message}`);
      throw error;
    }
  }

  // Delete a category by ID
  static async deleteCategory(id) {
    try {
      const query = `DELETE FROM categories WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      console.log(`✅ Category with ID "${id}" deleted successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting category: ${error.message}`);
      throw error;
    }
  }

  // Find category by slug
  static async findBySlug(slug) {
    try {
      const query = `SELECT c.*, b.name as brand_name FROM categories c 
                     LEFT JOIN brands b ON c.brandId = b.id 
                     WHERE c.slug = ?`;
      const [rows] = await db.execute(query, [slug]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`❌ Error fetching category by slug: ${error.message}`);
      throw error;
    }
  }

  // Find categories by brand ID
  static async findByBrandId(brandId) {
    try {
      const query = `SELECT * FROM categories WHERE brandId = ? ORDER BY name`;
      const [rows] = await db.execute(query, [brandId]);
      return rows;
    } catch (error) {
      console.error(
        `❌ Error fetching categories by brand ID: ${error.message}`
      );
      throw error;
    }
  }

  // Get table structure (helper method for debugging)
  static async getTableStructure() {
    try {
      const query = `DESCRIBE categories`;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error getting table structure: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Category;
