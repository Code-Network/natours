class AppError extends Error {
  constructor(message, statusCode) {
    // message is the only parameter the built-in Error accepts
    super(message);
    this.statusCode = statusCode;

    // If the statusCode starts with a 4 it is 'fail',
    //    if not then it is 500, 'error'
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // This is for testing purposes because sometimes you get some
    //   crazy errors that does not come from us, so if the error has
    //   this.isOperational set to true, then we know it is ours/legit
    this.isOperational = true;

    // Capture the stack trace
    // this => The current object
    // this.constructor => The AppError class itself
    // When a new object is created and the constructor function is called,
    //  then that function call is not going to appear in the stack trace
    //  and will not pollute it.
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
