const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

// Apply isLoggedIn to every single route we create on this page
// router.use(authController.isLoggedIn);

// Important: On Credit Card Charged Successfully after booking,
//  this route will be hit; Stripe will send a GET request here.
// FIXME: bookingController.createBookingCheckout here is
//  temporary because it is UNSECURE; we will use this in development
//  until we have our website deployed to a server
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

// NOTE: Test Only: protect getTour and test by removing cookie
// router.get('/tour/:slug', authController.protect, viewsController.getTour);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

// TODO: A route which will display all of the tours a user has booked
router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);

// POST route used with form on account.pug
// Important: We protect this route because we want to ensure that only the
//  user can update their settings ( name, email and password )
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
