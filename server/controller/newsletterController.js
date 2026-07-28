const { NewsletterSubscriber } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.subscribe = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email"]);
  const existing = await NewsletterSubscriber.findOne({ where: { email: req.body.email } });
  if (existing) throw new ApiError(409, "Email is already subscribed");

  const subscription = await NewsletterSubscriber.create({ email: req.body.email, name: req.body.name || null });
  sendSuccess(res, { status: 201, message: "Successfully subscribed to the newsletter", data: subscription });
});

exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await NewsletterSubscriber.findAll({ order: [["subscribedAt", "DESC"]] });
  sendSuccess(res, { data: subscriptions, meta: { count: subscriptions.length } });
});

exports.getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await NewsletterSubscriber.findByPk(req.params.id);
  if (!subscription) throw new ApiError(404, "Subscription not found");
  sendSuccess(res, { data: subscription });
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email"]);
  const subscription = await NewsletterSubscriber.findByPk(req.params.id);
  if (!subscription) throw new ApiError(404, "Subscription not found");

  if (req.body.email !== subscription.email) {
    const existingEmail = await NewsletterSubscriber.findOne({ where: { email: req.body.email } });
    if (existingEmail) throw new ApiError(409, "Email is already subscribed");
  }

  await subscription.update({ email: req.body.email });
  sendSuccess(res, { message: "Subscription updated successfully", data: subscription });
});

exports.unsubscribe = asyncHandler(async (req, res) => {
  const deleted = await NewsletterSubscriber.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Subscription not found");
  sendSuccess(res, { message: "Successfully unsubscribed from the newsletter" });
});
