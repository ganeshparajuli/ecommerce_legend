const express = require("express");
const cartController = require("../controller/cartController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();
// Apply authentication middleware to all cart routes
router.use(isAuthenticated);

// Add item to cart
router.post("/", cartController.addToCart);

// Get user's cart
router.get("/", cartController.getCart);

// Update cart item quantity
router.put("/:productId", cartController.updateCartItem);

// Toggle cart item selection
router.patch("/:productId/toggle", cartController.toggleCartItem);

// Remove item from cart
router.delete("/:productId", cartController.removeFromCart);

// Clear cart
router.delete("/", cartController.clearCart);

// Get cart count
router.get("/count", cartController.getCartCount);

module.exports = router;
