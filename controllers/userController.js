const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// param obj = req.body
// param ...allowedFields will be an array containing 'name' and 'email' so far
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // Object.keys(obj) is an Array containing all the keys of param obj = req.body
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

  // todo: Filter out unwanted field names that are not allowed to be updated
  // Filter req.body so that it only contains name and email
  const filteredBody = filterObj(req.body, 'name', 'email');

  // todo: 3) Update user document

  // filteredBody => data (must only contain name and email for now)
  // We use x instead of req.body because we don't want to update all in the body
  //    We want to prevent user from updating role field, for instance
  //    User could have set req.body.role: 'admin' for instance
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser
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
