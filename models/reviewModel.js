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
// reviewSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'tour',
//     select: 'name'
//   }).populate({
//     path: 'user',
//     select: 'name photo'
//   });
//
//   next();
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
