const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

// POST /tour/26544/reviews
// GET /tour/26544/reviews
// GET /tour/26544/reviews/98745552

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

// TODO:  Create a Nested POST Endpoint
// router should use the reviewRouter if it ever should encounter a route
//   like this: /26544/reviews
// It says, "For this specific route '/:tourId/reviews,' we want to use the
//   reviewRouter instead"
// This is called 'Mounting a Router'
// This tour router should use the review router if it should ever
//   encounter this route:  '/:tourId/reviews'
// But this is not enough for this route to gain access to tourId;
//    - We must enable mergeParams in the reviewRouter to do that
// -- '/:tourId/reviews' is redirected to the reviewRouter
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
