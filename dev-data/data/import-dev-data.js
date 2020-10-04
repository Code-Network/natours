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

//  TODO:  Read the JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// TODO: Import data into Database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (e) {
    console.log(e);
  }
};

// TODO:  Delete all data from Collection
const deleteData = async () => {
  try {
    // Deletes all of the documents in the Tours Collection
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (e) {
    console.log(e);
  }
};

// Log process.argv to the console
console.log(process.argv);
