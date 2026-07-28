const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require("sequelize");
const { ApiError } = require("../utils/apiResponse");

// Centralized error handler - replaces the copy-pasted `catch (err) { res.status(500)... }`
// that used to live in every controller method.
module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.errors?.[0]?.path || "field";
    return res.status(409).json({ success: false, error: `${field} already exists` });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      success: false,
      error: "This action references a record that doesn't exist or is still in use",
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: err.errors.map((e) => e.message).join("; "),
    });
  }

  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  return res.status(500).json({ success: false, error: "Internal server error" });
};
