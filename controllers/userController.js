const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// TODO: User UPDATES CURRENTLY AUTHENTICATED SELF - '/updateMe'
//  Logged in User gains ability to update their own data here.
// Note: Currently, the user only update their name and email address
exports.updateMe = catchAsync(async (req, res, next) => {
  // todo: 1) Create Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    // Status Code 400 = Bad Request
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // todo: 2) Update user document
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success'
  });
});

// This error message fires here:
//  localhost:3000/api/v1/signup
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined - wrong endpoint!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

// Admins Only:  to update user
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
