const ProductVariant = require("../model/productVariantModel");

// Create a new product
exports.createProductVariant = async (req, res) => {
  try {
    console.log("Received product data:", req.body);
    // Convert [Object: null prototype] to a regular object
    const productData = Object.assign({}, req.body);

    // Extract all fields from request body including new model fields
  const {
  actualPrice,
  discountPrice,
  finalPrice,
  quantity,
  product_id,
  storage,
  size,
  color,
  originalPrice,
  is_deleted
} = productData;

console.log("Extracted product fields:", productData);

    // // Validate required fields
    // if (!name || name.trim() === "") {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Product name is required",
    //   });
    // }

    // Handle different price field names
    const productPrice = finalPrice  || actualPrice || 0;
    console.log("Determined product price:", productPrice);
    
    const numPrice = parseFloat(productPrice);

    if (!numPrice || numPrice <= 0 || isNaN(numPrice)) {
      return res.status(400).json({
        success: false,
        error: "Valid product price is required",
      });
    }
    // Parse JSON fields if they come as strings
    // const parseJsonField = (field) => {
    //   if (!field) return null;
    //   if (typeof field === "string") {
    //     try {
    //       return JSON.parse(field);
    //     } catch (e) {
    //       console.error(`Error parsing field: ${e.message}`);
    //       return field;
    //     }
    //   }
    //   return field;
    // };

// Prepare data for the product_variants model
const modelData = {
  actualPrice: actualPrice ? parseFloat(actualPrice) : null,
  discountPrice: discountPrice ? parseFloat(discountPrice) : null,
  finalPrice: finalPrice ? parseFloat(finalPrice) : null,
  quantity: quantity ? parseInt(quantity) : 0,
  product_id: product_id || null,
  storage: storage ? storage.trim() : null,
  size: size ? size.trim() : null,
  color: color ? color.trim() : null,
  originalPrice: originalPrice ? parseFloat(originalPrice) : null,
  is_deleted:
    is_deleted === true ||
    is_deleted === "true" ||
    is_deleted === 1
      ? 1
      : 0,
  // timestamps are handled automatically by DB
};


    console.log("Processed product data for model:", modelData);

    const result = await ProductVariant.create(modelData);

    res.status(201).json({
      success: true,
      message: "Product Variant created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error creating product variant:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// Update product
exports.updateProductVariant = async (req, res) => {
  try {
    const variantId = req.params.id;
    console.log("Updating product ID:", variantId);
    console.log("Request body:", req.body);
    const {product_id} = req.body;

    // Fetch the existing variant
    const existingVariant = await ProductVariant.findById(variantId);
    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        error: "Product variant not found",
      });
    }

     // Convert request body to plain object
    const variantData = Object.assign({}, req.body);

    // Build update object dynamically
    const updateData = {};
    const fields = [
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
      "deleted_reason",
    ];

    fields.forEach((key) => {
      if (variantData[key] !== undefined) {
        if (["actualPrice","discountPrice","finalPrice","quantity","originalPrice"].includes(key)) {
          updateData[key] = variantData[key] !== null ? parseFloat(variantData[key]) : null;
        } else if (key === "is_deleted") {
          updateData[key] = variantData[key] ? 1 : 0;
        } else {
          updateData[key] = variantData[key] ?? null;
        }
      }
    });

    // Always update timestamp
    updateData.updated_at = new Date();
    console.log("Final update data:", updateData);
    const result = await ProductVariant.update(product_id, updateData);

    res.json({
      success: true,
      message: "Product variant updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error updating product variant:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// Get all products
exports.getAllProductVariants = async (req, res) => {
  try {
    const products = await ProductVariant.findAll();
    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get product by ID
exports.getProductVariantById = async (req, res) => {
  try {
    const product = await ProductVariant.findById(req.params.id, true);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product variant not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product variant:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};





// ENHANCED: Delete product variant with soft delete support
exports.deleteProductVariant = async (req, res) => {
  try {
    const variantId = req.params.id;
    const {
      hard = false,
      reason = "Deleted by admin",
      force = false,
    } = req.body;

    console.log(`Delete request for product variant ${variantId}:`, {
      hard,
      reason,
      force,
    });

    // Check if variant exists
    const existingVariant = await ProductVariant.findById(variantId, true); // Include deleted
    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        error: "Product variant not found",
      });
    }

    // If already deleted and not forcing
    if (existingVariant.is_deleted && !force) {
      return res.status(400).json({
        success: false,
        error:
          "Product variant is already deleted. Use restore endpoint to restore it.",
        data: {
          variantId,
          deletedAt: existingVariant.deleted_at,
          deletedReason: existingVariant.deleted_reason,
        },
      });
    }

    try {
      if (hard) {
        // Attempt hard delete
        // if (!force) {
        //   // Check dependencies first
        //   const dependencyCheck = await ProductVariant.canHardDelete(variantId);

        //   if (!dependencyCheck.canDelete) {
        //     return res.status(409).json({
        //       success: false,
        //       error: "Cannot permanently delete this product variant",
        //       message: `This variant has ${dependencyCheck.totalDependencies} dependent records that prevent deletion.`,
        //       dependencies: dependencyCheck.dependencies,
        //       suggestion:
        //         "Use soft delete instead, or resolve dependencies first.",
        //       alternatives: {
        //         softDelete: `/api/productVariant/${variantId}`,
        //         checkDependencies: `/api/productVariant/${variantId}/dependencies`,
        //       },
        //     });
        //   }
        // }

        await ProductVariant.hardDelete(variantId, force);

        res.json({
          success: true,
          message: "Product variant permanently deleted successfully",
          data: {
            id: variantId,
            type: "hard_delete",
            forced: force,
          },
        });
      } else {
        // Soft delete
        const result = await ProductVariant.softDelete(variantId, reason);

        res.json({
          success: true,
          message: "Product variant deleted successfully (can be restored)",
          data: {
            ...result,
            type: "soft_delete",
            restoreEndpoint: `/api/productVariant/${variantId}/restore`,
          },
        });
      }
    } catch (deleteError) {
      console.error("Delete operation failed:", deleteError);

      if (deleteError.message.includes("dependent records")) {
        return res.status(409).json({
          success: false,
          error: "Cannot delete product variant due to dependencies",
          message: deleteError.message,
          suggestion: "Use soft delete instead",
          alternatives: {
            softDelete: {
              method: "DELETE",
              url: `/api/productVariant/${variantId}`,
              body: { hard: false, reason: "Variant with dependencies" },
            },
          },
        });
      }

      throw deleteError;
    }
  } catch (err) {
    console.error("Error deleting product variant:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// NEW: Restore soft deleted product variant
exports.restoreProductVariant = async (req, res) => {
  try {
    const variantId = req.params.id;

    const result = await ProductVariant.restore(variantId);

    res.json({
      success: true,
      message: "Product variant restored successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error restoring product variant:", err);

    if (err.message.includes("not found or not deleted")) {
      return res.status(404).json({
        success: false,
        error: "Product variant not found or not deleted",
      });
    }

    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};





