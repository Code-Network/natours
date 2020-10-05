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
  // __dirname is:
  // /Users/kokodev/WebstormProjects/nodejonas2/4-natours/natours/dev-data/data
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// TODO: Import data into Database
const importData = async () => {
  try {
    await Tour.create(tours);
    // eslint-disable-next-line no-console
    console.log('Data successfully loaded!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  process.exit();
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
  process.exit();
};

// Log process.argv to the console
/*
1.  process.argv is:
 OP:
[
  '/usr/local/bin/node',
  '/Users/kokodev/WebstormProjects/nodejonas2/4-natours/natours/dev-data/data/import-dev-data.js'
]

2.  node dev-data/data/import-dev-data.js --import
 OP:
[
 '/usr/local/bin/node',
 '/Users/kokodev/WebstormProjects/nodejonas2/4-natours/natours/dev-data/data/import-dev-data.js',
 '--import'
]

Note:  So, the option you choose will be process.argv[2]
*/

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log('process.argv is:  \n', process.argv);
