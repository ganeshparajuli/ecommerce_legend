const CartItem = require("../model/cartModel");
const Product = require("../model/productModel");

const cartController = {
  // Add item to cart
  addToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      // Log the request body to debug
      console.log("Add to cart request body:", JSON.stringify(req.body));

      // Extract product ID, quantity, and sale info from request body
      const { productId, quantity = 1, saleInfo } = req.body;

      // Handle case where productId might be an object
      let product_id;

      if (typeof productId === "object" && productId !== null && productId.id) {
        product_id = productId.id;
        console.log("Product ID extracted from object:", product_id);
      } else {
        product_id = productId;
      }

      // Validate input
      if (!product_id) {
        console.log("Invalid product ID received:", productId);
        return res.status(400).json({ message: "Product ID is required" });
      }

      if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }

      // Check if product exists
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if product is in stock
      if (product.quantity < parseInt(quantity)) {
        return res.status(400).json({
          message: "Product is out of stock or insufficient quantity",
        });
      }

      // Check if item already in cart
      const existingItem = await CartItem.findByUserAndProductId(
        userId,
        product_id
      );

      if (existingItem) {
        // If the total quantity would exceed available stock, return error
        if (existingItem.quantity + parseInt(quantity) > product.quantity) {
          return res.status(400).json({
            message:
              "Cannot add more of this item to your cart due to stock limitations",
            availableStock: product.quantity,
            currentlyInCart: existingItem.quantity,
          });
        }
      }

      // Log sale info for debugging
      if (saleInfo) {
        console.log("Sale info received:", saleInfo);
      }

      // Add to cart with sale information
      const cartItem = new CartItem(
        userId,
        product_id,
        parseInt(quantity),
        true,
        saleInfo // Pass sale info to constructor
      );
      await cartItem.save();

      // Determine the price to return in response
      const responsePrice =
        saleInfo?.salePrice || product.finalPrice || product.price;

      // Format response to match frontend expectations
      res.status(201).json({
        message: "Item added to cart successfully",
        cartItem: {
          product_id: product_id,
          quantity: parseInt(quantity),
          selected: true,
          price: responsePrice, // Use sale price if available
          originalPrice: saleInfo?.originalPrice || product.finalPrice,
          isOnSale: !!saleInfo,
          discountType: saleInfo?.discountType || null,
          discountValue: saleInfo?.discountValue || 0,
          saleId: saleInfo?.saleId || null,
          saleName: saleInfo?.saleName || null,
          product: {
            id: product.id,
            name: product.name,
            finalPrice: product.finalPrice || product.price,
            image: product.image || product.image_url,
            category: product.category,
          },
          name: product.name,
          finalPrice: responsePrice, // Use sale price for consistency
          image: product.image || product.image_url,
          category: product.category,
        },
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        message: "Failed to add item to cart",
        error: error.message,
        stack: error.stack,
        requestBody: JSON.stringify(req.body),
      });
    }
  },

  // Get user's cart
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;

      const cartItems = await CartItem.findByUserId(userId);
      const cartTotal = await CartItem.getCartTotal(userId);

      res.status(200).json({
        cartItems,
        cartTotal,
        itemCount: cartItems.length,
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch cart", error: error.message });
    }
  },

  // Update cart item quantity
  updateCartItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const { quantity, selected } = req.body;

      if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }

      // Check if item exists in cart
      const cartItem = await CartItem.findByUserAndProductId(userId, productId);
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Check if product exists and has sufficient stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < parseInt(quantity)) {
        return res.status(400).json({
          message: "Cannot update quantity due to stock limitations",
          availableStock: product.quantity,
        });
      }

      // Update quantity (and selected status if provided)
      await CartItem.updateQuantity(
        userId,
        productId,
        parseInt(quantity),
        selected
      );

      // Get updated cart item to return
      const updatedItem = await CartItem.findByUserAndProductId(
        userId,
        productId
      );

      res.status(200).json({
        message: "Cart item updated successfully",
        item: {
          product_id: productId,
          quantity: parseInt(quantity),
          selected: selected !== undefined ? selected : updatedItem.selected,
          product: {
            id: product.id,
            name: product.name,
            finalPrice: product.finalPrice || product.price,
            image: product.image || product.image_url,
            category: product.category,
          },
        },
      });
    } catch (error) {
      console.error("Update cart item error:", error);
      res
        .status(500)
        .json({ message: "Failed to update cart item", error: error.message });
    }
  },

  // Toggle cart item selection
  toggleCartItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      // Check if item exists in cart
      const cartItem = await CartItem.findByUserAndProductId(userId, productId);
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Toggle selection
      await CartItem.toggleSelection(userId, productId);

      // Get updated cart item
      const updatedItem = await CartItem.findByUserAndProductId(
        userId,
        productId
      );
      const product = await Product.findById(productId);

      res.status(200).json({
        message: "Cart item selection toggled successfully",
        item: {
          product_id: productId,
          quantity: updatedItem.quantity,
          selected: Boolean(updatedItem.selected),
          product: {
            id: product.id,
            name: product.name,
            finalPrice: product.finalPrice || product.price,
            image: product.image || product.image_url,
            category: product.category,
          },
        },
      });
    } catch (error) {
      console.error("Toggle cart item error:", error);
      res
        .status(500)
        .json({ message: "Failed to toggle cart item", error: error.message });
    }
  },

  // Remove item from cart
  removeFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      // Check if item exists in cart
      const cartItem = await CartItem.findByUserAndProductId(userId, productId);
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Remove item
      await CartItem.removeItem(userId, productId);

      res.status(200).json({
        message: "Item removed from cart successfully",
        product_id: productId,
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        message: "Failed to remove item from cart",
        error: error.message,
      });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;

      await CartItem.clearCart(userId);

      res.status(200).json({
        message: "Cart cleared successfully",
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      res
        .status(500)
        .json({ message: "Failed to clear cart", error: error.message });
    }
  },

  // Get cart count (for showing in UI badge)
  getCartCount: async (req, res) => {
    try {
      const userId = req.user.id;

      const count = await CartItem.getCartCount(userId);

      res.status(200).json({ count });
    } catch (error) {
      console.error("Get cart count error:", error);
      res
        .status(500)
        .json({ message: "Failed to get cart count", error: error.message });
    }
  },
};

module.exports = cartController;
