const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

// TODO: Create a Route for the top 5 cheapest tours
// Middleware must be run before we get to the getAllTours handler
// It is the middleware function - aliasTopTours()
//    in tourController.js which manipulates the
//    query object that's coming in.
// Prefill some of the fields in the query string in
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

//  Param Middleware
//  Logs the saved param name ('id') and the value (6).
/*
  router.param('id', (req, res, next, value, name) => {
  console.log(`Tour id is: ${value}`); // 3, or whatever id in url localhost:3000/api/v1/tours/3
  console.log(`Tour name is: ${name}`); // id
  next();
});
*/
// router.param('id', tourController.checkID);

// Create a checkBody middleware function
//  Check if body contains the name and price property
//  If not, send back status 400 (bad request)
// This is created in tourController.js and added to
//    router.post as tourController.checkBody
// .post(tourController.checkBody, tourController.createTour);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
