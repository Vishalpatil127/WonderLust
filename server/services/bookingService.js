const Booking = require("../models/booking");
const ExpressError = require("../utils/ExpressError");

const checkAvailability = async ({ listingId, checkIn, checkOut }) => {
  const overlappingBooking = await Booking.findOne({
    listing: listingId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });

  if (overlappingBooking) {
    throw new ExpressError("Listing is already booked for the selected dates", 409);
  }

  return true;
};

const bookingService = {
  checkAvailability,
};

module.exports = bookingService;
