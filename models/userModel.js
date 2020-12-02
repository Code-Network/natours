const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    minlength: [8, 'A password must be at least 8 chars long'],
    select: false
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
  },
  passwordChangedAt: Date
});

// -- Encrypt the Passwords using Mongoose Middleware
//   between getting the data and saving the data - pre()
userSchema.pre('save', async function(next) {
  // ONLY RUN THIS FUNCTION IF PASSWORD WAS NOT MODIFIED
  // -- Only encrypt the password when the password field has been updated,
  //  i.e.  when the password is created new or when it is updated
  //  -- 'this' refers to the current user
  // -- If the password has not been modified, call the next middleware
  if (!this.isModified('password')) return next();

  // HASH THE PASSWORD WITH COST OF 12
  // ENCRYPT / HASH using bcrypt algorithm -- npm bcryptjs
  // If the password has been modified, hash/encrypt the password
  // to protect against bruteforce attacks
  // -- bcrypt first adds a salt to the password, which is a random string,
  // so that two passwords do not generate the same hash
  // -- then bcrypt hashes/encrypts the password+salt
  // -- bcrypt.hash() is the async version
  // -- hash parameters =>
  //        - current password = this.password,
  //        - cost (a random string or # for cpu intensive we want it to be)
  //           - default is 10, but computers have gotten much faster
  //
  this.password = await bcrypt.hash(this.password, 12);

  // DELETE passwordConfirm FIELD
  // Delete the Confirm Password at this point because we only need the
  //   passwordConfirm during validation. We really do not want to persist
  //   it to a database.
  // Setting this.passwordConfirm to undefined deletes it.  Although this property
  //  is required in the userSchema, deleting it is fine because it is required that
  //  we input it when created, but it is not required that it persists to the DB

  this.passwordConfirm = undefined;
  next();
});

// TODO:  Create an instance method available on all docs of User collection
// this - document
// We cannot use 'this' because password.select = false, so password not available
//  So, we use bcrypt to compare the user's input password with the hashed password
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// TODO:  In authController.js, exports.protect, we find the currentUser via id,
//  at this point the currentUser has already been verified, their token passes
//  all tests, but what if the user has changed their password after they
//  have logged in (i.e. after the token was issued).
//  This gives them a new token and their old token, still valid, SHOULD
//  no longer be valid. Here we want to ensure that the old token is no longer
//  valid for this currentUser or any user.
// In order to do that, we have to call the JWT timestamp (iat).
// The iat tells you when that token was issued. In the userSchema, we create
// a new property called PasswordChangedAt which the user can only have in
// their document if they actually did change their password
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // Remember that in an instance method the keyword 'this' always
  // points to the current document. Check to see if passwordChangedAt exists,
  //   if it does, only then do we want to do the comparison
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
  }
  // By default we will return false stipulating that the currentUser
  // from authController.exports.protect has not changed their password
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
