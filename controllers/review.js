const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); 

module.exports.createReview = async (req, res) => {  // changed to async
        let listing = await Listing.findById(req.params.id);  // Retrieve listing by ID
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        let newReview = new Review(req.body.review);  // Create new review with the posted data
        newReview.author = req.user._id;
        listing.reviews.push(newReview);  // Add the new review to the listing's reviews array

        await newReview.save();  // Save the new review to the database
        await listing.save();  // Save the updated listing to the database

        req.flash("success", "New Review Created!");


        res.redirect(`/listings/${listing._id}`);  // Redirect to the listing's page
    };

module.exports.destroyReview = async (req, res) => {
        let { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  // Remove review from listing
        await Review.findByIdAndDelete(reviewId);  // Delete the review from the database
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);  // Redirect back to the listing's page
    }