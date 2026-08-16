const express = require("express");
const router = express.Router();
const reviews = require("../controllers/reviews");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Create a review for a listing
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listingId, rating, comment]
 *             properties:
 *               listingId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post("/", authenticate, reviews.createReview);

/**
 * @openapi
 * /api/reviews/listing/{listingId}:
 *   get:
 *     summary: Get all reviews for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 */
router.get("/listing/:listingId", reviews.getListingReviews);

/**
 * @openapi
 * /api/reviews/me:
 *   get:
 *     summary: Get reviews created by the current user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User reviews fetched successfully
 */
router.get("/me", authenticate, reviews.getMyReviews);

/**
 * @openapi
 * /api/reviews/images:
 *   post:
 *     summary: Upload review images
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Review images uploaded successfully
 */
router.post("/images", authenticate, upload.array("images", 5), reviews.uploadReviewImages);
router.put("/:id", authenticate, reviews.updateReview);
router.delete("/:id", authenticate, reviews.deleteReview);

module.exports = router;
