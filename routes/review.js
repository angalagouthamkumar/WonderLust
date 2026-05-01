const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//reviews 
//post route
router.post("/", validateReview,isLoggedIn, wrapAsync (reviewController.createReview));
//delete review route
router.delete("/:reviewId", isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;