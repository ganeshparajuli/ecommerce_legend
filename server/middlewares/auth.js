const jwt = require("jsonwebtoken");
const { User } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

exports.isAuthenticated = asyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req?.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }
  if (!user.active) {
    return res.status(401).json({
      success: false,
      message: "Account has been deactivated. Please contact support.",
    });
  }

  req.user = user;
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};
