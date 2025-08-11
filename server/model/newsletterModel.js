// model/newsletterModel.js
console.log('🔧 Loading database connection...');
const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");
console.log('✅ Database and UUID loaded successfully');

class Newsletter {
  constructor(email) {
    this.id = uuidv4();
    this.email = email;
    console.log('📧 New Newsletter instance created:', { id: this.id, email: this.email });
  }

  async save() {
    console.log('📧 Saving newsletter subscription to database...');
    try {
      const query = `INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)`;
      const [result] = await db.execute(query, [this.id, this.email]);
      
      console.log('✅ Newsletter subscription saved successfully:', {
        id: this.id,
        email: this.email,
        insertId: result.insertId,
        affectedRows: result.affectedRows
      });
      
      return { id: this.id, email: this.email };
    } catch (error) {
      console.error(`❌ Error saving newsletter subscription: ${error.message}`);
      console.error('Error details:', error);
      throw error;
    }
  }

  static async findAll() {
    console.log('📧 Finding all newsletter subscriptions...');
    try {
      const query = `SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`;
      const [result, _] = await db.execute(query);
      
      console.log('✅ Found newsletter subscriptions:', result.length);
      return result;
    } catch (error) {
      console.error(`❌ Error getting newsletter subscriptions: ${error.message}`);
      throw error;
    }
  }

  static async findById(id) {
    console.log('📧 Finding newsletter subscription by id:', id);
    try {
      const query = `SELECT * FROM newsletter_subscribers WHERE id = ?`;
      const [rows, _] = await db.execute(query, [id]);
      
      const result = rows.length > 0 ? rows[0] : null;
      console.log('✅ Newsletter subscription found:', !!result);
      
      return result;
    } catch (error) {
      console.error(`❌ Error getting newsletter subscription by id: ${error.message}`);
      throw error;
    }
  }

  static async findByEmail(email) {
    console.log('📧 Finding newsletter subscription by email:', email);
    try {
      const query = `SELECT * FROM newsletter_subscribers WHERE email = ?`;
      const [rows, _] = await db.execute(query, [email]);
      
      const result = rows.length > 0 ? rows[0] : null;
      console.log('✅ Newsletter subscription by email found:', !!result);
      
      return result;
    } catch (error) {
      console.error(`❌ Error getting newsletter subscription by email: ${error.message}`);
      throw error;
    }
  }

  static async updateSubscription(id, email) {
    console.log('📧 Updating newsletter subscription:', { id, email });
    try {
      const query = `UPDATE newsletter_subscribers SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const [result] = await db.execute(query, [email, id]);
      
      console.log('✅ Newsletter subscription update result:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
      
      if (result.affectedRows > 0) {
        // Return the updated subscription
        return await Newsletter.findById(id);
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error updating newsletter subscription: ${error.message}`);
      throw error;
    }
  }

  static async deleteSubscription(id) {
    console.log('📧 Deleting newsletter subscription:', id);
    try {
      const query = `DELETE FROM newsletter_subscribers WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
      
      console.log('✅ Newsletter subscription deletion result:', {
        affectedRows: result.affectedRows
      });
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`❌ Error deleting newsletter subscription: ${error.message}`);
      throw error;
    }
  }
}

console.log('📧 Newsletter model class configured');
module.exports = Newsletter;