const { User } = require("../models");
const authToken = require("../middlewares/authToken");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");
const requireFields = require("../utils/validateRequest");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  requireFields(req.body, ["name", "email", "password"]);

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(400, "User already exists");

  const image = req.file ? `uploads/${req.file.filename}` : null;
  const user = await User.create({ name, email, password, role: "user", image, phone });
  return authToken(user, 201, res, "User created successfully");
});

exports.addUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  requireFields(req.body, ["name", "email", "password", "role"]);

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(400, "User already exists");

  const image = req.file ? `uploads/${req.file.filename}` : null;
  const user = await User.create({ name, email, password, role, image });
  return authToken(user, 201, res, "User created successfully");
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  requireFields(req.body, ["email", "password"]);

  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(400, "Invalid credentials");

  const validPassword = await user.validatePassword(password);
  if (!validPassword) throw new ApiError(400, "Invalid credentials");

  if (!user.active) {
    throw new ApiError(401, "Account has been deactivated. Please contact support.");
  }

  return authToken(user, 200, res, "Login successful");
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  sendSuccess(res, { message: "User fetched successfully", data: user.toSafeJSON() });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  sendSuccess(res, { message: "Users fetched successfully", data: users.map((u) => u.toSafeJSON()) });
});

exports.updateImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image provided");
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  await user.update({ image: `uploads/${req.file.filename}` });
  sendSuccess(res, { message: "Image updated successfully", data: user.toSafeJSON() });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const isSelf = req.user.id === user.id;
  const isStaff = ["admin", "sub-admin", "sales"].includes(req.user.role);
  if (!isSelf && !isStaff) {
    throw new ApiError(403, "You are not allowed to update this user");
  }

  // Only staff roles may change account status or role - a plain user
  // must never be able to grant themselves (or anyone else) elevated access.
  const allowedFields = ["name", "phone", "address"];
  if (isStaff) allowedFields.push("active", "role");

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No permitted fields provided to update");
  }

  await user.update(updates);
  sendSuccess(res, { message: "User updated successfully", data: user.toSafeJSON() });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const deleted = await User.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "User not found");
  sendSuccess(res, { message: "User deleted successfully" });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  requireFields(req.body, ["id", "oldPassword", "newPassword"]);

  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.validatePassword(oldPassword);
  if (!isMatch) throw new ApiError(401, "Invalid old password");

  await user.update({ password: newPassword });
  sendSuccess(res, { message: "Password updated successfully" });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { id, newPassword } = req.body;
  requireFields(req.body, ["id", "newPassword"]);

  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, "User not found");

  await user.update({ password: newPassword });
  sendSuccess(res, { message: "Password reset successfully" });
});
