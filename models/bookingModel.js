const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paid: {
    type: Boolean,
    default: true
  }
});

// TODO:  Populate the tour and the user whenever there is a booking query
// Note: This is for an admin or a guide to check who has booked their tour.
bookingSchema.pre(/^find/, function(next) {
  // note: .populate() allows us to reference documents in outer collections
  // This should not greatly affect performance because only admins and guides
  //  will be able to check who has actually booked their tour.
  // step: populate the user and the tour ( but only the name of the tour )
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
