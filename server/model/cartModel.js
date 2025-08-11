const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class CartItem {
  constructor(
    userId,
    productId,
    quantity,
    selected = true,
    saleInfo = null,
    created_at,
    updated_at
  ) {
    this.id = uuidv4();
    this.userId = userId;
    this.productId = productId;
    this.quantity = quantity || 1;
    this.selected = selected;

    // Sale information
    this.originalPrice = saleInfo?.originalPrice || null;
    this.salePrice = saleInfo?.salePrice || null;
    this.discountType = saleInfo?.discountType || null;
    this.discountValue = saleInfo?.discountValue || null;
    this.saleId = saleInfo?.saleId || null;
    this.saleName = saleInfo?.saleName || null;

    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  async save() {
    try {
      // Try with all columns including sale info
      try {
        const sql = `INSERT INTO cart_items (
          id, 
          user_id, 
          product_id, 
          quantity,
          selected,
          original_price,
          sale_price,
          discount_type,
          discount_value,
          sale_id,
          sale_name,
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          quantity = VALUES(quantity),
          selected = VALUES(selected),
          original_price = VALUES(original_price),
          sale_price = VALUES(sale_price),
          discount_type = VALUES(discount_type),
          discount_value = VALUES(discount_value),
          sale_id = VALUES(sale_id),
          sale_name = VALUES(sale_name),
          updated_at = VALUES(updated_at);`;

        const [result] = await db.execute(sql, [
          this.id,
          this.userId,
          this.productId,
          this.quantity,
          this.selected,
          this.originalPrice,
          this.salePrice,
          this.discountType,
          this.discountValue,
          this.saleId,
          this.saleName,
          this.created_at,
          this.updated_at,
        ]);
        return result;
      } catch (err) {
        // Fallback for older schema without sale columns
        if (
          err.sqlMessage &&
          (err.sqlMessage.includes("Unknown column 'original_price'") ||
            err.sqlMessage.includes("Unknown column 'sale_price'"))
        ) {
          console.log("Sale columns don't exist, using basic schema");
          const sql = `INSERT INTO cart_items (
            id, 
            user_id, 
            product_id, 
            quantity,
            selected,
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            quantity = VALUES(quantity),
            selected = VALUES(selected),
            updated_at = VALUES(updated_at);`;

          const [result] = await db.execute(sql, [
            this.id,
            this.userId,
            this.productId,
            this.quantity,
            this.selected,
            this.created_at,
            this.updated_at,
          ]);
          return result;
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error("Error saving cart item: ", error);
      throw error;
    }
  }

  // Get all cart items for a user
  static async findByUserId(userId) {
    try {
      // Check if sale columns exist first
      let hasSaleColumns = true;
      try {
        const testSql = `SELECT discount_type FROM cart_items LIMIT 1`;
        await db.execute(testSql);
      } catch (err) {
        if (err.sqlMessage && err.sqlMessage.includes("Unknown column")) {
          hasSaleColumns = false;
        }
      }

      let sql;
      if (hasSaleColumns) {
        // Use sale columns if they exist
        sql = `
          SELECT 
            ci.id,
            ci.user_id,
            ci.product_id,
            ci.quantity,
            ci.selected,
            ci.original_price,
            ci.sale_price,
            ci.discount_type,
            ci.discount_value,
            ci.sale_id,
            ci.sale_name,
            p.id as product_id,
            p.name,
            p.finalPrice,
            p.quantity as countInStock,
            p.image,
            p.category 
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = ?
        `;
      } else {
        // Fallback to basic columns
        sql = `
          SELECT 
            ci.id,
            ci.user_id,
            ci.product_id,
            ci.quantity,
            ci.selected,
            p.id as product_id,
            p.name,
            p.finalPrice,
            p.quantity as countInStock,
            p.image,
            p.category 
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = ?
        `;
      }

      const [cartItems] = await db.execute(sql, [userId]);

      // Transform data to match the frontend expectations
      return cartItems.map((item) => {
        const baseItem = {
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          countInStock: item.countInStock,
          image: item.image,
          category: item.category,
          selected: item.selected !== undefined ? Boolean(item.selected) : true,
        };

        // Use sale price if available, otherwise use original product price
        if (hasSaleColumns && item.sale_price !== null) {
          baseItem.price = parseFloat(item.sale_price);
          baseItem.originalPrice = parseFloat(
            item.original_price || item.finalPrice
          );
          baseItem.discountType = item.discount_type;
          baseItem.discountValue = parseFloat(item.discount_value);

          // Calculate display discount percentage for UI
          if (item.discount_type === "percentage") {
            baseItem.discountPercentage = item.discount_value;
          } else if (item.discount_type === "fixed") {
            const originalPrice = parseFloat(
              item.original_price || item.finalPrice
            );
            baseItem.discountPercentage = Math.round(
              (item.discount_value / originalPrice) * 100
            );
          }

          baseItem.saleId = item.sale_id;
          baseItem.saleName = item.sale_name;
          baseItem.isOnSale = true;
        } else {
          baseItem.price = parseFloat(item.finalPrice || 0);
          baseItem.isOnSale = false;
        }

        return baseItem;
      });
    } catch (error) {
      console.error("Error finding cart items by user id: ", error);
      throw error;
    }
  }

  // Find a specific cart item
  static async findByUserAndProductId(userId, productId) {
    try {
      const sql = `SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?`;
      const [cartItem] = await db.execute(sql, [userId, productId]);
      return cartItem[0];
    } catch (error) {
      console.error("Error finding cart item: ", error);
      throw error;
    }
  }

  // Update cart item quantity
  static async updateQuantity(userId, productId, quantity, selected) {
    try {
      let sql;
      let params;

      // Try to update with selected field if provided
      if (selected !== undefined) {
        try {
          sql = `UPDATE cart_items SET quantity = ?, selected = ?, updated_at = ? WHERE user_id = ? AND product_id = ?`;
          params = [quantity, selected, new Date(), userId, productId];
          const [result] = await db.execute(sql, params);
          return result.affectedRows > 0;
        } catch (err) {
          // If there's an error with the 'selected' column, try without it
          if (
            err.sqlMessage &&
            err.sqlMessage.includes("Unknown column 'selected'")
          ) {
            sql = `UPDATE cart_items SET quantity = ?, updated_at = ? WHERE user_id = ? AND product_id = ?`;
            params = [quantity, new Date(), userId, productId];
            const [result] = await db.execute(sql, params);
            return result.affectedRows > 0;
          } else {
            throw err;
          }
        }
      } else {
        // Just update quantity
        sql = `UPDATE cart_items SET quantity = ?, updated_at = ? WHERE user_id = ? AND product_id = ?`;
        params = [quantity, new Date(), userId, productId];
        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0;
      }
    } catch (error) {
      console.error("Error updating cart item: ", error);
      throw error;
    }
  }

  // Toggle cart item selection
  static async toggleSelection(userId, productId) {
    try {
      // Check if selected column exists
      try {
        const sql = `UPDATE cart_items SET selected = NOT selected, updated_at = ? WHERE user_id = ? AND product_id = ?`;
        const [result] = await db.execute(sql, [new Date(), userId, productId]);
        return result.affectedRows > 0;
      } catch (err) {
        // If there's an error with selected column, it may not exist
        if (
          err.sqlMessage &&
          err.sqlMessage.includes("Unknown column 'selected'")
        ) {
          console.log(
            "Selected column doesn't exist. Consider adding it to the database."
          );
          // Return true to avoid disrupting the flow
          return true;
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error("Error toggling cart item selection: ", error);
      throw error;
    }
  }

  // Remove an item from cart
  static async removeItem(userId, productId) {
    try {
      const sql = `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`;
      const [result] = await db.execute(sql, [userId, productId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error removing cart item: ", error);
      throw error;
    }
  }

  // Clear user's cart
  static async clearCart(userId) {
    try {
      const sql = `DELETE FROM cart_items WHERE user_id = ?`;
      const [result] = await db.execute(sql, [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error clearing cart: ", error);
      throw error;
    }
  }

  // Get cart total (considering sale prices)
  static async getCartTotal(userId) {
    try {
      // Check if sale columns exist
      let hasSaleColumns = true;
      try {
        const testSql = `SELECT discount_type FROM cart_items LIMIT 1`;
        await db.execute(testSql);
      } catch (err) {
        if (err.sqlMessage && err.sqlMessage.includes("Unknown column")) {
          hasSaleColumns = false;
        }
      }

      let sql;
      if (hasSaleColumns) {
        sql = `
          SELECT SUM(
            ci.quantity * 
            COALESCE(ci.sale_price, p.finalPrice)
          ) as total
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = ?
        `;
      } else {
        sql = `
          SELECT SUM(ci.quantity * p.finalPrice) as total
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = ?
        `;
      }

      const [result] = await db.execute(sql, [userId]);
      return parseFloat(result[0].total) || 0;
    } catch (error) {
      console.error("Error calculating cart total: ", error);
      throw error;
    }
  }

  // Get cart count
  static async getCartCount(userId) {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM cart_items
        WHERE user_id = ?
      `;
      const [result] = await db.execute(sql, [userId]);
      return result[0].count || 0;
    } catch (error) {
      console.error("Error getting cart count: ", error);
      throw error;
    }
  }
}

module.exports = CartItem;
