const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

// Create a new order
router.post("/", isAuthenticated, orderController.createOrder);

// Get order by ID
router.get("/:id", isAuthenticated, orderController.getOrderById);

// Get user orders
router.get("/user/:userId", isAuthenticated, orderController.getUserOrders);

// Update order status (admin, sales, and finance)
router.put(
  "/:id/status",
  isAuthenticated,
  authorizeRoles("admin", "finance", "sales", "sub-admin"), // ✅ Added sales and sub-admin
  orderController.updateOrderStatus
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin", "finance", "sales", "sub-admin"), // ✅ Added sales and sub-admin
  orderController.updateOrder
);

// Cancel order
router.post("/:id/cancel", isAuthenticated, orderController.cancelOrder);

// ✅ FIXED: Get all orders - Now includes sales and sub-admin
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin", "finance", "sales", "sub-admin"), // ✅ Added sales and sub-admin
  orderController.getAllOrders
);

// ✅ FIXED: Get orders by status - Now includes sales and sub-admin
router.get(
  "/status/:status",
  isAuthenticated,
  authorizeRoles("admin", "finance", "sales", "sub-admin"), // ✅ Added sales and sub-admin
  orderController.getOrdersByStatus
);

module.exports = router;