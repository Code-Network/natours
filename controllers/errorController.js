// TODO:  Define a GLOBAL Error Handling Middleware
const AppError = require('./../utils/appError');

// ------------------------------------
// ------------------------------------
// TODO: Function to Handle DB CastError
// ------------------------------------
// ------------------------------------
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  /*
	 Status Code 400 => Bad Request -
	 The server cannot or will not process the request due to
	 something that is perceived to be a client error
	 (e.g., malformed request syntax, invalid request message
	 framing, or deceptive request routing).
	*/
  return new AppError(message, 400);
};

// ------------------------------------
// ------------------------------------
// TODO: Function to Handle Duplicate DB Fields
// ------------------------------------
// ------------------------------------
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;

  /*
		 Status Code 400 => Bad Request -
		 The server cannot or will not process the request due to
		 something that is perceived to be a client error
		 (e.g., malformed request syntax, invalid request message
		 framing, or deceptive request routing).
 */
  return new AppError(message, 400);
};

// ------------------------------------
// ------------------------------------
// TODO: Function to Handle DB Validation Errors
// ------------------------------------
// ------------------------------------
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  /*
	 Status Code 400 => Bad Request -
			The server cannot or will not process the request due to
			something that is perceived to be a client error
			(e.g., malformed request syntax, invalid request message
			framing, or deceptive request routing).
	*/
  return new AppError(message, 400);
};

// ------------------------------------
// ------------------------------------
// TODO: Function for Error Data in Development Only
// ------------------------------------
// ------------------------------------
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// ------------------------------------
// ------------------------------------
// TODO: Function for Error Data in Production Only
// ------------------------------------
// ------------------------------------
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 1) Log error
    console.log('ERROR 💥💥💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// ------------------------------------
// ------------------------------------
// TODO: Module Exports Error Controller
// ------------------------------------
// ------------------------------------
module.exports = (err, req, res, next) => {
  // See what is on the stack trace
  // The stack shows us where the error happened
  console.log('This is the STACK TRACE', err.stack);

  /* DEFAULT STATUS CODE
	 -- We want to read the err status code from the object itself.
	 -- When we create the status code on res.status,
	 we will define the status code on the status error.
	 -- Error Code 500 = Internal Server Error
	 -- We will define a default (500)
	 -- Ideally, we want to read the Error Object err.statusCode,
	 because there will be errors not coming from us, but from the
	 application, errors that we have not defined ourselves.
	 -- But if it is not defined, our default will be 500.
	 */
  err.statusCode = err.statusCode || 500;

  /*
	 DEFINE THE STATUS PROPERTY (i.e. status: 'fail')
	 We also want to define the value of the status property:.
	 Again we want to read the status property ( ex. 'fail' ),
	 but it will be 'error' by default if status is undefined.
	 */
  err.status = err.status || 'error';

  // Distinguish between friendly errors sent in production and
  //    detailed errors sent during development
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
