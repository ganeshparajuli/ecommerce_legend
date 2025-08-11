const Order = require("../model/orderModel");
const Product = require("../model/productModel");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      user_id,
      total_amount,
      shipping_address,
      orderItems,
      payment_method,
      promo_code,
      discount_amount,
    } = req.body;

    // Rename orderItems to items for compatibility with existing code
    const items = orderItems;

    // Use authenticated user's ID if no user_id is provided
    const orderUserId = user_id || req.user.id;

    // Validate input
    if (
      !orderUserId ||
      !total_amount ||
      !shipping_address ||
      !orderItems ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate items - check if products exist and have enough stock
    for (const item of items) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product_id} not found`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} has insufficient stock: ${product.quantity} available`,
        });
      }
    }

    // Create new order
    const newOrder = new Order(
      orderUserId,
      total_amount,
      shipping_address,
      payment_method,
      "pending",
      new Date(),
      promo_code || null,
      discount_amount || 0
    );

    // Save order
    const orderId = await newOrder.save();

    // Add order items
    await Order.addOrderItems(orderId, items);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order_id: orderId,
    });
  } catch (error) {
    console.error("Error creating order: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user is authorized to view this order
    if (req.user.id !== order.user_id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error getting order: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    // Extract userId from params
    const { userId } = req.params;

    // If userId is undefined, use the authenticated user's ID
    const targetUserId = userId === "undefined" ? req.user.id : userId;

    // If we still don't have a valid userId, return an error
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user is authorized - skip this check if req.user is not available
    if (req.user && req.user.id !== targetUserId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view these orders",
      });
    }

    const orders = await Order.findByUserId(targetUserId);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error getting user orders: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If trying to cancel, use cancelOrder method
    if (status === "cancelled") {
      await Order.cancelOrder(id);
    } else {
      await Order.updateStatus(id, status);
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { total_amount, shipping_address, payment_method, status } = req.body;

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      // If trying to cancel, use cancelOrder method instead
      if (status === "cancelled") {
        await Order.cancelOrder(id);
        return res.status(200).json({
          success: true,
          message: "Order cancelled successfully",
        });
      }
    }

    // Check permissions - admin can update any order
    // Regular users can only update their own orders in certain statuses
    if (!req.user.isAdmin && req.user.id !== order.user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this order",
      });
    }

    // Regular users should only be able to update orders in pending status
    if (!req.user.isAdmin && order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only modify orders with 'pending' status",
      });
    }

    // Create update data object
    const updateData = {};
    if (total_amount) updateData.total_amount = total_amount;
    if (shipping_address) updateData.shipping_address = shipping_address;
    if (payment_method) updateData.payment_method = payment_method;
    if (status) updateData.status = status;

    // Perform update
    const updated = await Order.updateOrder(id, updateData);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No fields to update or update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating order: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      total_amount,
      shipping_address,
      payment_method,
      status,
      orderItems,
    } = req.body;

    // Rest of the validation code...

    // Start a transaction for updating both order and items
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update order details
      const updateData = {};
      if (total_amount) updateData.total_amount = total_amount;
      if (shipping_address) updateData.shipping_address = shipping_address;
      if (payment_method) updateData.payment_method = payment_method;
      if (status) updateData.status = status;

      // Only update order details if there are fields to update
      if (Object.keys(updateData).length > 0) {
        const updated = await Order.updateOrder(id, updateData);
        if (!updated) {
          return res.status(400).json({
            success: false,
            message: "Order update failed",
          });
        }
      }

      // Update order items if provided
      if (orderItems && orderItems.length > 0) {
        await Order.updateOrderItems(id, orderItems);
      }

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating order: ", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Check user authorization
    if (req.user.id !== order.user_id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this order",
      });
    }

    await Order.cancelOrder(id);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const orders = await Order.findAll(limit, offset);
    const total = await Order.countAll();

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting all orders: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get orders by status (admin only)
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const orders = await Order.findByStatus(status, limit, offset);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error getting orders by status: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
