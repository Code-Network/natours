const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  // Create a new document based on the model
  // The data is in req.body
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success!',
    data: {
      user: newUser
    }
  });
});
