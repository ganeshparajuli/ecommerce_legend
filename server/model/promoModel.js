const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class PromoCode {
  constructor(data) {
    this.id = uuidv4();
    this.code = data.code.toUpperCase();
    this.description = data.description || "";
    this.minPurchase = data.minPurchase || data.min_purchase || 0;
    this.maxDiscount = data.maxDiscount || data.max_discount_amount || 0;
    this.validFrom = data.validFrom || data.valid_from;
    this.validUntil = data.validUntil || data.valid_until;
    this.maxUses = data.maxUses || data.max_uses;
    this.isActive =
      data.isActive !== undefined
        ? data.isActive
        : data.is_active !== undefined
        ? data.is_active
        : true;
  }

  async save() {
    try {
      const values = [
        this.id,
        this.code,
        this.description,
        this.minPurchase,
        this.maxDiscount,
        this.validFrom,
        this.validUntil,
        this.maxUses,
        this.isActive,
      ];

      console.log("Saving promo code with values:", values);

      const sql = `INSERT INTO promocodes 
        (id, code, description, min_purchase, max_discount_amount, valid_from, valid_until, max_uses, is_active, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

      const [result, _] = await db.execute(sql, values);
      console.log("Promo code saved successfully:", result);
      if (result.affectedRows !== 1) {
        throw new Error("Failed to insert promo code");
      }

      return {
        id: this.id,
        code: this.code,
        description: this.description,
        min_purchase: this.minPurchase,
        max_discount_amount: this.maxDiscount,
        valid_from: this.validFrom,
        valid_until: this.validUntil,
        max_uses: this.maxUses,
        is_active: this.isActive,
      };
    } catch (error) {
      console.error("Error saving promo code: ", error);
      throw error;
    }
  }

  // Find all promo codes
  static async findAll() {
    try {
      const sql = `SELECT * FROM promocodes ORDER BY created_at DESC`;
      const [promoCodes, _] = await db.execute(sql);
      return promoCodes;
    } catch (error) {
      console.error("Error finding all promo codes: ", error);
      throw error;
    }
  }

  // Find promo code by ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM promocodes WHERE id = ?`;
      const [promoCodes, _] = await db.execute(sql, [id]);

      if (promoCodes.length === 0) {
        return null;
      }

      return promoCodes[0];
    } catch (error) {
      console.error("Error finding promo code by ID: ", error);
      throw error;
    }
  }

  // Find promo code by code
  static async findByCode(code) {
    try {
      const sql = `SELECT * FROM promocodes WHERE code = ?`;
      const [promoCodes, _] = await db.execute(sql, [code.toUpperCase()]);

      if (promoCodes.length === 0) {
        return null;
      }

      return promoCodes[0];
    } catch (error) {
      console.error("Error finding promo code by code: ", error);
      throw error;
    }
  }

  // Update promo code
  static async updatePromoCode(id, updates) {
    try {
      // Check if updates object is empty
      if (Object.keys(updates).length === 0) {
        throw new Error("No fields to update");
      }

      // Prepare the SET part of the SQL query
      const setClause = [];
      const values = [];

      // Process each field that needs to be updated
      if (updates.code !== undefined) {
        setClause.push("code = ?");
        values.push(updates.code.toUpperCase());
      }

      if (updates.description !== undefined) {
        setClause.push("description = ?");
        values.push(updates.description);
      }

      if (updates.minPurchase !== undefined) {
        setClause.push("min_purchase = ?");
        values.push(updates.minPurchase);
      }
      if (updates.maxDiscount !== undefined) {
        setClause.push("max_discount_amount = ?");
        values.push(updates.maxDiscount);
      }

      if (updates.validFrom !== undefined) {
        setClause.push("valid_from = ?");
        values.push(updates.validFrom);
      }

      if (updates.validUntil !== undefined) {
        setClause.push("valid_until = ?");
        values.push(updates.validUntil);
      }

      if (updates.isActive !== undefined) {
        setClause.push("is_active = ?");
        values.push(updates.isActive);
      }

      // Add the id to the values array
      values.push(id);

      // Construct the final SQL query
      const sql = `UPDATE promocodes SET ${setClause.join(", ")} WHERE id = ?`;

      const [result, _] = await db.execute(sql, values);

      if (result.affectedRows === 0) {
        return null;
      }

      return await PromoCode.findById(id);
    } catch (error) {
      console.error("Error updating promo code: ", error);
      throw error;
    }
  }

  // Delete promo code
  static async deletePromoCode(id) {
    try {
      const sql = `DELETE FROM promocodes WHERE id = ?`;
      const [result, _] = await db.execute(sql, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting promo code: ", error);
      throw error;
    }
  }

  // Find all active and valid promo codes
  static async findActiveAndValid() {
    try {
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const sql = `
        SELECT * FROM promocodes 
        WHERE is_active = 1 
        AND valid_from <= ? 
        AND valid_until >= ?
      `;

      const [promoCodes, _] = await db.execute(sql, [currentDate, currentDate]);
      return promoCodes;
    } catch (error) {
      console.error("Error finding active and valid promo codes: ", error);
      throw error;
    }
  }

  // Validate promo code for a given purchase amount
  static async validatePromoCode(code, purchaseAmount) {
    try {
      const promoCode = await PromoCode.findByCode(code);

      if (!promoCode) {
        return { valid: false, message: "Promo code not found" };
      }

      const currentDate = new Date();
      const validFrom = new Date(promoCode.valid_from);
      const validUntil = new Date(promoCode.valid_until);

      // Check if promo code is active
      if (!promoCode.is_active) {
        return { valid: false, message: "Promo code is inactive" };
      }

      // Check if promo code is within valid date range
      if (currentDate < validFrom) {
        return { valid: false, message: "Promo code is not yet valid" };
      }

      if (currentDate > validUntil) {
        return { valid: false, message: "Promo code has expired" };
      }

      // Check if purchase meets minimum amount
      if (purchaseAmount < promoCode.min_purchase) {
        return {
          valid: false,
          message: `Minimum purchase amount is Rs.${promoCode.min_purchase}`,
        };
      }

      // Calculate discount amount
      let discountAmount = 0;

      // If max_discount_amount is set, use it as the discount
      if (promoCode.max_discount_amount && promoCode.max_discount_amount > 0) {
        discountAmount = promoCode.max_discount_amount;
      }

      // Ensure discount doesn't exceed purchase amount
      if (discountAmount > purchaseAmount) {
        discountAmount = purchaseAmount;
      }

      const finalAmount = purchaseAmount - discountAmount;

      return {
        valid: true,
        message: "Promo code applied successfully",
        promoCode: promoCode,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
      };
    } catch (error) {
      console.error("Error validating promo code: ", error);
      throw error;
    }
  }

  // Auto-expire promo codes
  static async autoExpirePromoCodes() {
    try {
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const sql = `
        UPDATE promocodes 
        SET is_active = 0 
        WHERE is_active = 1 
        AND valid_until < ? AND max_uses = ?
      `;

      const [result, _] = await db.execute(sql, [currentDate]);

      return {
        message: "Auto-expiration completed",
        expiredCount: result.affectedRows,
      };
    } catch (error) {
      console.error("Error auto-expiring promo codes: ", error);
      throw error;
    }
  }
}

module.exports = PromoCode;
