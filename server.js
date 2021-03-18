const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Listen for uncaughtExceptions event such as console
//  logging a var that DNE i.e console.log( x )
// Then gracefully shut down the server.
// This listener is put at the top of our application
//  because it is synchronous. If we put it on the bottom
//  then it will not catch any uncaught exception errors which
//  came before it.  It will even catch errors in app.js.
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // We do not close the server gently here because we cannot
  //  access the server before initialization
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

// Note: process.env.PORT is mandatory to deploy on heroku
const port = process.env.PORT || 3000;

// Put server in a variable
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Globally handle all unhandled rejections such as bad DB password
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // Close the listening server gently and then close down the app
  server.close(() => {
    // Shut down the application
    // This shuts down the app very abruptly because it will immediately
    //   abort all the requests that are currently still running/pending
    // This is the reason we first close the server and then shut down the app
    process.exit(1);
  });
});

/* TODO:  Heroku shuts down a site daily by sending the SIGTERM signal.
      Listen for SIGTERM and once received, gracefully terminate the app,
       politely handling unhandled requests */
process.on('SIGTERM', () => {
  console.log('☘️ 🙌🏽 ☘️ SIGTERM RECEIVED. Shutting down gracefully ☘️ 👋🏽 ☘️');

  // step: Use server.close() to allow for a Graceful shutdown which
  //  enables all pending requests to process until the end.
  server.close(() => {
    console.log('☘️ 🙌🏽 ☘️ Process terminated! ☘️ 👋🏽 ☘️');
  });
});
