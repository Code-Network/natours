const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) todo: Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  /*
   2) todo: Add some error handling in case there is not tour or a wrong tour is req
   Note: Without this, the entire error would be leaked to the client, such as
    in the absence of the tour (i.e. such as a bad url) the error would display,
     "Cannot read property 'name' of null" */
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 3) todo: Build template
  // 4) todo: Render template using the data from Step 1

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "default-src 'self'", "connect-src 'self'")
    .render('login', {
      title: 'Log into your account'
    });
};

// TODO:  Get the User Account Page
exports.getAccount = (req, res) => {
  // Simply render the account page
  // No need to query the current user because that has already been done in the protect middleware
  res.status(200).render('account', {
    title: 'Your account'
  });
};

// TODO: Create a handler for the /submit-user-data route required on
//      first form on account.pug
exports.updateUserData = catchAsync(async (req, res, next) => {
  // Take a look at the body
  // Note: req.body will be empty because we need an express middleware
  //  in app.js in order to parse data from a form, i.e. In app.js,
  //  app.use(express.urlencoded({ extended: true, limit: '10kb' }))
  // Used for parsing application/x-www-form-urlencoded
  // console.log('UPDATING USER', req.body);
});
