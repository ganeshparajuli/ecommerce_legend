const express = require("express");
const wishlistController = require("../controller/wishlistController");
const { isAuthenticated } = require("../middlewares/auth"); // Assuming you have auth middleware

const router = express.Router();

// Apply authentication middleware to all wishlist routes
router.use(isAuthenticated);
// Add a product to wishlist
router.post("/", wishlistController.addToWishlist);

// Get all wishlist items for the logged-in user
router.get("/", wishlistController.getWishlist);

// Remove an item from the wishlist
router.delete("/:id", wishlistController.removeFromWishlist);

// Clear the entire wishlist
router.delete("/", wishlistController.clearWishlist);

module.exports = router;
