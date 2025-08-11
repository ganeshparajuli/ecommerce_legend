const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const { isAuthenticated } = require("../middlewares/auth");

router.post(
  "/create-customer",
  isAuthenticated,
  paymentController.createCustomer
);
router.post(
  "/add-payment-method",
  isAuthenticated,
  paymentController.addPaymentMethod
);

module.exports = router;
