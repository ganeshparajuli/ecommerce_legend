const Sale = require("../model/saleModel");

const saleController = {
  // Get all sales
  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.findAll();
      res.status(200).json({ success: true, sales });
    } catch (error) {
      console.error("Get all sales error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sales",
        error: error.message,
      });
    }
  },

  // Get sale by ID
  getSaleById: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await Sale.findById(id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      // Get products associated with this sale
      const products = await Sale.getSaleProducts(id);

      res.status(200).json({
        success: true,
        sale: {
          ...sale,
          products,
        },
      });
    } catch (error) {
      console.error("Get sale by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sale",
        error: error.message,
      });
    }
  },

  // Create a new sale
  createSale: async (req, res) => {
    try {
      const {
        name,
        description,
        discountType,
        discountValue,
        startDate,
        endDate,
        status,
        productIds,
      } = req.body;

      // Basic validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Sale name is required",
        });
      }

      // Check if sale with same name already exists
      const existingSale = await Sale.findByName(name);
      if (existingSale) {
        return res.status(400).json({
          success: false,
          message: "Sale with this name already exists",
        });
      }

      // Create the sale
      const sale = new Sale(
        name,
        description,
        discountType || "percentage",
        discountValue || 0,
        startDate || null,
        endDate || null,
        status || "draft"
      );

      await sale.save();

      // If product IDs were provided, associate them with the sale
      if (productIds && Array.isArray(productIds) && productIds.length > 0) {
        await Sale.addProductsToSale(sale.id, productIds);
      }

      res.status(201).json({
        success: true,
        message: "Sale created successfully",
        sale: {
          id: sale.id,
          name: sale.name,
          description: sale.description,
          discountType: sale.discountType,
          discountValue: sale.discountValue,
          startDate: sale.startDate,
          endDate: sale.endDate,
          status: sale.status,
          productCount: productIds ? productIds.length : 0,
          totalSales: 0,
        },
      });
    } catch (error) {
      console.error("Create sale error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create sale",
        error: error.message,
      });
    }
  },

  // Update sale
  updateSale: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Check if the sale exists
      const existingSale = await Sale.findById(id);
      if (!existingSale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      // Update the sale fields
      await Sale.updateSale(id, updateData);

      // If product IDs were provided, update the associated products
      if (updateData.productIds && Array.isArray(updateData.productIds)) {
        await Sale.addProductsToSale(id, updateData.productIds);
      }

      // Get the updated sale
      const updatedSale = await Sale.findById(id);

      res.status(200).json({
        success: true,
        message: "Sale updated successfully",
        sale: updatedSale,
        updatedFields: Object.keys(updateData),
      });
    } catch (error) {
      console.error("Update sale error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update sale",
        error: error.message,
      });
    }
  },

  // Delete sale
  deleteSale: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the sale exists
      const existingSale = await Sale.findById(id);
      if (!existingSale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      // Delete the sale
      await Sale.delete(id);

      res.status(200).json({
        success: true,
        message: "Sale deleted successfully",
      });
    } catch (error) {
      console.error("Delete sale error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete sale",
        error: error.message,
      });
    }
  },

  // Get sales by status
  getSalesByStatus: async (req, res) => {
    try {
      const { status } = req.params;

      // Validate the status
      const validStatuses = ["active", "scheduled", "ended", "draft"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be active, scheduled, ended, or draft.",
        });
      }

      const sales = await Sale.findByStatus(status);

      res.status(200).json({
        success: true,
        sales,
      });
    } catch (error) {
      console.error(`Get sales by status error:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sales by status",
        error: error.message,
      });
    }
  },

  // Get products for a sale
  getSaleProducts: async (req, res) => {
    try {
      const { id } = req.params;

      console.log("🔍 Getting products for sale:", id);

      const products = await Sale.getSaleProducts(id);

      console.log(`✅ Retrieved ${products.length} products for sale ${id}`);

      res.status(200).json({
        success: true,
        products: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Get sale products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get sale products",
        error: error.message,
      });
    }
  },

  // Add products to sale
  addProductsToSale: async (req, res) => {
    try {
      const { id } = req.params;
      const { productIds } = req.body;

      if (
        !productIds ||
        !Array.isArray(productIds) ||
        productIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Product IDs must be provided as a non-empty array",
        });
      }

      // Check if the sale exists
      const existingSale = await Sale.findById(id);
      if (!existingSale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      // Add products to sale
      await Sale.addProductsToSale(id, productIds);

      res.status(200).json({
        success: true,
        message: "Products added to sale successfully",
        productCount: productIds.length,
      });
    } catch (error) {
      console.error("Add products to sale error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add products to sale",
        error: error.message,
      });
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (req, res) => {
    try {
      const analytics = await Sale.getSalesAnalytics();

      res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.error("Get sales analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sales analytics",
        error: error.message,
      });
    }
  },

  getSaleGifts: async (req, res) => {
    try {
      const { id } = req.params;

      const saleGifts = await Sale.getSaleGiftProducts(id);
      const productGifts = await Sale.getProductSpecificGifts(id);

      res.status(200).json({
        success: true,
        gifts: {
          saleGifts,
          productGifts,
        },
      });
    } catch (error) {
      console.error("Get sale gifts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get sale gifts",
        error: error.message,
      });
    }
  },

  // Add/Update sale gifts
  updateSaleGifts: async (req, res) => {
    try {
      const { id } = req.params;
      const { saleGifts, productGifts } = req.body;

      // Check if sale exists
      const existingSale = await Sale.findById(id);
      if (!existingSale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      // Update sale-level gifts
      if (saleGifts) {
        await Sale.addSaleGiftProducts(id, saleGifts);
      }

      // Update product-specific gifts
      if (productGifts) {
        await Sale.addProductSpecificGifts(id, productGifts);
      }

      res.status(200).json({
        success: true,
        message: "Sale gifts updated successfully",
      });
    } catch (error) {
      console.error("Update sale gifts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update sale gifts",
        error: error.message,
      });
    }
  },

  // Calculate gifts for cart
  calculateCartGifts: async (req, res) => {
    try {
      const { saleId } = req.params;
      const { cartItems } = req.body;

      if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({
          success: false,
          message: "Cart items are required",
        });
      }

      const applicableGifts = await Sale.calculateApplicableGifts(
        saleId,
        cartItems
      );

      res.status(200).json({
        success: true,
        applicableGifts,
      });
    } catch (error) {
      console.error("Calculate cart gifts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate cart gifts",
        error: error.message,
      });
    }
  },
};

module.exports = saleController;
