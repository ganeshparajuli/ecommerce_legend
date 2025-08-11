const Product = require("../model/productModel");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log("Received product data:", req.body);
    console.log("Uploaded files:", req.files);

    // Convert [Object: null prototype] to a regular object
    const productData = Object.assign({}, req.body);

    // Extract all fields from request body including new model fields
    const {
      name,
      brand,
      category,
      description,
      price,
      actualPrice,
      discountPrice,
      finalPrice,
      originalPrice,
      stock,
      quantity,
      is_featured,
      featured,
      color,
      sku,
      keyFeatures,
      specifications,
      productDetails,
      rating,
      reviewCount,
      availability,
      tags,
    } = productData;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Product name is required",
      });
    }

    // Handle different price field names
    const productPrice = finalPrice || price || actualPrice || 0;
    const numPrice = parseFloat(productPrice);

    if (!numPrice || numPrice <= 0 || isNaN(numPrice)) {
      return res.status(400).json({
        success: false,
        error: "Valid product price is required",
      });
    }

    // FIXED: Process uploaded images for upload.fields() structure
    let imageData = null;
    const allImages = [];

    if (req.files) {
      // Handle different field names from upload.fields()
      if (req.files.images) {
        const images = Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images];
        allImages.push(...images);
      }

      if (req.files.image) {
        const images = Array.isArray(req.files.image)
          ? req.files.image
          : [req.files.image];
        allImages.push(...images);
      }

      if (allImages.length > 0) {
        // Use relative paths that match your actual file structure
        const imagePaths = allImages.map((file) => `uploads/${file.filename}`);
        imageData = JSON.stringify(imagePaths);
        console.log("Processed image paths:", imagePaths);
      }
    }

    // Parse JSON fields if they come as strings
    const parseJsonField = (field) => {
      if (!field) return null;
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch (e) {
          console.error(`Error parsing field: ${e.message}`);
          return field;
        }
      }
      return field;
    };

    // Prepare data for the model with all fields
    const modelData = {
      name: name.trim(),
      brand: brand || null,
      category: category || null,
      description: description || null,
      actualPrice: actualPrice ? parseFloat(actualPrice) : numPrice,
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      finalPrice: finalPrice ? parseFloat(finalPrice) : numPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      quantity: parseInt(stock || quantity) || 0,
      featured:
        is_featured === true ||
        is_featured === "true" ||
        featured === true ||
        featured === "true",
      image: imageData, // This will now contain the JSON array of image paths
      color: color || null,
      // New fields
      sku: sku || null, // Model will auto-generate if null
      keyFeatures: parseJsonField(keyFeatures) || [],
      specifications: parseJsonField(specifications) || {},
      productDetails: productDetails || description || null,
      rating: rating ? parseFloat(rating) : 0,
      reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      availability: availability || "In Stock",
      tags: parseJsonField(tags) || [],
    };

    console.log("Processed product data for model:", modelData);
    console.log("Image data being saved:", imageData);

    const result = await Product.create(modelData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("Updating product ID:", productId);
    console.log("Request body:", req.body);
    console.log("Files received:", req.files);

    // Get the existing product first
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Convert [Object: null prototype] to a regular object
    const productData = Object.assign({}, req.body);

    // Parse JSON fields if they come as strings
    const parseJsonField = (field) => {
      if (!field) return undefined;
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    };

    // Build the update data object - only include fields that are provided
    const updateData = {};

    // Basic fields
    if (productData.name !== undefined)
      updateData.name = productData.name.trim();
    if (productData.brand !== undefined)
      updateData.brand = productData.brand || null;
    if (productData.category !== undefined)
      updateData.category = productData.category || null;
    if (productData.description !== undefined)
      updateData.description = productData.description || null;
    if (productData.color !== undefined)
      updateData.color = productData.color || null;

    // Price fields
    if (productData.actualPrice !== undefined)
      updateData.actualPrice = parseFloat(productData.actualPrice) || null;
    if (productData.discountPrice !== undefined)
      updateData.discountPrice = parseFloat(productData.discountPrice) || null;
    if (productData.finalPrice !== undefined)
      updateData.finalPrice = parseFloat(productData.finalPrice) || null;
    if (productData.originalPrice !== undefined)
      updateData.originalPrice = parseFloat(productData.originalPrice) || null;

    // Quantity
    if (productData.quantity !== undefined || productData.stock !== undefined) {
      updateData.quantity =
        parseInt(productData.quantity || productData.stock) || 0;
    }

    // Featured flag
    if (
      productData.featured !== undefined ||
      productData.is_featured !== undefined
    ) {
      const featured = productData.featured || productData.is_featured;
      updateData.featured =
        featured === "1" ||
        featured === 1 ||
        featured === true ||
        featured === "true";
    }

    // New fields
    if (productData.sku !== undefined) updateData.sku = productData.sku;
    if (productData.keyFeatures !== undefined)
      updateData.keyFeatures = parseJsonField(productData.keyFeatures);
    if (productData.specifications !== undefined)
      updateData.specifications = parseJsonField(productData.specifications);
    if (productData.productDetails !== undefined)
      updateData.productDetails = productData.productDetails;
    if (productData.rating !== undefined)
      updateData.rating = parseFloat(productData.rating);
    if (productData.reviewCount !== undefined)
      updateData.reviewCount = parseInt(productData.reviewCount);
    if (productData.availability !== undefined)
      updateData.availability = productData.availability;
    if (productData.tags !== undefined)
      updateData.tags = parseJsonField(productData.tags);

    // FIXED: Handle image uploads for update
    let finalImages = [];

    // 1. Handle existing images that should be kept
    if (productData.existingImages) {
      try {
        const imagesToKeep = JSON.parse(productData.existingImages);
        finalImages = [...imagesToKeep];
        console.log("Keeping existing images:", imagesToKeep);
      } catch (e) {
        console.error("Error parsing existingImages:", e);
      }
    }

    // 2. Handle new uploaded images
    const allNewImages = [];
    if (req.files) {
      // Handle images field
      if (req.files.images) {
        const images = Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images];
        allNewImages.push(...images);
      }

      // Handle newImages field
      if (req.files.newImages) {
        const images = Array.isArray(req.files.newImages)
          ? req.files.newImages
          : [req.files.newImages];
        allNewImages.push(...images);
      }

      // Handle image field (backward compatibility)
      if (req.files.image) {
        const images = Array.isArray(req.files.image)
          ? req.files.image
          : [req.files.image];
        allNewImages.push(...images);
      }

      if (allNewImages.length > 0) {
        const newImagePaths = allNewImages.map(
          (file) => `uploads/${file.filename}`
        );
        finalImages = [...finalImages, ...newImagePaths];
        console.log("Adding new images:", newImagePaths);
      }
    }

    // Update image data if there are any images
    if (finalImages.length > 0 || allNewImages.length > 0) {
      updateData.image = JSON.stringify(finalImages);
      console.log("Final image array:", finalImages);
    }

    console.log("Final update data:", updateData);
    const result = await Product.update(productId, updateData);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
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
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get product by SKU
exports.getProductBySKU = async (req, res) => {
  try {
    const product = await Product.findBySKU(req.params.sku);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product by SKU:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};



// ENHANCED: Delete product with soft delete support
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      hard = false,
      reason = "Deleted by admin",
      force = false,
    } = req.body;

    console.log(`Delete request for product ${productId}:`, {
      hard,
      reason,
      force,
    });

    // Check if product exists
    const existingProduct = await Product.findById(productId, true); // Include deleted
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // If already deleted and not forcing
    if (existingProduct.is_deleted && !force) {
      return res.status(400).json({
        success: false,
        error:
          "Product is already deleted. Use restore endpoint to restore it.",
        data: {
          productId,
          deletedAt: existingProduct.deleted_at,
          deletedReason: existingProduct.deleted_reason,
        },
      });
    }

    try {
      if (hard) {
        // Attempt hard delete
        if (!force) {
          // Check dependencies first
          const dependencyCheck = await Product.canHardDelete(productId);

          if (!dependencyCheck.canDelete) {
            return res.status(409).json({
              success: false,
              error: "Cannot permanently delete this product",
              message: `This product has ${dependencyCheck.totalDependencies} dependent records that prevent deletion.`,
              dependencies: dependencyCheck.dependencies,
              suggestion:
                "Use soft delete instead, or resolve dependencies first.",
              alternatives: {
                softDelete: `/api/product/${productId}`,
                checkDependencies: `/api/product/${productId}/dependencies`,
              },
            });
          }
        }

        await Product.hardDelete(productId, force);

        res.json({
          success: true,
          message: "Product permanently deleted successfully",
          data: {
            id: productId,
            type: "hard_delete",
            forced: force,
          },
        });
      } else {
        // Soft delete
        const result = await Product.softDelete(productId, reason);

        res.json({
          success: true,
          message: "Product deleted successfully (can be restored)",
          data: {
            ...result,
            type: "soft_delete",
            restoreEndpoint: `/api/product/${productId}/restore`,
          },
        });
      }
    } catch (deleteError) {
      console.error("Delete operation failed:", deleteError);

      if (deleteError.message.includes("dependent records")) {
        return res.status(409).json({
          success: false,
          error: "Cannot delete product due to dependencies",
          message: deleteError.message,
          suggestion: "Use soft delete instead",
          alternatives: {
            softDelete: {
              method: "DELETE",
              url: `/api/product/${productId}`,
              body: { hard: false, reason: "Product with dependencies" },
            },
          },
        });
      }

      throw deleteError;
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// NEW: Restore soft deleted product
exports.restoreProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await Product.restore(productId);

    res.json({
      success: true,
      message: "Product restored successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error restoring product:", err);

    if (err.message.includes("not found or not deleted")) {
      return res.status(404).json({
        success: false,
        error: "Product not found or not deleted",
      });
    }

    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// NEW: Check product dependencies
exports.checkProductDependencies = async (req, res) => {
  try {
    const productId = req.params.id;

    const dependencyCheck = await Product.canHardDelete(productId);

    res.json({
      success: true,
      data: {
        productId,
        canHardDelete: dependencyCheck.canDelete,
        totalDependencies: dependencyCheck.totalDependencies,
        dependencies: dependencyCheck.dependencies,
        recommendation: dependencyCheck.canDelete
          ? "Safe to hard delete"
          : "Use soft delete - has dependent records",
      },
    });
  } catch (err) {
    console.error("Error checking dependencies:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// NEW: Get deleted products
exports.getDeletedProducts = async (req, res) => {
  try {
    const deletedProducts = await Product.getDeleted();

    res.json({
      success: true,
      data: deletedProducts,
      count: deletedProducts.length,
      message: "Deleted products retrieved successfully",
    });
  } catch (err) {
    console.error("Error fetching deleted products:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// ENHANCED: Get all products with deletion status filter
exports.getAllProducts = async (req, res) => {
  try {
    const { includeDeleted = false, status } = req.query;

    let products;

    if (status === "deleted") {
      products = await Product.getDeleted();
    } else if (status === "active") {
      products = await Product.getByStatus(false);
    } else if (includeDeleted === "true") {
      products = await Product.findAll(true);
    } else {
      products = await Product.findAll(false);
    }

    res.json({
      success: true,
      data: products,
      count: products.length,
      filters: {
        includeDeleted: includeDeleted === "true",
        status: status || "all",
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// ENHANCED: Get product by ID with deletion status
exports.getProductById = async (req, res) => {
  try {
    const { includeDeleted = false } = req.query;
    const product = await Product.findById(
      req.params.id,
      includeDeleted === "true"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error:
          includeDeleted === "true"
            ? "Product not found"
            : "Product not found or has been deleted",
        suggestion:
          includeDeleted !== "true"
            ? "Add ?includeDeleted=true to see deleted products"
            : null,
      });
    }

    // Add status information
    const productWithStatus = {
      ...product,
      status: product.is_deleted ? "deleted" : "active",
      canRestore: product.is_deleted,
      canHardDelete: product.is_deleted,
    };

    res.json({
      success: true,
      data: productWithStatus,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// NEW: Bulk operations for products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const {
      productIds,
      hard = false,
      reason = "Bulk delete operation",
      force = false,
    } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs array is required",
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: productIds.length,
    };

    for (const productId of productIds) {
      try {
        if (hard) {
          if (!force) {
            const dependencyCheck = await Product.canHardDelete(productId);
            if (!dependencyCheck.canDelete) {
              results.failed.push({
                productId,
                error: "Has dependent records",
                dependencies: dependencyCheck.dependencies,
              });
              continue;
            }
          }
          await Product.hardDelete(productId, force);
          results.successful.push({ productId, type: "hard_delete" });
        } else {
          const result = await Product.softDelete(productId, reason);
          results.successful.push({
            productId,
            type: "soft_delete",
            ...result,
          });
        }
      } catch (error) {
        results.failed.push({
          productId,
          error: error.message,
        });
      }
    }

    const statusCode = results.failed.length === 0 ? 200 : 207; // 207 = Multi-Status

    res.status(statusCode).json({
      success: results.failed.length === 0,
      message: `Bulk delete completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results,
    });
  } catch (err) {
    console.error("Error in bulk delete:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// NEW: Bulk restore products
exports.bulkRestoreProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs array is required",
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: productIds.length,
    };

    for (const productId of productIds) {
      try {
        const result = await Product.restore(productId);
        results.successful.push({ productId, ...result });
      } catch (error) {
        results.failed.push({
          productId,
          error: error.message,
        });
      }
    }

    const statusCode = results.failed.length === 0 ? 200 : 207;

    res.status(statusCode).json({
      success: results.failed.length === 0,
      message: `Bulk restore completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results,
    });
  } catch (err) {
    console.error("Error in bulk restore:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findis_FeaturedProducts();
    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching featured products:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const criteria = {
      name: req.query.name,
      brand: req.query.brand,
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      inStock: req.query.inStock === "true",
    };

    // Remove undefined values
    Object.keys(criteria).forEach(
      (key) => criteria[key] === undefined && delete criteria[key]
    );

    const products = await Product.search(criteria);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error("Error searching products:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(parseInt(quantity))) {
      return res.status(400).json({
        success: false,
        error: "Valid quantity is required",
      });
    }

    await Product.updateStock(productId, parseInt(quantity));

    res.json({
      success: true,
      message: "Product stock updated successfully",
      data: { id: productId, quantity: parseInt(quantity) },
    });
  } catch (err) {
    console.error("Error updating product stock:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Update product rating
exports.updateProductRating = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, reviewCount } = req.body;

    if (!rating || !reviewCount) {
      return res.status(400).json({
        success: false,
        error: "Rating and review count are required",
      });
    }

    const newRating = parseFloat(rating);
    const newReviewCount = parseInt(reviewCount);

    if (isNaN(newRating) || isNaN(newReviewCount)) {
      return res.status(400).json({
        success: false,
        error: "Invalid rating or review count",
      });
    }

    if (newRating < 0 || newRating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 0 and 5",
      });
    }

    await Product.updateRating(productId, newRating, newReviewCount);

    res.json({
      success: true,
      message: "Product rating updated successfully",
      data: { id: productId, rating: newRating, reviewCount: newReviewCount },
    });
  } catch (err) {
    console.error("Error updating product rating:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.search({ category });

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get products by color
exports.getProductsByColor = async (req, res) => {
  try {
    const { color } = req.params;
    // You'll need to add a color search to your Product model
    const query = "SELECT * FROM products WHERE color = ?";
    const [products] = await db.execute(query, [color]);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error("Error fetching products by color:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get products by size
exports.getProductsBySize = async (req, res) => {
  try {
    const { size } = req.params;
    // Note: Your current model doesn't have a size field
    // You might need to add it or use the specifications field
    const query =
      "SELECT * FROM products WHERE JSON_CONTAINS(specifications, JSON_OBJECT('size', ?))";
    const [products] = await db.execute(query, [size]);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error("Error fetching products by size:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get products by price range
exports.getProductsByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;

    if (!minPrice && !maxPrice) {
      return res.status(400).json({
        success: false,
        error: "Please provide minPrice or maxPrice query parameters",
      });
    }

    const criteria = {};
    if (minPrice) criteria.minPrice = parseFloat(minPrice);
    if (maxPrice) criteria.maxPrice = parseFloat(maxPrice);

    const products = await Product.search(criteria);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error("Error fetching products by price range:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Update product image only
exports.updateProductImage = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images provided",
      });
    }

    // Get existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Process new images
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    const imageData = JSON.stringify(imagePaths);

    // Update only the image field
    const result = await Product.update(productId, { image: imageData });

    res.json({
      success: true,
      message: "Product image updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error updating product image:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
