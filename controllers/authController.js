const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

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
  //   remove the iat and exp fields from debugger payload to verify.
  // Move to function signToken();

  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN
  // });

  const token = signToken(newUser._id);

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

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    // 401 => Unauthorized
    // Attacker will not know if email or password is incorrect
    return next(new AppError('Incorrect email or password', 401));
  }

  console.log(user);

  // If everything ok, send token to client
  // const token = '';
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it is there
  // var token must be a let and not a const because the if statement is scoped
  //  and const token would not be available outside the if statement.
  let token;

  // This will work because in Postman/Users/GetAllUsers we add the header:
  //  Authorization: Bearer iamthetoken
  // From app.js middleware, we console log req.headers and receive in console:
  // {
  //   authorization: 'Bearer iamthetoken',
  //     'user-agent': 'PostmanRuntime/7.26.8',
  //   accept: '*/*',
  //   'cache-control': 'no-cache',
  //   'postman-token': 'b008bc5e-1a66-458f-9e6d-f852d80beb57',
  //   host: 'localhost:3000',
  //   'accept-encoding': 'gzip, deflate, br',
  //   connection: 'keep-alive'
  // }
  //
  // Here we check to see if the following header exists:
  // Key: "Authorization" and Value" "Bearer tokenID" exists.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // The token will be the second part of the string
    // split() turns it into an array and we use the second element
    //    which would be the token, eventually
    token = req.headers.authorization.split(' ')[1];
  }

  // Log the token to the console
  console.log(token);

  // Check to see if a token exists
  // If there is no token, return a new operational error
  //  using global handling middleware with an error which stipulates
  //  that the user is not logged in
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Validate the token - Verification token
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //
  // 3) Check if user still exists
  // const currentUser = await User.findById(decoded.id);
  // if (!currentUser) {
  //   return next(
  //     new AppError('The user belonging to this token no longer exists', 401)
  //   );
  // }
  //
  // 4) Check if user changed password after the token/JWT was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password!  Please log in again', 401)
  //   );
  // }
  //
  // // GRANT ACCESS TO PROTECTED ROUTE
  // req.user = currentUser;
  next();
});
