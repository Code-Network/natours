const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES

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
// Install npm express-mongo-sanitize package
// This will look at the req.body, req.query, and req.params to filter out all
//   of the dollar signs ( $ ) and dots ( . ) because that is how
//   MongoDB Operators are written
app.use(mongoSanitize());

// Data Sanitization against XSS attacks ( Cross Scripting )
// Install npm xss-clean

// ============================================================================
// ============================================================================
// TODO: Serving static files
app.use(express.static(`${__dirname}/public`));

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
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
