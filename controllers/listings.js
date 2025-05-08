const Listing = require("../models/listing.js");

// Index Route
module.exports.index = async(req,res) => {
   const allListing = await Listing.find({});
   res.render("./listings/index.ejs",{allListing});

}

// New Route
module.exports.renderNewForm = (req,res) =>{
    res.render("listings/new.ejs"); 
};

// Shwo Route
module.exports.showListings = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path : "reviews", populate: {
        path:"author",
    }})
    .populate("owner");
    if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing}); 
}

// Create Route
module.exports.createListings = async(req,res,next) =>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing (req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url,filename }; 
    await newListing.save();
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
}

// Edit Route
module.exports.renderEditForm = async(req,res) =>{
    let  { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
        }

        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
}

// Update Route
module.exports.updateListings = async(req,res) =>{
    let  { id } = req.params;
    if(!req.body.listing){
        throw new ExpressError(404,"send valid data for listings");
    }
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }   
    req.flash("success", "listing Update!");
    res.redirect(`/listings/${id}`);
}

// Delete Route
module.exports.destroyListings = async(req,res) =>{
    let  { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing Deleted!");
    res.redirect("/listings");
};

// search route
module.exports.searchListings = async (req, res) => {
    const query = req.query.q; // Get the query from the search form
    console.log(`Searching for: ${query}`);

    const regex = new RegExp(query, 'i'); // Create a case-insensitive regex for search
    
    // Query listings where title, description, or location matches the regex
    const listings = await Listing.find({
        $or: [
            { title: regex },
            { description: regex },
            { location: regex }
        ]
    });

    console.log(`Found listings: ${listings.length}`);
    
    // Render search results
    res.render("listings/searchResults.ejs", { listings, query });
};
