const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class Order {
  constructor(
    user_id,
    total_amount,
    shipping_address,
    payment_method = "credit_card",
    status = "pending",
    created_at = new Date(),
    promo_code,
    discount_amount
  ) {
    this.id = uuidv4();
    this.user_id = user_id;
    this.total_amount = total_amount;
    this.shipping_address = shipping_address;
    this.payment_method = payment_method;
    this.status = status;
    this.created_at = created_at;
    this.promo_code = promo_code;
    this.discount_amount = discount_amount;
  }

  async save() {
    try {
      // Insert order without transaction if transaction methods aren't available
      const orderSql = `INSERT INTO orders (
      id, 
      user_id, 
      total_amount, 
      shipping_address, 
      status,
      payment_method,  
      created_at,
      promo_code,
      discount_amount
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?);`;

      const params = [
        this.id,
        this.user_id,
        this.total_amount,
        JSON.stringify(this.shipping_address),
        this.status,
        this.payment_method,
        this.promo_code,
        this.discount_amount,
      ];

      console.log("Executing SQL with params:", params);

      const connection = await db.getConnection();

      try {
        const [result] = await connection.execute(orderSql, params);
        console.log("Order saved successfully:", result);
        return this.id;
      } catch (sqlError) {
        console.error("SQL Error:", sqlError);
        throw sqlError;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error saving order:", error);
      throw error;
    }
  }

  // Add order items
  static async addOrderItems(orderId, items) {
    try {
      for (const item of items) {
        const { product_id, quantity, price } = item;

        // Insert order item
        const orderItemSql = `INSERT INTO order_items (
          id,
          order_id,
          product_id,
          quantity,
          price,
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW());`;

        await db.execute(orderItemSql, [
          uuidv4(),
          orderId,
          product_id,
          quantity,
          price,
        ]);

        // Update product quantity
        const updateProductSql = `UPDATE products 
        SET quantity = quantity - ?
        WHERE id = ? AND quantity >= ?;`;

        const [result] = await db.execute(updateProductSql, [
          quantity,
          product_id,
          quantity,
        ]);

        // If no rows were affected, the product is out of stock
        if (result.affectedRows === 0) {
          throw new Error(`Product ${product_id} is out of stock`);
        }
      }

      return true;
    } catch (error) {
      console.error("Error adding order items: ", error);
      throw error;
    }
  }

  // Find order by id
  static async findById(id) {
    try {
      const sql = `SELECT * FROM orders WHERE id = ?`;
      const [order] = await db.execute(sql, [id]);

      if (order.length === 0) {
        return null;
      }

      // Parse the JSONB shipping_address back to object
      const orderWithParsedAddress = {
        ...order[0],
        shipping_address: JSON.parse(order[0].shipping_address),
      };

      // Get order items
      const itemsSql = `SELECT 
        oi.*, 
        p.name as product_name, 
        p.image as product_image 
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`;

      const [items] = await db.execute(itemsSql, [id]);

      return {
        ...orderWithParsedAddress,
        items,
      };
    } catch (error) {
      console.error("Error finding order by id: ", error);
      throw error;
    }
  }

  // Find orders by user id
  static async findByUserId(userId) {
    try {
      const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
      const [orders] = await db.execute(sql, [userId]);

      // Get order items for each order
      const result = [];

      for (const order of orders) {
        // Parse the JSONB shipping_address back to object
        const orderWithParsedAddress = {
          ...order,
          shipping_address: JSON.parse(order.shipping_address),
        };

        const itemsSql = `SELECT 
          oi.*, 
          p.name as product_name, 
          p.image as product_image 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`;

        const [items] = await db.execute(itemsSql, [order.id]);

        result.push({
          ...orderWithParsedAddress,
          items,
        });
      }

      return result;
    } catch (error) {
      console.error("Error finding orders by user id: ", error);
      throw error;
    }
  }

  // Add to orderModel.js
  static async updateOrder(id, updateData) {
    try {
      // Extract updateable fields
      const { total_amount, shipping_address, payment_method, status } =
        updateData;

      // Build update query dynamically based on provided fields
      let updateFields = [];
      let params = [];

      if (total_amount) {
        updateFields.push("total_amount = ?");
        params.push(total_amount);
      }

      if (shipping_address) {
        updateFields.push("shipping_address = ?");
        params.push(JSON.stringify(shipping_address));
      }

      if (payment_method) {
        updateFields.push("payment_method = ?");
        params.push(payment_method);
      }

      if (status) {
        updateFields.push("status = ?");
        params.push(status);
      }

      // Add updated_at timestamp
      updateFields.push("updated_at = NOW()");

      // If no fields to update, return early
      if (updateFields.length === 0) {
        return false;
      }

      // Add id as the last parameter
      params.push(id);

      // Execute update query
      const sql = `UPDATE orders SET ${updateFields.join(", ")} WHERE id = ?`;
      const [result] = await db.execute(sql, params);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating order: ", error);
      throw error;
    }
  }

  // Update order status
  static async updateStatus(id, status) {
    try {
      const sql = `UPDATE orders SET status = ? WHERE id = ?`;
      await db.execute(sql, [status, id]);
      return true;
    } catch (error) {
      console.error("Error updating order status: ", error);
      throw error;
    }
  }

  static async updateOrderItems(orderId, items) {
    try {
      // First, get existing order items
      const itemsSql = `SELECT * FROM order_items WHERE order_id = ?`;
      const [existingItems] = await db.execute(itemsSql, [orderId]);

      // Track items for product quantity adjustments
      const existingItemMap = {};
      existingItems.forEach((item) => {
        existingItemMap[item.product_id] = item;
      });

      // For each new item
      for (const item of items) {
        const { product_id, quantity, price } = item;

        // If item already exists in the order
        if (existingItemMap[product_id]) {
          const oldQuantity = existingItemMap[product_id].quantity;
          const quantityDiff = quantity - oldQuantity;

          // Update existing item
          const updateItemSql = `
          UPDATE order_items 
          SET quantity = ?, price = ?, updated_at = NOW() 
          WHERE order_id = ? AND product_id = ?
        `;
          await db.execute(updateItemSql, [
            quantity,
            price,
            orderId,
            product_id,
          ]);

          // Adjust product inventory
          if (quantityDiff !== 0) {
            const adjustProductSql = `
            UPDATE products 
            SET quantity = quantity - ? 
            WHERE id = ? AND quantity >= ?
          `;

            // If adding more, check if there's enough inventory
            if (quantityDiff > 0) {
              const [result] = await db.execute(adjustProductSql, [
                quantityDiff,
                product_id,
                quantityDiff,
              ]);

              if (result.affectedRows === 0) {
                throw new Error(`Product ${product_id} has insufficient stock`);
              }
            } else {
              // If reducing, return to inventory
              await db.execute(
                `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
                [Math.abs(quantityDiff), product_id]
              );
            }
          }

          // Remove from tracking map to identify items to delete
          delete existingItemMap[product_id];
        } else {
          // Add new item
          const insertItemSql = `
          INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `;
          await db.execute(insertItemSql, [
            uuidv4(),
            orderId,
            product_id,
            quantity,
            price,
          ]);

          // Reduce product inventory
          const adjustProductSql = `
          UPDATE products 
          SET quantity = quantity - ? 
          WHERE id = ? AND quantity >= ?
        `;

          const [result] = await db.execute(adjustProductSql, [
            quantity,
            product_id,
            quantity,
          ]);

          if (result.affectedRows === 0) {
            throw new Error(`Product ${product_id} has insufficient stock`);
          }
        }
      }

      // Handle items that were removed
      for (const productId in existingItemMap) {
        const item = existingItemMap[productId];

        // Return quantity to product inventory
        await db.execute(
          `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
          [item.quantity, productId]
        );

        // Delete the order item
        await db.execute(
          `DELETE FROM order_items WHERE order_id = ? AND product_id = ?`,
          [orderId, productId]
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating order items: ", error);
      throw error;
    }
  }

  // Get all orders (for admin)
  static async findAll(limit = 20, offset = 0) {
    try {
      const sql = `SELECT *
       FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const [orders] = await db.execute(sql, [limit, offset]);

      // Get order items for each order
      const result = [];

      for (const order of orders) {
        // Parse the JSONB shipping_address back to object
        const orderWithParsedAddress = {
          ...order,
          shipping_address: JSON.parse(order.shipping_address),
        };

        const itemsSql = `SELECT 
          oi.*, 
          p.name as product_name, 
          p.image as product_image 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`;

        const [items] = await db.execute(itemsSql, [order.id]);

        result.push({
          ...orderWithParsedAddress,
          items,
        });
      }

      return result;
    } catch (error) {
      console.error("Error finding all orders: ", error);
      throw error;
    }
  }

  // Count total orders
  static async countAll() {
    try {
      const sql = `SELECT COUNT(*) as total FROM orders`;
      const [result] = await db.execute(sql);
      return result[0].total;
    } catch (error) {
      console.error("Error counting orders: ", error);
      throw error;
    }
  }

  // Get orders by status
  static async findByStatus(status, limit = 20, offset = 0) {
    try {
      const sql = `SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const [orders] = await db.execute(sql, [status, limit, offset]);

      // Get order items for each order
      const result = [];

      for (const order of orders) {
        // Parse the JSONB shipping_address back to object
        const orderWithParsedAddress = {
          ...order,
          shipping_address: JSON.parse(order.shipping_address),
        };

        const itemsSql = `SELECT 
          oi.*, 
          p.name as product_name, 
          p.image as product_image 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`;

        const [items] = await db.execute(itemsSql, [order.id]);

        result.push({
          ...orderWithParsedAddress,
          items,
        });
      }

      return result;
    } catch (error) {
      console.error("Error finding orders by status: ", error);
      throw error;
    }
  }

  // Cancel an order
  static async cancelOrder(id) {
    try {
      // Get order items
      const itemsSql = `SELECT * FROM order_items WHERE order_id = ?`;
      const [items] = await db.execute(itemsSql, [id]);

      // Return items to inventory
      for (const item of items) {
        const updateProductSql = `UPDATE products 
        SET quantity = quantity + ?
        WHERE id = ?`;

        await db.execute(updateProductSql, [item.quantity, item.product_id]);
      }

      // Update order status
      const updateOrderSql = `UPDATE orders SET status = 'cancelled' WHERE id = ?`;
      await db.execute(updateOrderSql, [id]);

      return true;
    } catch (error) {
      console.error("Error cancelling order: ", error);
      throw error;
    }
  }
}

module.exports = Order;
