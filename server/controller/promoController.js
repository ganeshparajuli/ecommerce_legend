const PromoCode = require("../model/promoModel");

const promoCodeController = {
  // Create a new promo code (admin only)
  createPromoCode: async (req, res) => {
    try {
      // Check if promo code already exists
      const existingPromoCode = await PromoCode.findByCode(req.body.code);
      if (existingPromoCode) {
        return res.status(400).json({
          success: false,
          message: "Promo code already exists",
        });
      }

      // Create new promo code (constructor handles the object)
      const promoCode = new PromoCode(req.body);
      const savedPromoCode = await promoCode.save();

      res.status(201).json({
        success: true,
        message: "Promo code created successfully",
        data: savedPromoCode,
      });
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create promo code",
        error: error.message,
      });
    }
  },

  // Get all promo codes (admin only)
  getAllPromoCodes: async (req, res) => {
    try {
      const promoCodes = await PromoCode.findAll();

      res.status(200).json({
        success: true,
        count: promoCodes.length,
        data: promoCodes,
      });
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch promo codes",
        error: error.message,
      });
    }
  },

  // Get promo code by ID (admin only)
  getPromoCodeById: async (req, res) => {
    try {
      const { id } = req.params;

      const promoCode = await PromoCode.findById(id);

      if (!promoCode) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Promo Fetched Successfully",
        data: promoCode,
      });
    } catch (error) {
      console.error("Error fetching promo code:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch promo code",
        error: error.message,
      });
    }
  },

  // Update promo code (admin only)
  updatePromoCode: async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating promo code ID:", id);
      console.log("Received update data:", req.body);

      // Check if promo code exists
      const existingPromoCode = await PromoCode.findById(id);
      if (!existingPromoCode) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      // Check if updating the code, and if so, ensure it's unique
      if (req.body.code && req.body.code !== existingPromoCode.code) {
        const codeExists = await PromoCode.findByCode(req.body.code);
        if (codeExists) {
          return res.status(400).json({
            success: false,
            message: "Promo code already exists",
          });
        }
      }

      // Prepare update object with camelCase keys
      const updates = {};
      if (req.body.code) updates.code = req.body.code;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.minPurchase !== undefined)
        updates.minPurchase = req.body.minPurchase;
      if (req.body.validFrom) updates.validFrom = req.body.validFrom;
      if (req.body.validUntil) updates.validUntil = req.body.validUntil;
      if (req.body.maxUses !== undefined) updates.maxUses = req.body.maxUses;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      const updatedPromoCode = await PromoCode.updatePromoCode(id, updates);

      res.status(200).json({
        success: true,
        message: "Promo code updated successfully",
        data: updatedPromoCode,
      });
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update promo code",
        error: error.message,
      });
    }
  },

  // Delete promo code (admin only)
  deletePromoCode: async (req, res) => {
    try {
      const { id } = req.params;

      const success = await PromoCode.deletePromoCode(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Promo code deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting promo code:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete promo code",
        error: error.message,
      });
    }
  },

  // Validate a promo code (for users during checkout)
  validatePromoCode: async (req, res) => {
    try {
      const { code, purchaseAmount } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Promo code is required",
        });
      }

      if (!purchaseAmount && purchaseAmount !== 0) {
        return res.status(400).json({
          success: false,
          message: "Purchase amount is required",
        });
      }

      const validationResult = await PromoCode.validatePromoCode(
        code,
        purchaseAmount
      );

      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
        });
      }

      res.status(200).json({
        success: true,
        message: validationResult.message,
        data: {
          promoCode: validationResult.promoCode,
          discountAmount: validationResult.discountAmount,
          finalAmount: validationResult.finalAmount,
        },
      });
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate promo code",
        error: error.message,
      });
    }
  },

  // Get active promo codes (for users to see available promo codes)
  getActivePromoCodes: async (req, res) => {
    try {
      const promoCodes = await PromoCode.findActiveAndValid();

      res.status(200).json({
        success: true,
        count: promoCodes.length,
        data: promoCodes,
      });
    } catch (error) {
      console.error("Error fetching active promo codes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch active promo codes",
        error: error.message,
      });
    }
  },

  // Run auto-expiration (can be called via cron job or manually by admin)
  runAutoExpiration: async (req, res) => {
    try {
      const result = await PromoCode.autoExpirePromoCodes();

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          expiredCount: result.expiredCount,
        },
      });
    } catch (error) {
      console.error("Error running auto-expiration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to run auto-expiration",
        error: error.message,
      });
    }
  },
};

module.exports = promoCodeController;
