const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class FAQ {
  constructor(question, answer, order) {
    this.id = uuidv4();
    this.question = question;
    this.answer = answer;
    this.order = order;
  }

  // Save a new FAQ
  async save() {
    try {
      const sql = `INSERT INTO faqs (id, question, answer, \`order\`, created_at) VALUES (?, ?, ?, ?, NOW())`;
      await db.execute(sql, [this.id, this.question, this.answer, this.order]);
      return this.id;
    } catch (error) {
      console.error("Error saving FAQ:", error);
      throw error;
    }
  }

  // Get all FAQs
  static async findAll() {
    try {
      const sql = `SELECT * FROM faqs`;
      const [faqs] = await db.execute(sql);
      return faqs;
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      throw error;
    }
  }

  // Get FAQ by ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM faqs WHERE id = ?`;
      const [faq] = await db.execute(sql, [id]);
      return faq.length ? faq[0] : null;
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      throw error;
    }
  }

  // Update FAQ
  static async updateFAQ(id, fields) {
    if (Object.keys(fields).length === 0) {
      throw new Error("No fields to update");
    }

    // If fields contains 'order', we need to handle it specially
    const updates = Object.entries(fields)
      .map(([key, _]) => (key === "order" ? `\`order\` = ?` : `${key} = ?`))
      .join(", ");
    const values = [...Object.values(fields), id];

    const sql = `UPDATE faqs SET ${updates} WHERE id = ?`;
    try {
      await db.execute(sql, values);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      throw error;
    }
  }

  // Delete FAQ
  static async deleteFAQ(id) {
    try {
      const sql = `DELETE FROM faqs WHERE id = ?`;
      await db.execute(sql, [id]);
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      throw error;
    }
  }
}

module.exports = FAQ;
