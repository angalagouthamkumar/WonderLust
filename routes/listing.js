const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingcontroller = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer( {storage})


router
    .route("/")
    .get(listingcontroller.index) // index route
    .post(isLoggedIn, (upload.single("listingimage")), validateListing,listingcontroller.createListing); // create route

// new route
router.get("/new", isLoggedIn, listingcontroller.renderNewForm);

router.route("/:id")
    .get( listingcontroller.showListing) // show route
    .put( isLoggedIn, isOwner,(upload.single("listingimage")), validateListing, listingcontroller.updateListing) // update route
    .delete(isLoggedIn, isOwner, listingcontroller.deleteListing) // delete route

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, listingcontroller.renderEditForm);


module.exports = router;