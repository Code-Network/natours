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
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
