const express = require("express");
const router = express.Router();
const bookings = require("../controllers/bookings");
const { authenticate } = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/", authenticate, bookings.createBooking);
router.get("/mine", authenticate, bookings.getMyBookings);
router.get("/host", authenticate, authorize("host", "admin"), bookings.getHostBookings);

module.exports = router;

