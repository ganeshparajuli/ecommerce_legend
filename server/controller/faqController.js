const { Faq } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, order } = req.body;
  requireFields(req.body, ["question", "answer"]);
  if (order === undefined || typeof order !== "number" || order < 0) {
    throw new ApiError(400, "Order must be a non-negative number");
  }

  const faq = await Faq.create({ question, answer, sortOrder: order });
  sendSuccess(res, { status: 201, message: "FAQ added successfully", data: faq });
});

exports.getAllFAQs = asyncHandler(async (req, res) => {
  const faqs = await Faq.findAll({ order: [["sortOrder", "ASC"]] });
  sendSuccess(res, { data: faqs });
});

exports.getFAQById = asyncHandler(async (req, res) => {
  const faq = await Faq.findByPk(req.params.id);
  if (!faq) throw new ApiError(404, "FAQ not found");
  sendSuccess(res, { data: faq });
});

exports.updateFAQ = asyncHandler(async (req, res) => {
  const faq = await Faq.findByPk(req.params.id);
  if (!faq) throw new ApiError(404, "FAQ not found");

  const { question, answer, order } = req.body;
  const updates = {};
  if (question) updates.question = question;
  if (answer) updates.answer = answer;
  if (order !== undefined) updates.sortOrder = order;
  if (!Object.keys(updates).length) throw new ApiError(400, "No fields to update");

  await faq.update(updates);
  sendSuccess(res, { message: "FAQ updated successfully", data: faq });
});

exports.deleteFAQ = asyncHandler(async (req, res) => {
  const deleted = await Faq.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "FAQ not found");
  sendSuccess(res, { message: "FAQ deleted successfully" });
});
