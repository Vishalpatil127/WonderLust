const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listing",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
      index: true,
    },
    checkOut: {
      type: Date,
      required: true,
      index: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 }, { unique: false });

module.exports = mongoose.model("Booking", bookingSchema);
