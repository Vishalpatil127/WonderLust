const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema =new Schema({
    title :{
      type : String,
      require:true,
    },
    description :String,
    image :{
   default:"https://images.unsplash.com/photo-1501084817055-6255093c0f3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
   type: String,
   set:(v)=> v===" "? "https://images.unsplash.com/photo-1501084817055-6255093c0f3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
   :v,
    },
    price :Number,
    location : String,
    country : String,
})

const Listing = mongoose.model("listing",listingSchema);
module.exports = Listing;