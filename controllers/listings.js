const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { getCachedData, setCachedData } = require("../services/cacheService");

const buildFilter = (query) => {
  const filter = {};
  const { search, country, location, minPrice, maxPrice, status } = query;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  if (country) filter.country = { $regex: country, $options: "i" };
  if (location) filter.location = { $regex: location, $options: "i" };
  if (status) filter.status = status;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return filter;
};

const buildSort = (sortBy) => {
  switch (sortBy) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "newest":
      return { createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    default:
      return { createdAt: -1 };
  }
};

module.exports.getAllListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sort = "newest", nearby, radius = 50 } = req.query;
  const filter = buildFilter(req.query);
  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNumber - 1) * limitNumber;
  const sortOptions = buildSort(sort);
  const cacheKey = `listings:${JSON.stringify({ ...req.query, page: pageNumber, limit: limitNumber, sort })}`;

  const cached = await getCachedData(cacheKey);
  if (cached) {
    return sendSuccess(res, 200, cached);
  }

  if (nearby) {
    const [lat, lng] = nearby.split(",").map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new ExpressError("nearby should be provided as lat,lng", 400);
    }

    filter.coordinates = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: Number(radius) * 1000,
      },
    };
  }

  const [total, listings] = await Promise.all([
    Listing.countDocuments(filter),
    Listing.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .populate("owner", "username email"),
  ]);

  const payload = {
    success: true,
    count: listings.length,
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages: Math.ceil(total / limitNumber),
    listings,
  };

  await setCachedData(cacheKey, payload, 120);
  sendSuccess(res, 200, payload);
});

module.exports.getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    "owner",
    "username email"
  );

  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  sendSuccess(res, 200, { listing });
});

module.exports.createListing = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    owner: req.user._id,
    image: req.body.image || "https://images.unsplash.com/photo-1501084817055-6255093c0f3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  };

  const listing = new Listing(payload);
  await listing.save();
  await listing.populate("owner", "username email");

  sendSuccess(res, 201, { listing });
});

module.exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  if (!listing.owner.equals(req.user._id) && req.user.role !== "admin") {
    throw new ExpressError("Not authorized to update this listing", 403);
  }

  Object.assign(listing, req.body);
  await listing.save();
  await listing.populate("owner", "username email");

  sendSuccess(res, 200, { listing });
});

module.exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  if (!listing.owner.equals(req.user._id) && req.user.role !== "admin") {
    throw new ExpressError("Not authorized to delete this listing", 403);
  }

  await listing.deleteOne();
  sendSuccess(res, 200, { message: "Listing deleted" });
});
