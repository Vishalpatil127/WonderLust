const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info("Connected to MongoDB");
};

module.exports = connectDB;
