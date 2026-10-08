const { Op } = require("sequelize");
const { Product, ProductImage, ProductVariant, Brand, Category, CategorySeries, sequelize } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

const PRODUCT_INCLUDES = [
  { model: ProductImage, as: "images", separate: true, order: [["sortOrder", "ASC"]] },
  { model: ProductVariant, as: "variants", separate: true, order: [["createdAt", "ASC"]] },
  { model: Brand, as: "brand" },
  { model: Category, as: "category" },
  { model: CategorySeries, as: "series" },
];

function serializeProduct(product) {
  return {
    ...product.toJSON(),
    priceRange: product.priceRange,
    defaultVariant: product.defaultVariant,
  };
}

function parseJsonField(field, fallback) {
  if (field === undefined) return undefined;
  if (typeof field !== "string") return field;
  try {
    return JSON.parse(field);
  } catch {
    return fallback;
  }
}

function parseVariantsInput(rawVariants) {
  const variants = parseJsonField(rawVariants, []);
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new ApiError(400, "At least one variant (with a price) is required");
  }
  return variants.map((v, index) => {
    const price = Number(v.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new ApiError(400, `Variant ${index + 1}: a valid non-negative price is required`);
    }
    const compareAtPrice =
      v.compareAtPrice !== undefined && v.compareAtPrice !== null && v.compareAtPrice !== ""
        ? Number(v.compareAtPrice)
        : null;
    return {
      id: v.id, // present when updating an existing variant
      sku: v.sku || undefined,
      price,
      compareAtPrice: compareAtPrice !== null && compareAtPrice > price ? compareAtPrice : null,
      quantity: Number.isFinite(Number(v.quantity)) ? parseInt(v.quantity, 10) : 0,
      attributes: v.attributes && typeof v.attributes === "object" ? v.attributes : {},
      isDefault: !!v.isDefault,
    };
  });
}

function collectUploadedImagePaths(files) {
  if (!files) return [];
  const groups = ["images", "newImages", "image"];
  const uploaded = [];
  for (const group of groups) {
    if (files[group]) {
      const list = Array.isArray(files[group]) ? files[group] : [files[group]];
      uploaded.push(...list);
    }
  }
  return uploaded.map((f) => `uploads/${f.filename}`);
}

exports.createProduct = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name"]);
  const variantsInput = parseVariantsInput(req.body.variants);
  const newImagePaths = collectUploadedImagePaths(req.files);

  const product = await sequelize.transaction(async (t) => {
    const created = await Product.create(
      {
        name: req.body.name.trim(),
        brandId: req.body.brandId || null,
        categoryId: req.body.categoryId || null,
        seriesId: req.body.seriesId || null,
        description: req.body.description || null,
        productDetails: req.body.productDetails || req.body.description || null,
        keyFeatures: parseJsonField(req.body.keyFeatures, []) || [],
        specifications: parseJsonField(req.body.specifications, {}) || {},
        tags: parseJsonField(req.body.tags, []) || [],
        availability: req.body.availability || "In Stock",
        isFeatured: req.body.isFeatured === true || req.body.isFeatured === "true",
        sku: req.body.sku || undefined,
      },
      { transaction: t }
    );

    await Promise.all(
      newImagePaths.map((url, index) =>
        ProductImage.create(
          { productId: created.id, url, sortOrder: index, isPrimary: index === 0 },
          { transaction: t }
        )
      )
    );

    await Promise.all(
      variantsInput.map((v, index) =>
        ProductVariant.create(
          {
            productId: created.id,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            quantity: v.quantity,
            attributes: v.attributes,
            isDefault: v.isDefault || index === 0,
          },
          { transaction: t }
        )
      )
    );

    return created;
  });

  const full = await Product.findByPk(product.id, { include: PRODUCT_INCLUDES });
  sendSuccess(res, { status: 201, message: "Product created successfully", data: serializeProduct(full) });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const updates = {};
  const directFields = [
    "description",
    "productDetails",
    "availability",
    "sku",
  ];
  for (const field of directFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.brandId !== undefined) updates.brandId = req.body.brandId || null;
  if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId || null;
  if (req.body.seriesId !== undefined) updates.seriesId = req.body.seriesId || null;
  if (req.body.isFeatured !== undefined) {
    updates.isFeatured = req.body.isFeatured === true || req.body.isFeatured === "true";
  }
  if (req.body.keyFeatures !== undefined) updates.keyFeatures = parseJsonField(req.body.keyFeatures, []);
  if (req.body.specifications !== undefined) updates.specifications = parseJsonField(req.body.specifications, {});
  if (req.body.tags !== undefined) updates.tags = parseJsonField(req.body.tags, []);

  await sequelize.transaction(async (t) => {
    await product.update(updates, { transaction: t });

    // Images: `existingImages` (JSON array of URLs to keep) + newly uploaded files, mirroring the create flow.
    const newImagePaths = collectUploadedImagePaths(req.files);
    if (req.body.existingImages !== undefined || newImagePaths.length) {
      const keepUrls = new Set(parseJsonField(req.body.existingImages, []) || []);
      const currentImages = await ProductImage.findAll({ where: { productId: product.id }, transaction: t });
      await Promise.all(
        currentImages
          .filter((img) => !keepUrls.has(img.url))
          .map((img) => img.destroy({ transaction: t }))
      );
      const keptCount = currentImages.filter((img) => keepUrls.has(img.url)).length;
      await Promise.all(
        newImagePaths.map((url, i) =>
          ProductImage.create(
            { productId: product.id, url, sortOrder: keptCount + i, isPrimary: keptCount + i === 0 },
            { transaction: t }
          )
        )
      );
    }

    // Variants: when provided, the submitted list is the full desired state - update existing,
    // create new, soft-delete any that were removed from the list.
    if (req.body.variants !== undefined) {
      const variantsInput = parseVariantsInput(req.body.variants);
      const existingVariants = await ProductVariant.findAll({ where: { productId: product.id }, transaction: t });
      const submittedIds = new Set(variantsInput.filter((v) => v.id).map((v) => v.id));

      await Promise.all(
        existingVariants
          .filter((v) => !submittedIds.has(v.id))
          .map((v) => v.destroy({ transaction: t }))
      );

      await Promise.all(
        variantsInput.map(async (v, index) => {
          const payload = {
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            quantity: v.quantity,
            attributes: v.attributes,
            isDefault: v.isDefault || (index === 0 && !variantsInput.some((x) => x.isDefault)),
          };
          if (v.id) {
            const existing = existingVariants.find((e) => e.id === v.id);
            if (existing) return existing.update(payload, { transaction: t });
          }
          return ProductVariant.create({ ...payload, productId: product.id }, { transaction: t });
        })
      );
    }
  });

  const full = await Product.findByPk(product.id, { include: PRODUCT_INCLUDES });
  sendSuccess(res, { message: "Product updated successfully", data: serializeProduct(full) });
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const { status, includeDeleted, brandId, categoryId, seriesId, featured } = req.query;
  const where = {};
  if (brandId) where.brandId = brandId;
  if (categoryId) where.categoryId = categoryId;
  if (seriesId) where.seriesId = seriesId;
  if (featured === "true") where.isFeatured = true;

  let paranoid = true;
  if (status === "deleted") {
    where.deletedAt = { [Op.ne]: null };
    paranoid = false;
  } else if (includeDeleted === "true") {
    paranoid = false;
  }

  const products = await Product.findAll({
    where,
    include: PRODUCT_INCLUDES,
    paranoid,
    order: [["createdAt", "DESC"]],
  });

  sendSuccess(res, { data: products.map(serializeProduct), meta: { count: products.length } });
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { isFeatured: true },
    include: PRODUCT_INCLUDES,
    order: [["createdAt", "DESC"]],
  });
  sendSuccess(res, { data: products.map(serializeProduct) });
});

exports.searchProducts = asyncHandler(async (req, res) => {
  const { name, brandId, categoryId, seriesId, minPrice, maxPrice, inStock } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (brandId) where.brandId = brandId;
  if (categoryId) where.categoryId = categoryId;
  if (seriesId) where.seriesId = seriesId;

  const variantWhere = {};
  if (minPrice) variantWhere.price = { ...variantWhere.price, [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) variantWhere.price = { ...variantWhere.price, [Op.lte]: parseFloat(maxPrice) };
  if (inStock === "true") variantWhere.quantity = { [Op.gt]: 0 };

  const products = await Product.findAll({
    where,
    include: [
      ...PRODUCT_INCLUDES.filter((i) => i.as !== "variants"),
      { model: ProductVariant, as: "variants", where: Object.keys(variantWhere).length ? variantWhere : undefined, required: Object.keys(variantWhere).length > 0 },
    ],
    order: [["createdAt", "DESC"]],
  });

  sendSuccess(res, { data: products.map(serializeProduct), meta: { count: products.length } });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const product = await Product.findByPk(req.params.id, {
    include: PRODUCT_INCLUDES,
    paranoid: !includeDeleted,
  });
  if (!product) throw new ApiError(404, "Product not found");
  sendSuccess(res, {
    data: { ...serializeProduct(product), status: product.deletedAt ? "deleted" : "active" },
  });
});

exports.getProductBySKU = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ where: { sku: req.params.sku }, include: PRODUCT_INCLUDES });
  if (!product) throw new ApiError(404, "Product not found");
  sendSuccess(res, { data: serializeProduct(product) });
});

exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { categoryId: req.params.categoryId },
    include: PRODUCT_INCLUDES,
  });
  sendSuccess(res, { data: products.map(serializeProduct), meta: { count: products.length } });
});

exports.getProductsBySeries = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { seriesId: req.params.seriesId },
    include: PRODUCT_INCLUDES,
  });
  sendSuccess(res, { data: products.map(serializeProduct), meta: { count: products.length } });
});

exports.updateProductRating = asyncHandler(async (req, res) => {
  const { rating, reviewCount } = req.body;
  requireFields(req.body, ["rating", "reviewCount"]);
  const newRating = parseFloat(rating);
  if (isNaN(newRating) || newRating < 0 || newRating > 5) {
    throw new ApiError(400, "Rating must be between 0 and 5");
  }
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  await product.update({ rating: newRating, reviewCount: parseInt(reviewCount, 10) });
  sendSuccess(res, { message: "Product rating updated successfully", data: { id: product.id, rating: newRating, reviewCount } });
});

exports.updateProductStock = asyncHandler(async (req, res) => {
  const { quantity, variantId } = req.body;
  if (quantity === undefined || isNaN(parseInt(quantity, 10))) {
    throw new ApiError(400, "Valid quantity is required");
  }
  const variants = await ProductVariant.findAll({ where: { productId: req.params.id } });
  if (!variants.length) throw new ApiError(404, "Product not found or has no variants");

  const target = variantId ? variants.find((v) => v.id === variantId) : variants[0];
  if (!target) throw new ApiError(404, "Variant not found");
  if (!variantId && variants.length > 1) {
    throw new ApiError(400, "Product has multiple variants - specify variantId");
  }

  await target.update({ quantity: parseInt(quantity, 10) });
  sendSuccess(res, { message: "Stock updated successfully", data: { variantId: target.id, quantity: target.quantity } });
});

async function countDependencies(productId) {
  const { CartItem, OrderItem, SaleProduct, SaleGiftProduct, SaleProductGift } = require("../models");
  const [cartItems, orderItems, saleProducts, saleGiftAsGift, saleProductGiftAsMain, saleProductGiftAsGift] =
    await Promise.all([
      CartItem.count({ where: { productId } }),
      OrderItem.count({ where: { productId } }),
      SaleProduct.count({ where: { productId } }),
      SaleGiftProduct.count({ where: { giftProductId: productId } }),
      SaleProductGift.count({ where: { mainProductId: productId } }),
      SaleProductGift.count({ where: { giftProductId: productId } }),
    ]);
  const dependencies = {
    cartItems,
    orderItems,
    saleProducts,
    saleGifts: saleGiftAsGift + saleProductGiftAsMain + saleProductGiftAsGift,
  };
  const total = Object.values(dependencies).reduce((sum, n) => sum + n, 0);
  return { dependencies, total, canDelete: total === 0 };
}

exports.checkProductDependencies = asyncHandler(async (req, res) => {
  const result = await countDependencies(req.params.id);
  sendSuccess(res, {
    data: {
      productId: req.params.id,
      canHardDelete: result.canDelete,
      totalDependencies: result.total,
      dependencies: result.dependencies,
      recommendation: result.canDelete ? "Safe to hard delete" : "Use soft delete - has dependent records",
    },
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { hard = false, force = false } = req.body;
  const product = await Product.findByPk(req.params.id, { paranoid: false });
  if (!product) throw new ApiError(404, "Product not found");

  if (hard) {
    if (!force) {
      const check = await countDependencies(product.id);
      if (!check.canDelete) {
        throw new ApiError(
          409,
          `Cannot permanently delete: ${check.total} dependent record(s) found. Use soft delete or force=true.`
        );
      }
    }
    await product.destroy({ force: true });
    return sendSuccess(res, { message: "Product permanently deleted", data: { id: product.id, type: "hard_delete" } });
  }

  if (product.deletedAt) throw new ApiError(400, "Product is already deleted");
  await product.update({ deletedReason: req.body.reason || "Deleted by admin" });
  await product.destroy(); // paranoid soft-delete
  sendSuccess(res, { message: "Product deleted successfully (can be restored)", data: { id: product.id, type: "soft_delete" } });
});

exports.restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, { paranoid: false });
  if (!product || !product.deletedAt) throw new ApiError(404, "Product not found or not deleted");
  await product.restore();
  await product.update({ deletedReason: null });
  sendSuccess(res, { message: "Product restored successfully", data: { id: product.id } });
});

exports.getDeletedProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { deletedAt: { [Op.ne]: null } },
    paranoid: false,
    include: PRODUCT_INCLUDES,
    order: [["deletedAt", "DESC"]],
  });
  sendSuccess(res, { data: products.map(serializeProduct), meta: { count: products.length } });
});

exports.bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds, hard = false, force = false, reason } = req.body;
  if (!Array.isArray(productIds) || !productIds.length) {
    throw new ApiError(400, "Product IDs array is required");
  }
  const results = { successful: [], failed: [] };
  for (const id of productIds) {
    try {
      const product = await Product.findByPk(id, { paranoid: false });
      if (!product) throw new Error("Not found");
      if (hard) {
        if (!force) {
          const check = await countDependencies(id);
          if (!check.canDelete) throw new Error(`${check.total} dependent record(s)`);
        }
        await product.destroy({ force: true });
      } else {
        await product.update({ deletedReason: reason || "Bulk delete operation" });
        await product.destroy();
      }
      results.successful.push({ productId: id });
    } catch (error) {
      results.failed.push({ productId: id, error: error.message });
    }
  }
  sendSuccess(res, {
    status: results.failed.length ? 207 : 200,
    message: `Bulk delete: ${results.successful.length} successful, ${results.failed.length} failed`,
    data: results,
  });
});

exports.bulkRestoreProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || !productIds.length) {
    throw new ApiError(400, "Product IDs array is required");
  }
  const results = { successful: [], failed: [] };
  for (const id of productIds) {
    try {
      const product = await Product.findByPk(id, { paranoid: false });
      if (!product || !product.deletedAt) throw new Error("Not found or not deleted");
      await product.restore();
      await product.update({ deletedReason: null });
      results.successful.push({ productId: id });
    } catch (error) {
      results.failed.push({ productId: id, error: error.message });
    }
  }
  sendSuccess(res, {
    status: results.failed.length ? 207 : 200,
    message: `Bulk restore: ${results.successful.length} successful, ${results.failed.length} failed`,
    data: results,
  });
});
