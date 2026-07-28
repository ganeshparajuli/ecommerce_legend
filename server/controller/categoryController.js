const { Category, Brand } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

exports.createCategory = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name"]);
  const name = req.body.name.trim();
  const category = await Category.create({ name, slug: slugify(name), brandId: req.body.brandId || null });
  sendSuccess(res, { status: 201, message: "Category created successfully", data: category });
});

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ include: [{ model: Brand, as: "brand" }], order: [["name", "ASC"]] });
  sendSuccess(res, { data: categories });
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id, { include: [{ model: Brand, as: "brand" }] });
  if (!category) throw new ApiError(404, "Category not found");
  sendSuccess(res, { data: category });
});

exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ where: { slug: req.params.slug } });
  if (!category) throw new ApiError(404, "Category not found");
  sendSuccess(res, { data: category });
});

exports.getCategoriesByBrandId = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ where: { brandId: req.params.brandId }, order: [["name", "ASC"]] });
  sendSuccess(res, { data: categories });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name"]);
  const category = await Category.findByPk(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const name = req.body.name.trim();
  await category.update({
    name,
    slug: slugify(name),
    brandId: req.body.brandId !== undefined ? req.body.brandId : category.brandId,
  });
  sendSuccess(res, { message: "Category updated successfully", data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const deleted = await Category.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Category not found");
  sendSuccess(res, { message: "Category deleted successfully" });
});
