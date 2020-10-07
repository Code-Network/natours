const mongoose = require('mongoose');
const dotenv = require('dotenv');

//  Instead of below, use dotenv package
// Make sure you have it before it goes to app
dotenv.config({ path: './config.env' });
const app = require('./app');

// TODO: Link to Remote Database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//
// -------------------------------------------------------
// TODO: ---- Connect Mongoose to a Remote Database ------
// -------------------------------------------------------
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

//
// ------------------------------------------------------------------
// TODO: Create a Document for the Database and Save to the Database
// TODO:  All schema and modeling moved to tourModel.js
// ------------------------------------------------------------------
//
// Create a Database Document and save to the Database
// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 997
// });

// Save the document (testTour) to the Database
// testTour
//   .save()
//   .then(doc => {
//     // eslint-disable-next-line no-console
//     console.log(doc);
//   })
//   // eslint-disable-next-line no-console
//   .catch(err => console.log('ERROR', err));

// located at process.env
// console.log(app.get('env')); // express default => development
// BUT we have to set NODE_ENV=development
// On terminal, type: NODE_ENV=development nodemon server.js
// process.env will then return
// NODE_ENV: 'development',
//   _: '/usr/local/bin/nodemon'
// You can define any var, say X+23:
// Terminal:  NODE_ENV=development X=23 nodemon server.js
// Returns:
// NODE_ENV: 'development',
//   X: '23',
//   _: '/usr/local/bin/nodemon'
// Change NODE_ENV=production when ready to deploy because many
//    packages depend on this environment variable
// PUT ALL OF THESE VARIABLES IN A config.env
// console.log(process.env);

// npm run start:prod for production
// npm run start for development
const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${port}`);
});
