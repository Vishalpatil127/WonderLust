const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV:             z.enum(["development", "production", "test"]).default("development"),
  PORT:                 z.coerce.number().default(8080),
  MONGODB_URI:          z.string().min(1),
  JWT_SECRET:           z.string().min(16),
  // Required in production; falls back to JWT_SECRET in dev so local setup still works
  JWT_REFRESH_SECRET:   z.string().min(16).optional(),
  CLIENT_URL:           z.string().url().default("http://localhost:5173"),
  // Full public URL of this API server — used for OAuth callback in production
  // e.g. https://api.wonderlust.com  (no trailing slash)
  APP_URL:              z.string().url().optional(),
  // Google OAuth
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Derived convenience field — built from APP_URL when present
  GOOGLE_CALLBACK_URL:  z.string().url().optional(),
  // Razorpay
  RAZORPAY_KEY_ID:      z.string().optional(),
  RAZORPAY_KEY_SECRET:  z.string().optional(),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY:    z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // SMTP
  SMTP_HOST:  z.string().optional(),
  SMTP_PORT:  z.coerce.number().optional(),
  SMTP_USER:  z.string().optional(),
  SMTP_PASS:  z.string().optional(),
  // Redis
  REDIS_URL:  z.string().optional(),
});

const parsed = envSchema.parse(process.env);

// Derive GOOGLE_CALLBACK_URL from APP_URL when not explicitly set
if (!parsed.GOOGLE_CALLBACK_URL && parsed.APP_URL) {
  parsed.GOOGLE_CALLBACK_URL = `${parsed.APP_URL}/api/oauth/google/callback`;
}

// Warn in production if JWT_REFRESH_SECRET is missing
if (parsed.NODE_ENV === "production" && !parsed.JWT_REFRESH_SECRET) {
  console.warn(
    "[WARN] JWT_REFRESH_SECRET is not set. Falling back to JWT_SECRET for refresh tokens. " +
    "Set JWT_REFRESH_SECRET in production for proper token rotation."
  );
}

module.exports = parsed;
