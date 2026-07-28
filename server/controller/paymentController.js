const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require("stripe")(process.env.STRIPE_SECRET_KEY);
}

exports.createCustomer = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) throw new ApiError(501, "Card payments are not configured on this server");

  requireFields(req.body, ["email"]);
  const customer = await stripe.customers.create({ email: req.body.email, name: req.body.name });
  sendSuccess(res, { data: { customerId: customer.id } });
});

exports.addPaymentMethod = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) throw new ApiError(501, "Card payments are not configured on this server");

  const { customerId, paymentMethodId } = req.body;
  requireFields(req.body, ["customerId", "paymentMethodId"]);

  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });
  sendSuccess(res, { message: "Payment method added" });
});
