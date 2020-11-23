const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

/*
exports.login = catchAsync(async (req, res, next) => {
  /!*
    TODO: Put user email and password in vars
      -- Initially we begin with the following:
        const email = req.body.email;
        const password = req.body.password;

      -- But it is recommended we use ES6 Destructuring
        const { email } = req.body;
        const { password } = req.body;

      -- To further simplify it:
        const { email, password } = req.body;

      -- This is how the user is going to send in the
            login credentials for us to verify/check
   *!/
  const { email, password } = req.body;

  // TODO: 1)  Check if email and password exist
  if (!email || !password) {
    // HTTP Error Code === statusCode === 400 === Bad Request
    // return next() to ensure the exports.login finishes right away
    return next(new AppError('Please provide email and password', 400));
  }

  // TODO: 2)  Check if user exists && password is correct
  // const user = User.findOne({ email: email });
  // Since field and variable are the same we only need { email }
  // Use .select('+password') to put the password back into the user data
  //    in order to verify that their password is correct
  const user = await User.findOne({ email }).select('+password');
  console.log(user);

  // TODO: 3)  If everything is OK, send JWT back to the client
  // Test 1) by creating a fake token
  const token = '';
  res.status(200).json({
    status: 'success',
    token
  });
});
*/

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email: email }).select('+password');

  console.log(user);

  const token = '';

  res.status(200).json({
    status: 'success',
    token
  });
});
