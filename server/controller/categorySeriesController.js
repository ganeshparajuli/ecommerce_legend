const { CategorySeries, Category } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.createCategorySeries = asyncHandler(async (req, res) => {
  const { series_name, category_id, is_active } = req.body;
  requireFields(req.body, ["series_name"]);

  const series = await CategorySeries.create({
    seriesName: series_name.trim(),
    categoryId: category_id || null,
    isActive: !!is_active,
  });
  sendSuccess(res, { status: 201, message: "CategorySeries created successfully", data: series });
});

exports.getAllCategoriesSeries = asyncHandler(async (req, res) => {
  const series = await CategorySeries.findAll({ include: [{ model: Category, as: "category" }], order: [["seriesName", "ASC"]] });
  sendSuccess(res, { data: series });
});

exports.getCategorySeriesById = asyncHandler(async (req, res) => {
  const series = await CategorySeries.findByPk(req.params.id, { include: [{ model: Category, as: "category" }] });
  if (!series) throw new ApiError(404, "Category series not found");
  sendSuccess(res, { data: series });
});

exports.updateCategorySeries = asyncHandler(async (req, res) => {
  const { series_name, category_id, is_active } = req.body;
  requireFields(req.body, ["series_name"]);

  const series = await CategorySeries.findByPk(req.params.id);
  if (!series) throw new ApiError(404, "Category series not found");

  await series.update({
    seriesName: series_name.trim(),
    categoryId: category_id !== undefined ? category_id : series.categoryId,
    isActive: is_active !== undefined ? !!is_active : series.isActive,
  });
  sendSuccess(res, { message: "Category series updated successfully", data: series });
});

exports.deleteCategorySeries = asyncHandler(async (req, res) => {
  const deleted = await CategorySeries.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Category series not found");
  sendSuccess(res, { message: "Category series deleted successfully" });
});
