const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class Sale {
  constructor(
    name,
    description,
    discountType,
    discountValue,
    startDate = null,
    endDate = null,
    status = "draft",
    created_at = new Date(),
    updated_at = new Date()
  ) {
    this.id = uuidv4(); // generate a unique id
    this.name = name;
    this.description = description;
    this.discountType = discountType;
    this.discountValue = discountValue;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  async save() {
    try {
      const sql = `INSERT INTO sales (
        id, 
        name, 
        description, 
        discount_type, 
        discount_value, 
        start_date, 
        end_date, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [newSale, _] = await db.execute(sql, [
        this.id,
        this.name,
        this.description,
        this.discountType,
        this.discountValue,
        this.startDate,
        this.endDate,
        this.status,
        this.created_at,
        this.updated_at,
      ]);

      return newSale;
    } catch (error) {
      console.error("Error saving sale: ", error);
      throw error;
    }
  }

  // FIXED: Find all sales - removed problematic orders join
  static async findAll() {
    try {
      const sql = `
        SELECT 
          s.*,
          COUNT(DISTINCT sp.product_id) as product_count,
          0 as total_sales
        FROM 
          sales s
        LEFT JOIN 
          sale_products sp ON s.id = sp.sale_id
        GROUP BY 
          s.id
        ORDER BY 
          s.created_at DESC
      `;
      const [result, _] = await db.execute(sql);

      // Format the result to match frontend structure
      return result.map((sale) => ({
        id: sale.id,
        name: sale.name,
        description: sale.description,
        discountType: sale.discount_type,
        discountValue: parseFloat(sale.discount_value),
        startDate: sale.start_date,
        endDate: sale.end_date,
        status: sale.status,
        productCount: sale.product_count,
        totalSales: parseFloat(sale.total_sales),
      }));
    } catch (error) {
      console.error("Error finding all sales: ", error);
      throw error;
    }
  }

  // FIXED: Find sale by id - removed problematic orders join
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          s.*,
          COUNT(DISTINCT sp.product_id) as product_count,
          0 as total_sales
        FROM 
          sales s
        LEFT JOIN 
          sale_products sp ON s.id = sp.sale_id
        WHERE 
          s.id = ?
        GROUP BY 
          s.id
      `;
      const [sale, _] = await db.execute(sql, [id]);

      if (sale.length === 0) {
        return null;
      }

      return {
        id: sale[0].id,
        name: sale[0].name,
        description: sale[0].description,
        discountType: sale[0].discount_type,
        discountValue: parseFloat(sale[0].discount_value),
        startDate: sale[0].start_date,
        endDate: sale[0].end_date,
        status: sale[0].status,
        productCount: sale[0].product_count,
        totalSales: parseFloat(sale[0].total_sales),
        created_at: sale[0].created_at,
        updated_at: sale[0].updated_at,
      };
    } catch (error) {
      console.error("Error finding sale by id: ", error);
      throw error;
    }
  }

  // Find sale by name
  static async findByName(name) {
    try {
      const sql = `SELECT * FROM sales WHERE name = ?`;
      const [sale, _] = await db.execute(sql, [name]);
      return sale[0];
    } catch (error) {
      console.error("Error finding sale by name: ", error);
      throw error;
    }
  }

  // Update sale
  static async updateSale(id, fields) {
    try {
      // Check if fields object is empty
      if (Object.keys(fields).length === 0) {
        throw new Error("No fields to update");
      }

      // Filter out calculated/virtual fields that don't exist in the database
      const allowedFields = [
        "name",
        "description",
        "discountType",
        "discountValue",
        "startDate",
        "endDate",
        "status",
      ];

      // Only keep fields that are allowed to be updated
      const filteredFields = {};
      Object.entries(fields).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          filteredFields[key] = value;
        }
      });

      // Add updated_at timestamp
      filteredFields.updated_at = new Date();

      // Convert camelCase to snake_case for database fields
      const dbFields = {};
      Object.entries(filteredFields).forEach(([key, value]) => {
        // Convert camelCase to snake_case
        if (key === "discountType") {
          dbFields["discount_type"] = value;
        } else if (key === "discountValue") {
          dbFields["discount_value"] = value;
        } else if (key === "startDate") {
          dbFields["start_date"] = value;
        } else if (key === "endDate") {
          dbFields["end_date"] = value;
        } else {
          dbFields[key] = value;
        }
      });

      // Construct the SET clause
      const updates = Object.entries(dbFields)
        .map(([key, _]) => `${key} = ?`)
        .join(", ");

      // Prepare the values array
      const values = [...Object.values(dbFields), id];

      // Construct the SQL query
      const sql = `UPDATE sales SET ${updates} WHERE id = ?`;

      console.log("Executing SQL:", sql);
      console.log("With values:", values);

      const [result, _] = await db.execute(sql, values);
      return result;
    } catch (error) {
      console.error("Error updating sale: ", error);
      throw error;
    }
  }

  // Delete sale
  static async delete(id) {
    try {
      // First, delete all associated products
      await db.execute("DELETE FROM sale_products WHERE sale_id = ?", [id]);

      // Then delete the sale
      const sql = `DELETE FROM sales WHERE id = ?`;
      const [result, _] = await db.execute(sql, [id]);
      return result;
    } catch (error) {
      console.error("Error deleting sale: ", error);
      throw error;
    }
  }

  // Get products for a sale
  // 1. BACKEND FIX: Update getSaleProducts in saleModel.js

  static async getSaleProducts(saleId) {
    try {
      console.log("🔍 Fetching products for sale:", saleId);

      const sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.actualPrice,
        p.finalPrice,
        p.quantity,
        p.category,
        p.image,
        sp.created_at as added_to_sale_at
      FROM 
        products p
      JOIN 
        sale_products sp ON p.id = sp.product_id
      WHERE 
        sp.sale_id = ?
      ORDER BY 
        sp.created_at DESC
    `;

      const [products, _] = await db.execute(sql, [saleId]);

      console.log(
        `✅ Found ${products.length} products for sale ${saleId}:`,
        products
      );

      // Format the products to match frontend expectations
      return products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price || 0),
        finalPrice: parseFloat(product.finalPrice || product.price || 0),
        stock: product.quantity,
        category: product.category,
        image: product.image,
        addedToSaleAt: product.added_to_sale_at,
      }));
    } catch (error) {
      console.error("Error getting sale products: ", error);
      throw error;
    }
  }

  // Add products to a sale
  static async addProductsToSale(saleId, productIds) {
    try {
      console.log("🔄 Adding products to sale:", saleId, productIds);

      // Delete existing products for this sale
      await db.execute("DELETE FROM sale_products WHERE sale_id = ?", [saleId]);
      console.log("✅ Cleared existing products for sale");

      // Add new products (if any)
      if (productIds && productIds.length > 0) {
        for (const productId of productIds) {
          await db.execute(
            "INSERT INTO sale_products (sale_id, product_id, created_at) VALUES (?, ?, NOW())",
            [saleId, productId]
          );
        }
        console.log(`✅ Added ${productIds.length} products to sale`);
      }

      return true;
    } catch (error) {
      console.error("Error adding products to sale: ", error);
      throw error;
    }
  }

  // FIXED: Get sales by status - removed problematic orders join
  static async findByStatus(status) {
    try {
      const sql = `
        SELECT 
          s.*,
          COUNT(DISTINCT sp.product_id) as product_count,
          0 as total_sales
        FROM 
          sales s
        LEFT JOIN 
          sale_products sp ON s.id = sp.sale_id
        WHERE 
          s.status = ?
        GROUP BY 
          s.id
        ORDER BY 
          s.created_at DESC
      `;
      const [sales, _] = await db.execute(sql, [status]);

      // Format the result to match frontend structure
      return sales.map((sale) => ({
        id: sale.id,
        name: sale.name,
        description: sale.description,
        discountType: sale.discount_type,
        discountValue: parseFloat(sale.discount_value),
        startDate: sale.start_date,
        endDate: sale.end_date,
        status: sale.status,
        productCount: sale.product_count,
        totalSales: parseFloat(sale.total_sales),
      }));
    } catch (error) {
      console.error(`Error finding sales by status '${status}': `, error);
      throw error;
    }
  }

  // FIXED: Get sales analytics - removed problematic orders join
  static async getSalesAnalytics() {
    try {
      const sql = `
        SELECT 
          s.status,
          COUNT(DISTINCT s.id) as count
        FROM 
          sales s
        GROUP BY 
          s.status
      `;
      const [results, _] = await db.execute(sql);

      // Initialize default structure
      const analytics = {
        active: 0,
        scheduled: 0,
        ended: 0,
        draft: 0,
        totalRevenue: 0, // Set to 0 for now until we implement proper tracking
      };

      // Fill in values from results
      results.forEach((row) => {
        if (row.status in analytics) {
          analytics[row.status] = row.count;
        }
      });

      return analytics;
    } catch (error) {
      console.error("Error getting sales analytics: ", error);
      throw error;
    }
  }

  // BONUS: Method to calculate estimated potential revenue for a sale
  static async getEstimatedRevenue(saleId) {
    try {
      const sql = `
        SELECT 
          s.discount_type,
          s.discount_value,
          COUNT(sp.product_id) as product_count,
          AVG(p.price) as avg_product_price,
          SUM(p.price) as total_original_price
        FROM 
          sales s
        LEFT JOIN 
          sale_products sp ON s.id = sp.sale_id
        LEFT JOIN 
          products p ON sp.product_id = p.id
        WHERE 
          s.id = ?
        GROUP BY 
          s.id
      `;

      const [result, _] = await db.execute(sql, [saleId]);

      if (result.length === 0) return 0;

      const sale = result[0];
      const totalOriginalPrice = parseFloat(sale.total_original_price) || 0;

      if (sale.discount_type === "percentage") {
        return totalOriginalPrice * (parseFloat(sale.discount_value) / 100);
      } else {
        return parseFloat(sale.discount_value) * sale.product_count;
      }
    } catch (error) {
      console.error("Error calculating estimated revenue: ", error);
      return 0;
    }
  }

  static async getSaleGiftProducts(saleId) {
    try {
      const sql = `
      SELECT 
        sgp.*,
        p.id as product_id,
        p.name as product_name,
        p.image as product_image,
        p.actualPrice as product_price,
        p.quantity as product_stock
      FROM 
        sale_gift_products sgp
      JOIN 
        products p ON sgp.gift_product_id = p.id
      WHERE 
        sgp.sale_id = ? AND sgp.is_active = TRUE
      ORDER BY 
        sgp.created_at ASC
    `;

      const [gifts] = await db.execute(sql, [saleId]);
      return gifts;
    } catch (error) {
      console.error("Error getting sale gift products:", error);
      throw error;
    }
  }

  // Get product-specific gift products
  static async getProductSpecificGifts(saleId, productId = null) {
    try {
      let sql = `
      SELECT 
        spg.*,
        p.id as gift_product_id,
        p.name as gift_product_name,
        p.image as gift_product_image,
        p.actualPrice as gift_product_price,
        mp.name as main_product_name
      FROM 
        sale_product_gifts spg
      JOIN 
        products p ON spg.gift_product_id = p.id
      JOIN 
        products mp ON spg.main_product_id = mp.id
      WHERE 
        spg.sale_id = ? AND spg.is_active = TRUE
    `;

      const params = [saleId];

      if (productId) {
        sql += ` AND spg.main_product_id = ?`;
        params.push(productId);
      }

      sql += ` ORDER BY spg.created_at ASC`;

      const [gifts] = await db.execute(sql, params);
      return gifts;
    } catch (error) {
      console.error("Error getting product specific gifts:", error);
      throw error;
    }
  }

  // Add sale-level gift products
  static async addSaleGiftProducts(saleId, giftProducts) {
    try {
      // Clear existing sale gifts
      await db.execute("DELETE FROM sale_gift_products WHERE sale_id = ?", [
        saleId,
      ]);

      // Add new gifts
      if (giftProducts && giftProducts.length > 0) {
        for (const gift of giftProducts) {
          const giftId = uuidv4();
          await db.execute(
            `
          INSERT INTO sale_gift_products (
            id, sale_id, gift_product_id, gift_quantity, 
            min_purchase_amount, min_quantity, max_gifts_per_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            [
              giftId,
              saleId,
              gift.productId,
              gift.quantity || 1,
              gift.minPurchaseAmount || 0,
              gift.minQuantity || 1,
              gift.maxGiftsPerOrder || 1,
            ]
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error adding sale gift products:", error);
      throw error;
    }
  }

  // Add product-specific gift products
  static async addProductSpecificGifts(saleId, productGifts) {
    try {
      // Clear existing product gifts for this sale
      await db.execute("DELETE FROM sale_product_gifts WHERE sale_id = ?", [
        saleId,
      ]);

      // Add new product-specific gifts
      if (productGifts && productGifts.length > 0) {
        for (const gift of productGifts) {
          const giftId = uuidv4();
          await db.execute(
            `
          INSERT INTO sale_product_gifts (
            id, sale_id, main_product_id, gift_product_id, 
            gift_quantity, min_main_quantity, max_gifts_per_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            [
              giftId,
              saleId,
              gift.mainProductId,
              gift.giftProductId,
              gift.giftQuantity || 1,
              gift.minMainQuantity || 1,
              gift.maxGiftsPerOrder || 1,
            ]
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error adding product specific gifts:", error);
      throw error;
    }
  }

  // Calculate applicable gifts for cart
  static async calculateApplicableGifts(saleId, cartItems) {
    try {
      const applicableGifts = [];

      // Get sale-level gifts
      const saleGifts = await Sale.getSaleGiftProducts(saleId);

      // Calculate total purchase amount for sale-level gifts
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Check sale-level gift eligibility
      for (const gift of saleGifts) {
        if (totalAmount >= gift.min_purchase_amount) {
          const totalQualifyingItems = cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          if (totalQualifyingItems >= gift.min_quantity) {
            applicableGifts.push({
              type: "sale_gift",
              giftProductId: gift.gift_product_id,
              giftProductName: gift.product_name,
              giftQuantity: Math.min(
                gift.gift_quantity,
                gift.max_gifts_per_order
              ),
              reason: `Sale gift: Spend $${gift.min_purchase_amount}+`,
            });
          }
        }
      }

      // Get product-specific gifts
      const productGifts = await Sale.getProductSpecificGifts(saleId);

      // Check product-specific gift eligibility
      for (const cartItem of cartItems) {
        const relevantGifts = productGifts.filter(
          (g) => g.main_product_id === cartItem.productId
        );

        for (const gift of relevantGifts) {
          if (cartItem.quantity >= gift.min_main_quantity) {
            const giftQuantity =
              Math.floor(cartItem.quantity / gift.min_main_quantity) *
              gift.gift_quantity;
            const finalGiftQuantity = Math.min(
              giftQuantity,
              gift.max_gifts_per_order
            );

            applicableGifts.push({
              type: "product_gift",
              giftProductId: gift.gift_product_id,
              giftProductName: gift.gift_product_name,
              giftQuantity: finalGiftQuantity,
              mainProductId: cartItem.productId,
              reason: `Free with ${gift.main_product_name}`,
            });
          }
        }
      }

      return applicableGifts;
    } catch (error) {
      console.error("Error calculating applicable gifts:", error);
      throw error;
    }
  }
}
module.exports = Sale;
