const express = require("express");
const cartController = require("../controller/cartController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();
// Apply authentication middleware to all cart routes
router.use(isAuthenticated);

// Get cart count - literal path, must come before "/:variantId"
router.get("/count", cartController.getCartCount);

// Add item to cart (body: { productVariantId, quantity, saleId? })
router.post("/", cartController.addToCart);

// Get user's cart
router.get("/", cartController.getCart);

// Update cart item quantity/selection
router.put("/:variantId", cartController.updateCartItem);

// Toggle cart item selection
router.patch("/:variantId/toggle", cartController.toggleCartItem);

// Remove item from cart
router.delete("/:variantId", cartController.removeFromCart);

// Clear cart
router.delete("/", cartController.clearCart);

module.exports = router;
