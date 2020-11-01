const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
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
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

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
