const express = require("express");
const reviewController = require("../controller/reviewController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Public: get reviews by product (filters isVisible for non-admins)
router.get("/product/:productId", isAuthenticated, reviewController.getReviewsByProductId);

// Public fallback for unauthenticated (no user obj, only visible reviews)
router.get("/public/:productId", reviewController.getReviewsByProductId);

// Admin: get all reviews
router.get("/", isAuthenticated, authorizeRoles("admin", "sub-admin"), reviewController.getAllReviews);

// Admin: toggle visibility
router.patch("/:id/visibility", isAuthenticated, authorizeRoles("admin", "sub-admin"), reviewController.toggleReviewVisibility);

// Authenticated users: create review
router.post("/", isAuthenticated, reviewController.createReview);

// Owner or admin: update/delete
router.put("/:id", isAuthenticated, reviewController.updateReview);
router.delete("/:id", isAuthenticated, reviewController.deleteReview);

// Get single review
router.get("/:id", reviewController.getReviewById);

module.exports = router;
