const mongoose = require('mongoose');

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

//
// ------------------------------------------------------------------
// TODO: ----------------- Create a Model ---------------------------
// ------------------------------------------------------------------

// Always use uppercase on Model Variables
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
