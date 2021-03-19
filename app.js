const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csp = require('express-csp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

/*
  Todo: Heroku uses proxies to redirect or modify connections; trust proxy
  Note: By enabling the "trust proxy" setting via app.enable('trust proxy'),
   Express will have knowledge that it's sitting behind a proxy and that
   the X-Forwarded-* header fields may be trusted, which otherwise may be
   easily spoofed. Enabling this setting has several subtle effects.
   The first of which is that X-Forwarded-Proto may be set by the reverse
   proxy to tell the app that it is https or simply http.
   This value is reflected by req.protocol. The second change this makes is
   the req.ip and req.ips values will be  populated with
   X-Forwarded-For's list of addresses.
*/
app.enable('trust proxy');

// Todo: Implement CORS
// Note:  Used in development
// app.use(
//   cors({
//     credentials: true,
//     origin: 'http://localhost:3000'
//   })
// );

// Todo:  Implement CORS in production
// Implement CORS
// Note: The cors package adds appropriate headers for cross origin
//  resource sharing to our response for all incoming GET and POST requests.
app.use(cors());

// Access-Control-Allow-Origin * (all)
// if backend is at api.kokodev-adventures.herokuapp.com,
//  and front-end is at kokodev-adventures.herokuapp.com ( different )
// app.use(cors({
//   origin: 'https://kokodev-adventures.herokuapp.com'
// }))

/*
  Note: Enable pre-flight request for all more complex HTTP requests
     (PATCH, DELETE and PUT or requests that send cookies or use nonstandard headers)
     These require a pre-flight phase.
   For complex requests, the browser sends an OPTIONS request when there
     is a pre-flight phase to see if it is safe to send.
   We must respond to that OPTIONS request from the browser on our own server
     by sending back the same Access-Control-Allow-Origin header, etc.
     (through CORS package)
   Note that OPTIONS, is just another HTTP Request.
   Note: We can allow a preflight phase on one route, but we will do them all.
     code-sample: ( if one route )
        app.options('/api/v1/tours/:id', cors());
  step:
   '*' Defines the route for which we want to handle the OPTIONS request (all)
   The cors() middleware is the handler. */
app.options('*', cors());

app.use(express.static('.'));

// TODO:  Set up the Pug Engine
// a) Inform express what engine we want to use.
// Template View Engine is Pug
// Express supports pug, no need to install or require
// Pug templates are called views in Express
app.set('view engine', 'pug');

// b) Point to the folder where we will have our Pug files.
// The path we provide is always relative to the directory from where
// we launched the Node Application - server.js in root project folder
// -- Don't do this:  app.set('views', './views');
// A trick we can use with Node is to use the path module to tell
//   express where the views folder is.
//   - path is a built-in node module.. require path
// This will, behind the scenes, join the directory name 'views'
// We use this trick because Node will create a correct path with __dirname
// and we won't have to worry about whether or not we need a slash.
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// TODO: Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// ===========================================================================
// ===========================================================================
// TODO: Set Security HTTP headers
// Will have to do the extended version of helmet in production
app.use(helmet());
csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:8828',
        'ws://localhost:56558/'
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/'
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/'
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/'
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'wss://kokodev-adventures.herokuapp.com:*/',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/'
      ]
    }
  }
});

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

// TODO: Parse urlencoded form data
//  The express.urlencoded() function is a built-in middleware function
//  in Express. It parses incoming requests with urlencoded payloads,
//  such as form data and is based on body-parser.
// -- Used for parsing application/x-www-form-urlencoded
// Note: viewsController.js exports.updateUserData requires this in order to
//   parse the form data. If not, then req.body at exports.updateUserData will
//   be empty. The way that a form sends data to the server is also urlencoded,
//   so we need this middleware to parse the data coming from a urlencoded form.
// Set extended:true to allow us to pass more complex data in future if desired.
// Set limit: 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================================================
// ============================================================================
// TODO: Body parser, reading data from body into req.body
// Limit the amount of data passed into the body to 10 killibytes (for Security)
// Used for parsing application/json
app.use(express.json({ limit: '10kb' }));

// TODO: Use cookie parser
app.use(cookieParser());

// ============================================================================
// ============================================================================
// TODO: Data Sanitization -- protect against two attacks
// Data Sanitization against NoSQL query injection
// - Install npm express-mongo-sanitize package
// - This will look at the req.body, req.query  and req.params to
//    filter out all of the dollar signs ( $ ) and dots ( . ) because that
//    is how MongoDB Operators are written
app.use(mongoSanitize());

// Data Sanitization against XSS attacks ( Cross Scripting )
// Install npm xss-clean
/* Note:  Make sure this comes before any routes.
    -- This guards against any malicious HTML code.
 *  -- Will sanitize user input coming from POST body, GET queries, and url params
 *      -- data in req.body, req.query, and req.params
 * You can also access the API directly if you don't want to use as middleware.*/
app.use(xss());

// Prevent Parameter Pollution
// HPP is Express middleware to protect against HTTP Parameter Pollution attacks
// HPP puts array parameters in req.query and/or req.body aside and just selects
//    the last parameter value.
// You add the middleware after parsing and you are done
// We use the whitelist option to specify the fields we do not want hpp to touch
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// TODO:  Compress files for deployment
app.use(compression());

// ============================================================================
// ============================================================================
// TODO: Middleware for testing only
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  // console.log('COOKIES:  ', req.cookies);

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

// PUG ROUTES
app.use('/', viewRouter);

// COLLECTION ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// ====================================================================
// ====================================================================

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// =====================================================================
// =====================================================================

app.use(globalErrorHandler);

// =====================================================================
// =====================================================================

module.exports = app;
