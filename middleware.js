const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js"); 
const {listingSchema} = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){   // ye use krte h taki ham check kr ske ki user phle se login h ya nhi
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be login to create create listing!")
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


//  isko use krke ham edit aur delete btn usi user ko show krte h jo ki jisne jis listing ko banaya h agar koi dusra aadmi koi dusre listings ko edit ya delete krna chahe to nhi kr payega 
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // Check if listing even exists
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Check if current user is owner
    if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};


module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body); // validate the data
    if(error){
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // validate the data
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next) => {            
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}