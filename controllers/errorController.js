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

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
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
    let error = { ...err };

    // Mongoose sends a CastError when a wrong URL is sent i.e. /apple
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // A duplicate field happens when a unique field is duplicated
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

    sendErrorProd(error, res);
  }
};
