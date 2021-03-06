const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// TODO: Create a route for the client to create a Stripe Checkout Session
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

module.exports = router;
