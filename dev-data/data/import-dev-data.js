const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

//  Instead of below, use dotenv package
// Make sure you have it before it goes to app
dotenv.config({ path: './config.env' });

// TODO: Link to Remote Database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//
// ------------------------------------------------------------------
// TODO: --------- Connect Mongoose to a Remote Database -----------
// ------------------------------------------------------------------
//
// Connect method returns a PROMISE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB connection successful!');
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.log('Connection ERROR', err));
