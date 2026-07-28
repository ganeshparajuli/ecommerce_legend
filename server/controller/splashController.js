const { Op } = require("sequelize");
const { SplashScreen, Product } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

const FIELDS = [
  "title",
  "description",
  "imageUrl",
  "productId",
  "isActive",
  "displayOrder",
  "startDate",
  "endDate",
  "buttonText",
  "buttonLink",
  "backgroundColor",
  "textColor",
];

exports.createSplash = asyncHandler(async (req, res) => {
  requireFields(req.body, ["title"]);
  const payload = { title: req.body.title.trim() };
  for (const field of FIELDS) if (field !== "title" && req.body[field] !== undefined) payload[field] = req.body[field];

  const splash = await SplashScreen.create(payload);
  sendSuccess(res, { status: 201, message: "Splash screen created successfully", data: splash });
});

exports.getAllSplash = asyncHandler(async (req, res) => {
  const splash = await SplashScreen.findAll({ order: [["displayOrder", "ASC"]] });
  sendSuccess(res, { data: splash, meta: { count: splash.length } });
});

exports.getActiveSplash = asyncHandler(async (req, res) => {
  const now = new Date();
  const splash = await SplashScreen.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        { [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: now } }] },
        { [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }] },
      ],
    },
    include: [{ model: Product, as: "product" }],
    order: [["displayOrder", "ASC"]],
  });
  sendSuccess(res, { data: splash, meta: { count: splash.length } });
});

exports.getSplashById = asyncHandler(async (req, res) => {
  const splash = await SplashScreen.findByPk(req.params.id, { include: [{ model: Product, as: "product" }] });
  if (!splash) throw new ApiError(404, "Splash screen not found");
  sendSuccess(res, { data: splash });
});

exports.getSplashByProductId = asyncHandler(async (req, res) => {
  const splash = await SplashScreen.findAll({ where: { productId: req.params.productId } });
  sendSuccess(res, { data: splash, meta: { count: splash.length } });
});

exports.updateSplash = asyncHandler(async (req, res) => {
  if (req.body.title !== undefined && !req.body.title.trim()) {
    throw new ApiError(400, "Splash title must be a non-empty string");
  }
  const splash = await SplashScreen.findByPk(req.params.id);
  if (!splash) throw new ApiError(404, "Splash screen not found");

  const updates = {};
  for (const field of FIELDS) if (req.body[field] !== undefined) updates[field] = req.body[field];
  await splash.update(updates);
  sendSuccess(res, { message: "Splash screen updated successfully", data: splash });
});

exports.deleteSplash = asyncHandler(async (req, res) => {
  const deleted = await SplashScreen.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Splash screen not found");
  sendSuccess(res, { message: "Splash screen deleted successfully" });
});

exports.toggleSplashStatus = asyncHandler(async (req, res) => {
  const splash = await SplashScreen.findByPk(req.params.id);
  if (!splash) throw new ApiError(404, "Splash screen not found");
  await splash.update({ isActive: !splash.isActive });
  sendSuccess(res, { message: `Splash screen ${splash.isActive ? "activated" : "deactivated"} successfully`, data: splash });
});

exports.updateDisplayOrders = asyncHandler(async (req, res) => {
  const { orderUpdates } = req.body;
  if (!Array.isArray(orderUpdates) || !orderUpdates.length) {
    throw new ApiError(400, "orderUpdates must be a non-empty array");
  }
  for (const update of orderUpdates) {
    if (!update.id || update.displayOrder === undefined) {
      throw new ApiError(400, "Each update must have id and displayOrder properties");
    }
  }
  await Promise.all(orderUpdates.map((u) => SplashScreen.update({ displayOrder: u.displayOrder }, { where: { id: u.id } })));
  sendSuccess(res, { message: "Display orders updated successfully" });
});

exports.bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body;
  if (!Array.isArray(ids) || !ids.length) throw new ApiError(400, "ids must be a non-empty array");
  if (typeof isActive !== "boolean") throw new ApiError(400, "isActive must be a boolean value");

  await SplashScreen.update({ isActive }, { where: { id: ids } });
  sendSuccess(res, { message: `${ids.length} splash screens ${isActive ? "activated" : "deactivated"} successfully` });
});

exports.getSplashStats = asyncHandler(async (req, res) => {
  const [total, active, inactive] = await Promise.all([
    SplashScreen.count(),
    SplashScreen.count({ where: { isActive: true } }),
    SplashScreen.count({ where: { isActive: false } }),
  ]);
  sendSuccess(res, { data: { stats: { total, active, inactive } } });
});
