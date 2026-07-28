const { Service } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.findAll({ order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: services });
});

exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) throw new ApiError(404, "Service not found");
  sendSuccess(res, { data: service });
});

exports.createService = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name"]);
  const service = await Service.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
  });
  sendSuccess(res, { status: 201, data: service });
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) throw new ApiError(404, "Service not found");

  const allowed = ["name", "description", "price", "imageUrl"];
  const updates = {};
  for (const field of allowed) if (req.body[field] !== undefined) updates[field] = req.body[field];

  await service.update(updates);
  sendSuccess(res, { data: service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const deleted = await Service.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Service not found");
  sendSuccess(res, { message: "Service deleted successfully" });
});
