const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class ProductVariant {
  constructor({
    product_id, // REQUIRED
    actualPrice,
    discountPrice,
    finalPrice,
    quantity,
    storage,
    size,
    color,
    originalPrice,
    is_deleted = false,
    deleted_at = null,
    deleted_reason = null,
    created_at = null,
    updated_at = null,
  }) {
    if (!product_id) {
      throw new Error("Product ID is required to create a variant.");
    }

    this.id = uuidv4();
    this.product_id = product_id;
    this.actualPrice = actualPrice ?? null;
    this.discountPrice = discountPrice ?? null;
    this.finalPrice = finalPrice ?? (actualPrice ?? null);
    this.quantity = quantity ?? 0;
    this.storage = storage ?? null;
    this.size = size ?? null;
    this.color = color ?? null;
    this.originalPrice = originalPrice ?? null;
    this.is_deleted = is_deleted ? 1 : 0;
    this.deleted_at = deleted_at ?? null;
    this.deleted_reason = deleted_reason ?? null;
    this.created_at = created_at ?? new Date();
    this.updated_at = updated_at ?? new Date();
  }

  static async create(variantData) {
    console.log("Creating product variant with data:", variantData);

    const variant = new ProductVariant(variantData);

    const query = `
      INSERT INTO product_variants 
        (id, product_id, actualPrice, discountPrice, finalPrice, quantity, storage, size, color, 
         originalPrice, is_deleted, deleted_at, created_at, updated_at) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await db.execute(query, [
        variant.id,
        variant.product_id,
        variant.actualPrice,
        variant.discountPrice,
        variant.finalPrice,
        variant.quantity,
        variant.storage,
        variant.size,
        variant.color,
        variant.originalPrice,
        variant.is_deleted,
        variant.deleted_at,
        variant.created_at,
        variant.updated_at,
      ]);

      return { id: variant.id, ...variant };
    } catch (error) {
      console.error("❌ Error in ProductVariant.create:", error);
      throw error;
    }
  }

  static async findAll(includeDeleted = false) {
    let query = "SELECT * FROM product_variants";
    if (!includeDeleted) query += " WHERE is_deleted = false";
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getDeleted() {
    const query = "SELECT * FROM product_variants WHERE is_deleted = true ORDER BY deleted_at DESC";
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getByStatus(isDeleted = false) {
    const query = "SELECT * FROM product_variants WHERE is_deleted = ? ORDER BY updated_at DESC";
    const [rows] = await db.execute(query, [isDeleted ? 1 : 0]);
    return rows;
  }

  static async update(id, variantData) {
  // Build dynamic update query
  const updateFields = [];
  const queryParams = [];

  // Only include fields that are actually provided
  const allowedFields = [
    "actualPrice",
    "discountPrice",
    "finalPrice",
    "quantity",
    "product_id",
    "storage",
    "size",
    "color",
    "originalPrice",
    "is_deleted",
    "deleted_at",
  ];

  for (const [key, value] of Object.entries(variantData)) {
    if (value !== undefined && allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);

      // Convert values correctly
      if (["actualPrice", "discountPrice", "finalPrice", "originalPrice"].includes(key)) {
        queryParams.push(value !== null ? parseFloat(value) : null);
      } else if (key === "quantity") {
        queryParams.push(parseInt(value) || 0);
      } else if (key === "is_deleted") {
        queryParams.push(value ? 1 : 0);
      } else {
        queryParams.push(value ?? null);
      }
    }
  }

  // Always update updated_at timestamp
  updateFields.push("updated_at = ?");
  queryParams.push(new Date());

  // Add ID for WHERE clause
  queryParams.push(id);

  const query = `
    UPDATE product_variants
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;

  try {
    const [result] = await db.execute(query, queryParams);
    return { id, ...variantData, updated_at: new Date() };
  } catch (error) {
    console.error("Error in ProductVariant.update:", error);
    throw error;
  }
}
static async findById(id, includeDeleted = false) {
  let query = "SELECT * FROM product_variants WHERE id = ?";
  const params = [id];

  if (!includeDeleted) {
    query += " AND is_deleted = false";
  }

  const [rows] = await db.execute(query, params);
  console.log("Query executed:", query, params);
  console.log("Rows fetched:", rows);
  return rows[0] || null;
}
static async restore(id) {
  const query = `
    UPDATE product_variants 
    SET is_deleted = false, 
        deleted_at = NULL, 
        updated_at = ?
    WHERE id = ? AND is_deleted = true
  `;

  const [result] = await db.execute(query, [new Date(), id]);

  if (result.affectedRows === 0) {
    throw new Error("Product variant not found or not deleted");
  }

  return { id, is_deleted: false, deleted_at: null };
}
static async softDelete(id, reason = "Deleted by admin") {
  const query = `
    UPDATE product_variants 
    SET is_deleted = true, 
        deleted_at = ?, 
        updated_at = ?
    WHERE id = ? AND is_deleted = false
  `;

  const [result] = await db.execute(query, [new Date(), new Date(), id]);

  if (result.affectedRows === 0) {
    throw new Error("Product variant not found or already deleted");
  }

  return { id, is_deleted: true, deleted_at: new Date(), reason };
}

static async hardDelete(id) {
  const query = `DELETE FROM product_variants WHERE id = ?`;
  const [result] = await db.execute(query, [id]);

  if (result.affectedRows === 0) {
    throw new Error("Product variant not found");
  }

  return { id, deleted: true, type: "hard_delete" };
}
static async canHardDelete(id) {
  try {
    // Check if this variant is used in order_items
    const [orderItems] = await db.execute(
      "SELECT COUNT(*) as count FROM order_items WHERE product_variant_id = ?",
      [id]
    );

    // Check if this variant is used in cart_items
    const [cartItems] = await db.execute(
      "SELECT COUNT(*) as count FROM cart_items WHERE product_variant_id = ?",
      [id]
    );

    // If you also track variants in sale_products, sale_gifts, etc., add similar checks here
    // Example:
    // const [saleProducts] = await db.execute(
    //   "SELECT COUNT(*) as count FROM sale_products WHERE product_variant_id = ?",
    //   [id]
    // );

    const dependencies = {
      orderItems: orderItems[0].count,
      cartItems: cartItems[0].count,
      // saleProducts: saleProducts[0].count,
    };

    const totalDependencies = Object.values(dependencies).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      canDelete: totalDependencies === 0,
      dependencies,
      totalDependencies,
    };
  } catch (error) {
    console.error("Error checking product variant dependencies:", error);
    return {
      canDelete: false,
      dependencies: {},
      totalDependencies: -1,
      error: error.message,
    };
  }
}

}

module.exports = ProductVariant;
