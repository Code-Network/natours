const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  // Create a new document based on the model
  // The data is in req.body
  // Note: Serious security flaw because using req.body user can register as admin
  // const newUser = await User.create(req.body);

  // TODO: Security fix for creating a new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  // TODO:  Log the newUser in as soon as they signup by signing a
  //  JWT (JSON Web Token) and then send it back to the client/user
  // NOTE: Logging in a user just means to sign a
  //    JSON Web Token (JWT) and send it back to the user.
  // -- In config.env, define JWT_SECRET and JWT_EXPIRES_IN
  // Note: In MongoDB, the id is _id
  // -- When verifying the JWT token in the debugger at jwt.io,
  //   remove the iat and exp fields from debugger payload to verify
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({
    status: 'success!',
    token,
    data: {
      user: newUser
    }
  });
});
