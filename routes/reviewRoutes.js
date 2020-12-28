const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// TODO:  Create a Nested POST Endpoint
// Set some mergeParams:true in Router to allow access to params tourId
//    from the tour router. Setting mergeParams to true enables access
//    to the tour router's tourId param
const router = express.Router({ mergeParams: true });

// Every reviews route must be authenticated
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
