const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const appError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Goal: 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  console.log(tour);

  // Goal: 2) Create checkout session
  // Install and require stripe
  // Important: Stripe only accepts images that are live;
  //  for testing, go to https://www.natours.dev for images
  // Note: Multiply price by 100 cents for Stripe requirements
  // Important: This is stripe 7.0.0; but stripe is on 8+ at the moment
  //  and uses a POST request as a route, not a GET.
  //  We will see if we can do it this way; if it fails, then we will
  //  upgrade and try the current documentation
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // Goal: 3) Create session as a response, i.e. Send it to the client
  /*
    Content-Security-Policy Issues
    --  If you have deployed a CSP, the full set of directives that Stripe.js
        and Checkout require are:  https://stripe.com/docs/security/guide

    Stripe.js =>
         connect-src, https://api.stripe.com
         frame-src, https://js.stripe.com, https://hooks.stripe.com
         script-src, https://js.stripe.com

     Checkout =>
         connect-src, https://checkout.stripe.com
         frame-src, https://checkout.stripe.com
         script-src, https://checkout.stripe.com
         img-src, https://*.stripe.com



   */
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self'; connect-src  data: blob: https://bundle.js:* https://*.mapbox.com" +
        ' https://*.cloudflare.com/' +
        ' https://bundle.js:*' +
        ' https://api.stripe.com  https://checkout.stripe.com; frame-src ' +
        "'self' https://js.stripe.com  https://hooks.stripe.com https://checkout.stripe.com; script-src" +
        " https://js.stripe.com https://checkout.stripe.com; img-src https://*.stripe.com 'self'"
    )
    .json({
      status: 'success',
      session
    });
});
