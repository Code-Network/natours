const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// TODO:  Create a Nested POST Endpoint
// Set some mergeParams:true in Router to allow access to params tourId
//    from the tour router. Setting mergeParams to true enables access
//    to the tour router's tourId param
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
