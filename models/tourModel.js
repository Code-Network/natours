const mongoose = require('mongoose');
const slugify = require('slugify');

//----------------------------------------------
// TODO: --------- Create a Schema -------------
// ---------------------------------------------
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    // Each time the data is outputted as JSON, we want virtuals to be true
    // i.e. We want the virtuals to be a part of the output
    toJSON: { virtuals: true },

    // Each time the data is outputted as an Object, we want virtuals to be true
    toObject: { virtuals: true },
  }
);

// TODO: Define a Virtual Property that contains the tour duration in weeks
//   This virtual property will be defined each time we GET something from the DB
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// TODO: DOCUMENT MIDDLEWARE: runs before .save() and .create(), but not
//  insertMany() because insertMany will not trigger the 'save' middleware event.
// This is for pre-middleware that is going to run on an actual event
//   And that event in this case is the save event.
// Each Middleware function has access to next()
tourSchema.pre('save', function (next) {
  // This callback function will be called before an actual
  // document is saved to the database
  // 'this' will point to the currently processed document
  //  i.e. the document that is being saved
  // 'this' is actually before we save the data to the Database
  // console.log(this);

  // Create a slug for each of these documents, a string will can put in url
  // NOTE: This will not work unless you have a slug in your SCHEMA
  // It may show up in POSTMAN but unless we put it in the SCHEMA,
  // 'slug' will not persist to the database.
  // i.e.     slug: String,
  this.slug = slugify(this.name, { lower: true });
  next();
});

// 'save' is a hook
tourSchema.pre('save', function (next) {
  console.log('Will save document');
  next();
});

// POST MIDDLEWARE
// Post middleware functions are executed after all the
// pre middleware functions have completed.
// In here we no longer have the 'this' keyword but we have the
//  finished document in the 'doc' parameter
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// Always use uppercase on Model Variables
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
