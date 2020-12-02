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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // todo: Programming or other unknown error:
    //  don't leak error details
  } else {
    // 1) Log error
    // An error may occur if a token is expired
    console.error('ERROR 💥', err);

    // 2) Send generic message
    // Note: Verified that the following is received in
    //  production mode when a token is expired - TokenExpiredError
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // { ...err } destructuring does not send error message in production
    // let error = { ...err };
    let error = Object.create(err);

    // Mongoose sends a CastError when a wrong URL is sent i.e. /apple
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // A duplicategit field happens when a unique field is duplicated
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

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
