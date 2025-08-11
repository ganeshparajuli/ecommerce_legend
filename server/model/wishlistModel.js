const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class Wishlist {
  constructor(userId, productId, addedAt = new Date()) {
    this.id = uuidv4(); // generate a unique id
    this.userId = userId;
    this.productId = productId;
    this.addedAt = addedAt;
  }

  async save() {
    try {
      const sql = `INSERT INTO wishlists (id, user_id, product_id, added_at) 
                   VALUES (?, ?, ?, ?)`;
      const [newWishlistItem, _] = await db.execute(sql, [
        this.id,
        this.userId,
        this.productId,
        this.addedAt,
      ]);
      return newWishlistItem;
    } catch (error) {
      console.error("Error saving wishlist item: ", error);
      throw error;
    }
  }

  // Static method to save a wishlist item directly
  static async save(data) {
    try {
      const id = uuidv4();
      const userId = data.user;
      const productId = data.product;
      const addedAt = new Date();

      const sql = `INSERT INTO wishlists (id, user_id, product_id, added_at) 
                  VALUES (?, ?, ?, ?)`;
      const [newWishlistItem, _] = await db.execute(sql, [
        id,
        userId,
        productId,
        addedAt,
      ]);

      return {
        id,
        user_id: userId,
        product_id: productId,
        added_at: addedAt,
      };
    } catch (error) {
      console.error("Error saving wishlist item: ", error);
      throw error;
    }
  }

  // Find one wishlist item by user and product
  static async findOne(criteria) {
    try {
      if (!criteria.user || !criteria.product) {
        throw new Error("User ID and Product ID are required");
      }

      const sql = `SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?`;
      const [wishlistItem, _] = await db.execute(sql, [
        criteria.user,
        criteria.product,
      ]);

      if (wishlistItem.length === 0) {
        return null;
      }

      return wishlistItem[0];
    } catch (error) {
      console.error("Error finding wishlist item: ", error);
      throw error;
    }
  }

  // Find all wishlist items for a user
  static async findByUserId(userId) {
    try {
      // First, get the wishlist items
      const sql = `SELECT * FROM wishlists WHERE user_id = ? ORDER BY added_at DESC`;
      const [wishlistItems, _] = await db.execute(sql, [userId]);

      // If we have wishlist items, get the product details for each
      if (wishlistItems.length > 0) {
        for (const item of wishlistItems) {
          // Get product details - adjust the column names to match your products table
          const productSql = `SELECT id, name, finalPrice, actualPrice, image, category FROM products WHERE id = ?`;
          const [products, __] = await db.execute(productSql, [
            item.product_id,
          ]);

          if (products.length > 0) {
            const product = products[0];
            // Add product details to the wishlist item
            item.product_name = product.name;
            item.price = product.finalPrice || product.actualPrice || 0; // Use finalPrice or actualPrice
            item.image = product.image;
            item.category = product.category;
          }
        }
      }

      return wishlistItems;
    } catch (error) {
      console.error("Error finding wishlist items by user id: ", error);
      throw error;
    }
  }

  // Find a specific wishlist item
  static async findById(id) {
    try {
      // Check if id is undefined or null
      if (!id) {
        return null;
      }

      const sql = `SELECT * FROM wishlists WHERE id = ?`;
      const [wishlistItem, _] = await db.execute(sql, [id]);
      if (wishlistItem.length === 0) {
        return null;
      }
      return wishlistItem[0];
    } catch (error) {
      console.error("Error finding wishlist item by id: ", error);
      throw error;
    }
  }

  // Check if a product is already in a user's wishlist
  static async checkItemExists(userId, productId) {
    try {
      // Check if either parameter is undefined or null
      if (!userId || !productId) {
        throw new Error("User ID and Product ID are required");
      }

      const sql = `SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?`;
      const [wishlistItem, _] = await db.execute(sql, [userId, productId]);
      return wishlistItem.length > 0;
    } catch (error) {
      console.error("Error checking wishlist item existence: ", error);
      throw error;
    }
  }

  // Delete a wishlist item
  static async deleteItem(id) {
    try {
      const sql = `DELETE FROM wishlists WHERE id = ?`;
      const [result, _] = await db.execute(sql, [id]);
      return result;
    } catch (error) {
      console.error("Error deleting wishlist item: ", error);
      throw error;
    }
  }

  // Clear all wishlist items for a user
  static async clearWishlist(userId) {
    try {
      const sql = `DELETE FROM wishlists WHERE user_id = ?`;
      const [result, _] = await db.execute(sql, [userId]);
      return result;
    } catch (error) {
      console.error("Error clearing wishlist: ", error);
      throw error;
    }
  }
}

module.exports = Wishlist;
