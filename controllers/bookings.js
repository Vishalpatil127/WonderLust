const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const asyncHandler = require("../middleware/asyncHandler");
const bookingService = require("../services/bookingService");
const { sendSuccess } = require("../utils/apiResponse");
const { sendEmail, buildBookingConfirmationEmail } = require("../services/emailService");

module.exports.createBooking = asyncHandler(async (req, res) => {
  const { listingId, checkIn, checkOut, guests, totalPrice } = req.body;

  if (!listingId || !checkIn || !checkOut || !guests || !totalPrice) {
    throw new ExpressError("listingId, checkIn, checkOut, guests, and totalPrice are required", 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  // Ensure the listing has an owner (host) set - prevents Booking validation errors
  if (!listing.owner) {
    throw new ExpressError("Listing owner (host) is not set for this listing. Cannot create booking.", 500);
  }

  await bookingService.checkAvailability({
    listingId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
  });

  const booking = await Booking.create({
    listing: listingId,
    customer: req.user._id,
    host: listing.owner,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    guests,
    totalPrice,
    status: "confirmed",
  });

  const customer = await User.findById(req.user._id);

  if (customer?.email) {
    const emailContent = buildBookingConfirmationEmail({
      customerName: customer.username || "Guest",
      listingTitle: listing.title,
      location: listing.location,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    await sendEmail({
      to: customer.email,
      subject: emailContent.subject,
      text: emailContent.text,
    });
  }

  sendSuccess(res, 201, { booking });
});

module.exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .populate("listing", "title image location country price")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { bookings });
});

module.exports.getHostBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ host: req.user._id })
    .populate("customer", "username email")
    .populate("listing", "title image location country price")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { bookings });
});
