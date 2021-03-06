const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Note: All booking routes are strictly for authenticated users
router.use(authController.protect);

// TODO: Create a route for the client to create a Stripe Checkout Session
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// Note: The routes below will be restricted to admin and lead-guide roles
router.use(authController.restrictTo('admin', 'lead-guide'));

// Todo: Create main booking route
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

// Todo: Create routes which enables an admin or lead-guide to,
//  GET a booking,
//  update ( PATCH ) a booking
//  or DELETE a booking
//  -- based on the booking ID --
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
