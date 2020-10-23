const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//
// =================================================================
// TODO:  1)  MIDDLEWARES
// =================================================================
//
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // Morgan for logging
  app.use(morgan('dev'));
}

// Middleware:  a function that can modify the incoming request data
//  Otherwise, req.body will be undefined instead of containing client post data
app.use(express.json());

//
// ---------------------------
//

app.set('json spaces', 2); // number of spaces for indentation

//
// ---------------------------
//

//  This app is an API, so we really shouldn't serve static files, but
//     Here is an example of how we do that.
// Note:  This will be found in Browser at url:
// localhost:3000/overview.html not
// localhost:3000/public/overview.html
//   because browsers automatically seek the public/ folder
//   Sets public folder to the root
//   ex.  http://localhost:3000/img/pin.png
//  Only works for static files in public/
// NOTE!  the html is not supposed to be served like this.
//    But this is how we serve static files froma folder and not from a route
app.use(express.static(`${__dirname}/public`));

//
// ----------------------------
//

//  Middle ware functions that we want to add to the middleware stack
//  To test our madeup middleware we send a simple request to the API
//  'Hello from the middleware 😻' should show up in the terminal
//  Since we did not specify any route, it will send it to all requests
//  NOTE:  If you put this after the route you are requesting it won't be called
//      because the cycle was already finished
/*app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('Hello from the middleware 😻');
  next();
});*/

//
// -----------------------------
//

//  Manipulate the request object by adding the current time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//
// ----------------------------
//

// =================================================================
// TODO: 2)  ROUTE HANDLERS
// =================================================================
// -- sent to `${__dirname}/routes`

//
// =================================================================
// TODO:  3)  ROUTES (this is where we mount our routers)
// =================================================================
//

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//
// =================================================================
// TODO:  4)  ERROR HANDLING
// =================================================================
//
// OPERATIONAL ERROR
// If URL has not been handled by the previous routers, it is a wrong
//  or badly typed URL, so we have to do something about bad URL for
//  all of the verbs (GET, DELETE, PATCH, etc )
// .all() means all verbs/http methods (get, post, patch, etc)
//  '*' means all the URLs/routes
// req.originalUrl =>  the URL that was requested
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cannot find ${req.originalUrl} on this server`,
  // });
  // next();

  const err = new Error(`CANNOT FIND ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;

  /*
   Any argument in next() is seen as an error by Express,
   and it will then skip all middlewares in the middleware stack
   and send the error that we passed in next() to our
   global error handling middleware, which will then go to our
   Error Handler [app.use((err, req, res, next) => {})] and be executed.
   */
  next(err);
});

// TODO:  Define a GLOBAL Error Handling Middleware
app.use((err, req, res, next) => {
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

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

//
// =================================================================
// TODO: 5)  START SERVER
// =================================================================
//

module.exports = app;
