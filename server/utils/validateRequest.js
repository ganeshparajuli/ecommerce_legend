const { ApiError } = require("./apiResponse");

// Thin required-field check used at the top of controller methods. Deeper validation
// (types, ranges, enums, uniqueness) is left to the Sequelize model layer.
module.exports = function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
  }
};
