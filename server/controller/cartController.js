const { CartItem, ProductVariant, Product, ProductImage, Sale } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");

const ITEM_INCLUDES = [
  {
    model: ProductVariant,
    as: "variant",
    include: [{ model: Product, as: "product", include: [{ model: ProductImage, as: "images", separate: true, limit: 1, order: [["sortOrder", "ASC"]] }] }],
  },
  { model: Sale, as: "sale" },
];

function effectivePrice(variant, sale) {
  const base = variant.price;
  if (!sale || sale.status !== "active") return { price: base, isOnSale: false };
  const discount =
    sale.discountType === "percentage" ? base * (sale.discountValue / 100) : sale.discountValue;
  return { price: Math.max(0, base - discount), isOnSale: true, discountType: sale.discountType, discountValue: sale.discountValue };
}

function serializeCartItem(item) {
  const { price, ...saleInfo } = effectivePrice(item.variant, item.sale);
  return {
    id: item.id,
    productId: item.productId,
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    selected: item.selected,
    price,
    ...saleInfo,
    variant: item.variant
      ? {
          id: item.variant.id,
          sku: item.variant.sku,
          price: item.variant.price,
          compareAtPrice: item.variant.compareAtPrice,
          quantity: item.variant.quantity,
          attributes: item.variant.attributes,
        }
      : null,
    product: item.variant?.product
      ? {
          id: item.variant.product.id,
          name: item.variant.product.name,
          image: item.variant.product.images?.[0]?.url || null,
        }
      : null,
  };
}

exports.addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productVariantId, quantity = 1, saleId } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productVariantId) throw new ApiError(400, "productVariantId is required");
  if (!Number.isFinite(qty) || qty < 1) throw new ApiError(400, "Valid quantity is required");

  const variant = await ProductVariant.findByPk(productVariantId, { include: [{ model: Product, as: "product" }] });
  if (!variant) throw new ApiError(404, "Product variant not found");

  const existing = await CartItem.findOne({ where: { userId, productVariantId } });
  const desiredQty = qty + (existing ? existing.quantity : 0);
  if (variant.quantity < desiredQty) {
    throw new ApiError(400, `Only ${variant.quantity} in stock`);
  }

  let item;
  if (existing) {
    item = await existing.update({ quantity: desiredQty, saleId: saleId || existing.saleId });
  } else {
    item = await CartItem.create({
      userId,
      productId: variant.productId,
      productVariantId,
      quantity: qty,
      saleId: saleId || null,
    });
  }

  const full = await CartItem.findByPk(item.id, { include: ITEM_INCLUDES });
  sendSuccess(res, { status: 201, message: "Item added to cart successfully", data: serializeCartItem(full) });
});

exports.getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.findAll({ where: { userId: req.user.id }, include: ITEM_INCLUDES, order: [["createdAt", "DESC"]] });
  const serialized = items.map(serializeCartItem);
  const cartTotal = serialized.reduce((sum, i) => sum + i.price * i.quantity, 0);
  sendSuccess(res, { data: { cartItems: serialized, cartTotal, itemCount: serialized.length } });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity, selected } = req.body;

  const item = await CartItem.findOne({ where: { userId: req.user.id, productVariantId: variantId } });
  if (!item) throw new ApiError(404, "Item not found in cart");

  const updates = {};
  if (quantity !== undefined) {
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) throw new ApiError(400, "Valid quantity is required");
    const variant = await ProductVariant.findByPk(variantId);
    if (variant.quantity < qty) throw new ApiError(400, `Only ${variant.quantity} in stock`);
    updates.quantity = qty;
  }
  if (selected !== undefined) updates.selected = !!selected;

  await item.update(updates);
  const full = await CartItem.findByPk(item.id, { include: ITEM_INCLUDES });
  sendSuccess(res, { message: "Cart item updated successfully", data: serializeCartItem(full) });
});

exports.toggleCartItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findOne({ where: { userId: req.user.id, productVariantId: req.params.variantId } });
  if (!item) throw new ApiError(404, "Item not found in cart");
  await item.update({ selected: !item.selected });
  const full = await CartItem.findByPk(item.id, { include: ITEM_INCLUDES });
  sendSuccess(res, { message: "Cart item selection toggled successfully", data: serializeCartItem(full) });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const deleted = await CartItem.destroy({ where: { userId: req.user.id, productVariantId: req.params.variantId } });
  if (!deleted) throw new ApiError(404, "Item not found in cart");
  sendSuccess(res, { message: "Item removed from cart successfully" });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await CartItem.destroy({ where: { userId: req.user.id } });
  sendSuccess(res, { message: "Cart cleared successfully" });
});

exports.getCartCount = asyncHandler(async (req, res) => {
  const count = await CartItem.count({ where: { userId: req.user.id } });
  sendSuccess(res, { data: { count } });
});
