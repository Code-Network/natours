const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

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
app.use(helmet());

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

// ============================================================================
// ============================================================================
// TODO: Body parser, reading data from body into req.body
// Limit the amount of data passed into the body to 10 killibytes (for Security)
app.use(express.json({ limit: '10kb' }));

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

// Create a route from which we will access the base.pug template
// We generally use app.get() when rendering pages in the browser.
// URL is the route we will use, which will be the root of our website => '/'
// Handler function is (req, res) => {}
app.get('/', (req, res) => {
  // Set status to 200 and render base pug; no need to specify .pug
  // tour and user are locals in the pug file
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Jonas'
  });
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// ============================================================================
// ============================================================================

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ============================================================================
// ============================================================================

app.use(globalErrorHandler);

// ============================================================================
// ============================================================================

module.exports = app;
