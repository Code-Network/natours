const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000'
  })
);

// TODO:  Set up the Pug Engine
// a) Inform express what engine we want to use.
// Template View Engine is Pug
// Express supports pug, no need to install or require
// Pug templates are called views in Express
app.set('view engine', 'pug');

// b) Point to the folder where we will have our Pug files.
// The path we provide is always relative to the directory from where
// we launched the Node Application - server.js in root project folder
// -- Don't do this:  app.set('views', './views');
// A trick we can use with Node is to use the path module to tell
//   express where the views folder is.
//   - path is a built-in node module.. require path
// This will, behind the scenes, join the directory name 'views'
// We use this trick because Node will create a correct path with __dirname
// and we won't have to worry about whether or not we need a slash.
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// TODO: Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// ===========================================================================
// ===========================================================================
// TODO: Set Security HTTP headers
// Will have to do the extended version of helmet in production
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: [
//           "'self'",
//           'data:',
//           'blob:',
//           'https:',
//           'https://*.cloudflare.com',
//           'https://js.stripe.com',
//           'https://*.mapbox.com',
//           'ws:'
//         ],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", 'https:', 'data:'],
//         scriptSrc: [
//           "'self'",
//           'https:',
//           'http:',
//           'blob:',
//           'data:',
//           'https://*.mapbox.com',
//           'https://js.stripe.com',
//           'https://m.stripe.network',
//           'https://*.cloudflare.com',
//           'https://checkout.stripe.com'
//         ],
//         frameSrc: [
//           "'self'",
//           'https://js.stripe.com',
//           'https://hooks.stripe.com',
//           'https://*.mapbox.com',
//           'https://checkout.stripe.com'
//         ],
//         objectSrc: ["'none'"],
//         styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
//         workerSrc: [
//           "'self'",
//           'data:',
//           'blob:',
//           'https://*.tiles.mapbox.com',
//           'https://api.mapbox.com',
//           'https://events.mapbox.com',
//           'https://m.stripe.network'
//         ],
//         childSrc: ["'self'", 'blob:'],
//         imgSrc: ["'self'", 'data:', 'blob:', 'https://*.stripe.com'],
//         formAction: ["'self'"],
//         connectSrc: [
//           "'self'",
//           'data:',
//           'blob:',
//           'https://*.stripe.com',
//           'https://*.mapbox.com',
//           'https://*.cloudflare.com/',
//           'https://bundle.js:*',
//           'https://checkout.stripe.com',
//           'https://api.stripe.com'
//
//           // 'ws://127.0.0.1:*/'
//         ],
//         upgradeInsecureRequests: false
//       }
//     }
//   })
// );

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", 'https:', 'data:'],
//         scriptSrc: [
//           "'self'",
//           'https:',
//           'http:',
//           'blob:',
//           'https://*.mapbox.com',
//           'https://checkout.stripe.com',
//           'https://js.stripe.com',
//           'https://m.stripe.network',
//           'https://*.cloudflare.com'
//         ],
//         frameSrc: [
//           "'self'",
//           'https://js.stripe.com',
//           'https://checkout.stripe.com'
//         ],
//         objectSrc: ["'none'"],
//         styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
//         workerSrc: [
//           "'self'",
//           'data:',
//           'blob:',
//           'https://*.tiles.mapbox.com',
//           'https://api.mapbox.com',
//           'https://events.mapbox.com',
//           'https://m.stripe.network'
//         ],
//         childSrc: ["'self'", 'blob:'],
//         imgSrc: ["'self'", 'data:', 'blob:'],
//         formAction: ["'self'"],
//         connectSrc: [
//           "'self'",
//           'data:',
//           'blob:',
//           'https://api.stripe.com',
//           'https://*.stripe.com',
//           'https://*.mapbox.com',
//           'https://*.cloudflare.com/',
//           'https://bundle.js:*'
//           // 'ws://127.0.0.1:*/',
//         ],
//         upgradeInsecureRequests: false
//       }
//     }
//   })
// );

// ============================================================================
// ============================================================================
// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================================================
// ============================================================================
// TODO: Limit requests from same API
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// TODO: Parse urlencoded form data
//  The express.urlencoded() function is a built-in middleware function
//  in Express. It parses incoming requests with urlencoded payloads,
//  such as form data and is based on body-parser.
// -- Used for parsing application/x-www-form-urlencoded
// Note: viewsController.js exports.updateUserData requires this in order to
//   parse the form data. If not, then req.body at exports.updateUserData will
//   be empty. The way that a form sends data to the server is also urlencoded,
//   so we need this middleware to parse the data coming from a urlencoded form.
// Set extended:true to allow us to pass more complex data in future if desired.
// Set limit: 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================================================
// ============================================================================
// TODO: Body parser, reading data from body into req.body
// Limit the amount of data passed into the body to 10 killibytes (for Security)
// Used for parsing application/json
app.use(express.json({ limit: '10kb' }));

// TODO: Use cookie parser
app.use(cookieParser());

// ============================================================================
// ============================================================================
// TODO: Data Sanitization -- protect against two attacks
// Data Sanitization against NoSQL query injection
// - Install npm express-mongo-sanitize package
// - This will look at the req.body, req.query  and req.params to
//    filter out all of the dollar signs ( $ ) and dots ( . ) because that
//    is how MongoDB Operators are written
app.use(mongoSanitize());

// Data Sanitization against XSS attacks ( Cross Scripting )
// Install npm xss-clean
/* Note:  Make sure this comes before any routes.
    -- This guards against any malicious HTML code.
 *  -- Will sanitize user input coming from POST body, GET queries, and url params
 *      -- data in req.body, req.query, and req.params
 * You can also access the API directly if you don't want to use as middleware.*/
app.use(xss());

// Prevent Parameter Pollution
// HPP is Express middleware to protect against HTTP Parameter Pollution attacks
// HPP puts array parameters in req.query and/or req.body aside and just selects
//    the last parameter value.
// You add the middleware after parsing and you are done
// We use the whitelist option to specify the fields we do not want hpp to touch
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// ============================================================================
// ============================================================================
// TODO: Middleware for testing only
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log('COOKIES:  ', req.cookies);

  /*
      // Use this middleware to log the headers to the console
      // The ones that a client can send along with a request

        In Postman, Get All Users, put in a Header for the token:
        "Authorization": "Bearer iamthetoken"

        Returns to console:
      //  {
      //  authorization: 'Bearer iamthetoken',
      //  'user-agent': 'PostmanRuntime/7.26.8',
      //  accept: ' * / *', // no spaces
      // 'cache-control': 'no-cache',
      //   'postman-token': 'b008bc5e-1a66-458f-9e6d-f852d80beb57',
      //   host: 'localhost:3000',
      //   'accept-encoding': 'gzip, deflate, br',
      //   connection: 'keep-alive'
      // }
*/
  // console.log(req.headers);

  next();
});

// ============================================================================
// ============================================================================

// 3) ROUTES

// PUG ROUTES
app.use('/', viewRouter);

// COLLECTION ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// ====================================================================
// ====================================================================

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// =====================================================================
// =====================================================================

app.use(globalErrorHandler);

// =====================================================================
// =====================================================================

module.exports = app;
