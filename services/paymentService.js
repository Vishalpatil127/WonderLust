const Razorpay = require("razorpay");
const env = require("../config/env");

const razorpay = env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  : null;

const createPaymentOrder = async ({ amount, currency = "INR", receipt }) => {
  if (!razorpay) {
    return { mock: true, amount, currency, receipt };
  }

  return razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt,
  });
};

module.exports = { createPaymentOrder };
