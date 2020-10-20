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
      maxlength: [40, 'A tour must have <= 40 characters'],
      minlength: [10, 'A tour must have >= 10 characters'],
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
      min: [1, 'A rating must be greater or equal to 1'],
      max: [5, 'A rating must be less than or equal to 5'],
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
    secretTour: {
      type: Boolean,
      default: false,
    },
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

// TODO: DOCUMENT MIDDLEWARE: runs before .save() and .create() ONLY, not
//  insertMany(), findByIdAndUpdate, etc because
//     will not trigger the 'save' middleware event.
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

// Additional 'save' is a hook
// tourSchema.pre('save', function (next) {
//   console.log('Will save document');
//   next();
// });

// POST MIDDLEWARE
// Post middleware functions are executed after all the
// pre middleware functions have completed.
// In here we no longer have the 'this' keyword but we have the
//  finished document in the 'doc' parameter
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// TODO:  QUERY MIDDLEWARE - 'find' hook --
// -- NOTE: This will not run for findOne, findById, etc.. only .find(),
//    so we will have to write query middleware to cover those use cases
// pre-find hook:  a Middleware that is going to run before any find query
//  is executed
// Use Case:  Secret tours only offered to VIPs, not publicly.
// Add secretTour of type Boolean with default set to false to Schema first.
/*tourSchema.pre('find', function (next) {
  //  'this' is a query object, so we can chain all methods for queries
  // In postman, we created one set to true
  // Only display queries where the secretTour is not true
  this.find({ secretTour: { $ne: true } });
  next();
});*/

/*tourSchema.pre('findOne', function (next) {
  //  'this' is a query object, so we can chain all methods for queries
  // In postman, we created one set to true
  // Only display queries where the secretTour is not true
  this.find({ secretTour: { $ne: true } });
  next();
});*/

// TODO: Use RE to run a pre hook query function that would filter out
//  all of the secret tours
// /^find/ = middleware should execute for all commands that start with 'find'
tourSchema.pre(/^find/, function (next) {
  //  'this' is a query object, so we can chain all methods for queries
  // In postman, we created one set to true
  // TODO:  Only display queries where the secretTour is not true
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// TODO:  Write a Post Hook Query for all /^find/
// Here we get access to all docs that were returned from the
//    query in param 'docs'
tourSchema.post(/^find/, function (docs, next) {
  // We can get access to 'this' from the pre hook above
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  // The result will be only those docs where secretTour is false
  console.log(docs.length);
  next();
});

// TODO: AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // An aggregate is an Array; we want to remove from the Beginning of the Array
  //  where secretTours is true so that those Documents will not be counted
  //    ( using unshift() at the beginning of the Array because it's an Array )
  //  .shift() to add to End of Array; .unshift() to add to Beginning of Array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  /*
   'this' points to the current aggregation object
   OP => console.log(this);
       Aggregate {
       _pipeline: [
           { '$match': [Object] },
           { '$group': [Object] },
           { '$sort': [Object] }
       ],
       _model: Model { Tour },
       options: {}
       }

   OP => console.log(this.pipeline());
       [
         { '$match': { secretTour: [Object] } },
         { '$match': { ratingsAverage: [Object] } },
         {
           '$group': {
               _id: [Object],
               numTours: [Object],
               numRatings: [Object],
               avgRating: [Object],
               avgPrice: [Object],
               minPrice: [Object],
               maxPrice: [Object]
           }
         },
         { '$sort': { avgPrice: 1 } }
       ]
   */
  console.log(this.pipeline());
  next();
});

// Always use uppercase on Model Variables
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
