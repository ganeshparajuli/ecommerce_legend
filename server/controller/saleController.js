const { fn, col } = require("sequelize");
const {
  Sale,
  SaleProduct,
  SaleGiftProduct,
  SaleProductGift,
  Product,
  ProductImage,
  ProductVariant,
  sequelize,
} = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

const VALID_STATUSES = ["draft", "scheduled", "active", "ended"];

async function withProductCount(sales) {
  const rows = await SaleProduct.findAll({ where: { saleId: sales.map((s) => s.id) }, raw: true });
  const countMap = new Map();
  for (const row of rows) countMap.set(row.saleId, (countMap.get(row.saleId) || 0) + 1);
  return sales.map((s) => ({ ...s.toJSON(), productCount: countMap.get(s.id) || 0 }));
}

exports.getAllSales = asyncHandler(async (req, res) => {
  const sales = await Sale.findAll({ order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: { sales: await withProductCount(sales) } });
});

exports.getSalesByStatus = asyncHandler(async (req, res) => {
  if (!VALID_STATUSES.includes(req.params.status)) throw new ApiError(400, "Invalid status");
  const sales = await Sale.findAll({ where: { status: req.params.status }, order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: { sales: await withProductCount(sales) } });
});

exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findByPk(req.params.id);
  if (!sale) throw new ApiError(404, "Sale not found");
  const products = await getSaleProductsData(sale.id);
  sendSuccess(res, { data: { sale: { ...sale.toJSON(), products } } });
});

async function getSaleProductsData(saleId) {
  const productIds = (await SaleProduct.findAll({ where: { saleId }, attributes: ["productId"], raw: true })).map(
    (r) => r.productId
  );
  if (!productIds.length) return [];

  const products = await Product.findAll({
    where: { id: productIds },
    include: [
      { model: ProductImage, as: "images", separate: true, limit: 1, order: [["sortOrder", "ASC"]] },
      { model: ProductVariant, as: "variants", separate: true },
    ],
  });
  return products.map((p) => ({ ...p.toJSON(), priceRange: p.priceRange, defaultVariant: p.defaultVariant }));
}

exports.getSaleProducts = asyncHandler(async (req, res) => {
  const products = await getSaleProductsData(req.params.id);
  sendSuccess(res, { data: { products }, meta: { count: products.length } });
});

exports.createSale = asyncHandler(async (req, res) => {
  const { name, description, discountType, discountValue, startDate, endDate, status, productIds } = req.body;
  requireFields(req.body, ["name"]);

  const existing = await Sale.findOne({ where: { name } });
  if (existing) throw new ApiError(400, "Sale with this name already exists");

  const sale = await sequelize.transaction(async (t) => {
    const created = await Sale.create(
      { name, description, discountType: discountType || "percentage", discountValue: discountValue || 0, startDate, endDate, status: status || "draft" },
      { transaction: t }
    );
    if (Array.isArray(productIds) && productIds.length) {
      await SaleProduct.bulkCreate(productIds.map((productId) => ({ saleId: created.id, productId })), { transaction: t });
    }
    return created;
  });

  sendSuccess(res, { status: 201, message: "Sale created successfully", data: { sale: { ...sale.toJSON(), productCount: productIds?.length || 0 } } });
});

exports.updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findByPk(req.params.id);
  if (!sale) throw new ApiError(404, "Sale not found");

  const { productIds, ...fields } = req.body;
  const allowed = ["name", "description", "discountType", "discountValue", "startDate", "endDate", "status"];
  const updates = {};
  for (const key of allowed) if (fields[key] !== undefined) updates[key] = fields[key];

  await sequelize.transaction(async (t) => {
    if (Object.keys(updates).length) await sale.update(updates, { transaction: t });
    if (Array.isArray(productIds)) {
      await SaleProduct.destroy({ where: { saleId: sale.id }, transaction: t });
      if (productIds.length) {
        await SaleProduct.bulkCreate(productIds.map((productId) => ({ saleId: sale.id, productId })), { transaction: t });
      }
    }
  });

  sendSuccess(res, { message: "Sale updated successfully", data: { sale, updatedFields: Object.keys(req.body) } });
});

exports.deleteSale = asyncHandler(async (req, res) => {
  const deleted = await Sale.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Sale not found");
  sendSuccess(res, { message: "Sale deleted successfully" });
});

exports.addProductsToSale = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || !productIds.length) throw new ApiError(400, "Product IDs must be a non-empty array");
  const sale = await Sale.findByPk(req.params.id);
  if (!sale) throw new ApiError(404, "Sale not found");

  await sequelize.transaction(async (t) => {
    await SaleProduct.destroy({ where: { saleId: sale.id }, transaction: t });
    await SaleProduct.bulkCreate(productIds.map((productId) => ({ saleId: sale.id, productId })), { transaction: t });
  });
  sendSuccess(res, { message: "Products added to sale successfully", data: { productCount: productIds.length } });
});

exports.getSalesAnalytics = asyncHandler(async (req, res) => {
  const rows = await Sale.findAll({ attributes: ["status", [fn("COUNT", col("id")), "count"]], group: ["status"], raw: true });
  const analytics = { active: 0, scheduled: 0, ended: 0, draft: 0, totalRevenue: 0 };
  for (const row of rows) analytics[row.status] = parseInt(row.count, 10);
  sendSuccess(res, { data: { analytics } });
});

exports.getSaleGifts = asyncHandler(async (req, res) => {
  const [saleGifts, productGifts] = await Promise.all([
    SaleGiftProduct.findAll({ where: { saleId: req.params.id, isActive: true }, include: [{ model: Product, as: "giftProduct" }] }),
    SaleProductGift.findAll({
      where: { saleId: req.params.id, isActive: true },
      include: [
        { model: Product, as: "giftProduct" },
        { model: Product, as: "mainProduct" },
      ],
    }),
  ]);
  sendSuccess(res, { data: { gifts: { saleGifts, productGifts } } });
});

exports.updateSaleGifts = asyncHandler(async (req, res) => {
  const sale = await Sale.findByPk(req.params.id);
  if (!sale) throw new ApiError(404, "Sale not found");

  const { saleGifts, productGifts } = req.body;
  await sequelize.transaction(async (t) => {
    if (saleGifts) {
      await SaleGiftProduct.destroy({ where: { saleId: sale.id }, transaction: t });
      await SaleGiftProduct.bulkCreate(
        saleGifts.map((g) => ({
          saleId: sale.id,
          giftProductId: g.productId,
          giftQuantity: g.quantity || 1,
          minPurchaseAmount: g.minPurchaseAmount || 0,
          minQuantity: g.minQuantity || 1,
          maxGiftsPerOrder: g.maxGiftsPerOrder || 1,
        })),
        { transaction: t }
      );
    }
    if (productGifts) {
      await SaleProductGift.destroy({ where: { saleId: sale.id }, transaction: t });
      await SaleProductGift.bulkCreate(
        productGifts.map((g) => ({
          saleId: sale.id,
          mainProductId: g.mainProductId,
          giftProductId: g.giftProductId,
          giftQuantity: g.giftQuantity || 1,
          minMainQuantity: g.minMainQuantity || 1,
          maxGiftsPerOrder: g.maxGiftsPerOrder || 1,
        })),
        { transaction: t }
      );
    }
  });

  sendSuccess(res, { message: "Sale gifts updated successfully" });
});

exports.calculateCartGifts = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;
  if (!Array.isArray(cartItems)) throw new ApiError(400, "Cart items are required");
  const saleId = req.params.saleId;

  const applicableGifts = [];
  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const saleGifts = await SaleGiftProduct.findAll({ where: { saleId, isActive: true }, include: [{ model: Product, as: "giftProduct" }] });
  for (const gift of saleGifts) {
    if (totalAmount >= gift.minPurchaseAmount && totalQty >= gift.minQuantity) {
      applicableGifts.push({
        type: "sale_gift",
        giftProductId: gift.giftProductId,
        giftProductName: gift.giftProduct?.name,
        giftQuantity: Math.min(gift.giftQuantity, gift.maxGiftsPerOrder),
        reason: `Sale gift: Spend ${gift.minPurchaseAmount}+`,
      });
    }
  }

  const productGifts = await SaleProductGift.findAll({
    where: { saleId, isActive: true },
    include: [
      { model: Product, as: "giftProduct" },
      { model: Product, as: "mainProduct" },
    ],
  });
  for (const item of cartItems) {
    const relevant = productGifts.filter((g) => g.mainProductId === item.productId);
    for (const gift of relevant) {
      if (item.quantity >= gift.minMainQuantity) {
        const giftQuantity = Math.floor(item.quantity / gift.minMainQuantity) * gift.giftQuantity;
        applicableGifts.push({
          type: "product_gift",
          giftProductId: gift.giftProductId,
          giftProductName: gift.giftProduct?.name,
          giftQuantity: Math.min(giftQuantity, gift.maxGiftsPerOrder),
          mainProductId: item.productId,
          reason: `Free with ${gift.mainProduct?.name}`,
        });
      }
    }
  }

  sendSuccess(res, { data: { applicableGifts } });
});
