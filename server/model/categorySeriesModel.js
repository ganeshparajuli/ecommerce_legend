const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class CategorySeries {
  constructor(categoryData) {
    console.log("Category constructor received:", JSON.stringify(categoryData));

    // Handle both string input and object input
    if (typeof categoryData === "string") {
      this.series_name = categoryData;
      // this.category_id = category_id || null;
      // this.is_active = false;

    } else {
      this.series_name = categoryData.series_name;
      this.category_id = categoryData.category_id || null;
      this.is_active = categoryData.is_active || false;
      // console.log("Final brandId set to:", this.brandId);
    }

    // Validate name
    if (!this.series_name || typeof this.series_name !== "string") {
      throw new Error("Category sreies name must be a non-empty string");
    }

    this.id = uuidv4();
    this.series_name = this.series_name.trim(); 
  }

  // Save a new category to the database (with brandId)
  async save() {
    try {
      console.log("Saving category with values:", {
        id: this.id,
        series_name: this.series_name,
        category_id: this.categories_series,
        is_active: this.is_active,
      });

      const query = `INSERT INTO category_series (id, series_name, category_id, is_active) 
                     VALUES (?, ?, ?, ?) `;
      console.log("SQL query:", query);
      console.log("Query parameters:", [
        this.id,
        this.series_name,
        this.category_id,
        this.is_active,     
      ]);

      const [result] = await db.execute(query, [
        this.id,
        this.series_name,
        this.category_id,
        this.is_active,  
      ]);

      // Verify what was actually inserted
      const verifyQuery = `SELECT * FROM category_series WHERE id = ?`;
      const [rows] = await db.execute(verifyQuery, [this.id]);
      console.log("Verified inserted category:", rows[0]);

      console.log(`✅ Category series"${this.series_name}" saved successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error saving category: ${error.message}`);
      console.error("SQL Error State:", error.sqlState);
      console.error("SQL Error Code:", error.code);
      console.error("SQL Error Number:", error.errno);
      throw error;
    }
  }

  static async create(categorySeriesData) {
    console.log("Create method received:", JSON.stringify(categorySeriesData));

    try {
      const categorySeries  = new CategorySeries(categorySeriesData);
      await categorySeries.save();

      // Fetch the actual saved category to confirm what's in the database
      const savedCategorySeries = await CategorySeries.findById(categorySeries.id);
      console.log("Category after save in DB:", savedCategorySeries);

      return {
        id: categorySeries.id,
        series_name: categorySeries.series_name,   
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
      // const query = `SELECT c.*, b.series_name as series_name FROM category_series c 
      //                ORDER BY c.series_name`;

      const query = `
      SELECT c.*
      FROM category_series c
      ORDER BY c.series_name
      `;

      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching category series: ${error.message}`);
      throw error;
    }
  }

  // Find a category by ID
 static async findById(id) {
  try {
    const query = `
      SELECT cs.*, c.name AS category_name
      FROM category_series cs
      LEFT JOIN categories c ON cs.category_id = c.id
      WHERE cs.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`❌ Error fetching category series by ID: ${error.message}`);
    throw error;
  }
}


  // Update a category by ID
  static async updateCategorySeries(id, categoryData) {
    try {
      // Handle both string and object inputs
      let updatedName;
      let category_id = null;

      if (typeof categoryData === "string") {
        updatedName = categoryData;
      } else {
        updatedName = categoryData.series_name;
        category_id = categoryData.category_id || null; // Use brandId consistently
      }

      if (!updatedName || typeof updatedName !== "string") {
        throw new Error("Updated name must be a non-empty string");
      }

      const query = `UPDATE category_series SET series_name = ?, category_id = ? WHERE id = ?`;// SET name = ?, slug = ?, brandId = ? WHERE id = ?`;
      const [result] = await db.execute(query, [
        updatedName.trim(),    
        category_id,
        id,
      ]);
      console.log(`✅ Category series with ID "${id}" updated successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating category series: ${error.message}`);
      throw error;
    }
  }

  // Delete a category by ID
  static async deleteCategorySeries(id) {
    try {
      const query = `DELETE FROM category_series WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      console.log(`✅ Category series with ID "${id}" deleted successfully.`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting category series: ${error.message}`);
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

  // Get table structure (helper method for debugging)
  static async getTableStructure() {
    try {
      const query = `DESCRIBE category_series`;
      const [result] = await db.execute(query);
      return result;
    } catch (error) {
      console.error(`❌ Error getting table structure: ${error.message}`);
      throw error;
    }
  }
}

module.exports = CategorySeries;
