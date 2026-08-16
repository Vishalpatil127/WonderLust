const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");
const { authenticate } = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/", listings.getAllListings);
router.get("/:id", listings.getListing);
router.post("/", authenticate, authorize("host", "admin"), listings.createListing);
router.put("/:id", authenticate, authorize("host", "admin"), listings.updateListing);
router.delete("/:id", authenticate, authorize("host", "admin"), listings.deleteListing);

module.exports = router;
