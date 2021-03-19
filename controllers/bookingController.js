const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const appError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Goal: 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  /*
      Goal: 2) Create checkout session
        -- Install and require stripe
   Important: Stripe only accepts images that are live; for testing,
    go to https://www.natours.dev for images

   Important: Multiply price by 100 cents for Stripe requirements

   Note: This is stripe 7.0.0; but stripe is on 8+ at the moment and uses a
    POST request as a route, not a GET. We will see if we can do it this
    way as a GET with the older version; if it fails, then we will upgrade
     and try the current documentation

   Note: success_url is the basis of the functionality we are to implement;
    Whenever a Booking is successful, the Browser will automatically go here:
          success_url: `${req.protocol}://${req.get('host')}/`
    Step: On booking success, put the data we will need to create a new booking
     as a query string right on the URL with the three required fields from
     our booking model -- tour, user and price.
     Important: Remove previous unsecure success_url
     code-sample: // Was a temporary fix
       success_url: `${req.protocol}://${req.get('host')}/?tour=${
       req.params.tourId
       }&user=${req.user.id}&price=${tour.price}`
   */
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
        ],
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

// Note: Replaced when we added Stripe Webhook - exports.webhookCheckout
// TODO: Create a new booking in the database
// Important: Not to be confused with createBooking
//  which will be accessible from our Booking API via POST url '/bookings'
/*exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // FIXME: This is only TEMPORARY, because it's UNSECURE:
  //    everyone can make bookings without paying
  // step: Get the data from the query string
  const { tour, user, price } = req.query;

  /!*
   step: Ensure the required fields exist
   Note: What exactly is the next middleware?
     - Remember that we want to create a new booking on the Home URL from:
     exports.getCheckoutSession const session:
       success_url: `${req.protocol}://${req.get('host')}/?tour=${
                      req.params.tourId
                     }&user=${req.user.id}&price=${tour.price}`,
     because that is the URL that is called whenever a purchase is
     successful with Stripe.
     -- So, what we need to do is to add this
     middleware function that we are creating right now onto the
     middleware stack of this route handler.
     -- What Route Handler is that?  It's the '/' route in
          routes/viewRoutes.js - isLoggedIn
     router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
     Important: That is the route that will be hit when a credit card
       is successfully charged.  This is also the point in time where
       we want to create a new booking.
   *!/
  if (!tour && !user && !price) return next();

  // step: Create the specific booking for the database
  await Booking.create({ tour, user, price });

  /!* Example Output:
     [
        '/',
        'tour=5c88fa8cf4afda39709c2955&user=60402477f3dc8d18f387de73&price=497'
     ]
   *!/

  // step: Redirect to the home page, which will direct us back here,
  //  only without the query strings for a bit more security
  // Note: On the second call to this middleware, since on redirect the
  //  query strings have been removed, it will fail the if statement
  //  which calls next()
  // Note: We do not call next() the first time because we will redirect to
  //  (make a request) to our root ( home page ) in
  //  (completely stripped of the query strings)
  //  In viewRoutes.js .get('/', bookController.createBookingCheckout.
  //  a second call to this middleware is made, only this time,
  //  the GET request will not have the query strings, thereby making
  //  this call a little more secure.

  res.redirect(req.originalUrl.split('?')[0]);
});*/

// session is exactly the session we previously created
// Use properties from session above
const createBookingCheckout = async session => {
  // tour, user and price are stored in the session
  const tour = session.client_reference_id;

  // to get user id, we will query by the email
  const user = (await User.findOne({ email: session.customer_email })).id;

  // price is stored in cents; divide by 100 to get dollar amount
  // Note: Use display_items because Stripe changed the property name
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};

// Important: Whenever a payment is successful, this will run.
//  Stripe will then call our webhook, which is the URL which is going to call
//  this function.  This function receives a body from the request, and then
//  together with the signature and/or webhook secret, creates an event which
//  will contain the session.  Using that session data, we can create our
//  new booking in the database.
exports.webhookCheckout = (req, res, next) => {
  // Read the Stripe signature from the headers Stripe sends
  const signature = req.headers['stripe-signature'];

  // Create a Stripe Event - must have Stripe Library installed
  let event;
  try {
    // Note: req.body is in raw form, available as a string
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Send back an error to Stripe
    return res.status(400).send(`Webhook error ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    // event.data.object is the checkout session
    createBookingCheckout(event.data.object);
  }

  // Send response to Stripe
  res.status(200).json({ received: true });
};

exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
