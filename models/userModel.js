const mongoose = require('mongoose');
const validator = require('validator');

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'A password must be at least 8 chars long']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // Custom Validator
    // el will be the password the user puts in on password confirmation from
    // the /signup POST request
    // this.password must match el for the validator to return true
    // This will only work on Save
    validate: {
      // This only works on SAVE and CREATE ( .create() or .save() )
      // It will not work on UPDATE, for example.
      validator: function(el) {
        return el === this.password; // abc === abc
      },
      message: 'Passwords are not the same'
    }
  }
});

// -- Encrypt the Passwords using Mongoose Middleware
//   between getting the data and saving the data
userSchema.pre('save', function(next) {
  // -- Only encrypt the password when the password field has been updated,
  //  i.e.  when the password is created new or when it is updated
  //  -- 'this' refers to the current user
  // -- If the password has not been modified, call the next middleware
  if (!this.isModified('password')) return next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
