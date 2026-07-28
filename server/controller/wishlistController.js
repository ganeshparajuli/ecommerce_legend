const { Wishlist, Product, ProductImage, ProductVariant } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");

const PRODUCT_INCLUDE = {
  model: Product,
  as: "product",
  include: [
    { model: ProductImage, as: "images", separate: true, limit: 1, order: [["sortOrder", "ASC"]] },
    { model: ProductVariant, as: "variants", separate: true },
  ],
};

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw new ApiError(400, "Product ID is required");

  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const [item, created] = await Wishlist.findOrCreate({
    where: { userId: req.user.id, productId },
  });
  if (!created) throw new ApiError(400, "Product already in wishlist");

  sendSuccess(res, { status: 201, message: "Item added to wishlist", data: item });
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.findAll({ where: { userId: req.user.id }, include: [PRODUCT_INCLUDE], order: [["addedAt", "DESC"]] });
  sendSuccess(res, { data: items, meta: { count: items.length } });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const deleted = await Wishlist.destroy({ where: { id: req.params.id, userId: req.user.id } });
  if (!deleted) throw new ApiError(404, "Wishlist item not found");
  sendSuccess(res, { message: "Item removed from wishlist" });
});

exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
  const deleted = await Wishlist.destroy({ where: { productId: req.params.productId, userId: req.user.id } });
  if (!deleted) throw new ApiError(404, "Wishlist item not found");
  sendSuccess(res, { message: "Item removed from wishlist" });
});

exports.clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.destroy({ where: { userId: req.user.id } });
  sendSuccess(res, { message: "Wishlist cleared successfully" });
});
