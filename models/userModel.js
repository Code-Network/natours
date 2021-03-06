const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// TODO:  From authController.resetPassword's 3)
//  Update changedPasswordAt property for current user
// This will run right before a new document is actually saved.
// We want to set the changedPasswordAt property to Date.now()
//    when we have modified the password.
// This is perfect place for specifying this property.
// We could have done it in the authController.resetPassword, but
//   we really want this to happen automatically.
userSchema.pre('save', function(next) {
  // Mongoose Documentation for isModified/isNew
  // We want to just skip on out to the next Middleware if the password has NOT
  // been modified OR if we are creating a NEW document.
  if (!this.isModified('password') || this.isNew) return next();

  // Modify the passwordChangedAt property
  // In theory this should work, but sometimes saving to DB is a lot slower than
  //   getting the JWT, making the update of the changedPasswordAt property set
  //   a bit after the JSON Web Token has been created.  Sometimes that causes
  //   the user to not be able to sign in because the reason this timestamp even
  //   exists is so that we can compare it with the timestamp on the JSON Web Token.
  // The FIX would be to subtract 1 second from the passwordChangedAt property.
  // This puts passwordChangedAt property one second in the past.
  // This ensures that the token is created after the password has been changed.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// TODO:  Encrypt the Password -- Use pre-save hook - Document Middleware
// todo: Only run this function if password was actually modified
// -- Encrypt the Passwords using Mongoose Document Middleware, pre-save hook,
// between the moment we receive data (password) and the moment it is
//    persisted it to the database,
//    i.e. between getting the data and saving the data - pre('save')
userSchema.pre('save', async function(next) {
  // todo: If the password has not been modified, call the next middleware
  // -- Only encrypt the password when the PASSWORD FIELD has been updated,
  //  i.e.  when the password is created new or when it is updated,
  //  don't re-encrypt the password when there is an email change for instance.
  //  -- 'this' refers to the current user
  if (!this.isModified('password')) return next();

  // todo: Hash the Password with Cost of 12
  //  - Encrypt the changed or new password using npm bcryptjs
  // ENCRYPT / HASH using bcrypt algorithm -- npm bcryptjs
  // If the password has been modified, hash/encrypt the password
  // to protect against bruteforce attacks
  // -- bcrypt first adds a salt to the password, which is a random string,
  // so that two passwords do not generate the same hash
  // -- then bcrypt hashes/encrypts the password+salt
  // -- bcrypt.hash() is the async version, so we must await
  // -- hash parameters =>
  //        - current password = this.password,
  //        - cost - a random string or # for cpu intensive and better encrypted
  //           - default is 10, but computers have gotten much faster
  //           - We will use cost instead of the salt

  this.password = await bcrypt.hash(this.password, 12);

  // todo: DELETE the entire passwordConfirm field (don't want to save to DB)
  // Delete the Confirm Password at this point because we only need the
  //   passwordConfirm during validation. We really do not want to persist
  //   it to a database.
  // Setting this.passwordConfirm to undefined deletes it.  Although this property
  //  is required in the userSchema, deleting it is fine because it is required that
  //  we input it when created, but it is not required that it persists to the DB
  // Setting this.passwordConfirm to undefined works to delete
  //    because it was set to required;
  //    required inputs are not required to be persisted in DB
  this.passwordConfirm = undefined;
  next();
});

// TODO:  Add Query Middleware to remove Inactive Users from getAllUsers
userSchema.pre(/^find/, function(next) {
  // this points to current query
  // 'In every type of find query extract all users where the active property
  //      is not equal to false'
  // This will remove inactive users from the output for getAllUsers
  this.find({ active: { $ne: false } });
  next();
});

// TODO:  Create an instance method available on all docs in User collection
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
// their document if they actually did change their password.
// Note: This method will be called in authController exports.protect()
//    i.e. 4) Check if user changed password after the token/JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // Remember that in an instance method the keyword 'this' always
  // points to the current document. Check to see if passwordChangedAt exists,
  //   if it does, only then do we want to do the comparison
  // todo: 1) Check to see if passwordChangedAt exists
  if (this.passwordChangedAt) {
    // Convert passwordChangedAt Date format 2020-04-10T00:00:00.000Z to
    // JWTTimestamp millisecond format 1606937467
    // console.log(this.passwordChangedAt, JWTTimestamp);
    // .getTime() => seconds. Convert to milliseconds => seconds/1000
    // parseInt(number, base)
    // todo: Convert passworldChangedAt to milliseconds, base 10
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimestamp, JWTTimestamp);

    // If JWTTimestamp (time token issued) is less than
    // changedTimestamp (time we changed our password) then password changed.
    // EX. password issued at time 100, then we change password at time 200 =>
    // TRUE:  Password changed after token was issued.
    // So, TRUE means Changed, FALSE means NOT Changed
    // todo: Return true if password changed, false if not changed
    return JWTTimestamp < changedTimestamp;
  }

  // By default we will return false stipulating that the currentUser
  // from authController.exports.protect has not changed their password
  // todo: Return the default => FALSE MEANS PASSWORD NOT CHANGED
  return false;
};

// Generate a random token, not a JSON web token for a password reset
userSchema.methods.createPasswordResetToken = function() {
  // should be a random string but doesn't have to be as cryptic
  // Import built-in Nodejs crypto module
  // Generate token, size 32 and convert to a hexidecimal string
  // This is essentially a temp password we send to the user on password reset.
  const resetToken = crypto.randomBytes(32).toString('hex');

  //  If a hacker gets access to this token/password, they can
  //  reset password and control the account.
  //  NEVER STORE a plain reset token IN THE DATABASE --
  //  ENCRYPT it lightly with built-in crypto first
  //  Create a new field in the userSchema (passwordResetToken) to store the
  //  encrypted random token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console log resetToken as an object so that it will give variable name
  // along with its value.
  // resetToken is the plain token/password and will be sent to user email
  // this.passwordResetToken is the encrypted resetToken we will store in DB
  // console.log({ resetToken }, this.passwordResetToken);

  // Create a 10-min expiration for the reset token and store in new
  // userSchema field 'passwordResetExpires'
  // This does not update/save the value in the user document; it simply modifies it;
  // this.passwordResetExpires will be saved/set in authController.forgotPassword
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return the UNENCRYPTED plain text reset token (this goes to the user)
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
