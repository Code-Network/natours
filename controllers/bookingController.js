const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Goal: 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // Goal: 2) Create checkout session
  // Install npm i stripe
  //
  // Goal: 3) Create session as a response, i.e. Send it to the client
});
