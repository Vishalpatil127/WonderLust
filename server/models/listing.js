const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1501084817055-6255093c0f3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      set: (v) =>
        v === " "
          ? "https://images.unsplash.com/photo-1501084817055-6255093c0f3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
          : v,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    location: {
      type: String,
      index: true,
    },
    country: {
      type: String,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coordinates: {
      type: {
        lat: Number,
        lng: Number,
      },
      index: "2dsphere",
    },
    amenities: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

listingSchema.index({ title: "text", location: "text", country: "text" });

const Listing = mongoose.model("listing", listingSchema);
module.exports = Listing;