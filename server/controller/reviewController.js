const Review = require("../model/reviewModel");

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (error) {
    console.error("Error getting review:", error);
    res.status(500).json({ message: "Failed to fetch review" });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const reviews = await Review.findByProductId(req.params.productId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error getting product reviews:", error);
    res.status(500).json({ message: "Failed to fetch product reviews" });
  }
};

const createReview = async (req, res) => {
  try {
    const { product_id, reviewer_name, rating, comment } = req.body;

    if (!product_id || !reviewer_name || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newReview = await Review.create({
      product_id,
      reviewer_name,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review created", id: newReview.id });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    await Review.update(req.params.id, { rating, comment });
    res.status(200).json({ message: "Review updated" });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    await Review.delete(req.params.id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  getReviewsByProductId,
  createReview,
  updateReview,
  deleteReview,
};
