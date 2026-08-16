const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

module.exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const [users, listings, bookings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
        },
      },
    ]),
  ]);

  sendSuccess(res, 200, {
    users,
    listings,
    bookings: bookings[0] || { totalRevenue: 0, totalBookings: 0 },
  });
});

module.exports.getHostDashboard = asyncHandler(async (req, res) => {
  const [listings, bookings] = await Promise.all([
    Listing.countDocuments({ owner: req.user._id }),
    Booking.aggregate([
      { $match: { host: req.user._id } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
        },
      },
    ]),
  ]);

  sendSuccess(res, 200, {
    listings,
    bookings: bookings[0] || { totalRevenue: 0, totalBookings: 0 },
  });
});
