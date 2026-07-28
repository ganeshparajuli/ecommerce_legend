function sendSuccess(res, { status = 200, data, message, meta } = {}) {
  return res.status(status).json({
    success: true,
    ...(message !== undefined ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? meta : {}),
  });
}

function sendError(res, { status = 500, error = "Server error" } = {}) {
  return res.status(status).json({ success: false, error });
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { sendSuccess, sendError, ApiError };
