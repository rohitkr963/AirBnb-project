const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");  // Import Listing model
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")
const reviewController = require("../controllers/review.js");

// POST a new review for a specific listing
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// POST Delete Route (for deleting a specific review)
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;
