const Tour = require('../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking was successful! Please check your email for a' +
      " confirmation. If your booking doesn't show up here immediately, please come back later.";
  next();
};

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
  // 1) step: Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  /*
   2) step: Add some error handling in case there is not tour or a wrong tour is req
   Note: Without this, the entire error would be leaked to the client, such as
    in the absence of the tour (i.e. such as a bad url) the error would display,
     "Cannot read property 'name' of null" */
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 3) step: Build template
  // 4) step: Render template using the data from Step 1

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
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

  // TODO: Get the form user's information from the database
  // Note: Ensure that the route which calls this handler is protected.
  // Note: Do not pass in the entire request; we just want to update
  //    the name and the email.  This ensures that a hacker cannot
  //    add additional fields, storing malicious date into our DB.
  // Note: Passwords are handles separately;
  //   -- We NEVER update password using findByIdAnUpdate because
  //    that will not run the safe middleware which will take care
  //    of encrypting our passwords. That is why we have a separate
  //    route for that in our API and also why we have a separate
  //    form for that in our user interface.
  // Note: option new: true is to receive the latest update
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

// TODO:  Create a handler which connects to '/my-tours' route and displays
//  a page of all the bookings a user has made
// Note: We could use a virtual populate with tours and reviews,
//  but here is an example of how we do it manually
exports.getMyTours = catchAsync(async (req, res, next) => {
  // step: 1) Find ALL bookings by the current user
  // Note: Each booking schema as a user id; here we query by the user ID
  const bookings = await Booking.find({ user: req.user.id });

  // console.log('Booking.find === ', bookings);

  // todo: Create an Array of all of the tour ids
  // step: 2) Find tours with the returned IDs;
  //  the tour ids for the bookings for the user
  // note: Go through users bookings and extract ids, put in an array.
  const tourIDs = bookings.map(el => el.tour);

  // step: 3) Now, having all of the tour ids, we can get the tours
  //  corresponding with those tour ids
  // important: Do not use findById because we have to use the $in operator
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // step: 4) Render the Overview Page with the matching tours the user has paid for
  // note: We will end up with a page that looks like the overview page,
  //  but only with the tours from const tours
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

/*  // todo: Alternate getMyTours
    // note: fetching of the tours a user has purchased could be more straight forward
     1.  const getMyTours = catchAsync(async (req, res, next) => {
         const bookings = await Booking.find({ user: req.user.id });
         const tours = await Promise.all(
           bookings.map(async el => {
            return await Tour.findById(el.tour);
           })
         );

         res.status(200).render('overview', {
           title: 'My Tours',
           tours,
         });
       });
*/
