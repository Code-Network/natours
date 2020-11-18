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

  res.status(201).json({
    status: 'success!',
    data: {
      user: newUser
    }
  });
});
