const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")




main().then(()=>{
    console.log("connected to db")
}).catch(error=>{
console.log(error);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust") ;
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))

app.get("/", (req,res)=>{
    res.send(" hi i am the root");
})


app.get("/listings",async(req,res)=>{
  const allListings= await Listing.find({});
     res.render("listings/indexx.ejs",{allListings});
    })

// new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})

//craete route
app.post("/listings", async(req,res)=>{
   // let{title,description,image,price,location,country}= req.body;
 const newlisting= new Listing (req.body.listing)
  await newlisting.save();
  res.redirect("/listings");
})

// edit route
app.get("/listings/:id/edit", async(req,res)=>{
    let{id}=req.params;
      const listing = await Listing.findById(id); 
      res.render("listings/edit.ejs",{listing})
})
//update route
app.put("/listings/:id",async(req,res)=>{
    let{id}= req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing})
   res.redirect(`/listings/${id}`)
})
// show route
app.get("/listings/:id",async(req,res)=>{
      let{id}=req.params;
      const listing = await Listing.findById(id);
      
      res.render("listings/show.ejs",{listing});
})




// app.get("/testlisting",(req,res)=>{
//       let sampleListing = new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:"calangute , goa",
//         country:"india"
//       });
//       sampleListing.save();
//       console.log("sample was saved ");
//       res.send("successful testing")
// })



app.listen(8080, ()=>{
    console.log("sever is listning to 8080")
});

