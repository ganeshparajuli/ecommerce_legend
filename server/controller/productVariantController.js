const { Op } = require("sequelize");
const { ProductVariant, Product, CartItem, OrderItem } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.getAllProductVariants = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const where = {};
  if (req.query.productId) where.productId = req.query.productId;
  const variants = await ProductVariant.findAll({ where, paranoid: !includeDeleted, order: [["createdAt", "ASC"]] });
  sendSuccess(res, { data: variants });
});

exports.getProductVariantById = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const variant = await ProductVariant.findByPk(req.params.id, { paranoid: !includeDeleted });
  if (!variant) throw new ApiError(404, "Product variant not found");
  sendSuccess(res, { data: variant });
});

exports.createProductVariant = asyncHandler(async (req, res) => {
  requireFields(req.body, ["product_id", "price"]);
  const product = await Product.findByPk(req.body.product_id);
  if (!product) throw new ApiError(404, "Product not found");

  const price = parseFloat(req.body.price);
  if (!Number.isFinite(price) || price < 0) throw new ApiError(400, "Valid price is required");
  const compareAtPrice = req.body.compareAtPrice !== undefined ? parseFloat(req.body.compareAtPrice) : null;

  const variant = await ProductVariant.create({
    productId: req.body.product_id,
    sku: req.body.sku || undefined,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
    quantity: parseInt(req.body.quantity, 10) || 0,
    attributes: req.body.attributes && typeof req.body.attributes === "object" ? req.body.attributes : {},
    isDefault: !!req.body.isDefault,
  });

  sendSuccess(res, { status: 201, message: "Product variant created successfully", data: variant });
});

exports.updateProductVariant = asyncHandler(async (req, res) => {
  const variant = await ProductVariant.findByPk(req.params.id);
  if (!variant) throw new ApiError(404, "Product variant not found");

  const updates = {};
  if (req.body.sku !== undefined) updates.sku = req.body.sku;
  if (req.body.quantity !== undefined) updates.quantity = parseInt(req.body.quantity, 10) || 0;
  if (req.body.attributes !== undefined && typeof req.body.attributes === "object") {
    updates.attributes = req.body.attributes;
  }
  if (req.body.isDefault !== undefined) updates.isDefault = !!req.body.isDefault;

  const nextPrice = req.body.price !== undefined ? parseFloat(req.body.price) : variant.price;
  if (req.body.price !== undefined) {
    if (!Number.isFinite(nextPrice) || nextPrice < 0) throw new ApiError(400, "Valid price is required");
    updates.price = nextPrice;
  }
  if (req.body.compareAtPrice !== undefined) {
    const compareAtPrice = req.body.compareAtPrice === null ? null : parseFloat(req.body.compareAtPrice);
    updates.compareAtPrice = compareAtPrice && compareAtPrice > nextPrice ? compareAtPrice : null;
  }

  await variant.update(updates);
  sendSuccess(res, { message: "Product variant updated successfully", data: variant });
});

async function countVariantDependencies(variantId) {
  const [cartItems, orderItems] = await Promise.all([
    CartItem.count({ where: { productVariantId: variantId } }),
    OrderItem.count({ where: { productVariantId: variantId } }),
  ]);
  const total = cartItems + orderItems;
  return { dependencies: { cartItems, orderItems }, total, canDelete: total === 0 };
}

exports.deleteProductVariant = asyncHandler(async (req, res) => {
  const { hard = false, force = false, reason } = req.body;
  const variant = await ProductVariant.findByPk(req.params.id, { paranoid: false });
  if (!variant) throw new ApiError(404, "Product variant not found");

  const siblingCount = await ProductVariant.count({ where: { productId: variant.productId } });
  if (siblingCount <= 1) {
    throw new ApiError(400, "Cannot delete the only variant of a product - delete the product instead");
  }

  if (hard) {
    if (!force) {
      const check = await countVariantDependencies(variant.id);
      if (!check.canDelete) {
        throw new ApiError(409, `Cannot permanently delete: ${check.total} dependent record(s) found.`);
      }
    }
    await variant.destroy({ force: true });
    return sendSuccess(res, { message: "Product variant permanently deleted", data: { id: variant.id, type: "hard_delete" } });
  }

  if (variant.deletedAt) throw new ApiError(400, "Product variant is already deleted");
  await variant.update({ deletedReason: reason || "Deleted by admin" });
  await variant.destroy();
  sendSuccess(res, { message: "Product variant deleted successfully (can be restored)", data: { id: variant.id, type: "soft_delete" } });
});

exports.restoreProductVariant = asyncHandler(async (req, res) => {
  const variant = await ProductVariant.findByPk(req.params.id, { paranoid: false });
  if (!variant || !variant.deletedAt) throw new ApiError(404, "Product variant not found or not deleted");
  await variant.restore();
  await variant.update({ deletedReason: null });
  sendSuccess(res, { message: "Product variant restored successfully", data: variant });
});
