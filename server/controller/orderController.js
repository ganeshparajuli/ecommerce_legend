const { Order, OrderItem, ProductVariant, Product, ProductImage, PromoCode, sequelize } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

const STAFF_ROLES = ["admin", "sub-admin", "sales", "finance"];
const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const ORDER_INCLUDES = [
  {
    model: OrderItem,
    as: "items",
    include: [
      { model: Product, as: "product", include: [{ model: ProductImage, as: "images", separate: true, limit: 1, order: [["sortOrder", "ASC"]] }] },
      { model: ProductVariant, as: "variant" },
    ],
  },
];

function canAccessOrder(user, order) {
  return user.id === order.userId || STAFF_ROLES.includes(user.role);
}

exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, orderItems, paymentMethod, promoCode } = req.body;
  requireFields(req.body, ["shippingAddress"]);
  if (!Array.isArray(orderItems) || !orderItems.length) {
    throw new ApiError(400, "At least one order item is required");
  }

  const order = await sequelize.transaction(async (t) => {
    let subtotal = 0;
    const itemsToCreate = [];

    for (const requested of orderItems) {
      const { productVariantId, quantity } = requested;
      if (!productVariantId || !quantity || quantity < 1) {
        throw new ApiError(400, "Each order item needs a productVariantId and quantity >= 1");
      }

      // Row-lock the variant so concurrent orders can't oversell the same stock.
      const variant = await ProductVariant.findByPk(productVariantId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!variant) throw new ApiError(404, `Product variant ${productVariantId} not found`);
      if (variant.quantity < quantity) {
        throw new ApiError(400, `Insufficient stock for variant ${productVariantId}: ${variant.quantity} available`);
      }

      await variant.update({ quantity: variant.quantity - quantity }, { transaction: t });

      // Price is always computed server-side from the current variant price - never trust the client.
      const price = variant.price;
      subtotal += price * quantity;
      itemsToCreate.push({
        productId: variant.productId,
        productVariantId: variant.id,
        quantity,
        price,
        originalPrice: variant.compareAtPrice || price,
      });
    }

    // Promo code discount is recomputed and clamped server-side rather than trusting a client total.
    let discountAmount = 0;
    let appliedPromoCode = null;
    if (promoCode) {
      const promo = await PromoCode.findOne({ where: { code: promoCode }, transaction: t });
      const now = new Date();
      if (
        promo &&
        promo.isActive &&
        now >= promo.validFrom &&
        now <= promo.validUntil &&
        subtotal >= promo.minPurchase
      ) {
        discountAmount = Math.min(promo.maxDiscountAmount, subtotal);
        appliedPromoCode = promo.code;
      }
    }

    const newOrder = await Order.create(
      {
        userId: req.user.id,
        totalAmount: Math.max(0, subtotal - discountAmount),
        shippingAddress,
        paymentMethod: paymentMethod || "cod",
        status: "pending",
        promoCode: appliedPromoCode,
        discountAmount,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      itemsToCreate.map((item) => ({ ...item, orderId: newOrder.id })),
      { transaction: t }
    );

    return newOrder;
  });

  const full = await Order.findByPk(order.id, { include: ORDER_INCLUDES });
  sendSuccess(res, { status: 201, message: "Order created successfully", data: full });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: ORDER_INCLUDES });
  if (!order) throw new ApiError(404, "Order not found");
  if (!canAccessOrder(req.user, order)) throw new ApiError(403, "Unauthorized to view this order");
  sendSuccess(res, { data: order });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId === "undefined" ? req.user.id : req.params.userId;
  if (req.user.id !== targetUserId && !STAFF_ROLES.includes(req.user.role)) {
    throw new ApiError(403, "Unauthorized to view these orders");
  }
  const orders = await Order.findAll({ where: { userId: targetUserId }, include: ORDER_INCLUDES, order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: orders });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { rows, count } = await Order.findAndCountAll({
    include: ORDER_INCLUDES,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
  sendSuccess(res, { data: rows, meta: { pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } } });
});

exports.getOrdersByStatus = asyncHandler(async (req, res) => {
  if (!VALID_STATUSES.includes(req.params.status)) throw new ApiError(400, "Invalid status");
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { rows, count } = await Order.findAndCountAll({
    where: { status: req.params.status },
    include: ORDER_INCLUDES,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
  sendSuccess(res, { data: rows, meta: { pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } } });
});

async function restockOrder(order, t) {
  const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
  for (const item of items) {
    await ProductVariant.increment("quantity", { by: item.quantity, where: { id: item.productVariantId }, transaction: t });
  }
}

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) throw new ApiError(400, "Invalid status");

  await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, "Order not found");

    if (status === "cancelled" && order.status !== "cancelled") {
      await restockOrder(order, t);
    }
    await order.update({ status }, { transaction: t });
  });

  sendSuccess(res, { message: "Order status updated successfully" });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, "Order not found");
    if (!canAccessOrder(req.user, order)) throw new ApiError(403, "Unauthorized to cancel this order");
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);
    }
    await restockOrder(order, t);
    await order.update({ status: "cancelled" }, { transaction: t });
  });

  sendSuccess(res, { message: "Order cancelled successfully" });
});

exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const { shippingAddress, paymentMethod, status } = req.body;
  if (status !== undefined && !VALID_STATUSES.includes(status)) throw new ApiError(400, "Invalid status");
  if (!STAFF_ROLES.includes(req.user.role) && order.status !== "pending") {
    throw new ApiError(400, "Can only modify orders with 'pending' status");
  }

  if (status === "cancelled") {
    await sequelize.transaction(async (t) => {
      await restockOrder(order, t);
      await order.update({ status: "cancelled" }, { transaction: t });
    });
    return sendSuccess(res, { message: "Order cancelled successfully" });
  }

  const updates = {};
  if (shippingAddress) updates.shippingAddress = shippingAddress;
  if (paymentMethod) updates.paymentMethod = paymentMethod;
  if (status) updates.status = status;
  await order.update(updates);
  sendSuccess(res, { message: "Order updated successfully" });
});
