const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const env = require("../config/env");

const hasCloudinary = !!(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

// Configure once at module load — always, so the instance is ready when needed
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a file buffer to Cloudinary.
 * Falls back to a base64 data-URL when credentials are not configured.
 *
 * @param {Buffer} fileBuffer
 * @param {object} [options]  - passed to cloudinary upload_stream
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "wonderlust", ...options },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  }

  // Fallback: base64 data-URL (works in <img> tags, not persisted after restart)
  const base64  = fileBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64}`;
  return Promise.resolve({
    secure_url: dataUrl,
    public_id:  `local_${Date.now()}`,
  });
};

module.exports = { uploadToCloudinary, hasCloudinary };
