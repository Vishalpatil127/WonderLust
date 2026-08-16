const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wonderlust";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};

module.exports = connectDB;
