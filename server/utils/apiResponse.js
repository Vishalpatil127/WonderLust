const sendSuccess = (res, statusCode = 200, data = {}) => {
  return res.status(statusCode).json({ success: true, ...data });
};

const sendError = (res, statusCode = 500, message = "Something went wrong") => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
