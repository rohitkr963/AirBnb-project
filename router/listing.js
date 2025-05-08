const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js")
// const flash = require("connect-flash");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
    // index router
  .get(wrapAsync(listingController.index))
  // create route
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListings)
  );

// New Route
router.get("/new", isLoggedIn,listingController.renderNewForm)

// search route
router.get("/search",
  isLoggedIn,
  listingController.searchListings);

router.route("/:id")
        // show route
    .get(wrapAsync(listingController.showListings))
        // update route
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListings))
        // delete route
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListings));

//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));


module.exports = router; 