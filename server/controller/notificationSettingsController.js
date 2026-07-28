const { NotificationSettings } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const BOOLEAN_FIELDS = [
  "orderConfirmation",
  "orderDelivery",
  "lowStockAlert",
  "newUserRegistration",
  "orderCancellation",
  "paymentConfirmation",
  "newsletterSubscription",
  "promotionalEmails",
  "smsNotifications",
  "emailNotifications",
];

async function getOrCreateSettings() {
  const [settings] = await NotificationSettings.findOrCreate({ where: {}, defaults: {} });
  return settings;
}

exports.getNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  sendSuccess(res, { data: settings });
});

exports.updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const updates = {};
  for (const field of BOOLEAN_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field] === true || req.body[field] === "true";
  }
  await settings.update(updates);
  sendSuccess(res, { message: "Notification settings updated successfully", data: settings });
});

exports.resetNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const defaults = Object.fromEntries(BOOLEAN_FIELDS.map((f) => [f, NotificationSettings.rawAttributes[f].defaultValue]));
  await settings.update(defaults);
  sendSuccess(res, { message: "Notification settings reset to defaults", data: settings });
});
