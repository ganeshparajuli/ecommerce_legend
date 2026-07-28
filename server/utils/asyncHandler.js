// Wraps an async Express handler so rejected promises reach the error-handling
// middleware instead of needing a try/catch in every controller method.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
