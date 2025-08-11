const User = require("../model/userModel");
const authToken = async (user, statusCode, res, message) => {
  try {
    const token = User.getAuthToken(user.id); // Use the static method correctly
    if (!token) {
      return res.status(401).json({
        success: false,
        code: statusCode || 500,
        message: message || "Unauthorized",
      });
    }
    // Convert COOKIE_EXPIRE to a number and set default to 1 day
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;

    // Set the access token cookie
    const options = {
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    return res
      .status(statusCode)
      .cookie("token", token, options)
      .json({ success: true, token, message, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = authToken;
