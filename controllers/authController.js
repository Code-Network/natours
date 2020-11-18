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
  //  JWT (JSON Web Token) and then send it back to the user

  res.status(201).json({
    status: 'success!',
    data: {
      user: newUser
    }
  });
});
