const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

//  Param Middleware
//  Logs the saved param name ('id') and the value (6).
/*
  router.param('id', (req, res, next, value, name) => {
  console.log(`Tour id is: ${value}`); // 3, or whatever id in url localhost:3000/api/v1/tours/3
  console.log(`Tour name is: ${name}`); // id
  next();
});
*/
router.param('id', tourController.checkID);

// Create a checkBody middleware function
//  Check if body contains the name and price property
//  If not, send back status 400 (bad request)
// This is created in tourController.js and added to
//    router.post as tourController.checkBody
// .post(tourController.checkBody, tourController.createTour);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
