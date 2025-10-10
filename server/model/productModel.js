const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

class Product {
  constructor({
    name,
    brand,
    category,
    description,
    stock,
    quantity,
    is_featured,
    featured = false,
    image,
    color,
    created_at,
    updated_at,
    actualPrice,
    discountPrice,
    finalPrice,
    // New fields for enhanced product details
    sku,
    keyFeatures,
    specifications,
    productDetails,
    rating = 0,
    reviewCount = 0,
    availability = "In Stock",
    originalPrice,
    savings,
    tags,
    price, // fallback for compatibility
    // NEW: Soft delete fields
    is_deleted = false,
    deleted_at = null,
    deleted_reason = null,
  }) {
    this.id = uuidv4();
    this.name = name || null;
    this.brand = brand || null;
    this.category = category || null;
    this.description = description || null;

    // Handle different price field names consistently
    this.actualPrice = actualPrice || price || null;
    this.discountPrice = discountPrice || null;
    this.finalPrice = finalPrice || price || null;
    this.originalPrice = originalPrice || null;
    this.savings = savings || null;

    // Handle stock/quantity naming inconsistency
    this.quantity = stock || quantity || 0;

    // Handle featured/is_featured naming inconsistency
    this.featured =
      is_featured === true ||
      is_featured === "true" ||
      featured === true ||
      featured === "true" ||
      false;

    // Handle image field
    this.image = image || null;
    this.color = color || null;

    // New enhanced fields
    this.sku = sku || this.generateSKU();
    this.keyFeatures = keyFeatures
      ? typeof keyFeatures === "string"
        ? JSON.parse(keyFeatures)
        : keyFeatures
      : [];
    this.specifications = specifications
      ? typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications
      : {};
    this.productDetails = productDetails || description || null;
    this.rating = parseFloat(rating) || 0;
    this.reviewCount = parseInt(reviewCount) || 0;
    this.availability = availability || "In Stock";
    this.tags = tags
      ? typeof tags === "string"
        ? JSON.parse(tags)
        : tags
      : [];

    // NEW: Soft delete fields
    this.is_deleted = is_deleted || false;
    this.deleted_at = deleted_at || null;
    this.deleted_reason = deleted_reason || null;

    // Timestamps
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  // Generate SKU if not provided
  generateSKU() {
    const prefix = this.category
      ? this.category.substring(0, 3).toUpperCase()
      : "PRD";
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  // Calculate savings automatically
  calculateSavings() {
    if (this.originalPrice && this.finalPrice) {
      return parseFloat(this.originalPrice) - parseFloat(this.finalPrice);
    }
    return 0;
  }

  static async findis_FeaturedProducts() {
    const query =
      "SELECT * FROM products WHERE featured = true AND is_deleted = false";
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findAll(includeDeleted = false) {
    // let query = "SELECT * FROM products";
//   let query = `
//   SELECT p.*, 
//          cs.series_name, 
//          cs.is_active, 
//          cs.category_id
//   FROM products p
//   LEFT JOIN category_series cs 
//          ON cs.product_id = p.id
// `;

let query = `SELECT 
    p.id,
    p.name,
    p.brand,
    p.category,
    p.description,
    p.actualPrice,
    p.discountPrice,
    p.finalPrice,
    p.quantity,
    p.featured,
    p.image,
    p.color,
    p.created_at,
    p.updated_at,
    p.sku,
    p.keyFeatures,
    p.specifications,
    p.productDetails,
    p.rating,
    p.reviewCount,
    p.availability,
    p.originalPrice,
    p.savings,
    p.tags,
    p.is_deleted,
    p.deleted_at,
    p.deleted_reason,
    zs.series_name,
    zs.is_active,
    zs.category_id,
    CONCAT(
        '[', 
        GROUP_CONCAT(
            JSON_OBJECT(
                'variant_id', pv.id,
                'color', pv.color,
                'storage', pv.storage,
                'finalPrice', pv.finalPrice,
                'quantity', pv.quantity
            )
            SEPARATOR ','
        ),
        ']'
    ) AS variants
FROM products p
LEFT JOIN categories cs 
       ON cs.id COLLATE utf8mb4_unicode_ci = p.category COLLATE utf8mb4_unicode_ci
LEFT JOIN category_series zs 
       ON zs.category_id COLLATE utf8mb4_unicode_ci = cs.id COLLATE utf8mb4_unicode_ci
LEFT JOIN product_variants pv 
       ON pv.product_id COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci
`;

if (!includeDeleted) {
  query += " WHERE p.is_deleted = false";
}

query += `
GROUP BY p.id, zs.series_name, zs.is_active, zs.category_id
LIMIT 0, 25;
`;


const [rows] = await db.execute(query);

return rows;

}

  static async findById(id, includeDeleted = false) {
    let query = "SELECT * FROM products WHERE id = ?";
    const params = [id];

    if (!includeDeleted) {
      query += " AND is_deleted = false";
    }

    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  static async findBySKU(sku, includeDeleted = false) {
    let query = "SELECT * FROM products WHERE sku = ?";
    const params = [sku];

    if (!includeDeleted) {
      query += " AND is_deleted = false";
    }

    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  static async create(productData) {
    console.log("Creating product with data:", productData);

    const product = new Product(productData);

    // Auto-calculate savings
    if (!product.savings) {
      product.savings = product.calculateSavings();
    }

    // Ensure we have all fields needed for the query
    const {
      id,
      name,
      brand,
      category,
      description,
      actualPrice,
      discountPrice,
      finalPrice,
      originalPrice,
      savings,
      quantity,
      featured,
      image,
      color,
      sku,
      keyFeatures,
      specifications,
      productDetails,
      rating,
      reviewCount,
      availability,
      tags,
      is_deleted,
      deleted_at,
      deleted_reason,
      created_at,
      updated_at,
    } = product;

    const query = `
      INSERT INTO products 
        (id, name, brand, category, description, actualPrice, discountPrice, finalPrice, originalPrice, savings,
         quantity, featured, image, color, sku, keyFeatures, specifications, productDetails, 
         rating, reviewCount, availability, tags, is_deleted, deleted_at, deleted_reason, created_at, updated_at) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await db.execute(query, [
        id,
        name,
        brand,
        category,
        description,
        actualPrice,
        discountPrice,
        finalPrice,
        originalPrice,
        savings,
        quantity,
        featured,
        image,
        color,
        sku,
        JSON.stringify(keyFeatures),
        JSON.stringify(specifications),
        productDetails,
        rating,
        reviewCount,
        availability,
        JSON.stringify(tags),
        is_deleted,
        deleted_at,
        deleted_reason,
        created_at,
        updated_at,
      ]);

// Extract storage and size from productData (or default to null)
const storage = productData.storage || null;
const size = productData.size || null;
const variantColor = productData.color || null;

// Insert default variant
const variantQuery = `
  INSERT INTO product_variants
    (id, actualPrice, discountPrice, finalPrice, originalPrice, quantity, storage, size, color, product_id, created_at, updated_at, is_deleted)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0)
`;

await db.execute(variantQuery, [
  uuidv4(),               // variant id
  actualPrice || null,
  discountPrice || null,
  finalPrice || null,
  originalPrice || null,
  quantity || 0,
  storage,                // from above
  size,                   // from above
  variantColor,           // from above
  id                      // link to parent product
]);
    return { id, ...product };
    } catch (error) {
      console.error("Error in Product.create:", error);
      throw error;
    }

  }

  // static async update(id, productData) {
  //   // Build a dynamic update query based on the provided fields
  //   let updateFields = [];
  //   let queryParams = [];

  //   // Only include fields that are actually provided
  //   for (const [key, value] of Object.entries(productData)) {
  //     // Skip undefined values
  //     if (value !== undefined) {
  //       // Handle JSON fields
  //       if (["keyFeatures", "specifications", "tags"].includes(key)) {
  //         updateFields.push(`${key} = ?`);
  //         queryParams.push(
  //           typeof value === "string" ? value : JSON.stringify(value)
  //         );
  //       } else {
  //         updateFields.push(`${key} = ?`);
  //         queryParams.push(value);
  //       }
  //     }
  //   }

  //   // Auto-calculate savings if prices are updated
  //   if (productData.originalPrice || productData.finalPrice) {
  //     const existing = await Product.findById(id, true); // Include deleted to allow updates
  //     const originalPrice = productData.originalPrice || existing.originalPrice;
  //     const finalPrice = productData.finalPrice || existing.finalPrice;

  //     if (originalPrice && finalPrice) {
  //       const savings = parseFloat(originalPrice) - parseFloat(finalPrice);
  //       updateFields.push("savings = ?");
  //       queryParams.push(savings);
  //     }
  //   }

  //   // Add the updated_at timestamp
  //   updateFields.push("updated_at = ?");
  //   queryParams.push(new Date());

  //   // Add the ID for the WHERE clause
  //   queryParams.push(id);

  //   const query = `
  //     UPDATE products 
  //     SET ${updateFields.join(", ")} 
  //     WHERE id = ?
  //   `;

  //   try {
  //     const [result] = await db.execute(query, queryParams);
  //     return { id, ...productData, updated_at: new Date() };
  //   } catch (error) {
  //     console.error("Error in Product.update:", error);
  //     throw error;
  //   }
  // }


  static async update(id, productData) {
  let updateFields = [];
  let queryParams = [];

  // Only include fields that are actually provided
  for (const [key, value] of Object.entries(productData)) {
    if (value !== undefined) {
      if (["keyFeatures", "specifications", "tags"].includes(key)) {
        updateFields.push(`${key} = ?`);
        queryParams.push(typeof value === "string" ? value : JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        queryParams.push(value);
      }
    }
  }

  // Auto-calculate savings if prices are updated
  if (productData.originalPrice || productData.finalPrice) {
    const existing = await Product.findById(id, true); // include deleted
    const originalPrice = productData.originalPrice || existing.originalPrice;
    const finalPrice = productData.finalPrice || existing.finalPrice;

    if (originalPrice && finalPrice) {
      const savings = parseFloat(originalPrice) - parseFloat(finalPrice);
      updateFields.push("savings = ?");
      queryParams.push(savings);
    }
  }

  // Add updated_at timestamp
  const now = new Date();
  updateFields.push("updated_at = ?");
  queryParams.push(now);

  // Add ID for WHERE clause
  queryParams.push(id);

  const query = `
    UPDATE products 
    SET ${updateFields.join(", ")} 
    WHERE id = ?
  `;

  try {
    const [result] = await db.execute(query, queryParams);

    // ✅ Update price-related fields in product_variants if any price-related field is updated
    const priceFields = ["actualPrice", "discountPrice", "finalPrice", "originalPrice", "quantity"];
    const priceUpdateData = {};

    for (const field of priceFields) {
      if (productData[field] !== undefined) {
        priceUpdateData[field] = productData[field];
      }
    }

    if (Object.keys(priceUpdateData).length > 0) {
      let variantUpdateFields = [];
      let variantParams = [];

      for (const [key, value] of Object.entries(priceUpdateData)) {
        variantUpdateFields.push(`${key} = ?`);
        variantParams.push(value);
      }

      variantUpdateFields.push("updated_at = ?");
      variantParams.push(now);

      variantParams.push(id); // product_id in product_variants

      const variantQuery = `
        UPDATE product_variants 
        SET ${variantUpdateFields.join(", ")}
        WHERE product_id = ?
      `;

      await db.execute(variantQuery, variantParams);
    }

    return { id, ...productData, updated_at: now };
  } catch (error) {
    console.error("Error in Product.update:", error);
    throw error;
  }
}

  static async updateStock(id, quantity) {
    const query =
      "UPDATE products SET quantity = ?, updated_at = ? WHERE id = ? AND is_deleted = false";
    await db.execute(query, [quantity, new Date(), id]);
  }

  static async updateRating(id, newRating, newReviewCount) {
    const query =
      "UPDATE products SET rating = ?, reviewCount = ?, updated_at = ? WHERE id = ? AND is_deleted = false";
    await db.execute(query, [newRating, newReviewCount, new Date(), id]);
  }

  // NEW: Soft delete method
  static async softDelete(id, reason = "Deleted by admin") {
    const query = `
      UPDATE products 
      SET is_deleted = true, deleted_at = ?, deleted_reason = ?, updated_at = ?
      WHERE id = ? AND is_deleted = false
    `;
    const deleteTime = new Date();
    const [result] = await db.execute(query, [
      deleteTime,
      reason,
      deleteTime,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Product not found or already deleted");
    }

    return {
      id,
      is_deleted: true,
      deleted_at: deleteTime,
      deleted_reason: reason,
    };
  }

  // NEW: Restore soft deleted product
  static async restore(id) {
    const query = `
      UPDATE products 
      SET is_deleted = false, deleted_at = NULL, deleted_reason = NULL, updated_at = ?
      WHERE id = ? AND is_deleted = true
    `;
    const [result] = await db.execute(query, [new Date(), id]);

    if (result.affectedRows === 0) {
      throw new Error("Product not found or not deleted");
    }

    return { id, is_deleted: false, deleted_at: null, deleted_reason: null };
  }

  // NEW: Check if product can be hard deleted (no dependencies)
  static async canHardDelete(id) {
    try {
      // Check order_items
      const [orderItems] = await db.execute(
        "SELECT COUNT(*) as count FROM order_items WHERE product_id = ?",
        [id]
      );

      // Check cart_items
      const [cartItems] = await db.execute(
        "SELECT COUNT(*) as count FROM cart_items WHERE product_id = ?",
        [id]
      );

      // Check sale_products
      const [saleProducts] = await db.execute(
        "SELECT COUNT(*) as count FROM sale_products WHERE product_id = ?",
        [id]
      );

      // Check product_gifts (as main product)
      const [productGiftsMain] = await db.execute(
        "SELECT COUNT(*) as count FROM product_gifts WHERE main_product_id = ?",
        [id]
      );

      // Check product_gifts (as gift product)
      const [productGiftsGift] = await db.execute(
        "SELECT COUNT(*) as count FROM product_gifts WHERE gift_product_id = ?",
        [id]
      );

      // Check sale_gifts
      const [saleGifts] = await db.execute(
        "SELECT COUNT(*) as count FROM sale_gifts WHERE gift_product_id = ?",
        [id]
      );

      const dependencies = {
        orderItems: orderItems[0].count,
        cartItems: cartItems[0].count,
        saleProducts: saleProducts[0].count,
        productGiftsMain: productGiftsMain[0].count,
        productGiftsGift: productGiftsGift[0].count,
        saleGifts: saleGifts[0].count,
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
      console.error("Error checking dependencies:", error);
      return {
        canDelete: false,
        dependencies: {},
        totalDependencies: -1,
        error: error.message,
      };
    }
  }

  // NEW: Hard delete (only if no dependencies)
  static async hardDelete(id, force = false) {
    if (!force) {
      const canDelete = await Product.canHardDelete(id);
      if (!canDelete.canDelete) {
        throw new Error(
          `Cannot delete product: ${canDelete.totalDependencies} dependent records found. ` +
            `Dependencies: ${JSON.stringify(canDelete.dependencies)}. ` +
            `Use soft delete instead or force delete with force=true.`
        );
      }
    }

    const query = "DELETE FROM products WHERE id = ?";
    await db.execute(query, [id]);
  }

  // Updated delete method - now defaults to soft delete
  static async delete(id, options = {}) {
    const {
      hard = false,
      reason = "Deleted by admin",
      force = false,
    } = options;

    if (hard) {
      return await Product.hardDelete(id, force);
    } else {
      return await Product.softDelete(id, reason);
    }
  }

  // Search products by various criteria (exclude deleted by default)
  static async search(criteria, includeDeleted = false) {
    let query = "SELECT * FROM products WHERE 1=1";
    let params = [];

    // Exclude deleted products unless specifically requested
    if (!includeDeleted) {
      query += " AND is_deleted = false";
    }

    if (criteria.name) {
      query += " AND name LIKE ?";
      params.push(`%${criteria.name}%`);
    }

    if (criteria.brand) {
      query += " AND brand = ?";
      params.push(criteria.brand);
    }

    if (criteria.category) {
      query += " AND category = ?";
      params.push(criteria.category);
    }

    if (criteria.minPrice) {
      query += " AND finalPrice >= ?";
      params.push(criteria.minPrice);
    }

    if (criteria.maxPrice) {
      query += " AND finalPrice <= ?";
      params.push(criteria.maxPrice);
    }

    if (criteria.inStock) {
      query += " AND quantity > 0";
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // NEW: Get deleted products
  static async getDeleted() {
    const query =
      "SELECT * FROM products WHERE is_deleted = true ORDER BY deleted_at DESC";
    const [rows] = await db.execute(query);
    return rows;
  }

  // NEW: Get products by deletion status
  static async getByStatus(isDeleted = false) {
    const query =
      "SELECT * FROM products WHERE is_deleted = ? ORDER BY updated_at DESC";
    const [rows] = await db.execute(query, [isDeleted]);
    return rows;
  }
}

module.exports = Product;
