const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listing",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
