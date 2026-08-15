const Wishlist = require("../models/wishlist");
const ExpressError = require("../utils/ExpressError");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

module.exports.addToWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) throw new ExpressError("listingId is required", 400);

  const existing = await Wishlist.findOne({ user: req.user._id, listing: listingId });
  if (existing) {
    throw new ExpressError("Listing already saved in wishlist", 409);
  }

  const wishlist = await Wishlist.create({ user: req.user._id, listing: listingId });
  sendSuccess(res, 201, { wishlist });
});

module.exports.getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id }).populate("listing");
  sendSuccess(res, 200, { items });
});

module.exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  await Wishlist.deleteOne({ user: req.user._id, listing: listingId });
  sendSuccess(res, 200, { message: "Removed from wishlist" });
});
