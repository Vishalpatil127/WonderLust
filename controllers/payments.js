const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { createPaymentOrder } = require("../services/paymentService");

module.exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, currency, receipt } = req.body;
  const order = await createPaymentOrder({ amount, currency, receipt });
  sendSuccess(res, 200, { order });
});
