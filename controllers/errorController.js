// TODO:  Define a GLOBAL Error Handling Middleware

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

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
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
