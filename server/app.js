require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/db");
const env = require("./config/env");
const logger = require("./config/logger");
const swaggerSpec = require("./docs/swagger");
const { securityMiddleware } = require("./middleware/security");
const listingRoutes = require("./routes/listings");
const userRoutes = require("./routes/users");
const bookingRoutes = require("./routes/bookings");
const wishlistRoutes = require("./routes/wishlist");
const paymentRoutes = require("./routes/payments");
const oauthRoutes = require("./routes/oauth");
const passport = require("./services/oauthService");
const dashboardRoutes = require("./routes/dashboard");
const uploadRoutes = require("./routes/uploads");
const reviewRoutes = require("./routes/reviews");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = env.PORT;

// Trust proxy — required for rate limiter and secure cookies behind nginx/load balancers
app.set("trust proxy", 1);

const allowedOrigins = (env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

connectDB().catch((err) => {
  logger.error("MongoDB connection failed:", err.message);
  process.exit(1);
});

app.use(morgan("combined"));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all localhost ports in development only
      if (env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(securityMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Initialize Passport so `passport.authenticate` works in routes
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ message: "Wonderlust API is running" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
