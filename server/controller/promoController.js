const { Op } = require("sequelize");
const { PromoCode } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.createPromoCode = asyncHandler(async (req, res) => {
  requireFields(req.body, ["code", "maxDiscountAmount", "validFrom", "validUntil"]);
  const existing = await PromoCode.findOne({ where: { code: req.body.code } });
  if (existing) throw new ApiError(400, "Promo code already exists");

  const promoCode = await PromoCode.create({
    code: req.body.code,
    description: req.body.description,
    minPurchase: req.body.minPurchase || 0,
    maxDiscountAmount: req.body.maxDiscountAmount,
    validFrom: req.body.validFrom,
    validUntil: req.body.validUntil,
    maxUses: req.body.maxUses || 0,
    isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
  });
  sendSuccess(res, { status: 201, message: "Promo code created successfully", data: promoCode });
});

exports.getAllPromoCodes = asyncHandler(async (req, res) => {
  const promoCodes = await PromoCode.findAll({ order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: promoCodes, meta: { count: promoCodes.length } });
});

exports.getPromoCodeById = asyncHandler(async (req, res) => {
  const promoCode = await PromoCode.findByPk(req.params.id);
  if (!promoCode) throw new ApiError(404, "Promo code not found");
  sendSuccess(res, { message: "Promo fetched successfully", data: promoCode });
});

exports.updatePromoCode = asyncHandler(async (req, res) => {
  const promoCode = await PromoCode.findByPk(req.params.id);
  if (!promoCode) throw new ApiError(404, "Promo code not found");

  if (req.body.code && req.body.code !== promoCode.code) {
    const codeExists = await PromoCode.findOne({ where: { code: req.body.code } });
    if (codeExists) throw new ApiError(400, "Promo code already exists");
  }

  const allowed = ["code", "description", "minPurchase", "maxDiscountAmount", "validFrom", "validUntil", "maxUses", "isActive"];
  const updates = {};
  for (const field of allowed) if (req.body[field] !== undefined) updates[field] = req.body[field];

  await promoCode.update(updates);
  sendSuccess(res, { message: "Promo code updated successfully", data: promoCode });
});

exports.deletePromoCode = asyncHandler(async (req, res) => {
  const deleted = await PromoCode.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Promo code not found");
  sendSuccess(res, { message: "Promo code deleted successfully" });
});

exports.validatePromoCode = asyncHandler(async (req, res) => {
  const { code, purchaseAmount } = req.body;
  requireFields(req.body, ["code"]);
  if (purchaseAmount === undefined) throw new ApiError(400, "Purchase amount is required");

  const promo = await PromoCode.findOne({ where: { code } });
  if (!promo) throw new ApiError(400, "Invalid promo code");

  const now = new Date();
  if (!promo.isActive) throw new ApiError(400, "This promo code is not active");
  if (now < promo.validFrom || now > promo.validUntil) throw new ApiError(400, "This promo code has expired");
  if (purchaseAmount < promo.minPurchase) {
    throw new ApiError(400, `Minimum purchase of ${promo.minPurchase} required`);
  }

  const discountAmount = Math.min(promo.maxDiscountAmount, purchaseAmount);
  sendSuccess(res, {
    message: "Promo code is valid",
    data: { promoCode: promo, discountAmount, finalAmount: purchaseAmount - discountAmount },
  });
});

exports.getActivePromoCodes = asyncHandler(async (req, res) => {
  const now = new Date();
  const promoCodes = await PromoCode.findAll({
    where: { isActive: true, validFrom: { [Op.lte]: now }, validUntil: { [Op.gte]: now } },
  });
  sendSuccess(res, { data: promoCodes, meta: { count: promoCodes.length } });
});

exports.runAutoExpiration = asyncHandler(async (req, res) => {
  const [expiredCount] = await PromoCode.update(
    { isActive: false },
    { where: { isActive: true, validUntil: { [Op.lt]: new Date() } } }
  );
  sendSuccess(res, { message: `${expiredCount} promo code(s) expired`, data: { expiredCount } });
});
