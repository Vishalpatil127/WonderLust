require("dotenv").config();
const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(error));

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wonderlust";
  await mongoose.connect(uri);
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data)
    console.log("data was initialized")
}
initDB();