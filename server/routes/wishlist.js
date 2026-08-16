const express = require("express");
const router = express.Router();
const wishlist = require("../controllers/wishlist");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, wishlist.addToWishlist);
router.get("/", authenticate, wishlist.getWishlist);
router.delete("/:listingId", authenticate, wishlist.removeFromWishlist);

module.exports = router;
