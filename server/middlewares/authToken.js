const jwt = require("jsonwebtoken");

const authToken = (user, statusCode, res, message) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: Number(process.env.JWT_EXPIRE) || 86400,
  });

  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, message, user: user.toSafeJSON() });
};

module.exports = authToken;
