const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")





main().then(()=>{
    console.log("connected to db")
}).catch(error=>{
console.log(error);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust") ;
}


app.get("/", (req,res)=>{
    res.send(" hi i am the root");
})

app.get("/testlisting",(req,res)=>{
      let sampleListing = new Listing({
        title:"my new villa",
        description:"by the beach",
        price:1200,
        location:"calangute , goa",
        country:"india"
      });
      sampleListing.save();
      console.log("sample was saved ");
      res.send("successful testing")
})



app.listen(8080, ()=>{
    console.log("sever is listning to 8080")
});

