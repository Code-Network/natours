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
router.route('/').get(bookingController.getAllBookings);

module.exports = router;
