function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = { asyncHandler, fail };
