const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  // This is sent during prodcution
  // A CastError is sent when URL is incorrect
  const message = `Invalid ${err.path}: ${err.value}.`;

  // 400 Error == 'Bad Request'
  return new AppError(message, 400);
};

// Triggered when we have a duplicate field
const handleDuplicateFieldsDB = err => {
  // This regex finds the text between quotes.
  // errmsg is a property created by Mongo which has the
  //   error text.  We want to extract the text between the quotes.
  //
  // For example:
  // "errmsg": "E11000 duplicate key error ... key: { name: \"The Sea Explorer\" }"
  //
  //  So, we need:  The Sea Explorer
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  // console.log(value);  // ex.  "The Sea Explorer"

  const message = `Duplicate field value: ${value}. Please use another value!`;

  // Status Code: 400 == Bad Request
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  // extract the message of each error from errors => errors.message
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// JWT Error - 401 - Unauthorized
// On incorrect token or missing token we get JsonWebTokenError
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// When a JWT is expired we get TokenExpiredError
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// TODO: Send an error website to the client in development
//  - If the URL starts with /api, it will send a more verbose Development Error
//     and we will render an error website with err.message
const sendErrorDev = (err, req, res) => {
  // Note: originalUrl is the entire URL and looks exactly like the route
  //  - if it starts with '/api' then we send down the JSON info
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });

    // Note: If the URL does not start with '/api' then we want to render an
    //   error website with err.message because we are in development
  }

  // RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

// Sends an error to the client in production
//  - Here we distinguish between Operational Errors and Unknown Errors
//  - If URL does not start with /api, we will render an Error website
//      without the extended more verbose err.message
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    // console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);

  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // { ...err } destructuring does not send error message in production
    // let error = { ...err };

    let error = Object.create(err);

    error.message = err.message;

    // Mongoose sends a CastError when a wrong URL is sent i.e. /apple
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // A duplicate git field happens when a unique field is duplicated
    //   i.e. creating a document with name: "The Forest Hunter"
    //   when that document name already exists
    // MongoDB declares error.name = "MongoError" when we have a duplicate field
    // The Mongoose error, however is error.code = 11000 when there is a duplicate field
    // When that happens, we send this error to handleDuplicateFieldsDB(error) which
    //    will
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // ValidationError is created by Mongoose and happens when the value
    // of a field does not meet the Schema requirements
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    // When the following JWT errors are triggered, set var error to perspective
    //   functions in order to send client useful error messages in production
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // console.log('error.message', error.message);
    // console.log('err.message', err.message);

    sendErrorProd(error, req, res);
  }
};
