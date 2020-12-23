const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // TODO: Get all reviews from a specific tour
  // Search for Reviews where tour = tourId
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  // If there is no tourId, then filter = {} and all reviews will be found
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// TODO: DeCouple from exports.createReview to set tour and user ids on the
//  body and add this function in reviewRoutes.js before
//  reviewController.createReview to ensure we get the ids
exports.setTourUserIds = (req, res, next) => {
  // TODO: Allow Nested Routes
  // This will make it so that the user can manually specify tour and user ID.
  // Define tour and user when they are not specified in the Request Body.
  // We just created the route for /tour/:tourId/reviews so we have to
  //  let the app know we want to use the current tour and the current user
  // So, if we didn't specify the tourId in the body,
  //    then we want to define that as the one coming from the URL
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // Note: We get req.user from the .protect() middleware
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = factory.createOne(Review);

/*exports.createReview = catchAsync(async (req, res, next) => {
  // Allow Nested Routes
  // This will make it so that the user can manually specify tour and user ID.
  // Define tour and user when they are not specified in the Request Body.
  // We just created the route for /tour/:tourId/reviews so we have to
  //  let the app know we want to use the current tour and the current user
  // So, if we didn't specify the tourId in the body,
  //    then we want to define that as the one coming from the URL
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // Note: We get req.user from the .protect() middleware
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});*/

exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
