const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const ExpressError = require("../utils/ExpressError");
const reviewService = require("../services/reviewService");
const { uploadToCloudinary } = require("../services/uploadService");

module.exports.createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview({
    listingId: req.body.listingId,
    userId: req.user._id,
    payload: req.body,
  });

  sendSuccess(res, 201, { review });
});

module.exports.getListingReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviewsForListing(req.params.listingId);
  sendSuccess(res, 200, { reviews });
});

module.exports.getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviewsByUser(req.user._id);
  sendSuccess(res, 200, { reviews });
});

module.exports.updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview({
    reviewId: req.params.id,
    userId: req.user._id,
    role: req.user.role,
    payload: req.body,
  });

  sendSuccess(res, 200, { review });
});

module.exports.deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview({
    reviewId: req.params.id,
    userId: req.user._id,
    role: req.user.role,
  });

  sendSuccess(res, 200, { message: "Review deleted successfully" });
});

module.exports.uploadReviewImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ExpressError("At least one image is required", 400);
  }

  let imageUrls;
  try {
    imageUrls = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );
  } catch (uploadErr) {
    console.error("Cloudinary upload error:", uploadErr);
    throw new ExpressError(`Image upload failed: ${uploadErr.message}`, 500);
  }

  sendSuccess(res, 200, { imageUrls: imageUrls.map((result) => result.secure_url) });
});
