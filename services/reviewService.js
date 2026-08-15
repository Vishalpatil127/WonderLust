const Review = require("../models/review");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

const validateReviewInput = ({ rating, comment, images }) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ExpressError("Rating must be an integer between 1 and 5", 400);
  }

  if (typeof comment !== "string" || comment.trim().length < 5) {
    throw new ExpressError("Comment must be at least 5 characters long", 400);
  }

  if (images && (!Array.isArray(images) || images.some((image) => typeof image !== "string" || !image.trim()))) {
    throw new ExpressError("Images must be an array of valid image URLs", 400);
  }

  return {
    rating,
    comment: comment.trim(),
    images: images || [],
  };
};

const calculateAggregateRating = (reviews) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return {
    averageRating: Number((total / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
  };
};

const updateListingRating = async (listingId) => {
  const reviews = await Review.find({ listing: listingId }).select("rating");
  const aggregate = calculateAggregateRating(reviews);
  await Listing.findByIdAndUpdate(listingId, aggregate, { new: true });
  return aggregate;
};

const createReview = async ({ listingId, userId, payload }) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  const existingReview = await Review.findOne({ listing: listingId, user: userId });
  if (existingReview) {
    throw new ExpressError("You already reviewed this listing. Edit your existing review instead.", 409);
  }

  const normalizedPayload = validateReviewInput(payload);
  const review = await Review.create({
    listing: listingId,
    user: userId,
    ...normalizedPayload,
  });

  await updateListingRating(listingId);
  return review;
};

const getReviewsForListing = async (listingId) => {
  return Review.find({ listing: listingId })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });
};

const getReviewsByUser = async (userId) => {
  return Review.find({ user: userId })
    .populate("listing", "title image location country")
    .sort({ createdAt: -1 });
};

const getReviewById = async (reviewId) => {
  return Review.findById(reviewId);
};

const updateReview = async ({ reviewId, userId, role, payload }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ExpressError("Review not found", 404);
  }

  if (review.user.toString() !== userId.toString() && role !== "admin") {
    throw new ExpressError("Not authorized to update this review", 403);
  }

  const normalizedPayload = validateReviewInput(payload);
  Object.assign(review, normalizedPayload);
  await review.save();
  await updateListingRating(review.listing);
  return review.populate("user", "username avatar");
};

const deleteReview = async ({ reviewId, userId, role }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ExpressError("Review not found", 404);
  }

  if (review.user.toString() !== userId.toString() && role !== "admin") {
    throw new ExpressError("Not authorized to delete this review", 403);
  }

  const listingId = review.listing;
  await review.deleteOne();
  await updateListingRating(listingId);
  return true;
};

module.exports = {
  validateReviewInput,
  calculateAggregateRating,
  updateListingRating,
  createReview,
  getReviewsForListing,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
};
