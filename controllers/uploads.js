const asyncHandler = require("../middleware/asyncHandler");
const { uploadToCloudinary } = require("../services/uploadService");
const { sendSuccess } = require("../utils/apiResponse");
const ExpressError = require("../utils/ExpressError");

module.exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ExpressError("Image file is required", 400);
  }

  const result = await uploadToCloudinary(req.file.buffer);
  sendSuccess(res, 200, { imageUrl: result.secure_url });
});
