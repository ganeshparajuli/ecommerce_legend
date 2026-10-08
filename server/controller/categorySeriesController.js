const { CategorySeries, Category, Brand } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

const SERIES_INCLUDES = [
  { model: Category, as: "category", include: [{ model: Brand, as: "brand" }] },
];

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
  const { categoryId } = req.query;
  const series = await CategorySeries.findAll({
    where: categoryId ? { categoryId } : undefined,
    include: SERIES_INCLUDES,
    order: [["seriesName", "ASC"]],
  });
  sendSuccess(res, { data: series });
});

exports.getCategorySeriesById = asyncHandler(async (req, res) => {
  const series = await CategorySeries.findByPk(req.params.id, { include: SERIES_INCLUDES });
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
