const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class Contact {
  constructor(name, phone, email, subject, message) {
    this.id = uuidv4(); // Generate a unique ID
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.subject = subject;
    this.message = message;
  }

  // Save new contact
  async save() {
    try {
      const sql = `INSERT INTO contacts (id, name, phone, email, subject, message, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, NOW())`;
      const [newContact, _] = await db.execute(sql, [
        this.id,
        this.name,
        this.phone,
        this.email,
        this.subject,
        this.message,
      ]);
      return newContact;
    } catch (error) {
      console.error("Error saving contact:", error);
      throw error;
    }
  }

  // Find all contacts
  static async findAll() {
    try {
      const sql = `SELECT * FROM contacts`;
      const [contacts, _] = await db.execute(sql);
      return contacts;
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  // Find a contact by ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM contacts WHERE id = ?`;
      const [contact, _] = await db.execute(sql, [id]);
      return contact.length ? contact[0] : null;
    } catch (error) {
      console.error("Error finding contact by ID:", error);
      throw error;
    }
  }

  // Update a contact
  static async updateContact(id, fields) {
    if (Object.keys(fields).length === 0) {
      throw new Error("No fields to update");
    }

    const updates = Object.entries(fields)
      .map(([key, _]) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(fields), id];

    const sql = `UPDATE contacts SET ${updates} WHERE id = ?`;

    try {
      const [result, _] = await db.execute(sql, values);
      return result;
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  // Hard delete a contact
  static async deleteContact(id) {
    try {
      const sql = `DELETE FROM contacts WHERE id = ?`;
      const [result, _] = await db.execute(sql, [id]);
      return result;
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  }
}

module.exports = Contact;
