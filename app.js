const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// ============================================================================
// ============================================================================

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================================================
// ============================================================================

// TODO:  Create a Limiter to limit the amount of requests per IP over a certain time
//  100 requests per hour ( in milliseconds )
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again in an hour!'
});

// Todo: Create a middleware function which limits access to '/api' route
app.use('/api', limiter);

// ===========================================================================
// ============================================================================

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// ============================================================================
// ============================================================================

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
