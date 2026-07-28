const { Review, Product, sequelize } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

async function recalculateProductRating(productId, transaction) {
  const [result] = await Review.findAll({
    where: { productId },
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

exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({ order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: reviews });
});

exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  sendSuccess(res, { data: review });
});

exports.getReviewsByProductId = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({ where: { productId: req.params.productId }, order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: reviews });
});

exports.createReview = asyncHandler(async (req, res) => {
  const { product_id, reviewer_name, rating, comment } = req.body;
  requireFields(req.body, ["product_id", "reviewer_name", "rating", "comment"]);

  const product = await Product.findByPk(product_id);
  if (!product) throw new ApiError(404, "Product not found");

  const ratingNum = parseInt(rating, 10);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const review = await sequelize.transaction(async (t) => {
    const created = await Review.create(
      { productId: product_id, userId: req.user?.id || null, reviewerName: reviewer_name, rating: ratingNum, comment },
      { transaction: t }
    );
    await recalculateProductRating(product_id, t);
    return created;
  });

  sendSuccess(res, { status: 201, message: "Review created", data: review });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

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

  await sequelize.transaction(async (t) => {
    const productId = review.productId;
    await review.destroy({ transaction: t });
    await recalculateProductRating(productId, t);
  });

  sendSuccess(res, { message: "Review deleted" });
});
