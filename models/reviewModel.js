const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

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

// TODO: Storing a summary of a related dataset on the main dataset; Store the
//  average rating and the number of ratings on each tour so that we don't
//  have to query the reviews and calculate that average each time that we
//  query for all the tours; useful for a tour overview page in our frontend
//  where we really do not want to display all of the reviews but would like
//  to show a summary of these reviews (i.e. number of ratings and the average)
// Statics are pretty much the same as methods but allow for defining functions
//      that exist directly on your Model.
// i.e.  Review.calcAverageRatings
// tourId = the tour ID to which the current review belongs to
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // 'this' points to the current model and we need to call .aggregate on a model
  // User Aggregation Pipeline
  // Pass in an Array of all the Reviews that belong to current tour in
  //    stages in .aggregate()
  // .aggregate() returns a Promise, so we must async/await
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

  console.log('stats === ', stats);

  /*
     - Require the Tour Model in order to Persist nRating and avgRating
     to the Database (Tour Collection)
     - Find the current tour using findByIdAndUpdate() - (returns a Promise) -
     with options to include the fields we would like to update and their
     values from the const stats output:
   ex. const stats may return:
   [
      {
          _id: 5fecbf09c88f5f7fca115e22,
          nRating: 2,
          avgRating: 4.05
      }
   ]

   stats[0].nRating = 2
   stats[0].avgRating = 4.05

   Note:  There is no need to store this is a variable because all we are
          looking to do is to update these fields.
   */
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};

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

// TODO: Implement a pre-middleware for these hooks/events:
//  findByIdAndUpdate() and findByIdAndDelete()
// findByIdAndUpdate() is a shorthand for findOneAndUpdate() with current ID
// findByIdAndDelete() is a shorthand for fineOneAndDelete() with current ID
// Note: Those hooks don't give us access to documents, only to
//  query middleware, so we can't just extract Model data from them
//  like we did with aggregate in statics().   We have to get around that.
//  because we want to be able to modify nRating and ratingAverage when a user
//  edits/update or deletes their tour review
reviewSchema.pre(/^findOneAnd/, async function(next) {
  /*
   -- The Goal is to gain access to the Current Review Document.
   -- 'this' is the Current Review Query, not the Current Review Document.
   -- NOTE: If we Execute the Query, that will give us access to the
          Current Review Document that is being processed.
   -- To execute the Query => this.findOne
   -- Then all we need to do is to async/await this.findOne()
          and save it somewhere, i.e. save it to a var
   -- NOTE 2: the updated review did not persist to the console log but
        it did persist to the database. Jonas did not look at DB to confirm
        but explains that findOne() gets its data from DB and I am assuming
        the the Review Update Data cannot be accessed in PRE middleware,
    -- BUT the point is to get the tourID because that is what we will
          need to calculate the averageRatings and nRating with the
          UPDATED data, so we can't use this old rating in calcAverageRatings()
          -- AND we can't change PRE to POST because we no longer have access
          to the Query after execution.  OOPS!  We need another hack.
  OP/
   r ===  {
       _id: 5fecdbd83045ab82b6467dfa,
       rating: 4,
       review: 'MAX is in the House!!!',
       tour: 5fecdb653045ab82b6467df9, // This is tour ID
       user: {
       _id: 5c8a23de2f8fb814b56fa18e,
       name: 'Max Smith',
       photo: 'user-15.jpg'
   },
     createdAt: 2020-12-30T19:58:16.040Z,
     __v: 0,
     id: '5fecdbd83045ab82b6467dfa'
   }
   */

  const r = await this.findOne();
  console.log('r === ', r);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
