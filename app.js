const express = require('express');
const morgan = require('morgan');

const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('Hello from the middleware 😻');
  next();
});

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
// TODO: 4)  START SERVER
// =================================================================
//

module.exports = app;
