const { Op } = require("sequelize");
const { Brand, Category } = require("../models");
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

exports.createBrand = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name"]);
  const name = req.body.name.trim();
  const brand = await Brand.create({
    name,
    slug: slugify(name),
    image: req.file ? `uploads/${req.file.filename}` : null,
  });
  sendSuccess(res, { status: 201, message: "Brand created successfully", data: brand });
});

exports.getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.findAll({ order: [["name", "ASC"]] });
  sendSuccess(res, { data: brands });
});

exports.getBrandsWithImages = asyncHandler(async (req, res) => {
  const brands = await Brand.findAll({ where: { image: { [Op.ne]: null } }, order: [["name", "ASC"]] });
  sendSuccess(res, { data: brands });
});

exports.getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");
  sendSuccess(res, { data: brand });
});

exports.getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ where: { slug: req.params.slug } });
  if (!brand) throw new ApiError(404, "Brand not found");
  sendSuccess(res, { data: brand });
});

exports.updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  const updates = {};
  if (req.body.name) {
    updates.name = req.body.name.trim();
    updates.slug = slugify(updates.name);
  }
  if (req.file) updates.image = `uploads/${req.file.filename}`;
  if (Object.keys(updates).length === 0) throw new ApiError(400, "No valid fields to update");

  await brand.update(updates);
  sendSuccess(res, { message: "Brand updated successfully", data: brand });
});

exports.updateBrandImage = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");
  if (!req.file) throw new ApiError(400, "No image file provided");
  await brand.update({ image: `uploads/${req.file.filename}` });
  sendSuccess(res, { message: "Brand image updated successfully", data: brand });
});

exports.removeBrandImage = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");
  await brand.update({ image: null });
  sendSuccess(res, { message: "Brand image removed successfully", data: brand });
});

exports.deleteBrand = asyncHandler(async (req, res) => {
  const deleted = await Brand.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Brand not found");
  sendSuccess(res, { message: "Brand deleted successfully" });
});

exports.getBrandWithCategories = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id, { include: [{ model: Category, as: "categories" }] });
  if (!brand) throw new ApiError(404, "Brand not found");
  sendSuccess(res, { data: brand });
});

exports.getBrandWithCategoriesBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ where: { slug: req.params.slug }, include: [{ model: Category, as: "categories" }] });
  if (!brand) throw new ApiError(404, "Brand not found");
  sendSuccess(res, { data: brand });
});
