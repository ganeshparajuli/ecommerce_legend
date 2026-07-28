const { Contact } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.createContact = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "phone", "email", "subject", "message"]);
  const contact = await Contact.create(req.body);
  sendSuccess(res, { status: 201, message: "Message sent successfully", data: contact });
});

exports.getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.findAll({ order: [["createdAt", "DESC"]] });
  sendSuccess(res, { data: contacts });
});

exports.getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) throw new ApiError(404, "Message not found");
  sendSuccess(res, { data: contact });
});

exports.updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) throw new ApiError(404, "Message not found");

  const allowed = ["name", "email", "phone", "subject", "message"];
  const updates = {};
  for (const field of allowed) if (req.body[field] !== undefined) updates[field] = req.body[field];
  if (!Object.keys(updates).length) throw new ApiError(400, "No fields to update");

  await contact.update(updates);
  sendSuccess(res, { message: "Message updated successfully", data: contact });
});

exports.deleteContact = asyncHandler(async (req, res) => {
  const deleted = await Contact.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Message not found");
  sendSuccess(res, { message: "Message deleted successfully" });
});
