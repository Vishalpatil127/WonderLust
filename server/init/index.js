require("dotenv").config();
const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wonderlust";
  await mongoose.connect(uri);

  let host = await User.findOne({ email: "host@wonderlust.com" });
  if (!host) {
    host = new User({
      username: "wonderlusthost",
      email: "host@wonderlust.com",
      password: "host12345",
      role: "host",
    });
    await host.save();
  }

  await Listing.deleteMany({});

  const listings = initdata.data.map((listing, index) => ({
    ...listing,
    owner: host._id,
    status: "active",
    isFeatured: index < 5,
    amenities: listing.amenities || ["WiFi", "Parking", "Kitchen"],
    coordinates: {
      lat: 12.5 + index * 0.5,
      lng: 77.5 + index * 0.5,
    },
  }));

  await Listing.insertMany(listings);
  console.log(`Seeded ${listings.length} listings for ${host.email}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});