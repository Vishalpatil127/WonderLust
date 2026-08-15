const express = require("express");
const router = express.Router();
const payments = require("../controllers/payments");
const { authenticate } = require("../middleware/auth");

router.post("/create-order", authenticate, payments.createOrder);

module.exports = router;