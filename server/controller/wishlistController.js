const Wishlist = require("../model/wishlistModel");
const Product = require("../model/productModel"); // Assuming you have a Product model
const wishlistController = {
  // Add a product to the wishlist
  addToWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check if the product is already in the wishlist
      const existingItem = await Wishlist.findOne({
        user: userId,
        product: productId,
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      // Add the product to the wishlist
      const wishlistItem = await Wishlist.save({
        user: userId,
        product: productId,
      });

      res.status(201).json({
        success: true,
        message: "Item added to wishlist",
        data: wishlistItem,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add to wishlist",
        error: error.message,
      });
    }
  },

  // Get all wishlist items for a user
  getWishlist: async (req, res) => {
    try {
      const userId = req.user.id; // Assuming you have authentication middleware
      const wishlistItems = await Wishlist.findByUserId(userId);

      res.status(200).json({
        success: true,
        count: wishlistItems.length,
        data: wishlistItems,
      });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching wishlist",
        error: error.message,
      });
    }
  },

  // Remove an item from the wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Wishlist item ID is required",
        });
      }

      const userId = req.user.id; // Assuming you have authentication middleware

      // Check if wishlist item exists and belongs to the user
      const wishlistItem = await Wishlist.findById(id);
      if (!wishlistItem) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }

      if (wishlistItem.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to wishlist item",
        });
      }

      await Wishlist.deleteItem(id);

      res.status(200).json({
        success: true,
        message: "Item removed from wishlist",
      });
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      res.status(500).json({
        success: false,
        message: "Error removing item from wishlist",
        error: error.message,
      });
    }
  },

  // Clear the entire wishlist for a user
  clearWishlist: async (req, res) => {
    try {
      const userId = req.user.id; // Assuming you have authentication middleware
      await Wishlist.clearWishlist(userId);

      res.status(200).json({
        success: true,
        message: "Wishlist cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      res.status(500).json({
        success: false,
        message: "Error clearing wishlist",
        error: error.message,
      });
    }
  },
};
module.exports = wishlistController;
