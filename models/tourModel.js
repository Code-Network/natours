const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']

      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 /* 4.666, 46.6, 47, 4.7 */
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // MongoDB uses a special data formal called GeoJSON
      //  in order to specify GeoSpatial Data
      type: {
        type: String,
        default: 'Point',
        enum: [
          'Point'
        ] /* specifies the only possible options this field can take */
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number /* Users go to tour location on this day */
      }
    ],
    guides: [
      {
        // Establish references between different datasets in Mongoose
        // We do not need to import User => './userModel'
        // Here we specify that an ObjectId is exactly what we expect
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ] /* Using referencing.

    Note:  If we wanted to implement Child Referencing on the Reviews we would
    do this:
     reviews: [
       {
       type: mongoose.Schema.ObjectId,
       ref: 'Review'
       }
     ]

     BUT, that is not what we want to do because it would be too cumbersome
     to persist endless reviews on each tour. Instead, we will use Mongoose's
     Virtual Populate.
    */
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// TODO: Set our own Index on fields that we query often (i.e. price)
// This makes queries for price much faster for queries for price
// price: 1 => price in ascending order
// price: -1 => price in descending order
// tourSchema.index({ price: 1 });

// TODO:  Set our own Index on price (Ascending) and ratingsAverage (Descending)
tourSchema.index({ price: 1, ratingsAverage: -1 });

// Create an index for slugs because we will use unique slugs to query tours
tourSchema.index({ slug: 1 });

/*
    TODO: Add an index for startLocation
In order to do geospatial queries we need to first attribute an
   index (in tourModel.js) to the field where the geospatial data
   that we are searching for is stored.
This time we are not going to set option to 1 or -1 because it is a
   different type of index.  For GeoSpatial data, this index needs
   to be a 2D sphere index if the data describes real points
   on an Earth-like Sphere. Or instead, we can also use a 2d index if
   we are using just fictional points on a simple two dimensional plane.
   - In this case we are talking about real points on the Earth's surface,
   so we are going to use a 2dsphere Index here.

 https://docs.mongodb.com/manual/tutorial/calculate-distances-using-spherical-geometry-with-2d-geospatial-indexes/
*/
// Tells MongoDB that this startLocation should be indexed to a 2dsphere.
// So, an Earth-like sphere where all of our data are located.
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// TODO: Virtual Populate Reviews from Tours
// 'reviews' is what we want to call the virtual fields
tourSchema.virtual('reviews', {
  ref: 'Review' /* Name of model we want to reference */,
  foreignField:
    'tour' /* Name of fields from Reviews in order to connect the two datasets.
    It's the reference in the Reviews Model where the ref to Tour Model is stored
    tourSchema is stored in reviewSchema.tours (The id of the tour is there)  */,
  localField:
    '_id' /* Where the id is stored in this current Tour Model
    (The id of the tour in tourModel.js is stored here = _id ) */
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// TODO: From the Array of User ids from the guides property,
//  create an Array of User Documents. Note, this only creates, it does not save
// This is for Embedding/ DeNormalizing;
// i.e.  This works when tourSchema.guides: Array
// We must import User  from './userModel' in order for this to work
/*tourSchema.pre('save', async function(next) {
  // this.guides is an Array of user IDs
  // loop through Users to get the current ID of each user
  // This will be an Array of User Documents from the IDs in the guides array
  const guidesPromises = this.guides.map(async id => await User.findById(id));

  // Because guidesPromises is an Array of Promises, we need to run the
  //    Promises at the same time using Promise.all
  //  Reassign those new values to this.guides.
  // NOTE:  This will override the Array of IDs to an Array of User Documents
  // NOTE 2:  This CREATES new documents, it does not save them
  this.guides = await Promise.all(guidesPromises);
  next();
});*/

// TODO:  Using query middleware to populate guides property on request
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
// This interfered with tourController.getDistances $geoNear because $geoNear
//   must be the First Stage in aggregation; it isn't because this
//   pre-aggregate has a $match stage which comes before $geoNear, so we
//   get an error on the /distances/34.111745,-118.11349/unit/mi
//   endpoint.
tourSchema.pre('aggregate', function(next) {
  // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  const things = this.pipeline()[0];
  if (Object.keys(things)[0] !== '$geoNear') {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
