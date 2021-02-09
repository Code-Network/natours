const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

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

// TODO:  Middleware for '/me' route which gets current user ID
// Route /me => this will be similar to factoryHandler's getOne()
// except that getMe() will Get the document based on User id
// from .protect() and pass it on to getUser() in userModel.js
// Gets data from (currently logged in User) and not URL params
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// TODO: User UPDATES CURRENTLY AUTHENTICATED SELF - '/updateMe'
//  Logged in User gains ability to update their own data here.
// Note: Currently, the user only update their name and email address
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('req.file from multer middleware', req.file);
  console.log('req.body after multer middleware', req.body);

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

  // TODO: Filter out unwanted field names that are not allowed
  //  to be updated
  // Filter req.body so that it only contains name and email
  const filteredBody = filterObj(req.body, 'name', 'email');

  // todo: 3) Update user document
  // filteredBody => data (must only contain name and email for now)
  // We use filteredBody instead of req.body because we don't want to update all in the body
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

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not defined and never will be! Please use /signup instead'
  });
};

// Admins Only:  to update user
// NOTE: Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);

exports.deleteMe = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);

// LEGACY CODE BELOW
/*
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
 */

// TODO:  Give the User the Capability of deleting their account
// exports.deleteMe = catchAsync(async (req, res, next) => {
//   // The data we want to update is the active property in the userSchema in userModel.js
//   await User.findByIdAndUpdate(req.user.id, { active: false });
//
//   // status code 204 => Deleted
//   // set data to null because they want to delete their account and we do not
//   //   want to return their data to them
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

// This error message fires here:
//  localhost:3000/api/v1/signup
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined - wrong endpoint!'
//   });
// };

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };
