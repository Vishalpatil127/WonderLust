const express = require("express");
const router = express.Router();
const uploads = require("../controllers/uploads");
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");

router.post("/image", authenticate, upload.single("image"), uploads.uploadImage);

module.exports = router;