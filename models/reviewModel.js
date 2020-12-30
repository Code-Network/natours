const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have content']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      // This is parent referencing; the Tour does not know about its children
      // This links to Tours; Tours does not link to this
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      // This is parent referencing; the User does not know about its users
      // This links to Users; Users does not link to this
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    /* This is so that a field not stored in the DB shows up in the OP
     * i.e. Average time a Review for a specific tour is createdAt  */
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// TODO:  Populate the tour and user fields -
//  NOTE: We turn this off because of redundancy, i.e When requesting
//  a single tour, the tour field is unnecessarily populated
reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });

  // Only populate the user field
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

// Statics are pretty much the same as methods but allow for defining functions
//      that exist directly on your Model.
// i.e.  Review.calcAverageRatings
// tourId will be the ID to which the current review belongs to
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // 'this' points to the current model and we need to call .aggregate on a model
  // User Aggregation Pipeline
  // Pass in an Array of all the Reviews that belong to current tour in
  //    stages in .aggregate()
  const stats = await this.aggregate([
    {
      $match: { tour: tourId } /* Only select the tour that we want to update */
    },
    {
      $group: {
        _id:
          '$tour' /* _id first field: $tour = field that all docs have in common;
         i.e. We are grouping all of the tours together by tour  */,
        nRating: {
          $sum: 1
        } /* Number of ratings = add one for each
         tour matched in previous step */,
        avgRating: { $avg: '$rating' } /*Average is calculated in rating field*/
      }
    }
  ]);

  console.log(stats);
};

// git test
// TODO:  Use calcAverageRatings() each time a new Review is created
// Use post save because in pre save the new review is not saved in DB yet
reviewSchema.post('save', function() {
  // 'this' points to the doc that is currently being saved = current review
  // So, 'this' is the current Review and in this.tour, tour is current tourId
  // Problem:  We want to call Review.calcAverageRatings(this.tour),
  //  but we can't do it that way because the Review is not yet defined.
  //  We can't put it after const Review because then the aggregation would not
  //  have taken place before the model was created.
  // Solution:  HACK ==> Use this.constructor
  // this.constructor is the model who created that document
  // this = current Review Document
  // constructor = the model who created the Review Document
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
