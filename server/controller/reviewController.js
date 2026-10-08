const { Review, Product, User, sequelize } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const { Op } = require("sequelize");

async function recalculateProductRating(productId, transaction) {
  const [result] = await Review.findAll({
    where: { productId, isVisible: true },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    raw: true,
    transaction,
  });
  await Product.update(
    { rating: parseFloat(result.avgRating) || 0, reviewCount: parseInt(result.count, 10) || 0 },
    { where: { id: productId }, transaction }
  );
}

// Public: get visible reviews for a product
exports.getReviewsByProductId = asyncHandler(async (req, res) => {
  const isAdmin = req.user && ["admin", "sub-admin"].includes(req.user.role);
  const where = { productId: req.params.productId };
  if (!isAdmin) where.isVisible = true;

  const reviews = await Review.findAll({
    where,
    include: [{ model: User, as: "user", attributes: ["id", "name", "image"] }],
    order: [["createdAt", "DESC"]],
  });
  sendSuccess(res, { data: reviews });
});

// Admin: get all reviews
exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    include: [
      { model: User, as: "user", attributes: ["id", "name", "image"] },
      { model: Product, as: "product", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  sendSuccess(res, { data: reviews });
});

exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id, {
    include: [{ model: User, as: "user", attributes: ["id", "name", "image"] }],
  });
  if (!review) throw new ApiError(404, "Review not found");
  sendSuccess(res, { data: review });
});

// Authenticated users only
exports.createReview = asyncHandler(async (req, res) => {
  const { product_id, rating, comment } = req.body;
  if (!product_id || !rating || !comment) {
    throw new ApiError(400, "product_id, rating and comment are required");
  }

  const product = await Product.findByPk(product_id);
  if (!product) throw new ApiError(404, "Product not found");

  const ratingNum = parseInt(rating, 10);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // One review per user per product
  const existing = await Review.findOne({ where: { productId: product_id, userId: req.user.id } });
  if (existing) throw new ApiError(400, "You have already reviewed this product");

  const review = await sequelize.transaction(async (t) => {
    const created = await Review.create(
      {
        productId: product_id,
        userId: req.user.id,
        reviewerName: req.user.name,
        rating: ratingNum,
        comment,
        isVisible: true,
      },
      { transaction: t }
    );
    await recalculateProductRating(product_id, t);
    return created;
  });

  const withUser = await Review.findByPk(review.id, {
    include: [{ model: User, as: "user", attributes: ["id", "name", "image"] }],
  });
  sendSuccess(res, { status: 201, message: "Review submitted", data: withUser });
});

// Admin: toggle visibility
exports.toggleReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  await sequelize.transaction(async (t) => {
    await review.update({ isVisible: !review.isVisible }, { transaction: t });
    await recalculateProductRating(review.productId, t);
  });

  sendSuccess(res, { message: `Review ${review.isVisible ? "hidden" : "visible"}`, data: { isVisible: review.isVisible } });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  // Only owner or admin can edit
  const isAdmin = req.user && ["admin", "sub-admin"].includes(req.user.role);
  if (!isAdmin && review.userId !== req.user.id) throw new ApiError(403, "Not allowed");

  const { rating, comment } = req.body;
  const updates = {};
  if (rating !== undefined) {
    const ratingNum = parseInt(rating, 10);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) throw new ApiError(400, "Rating must be between 1 and 5");
    updates.rating = ratingNum;
  }
  if (comment !== undefined) updates.comment = comment;

  await sequelize.transaction(async (t) => {
    await review.update(updates, { transaction: t });
    if (updates.rating !== undefined) await recalculateProductRating(review.productId, t);
  });

  sendSuccess(res, { message: "Review updated" });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  // Only owner or admin can delete
  const isAdmin = req.user && ["admin", "sub-admin"].includes(req.user.role);
  if (!isAdmin && review.userId !== req.user.id) throw new ApiError(403, "Not allowed");

  await sequelize.transaction(async (t) => {
    const productId = review.productId;
    await review.destroy({ transaction: t });
    await recalculateProductRating(productId, t);
  });

  sendSuccess(res, { message: "Review deleted" });
});
