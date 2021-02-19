const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

// ============================================================
// ============================================================

// TODO: I.  SIGN TOKEN
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// ============================================================
// ============================================================

// TODO:  Create Send Token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  /*
   step: cookie options
   -- The expires property must be converted into milliseconds
   Total milliseconds = ( now + expiration * hours * min * sec * 1000 )
   -- Setting secure:true property sends Cookie only on an encrypted connection
   i.e. only via HTTPS (which it has not been set to yet)
   So, in development, the cookie would not be created or sent to client.
   Set secure:true in production only.
   -- Property httpOnly: true => Makes it so that the Cookie cannot be accessed
   or modified in any way by the Browser.
   This prevents cross-site scripting attacks. So all the Browser is going
   to do when we set httpOnly:true is to basically receive the cookie,
   store it, and then send it automatically along with every request
   */
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // note: Only set cookie option property secure:true in production
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // step: Create and send an httpOnly cookie
  // Cookie will be sent on signup
  res.cookie('jwt', token, cookieOptions);

  // step: Remove the password from the output
  // On SIGNUP, the password displays in the output even though we have
  //   userSchema password.select:false to not display password
  //   This comes when we create a new document (signup).
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// ============================================================
// ============================================================

// TODO: II.  SIGN UP
exports.signup = catchAsync(async (req, res, next) => {
  // Create a new document based on the model
  // The data is in req.body
  // FIXME: Serious security flaw because using req.body user can register as admin
  // const newUser = await User.create(req.body);

  // Todo: Security fix for creating a new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  // Goal: Send a Welcome Email on Signup
  // Note: On views/email/welcome.pug there is an anchor tag used to Upload user photo
  // For now, we are just going to point to the Account settings page but this
  // would only work in development and not in production because
  // http://localhost:3000/me does not exist when we are in production
  // Get the data from the request, instead of:
  // const url = 'http://localhost:3000/me';
  // Important: To Test, just create a new user on POSTMAN ( i.e Signup );
  //  when you do, you get a new email in mailtrap.io/inboxes/.../messages;
  //  in the email you receive the welcome.pug page, and it is beautiful!

  let url = `${req.protocol}://localhost:3000/me`;
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-const-assign
    url = `${req.protocol}://${req.get('host')}/me`;
  }

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

// ============================================================
// ============================================================

// TODO:  III-B.  LOG IN
exports.login = catchAsync(async (req, res, next) => {
  // step: 0) Read the email and password from the request body object - req.body
  const { email, password } = req.body;

  // step: 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // step: 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  // correctPassword() is an async function implemented in userModel.js
  // const correct = await user.correctPassword(password, user.password);
  // if (!user || !correct) {
  // Put code for var correct in the second part of conditional because
  //   if user does not exist, then the conditional will fail and second
  //   part will not be implemented; if user does exist, only then will it
  //   implement code on left conditional;
  //   whereas if you have var correct on its own, if user DNE,
  //   then it will throw an error
  if (!user || !(await user.correctPassword(password, user.password))) {
    // 401 => Unauthorized
    // Attacker will not know if email or password is incorrect
    return next(new AppError('Incorrect email or password', 401));
  }

  // console.log(user);

  // 3) If everything ok, send token to client
  // const token = '';
  /*const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });*/
  createSendToken(user, 200, res);
});

// ============================================================
// ============================================================
/*
  TODO:  LOG OUT USER
  Note: The 'jwt' cookie has the token for the user to log in; since we set
    httpOnly:true for security, the cookie cannot be deleted by us or the browser;
    So, to be able to Log Out we need a workaround.
     -- Set the cookie with the exact same name but
        without a token and with a ten second expiration.
     -- This will effectively logout the user.
     -- We do not set it to secure:true because there is no sensitive data
*/
exports.logout = (req, res) => {
  /*
   Note: The secret is to give the new cookie the exact same name: 'jwt'
   step: Create cookie with the exact same name as the signin cookie
          with a dummy text (instead of token) and cookie option expiration
          date of current time plus ten seconds
   */
  res.cookie('jwt', 'Logged Out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

// ============================================================
// ============================================================

// TODO:  IV.  PROTECT ROUTES
// goal: make the user's ID safe
exports.protect = catchAsync(async (req, res, next) => {
  // step: 1) Get token and check if it is there
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
  // step: Check to see if the following header exists:
  // Key: "Authorization" and Value" "Bearer tokenID" exists.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // The token will be the second part of the string
    // split() turns it into an array and we use the second element
    //    which would be the token, eventually
    token = req.headers.authorization.split(' ')[1];

    /*
      In createSendToken(), we created and sent a cookie called 'jwt'
        -- res.cookie('jwt', token, cookieOptions);
      step: Check to see if the cookie exists; if it does, set token to jwt
    */
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    // Log the token to the console
    // console.log(token);

    // Check to see if a token exists
    // If there is no token, return a new operational error
    //  using global handling middleware with an error which stipulates
    //  that the user is not logged in and a statuscode 401 (Unauthorized Access)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // step: 2) Verification token -- Validate the token -- use jwt.verify()
  // Verifies if someone has manipulated the data (payload) or if
  //    the token has already expired
  // verify() will verify token and then when done, will call callback we specify
  /*  verify() Syntax
      jwt.verify(
          token: string,
          secretOrPublicKey: string | Buffer,
          options?: VerifyOptions): string \ object
      Synchronously verify given token using a secret/public key
      to get a decoded token (JWT string to verify
      secretOrPublicKey - Either the secret from HMAC algo
      or the PEM encoded public key for RSA and ECDSA
  */
  // step: -- use util.promisify to make it a PROMISE and use async/await
  // jwt.verify(token, process.env.JWT_SECRET);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  /* Example output of var decoded is
      {
        id: '5c8a1d5b0190b214360dc999',
        iat: 1611763291,
        exp: 1619539291
      }
   */
  // console.log(decoded);

  // step: 3) Check if user still exists - at this point, the user is already verified
  //  This is a good reason to have the user's _id in the payload
  // note: .findById() is a convenience method on the model that's provided by Mongoose
  //    to find a document by its _id. -- decoded.id is iat=issuedAt
  const currentUser = await User.findById(decoded.id);

  // step: If there is no valid currentUser, create an instance of AppError stating
  //  that this user belonging to this token no longer exists
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // step: 4) Check if user changed password after the token/JWT was issued
  // Note:  Documents are instances of a model, so technically,
  //    the user belongs to the User model and not to the Controller
  //   -- Each document (currentUser) is an instance of userSchema
  //   -- and each document (currentUser) has access to userSchema.methods
  //  -- iat is 'issued at' JWT payload
  //  -- userSchema.methods.changedPasswordAfter(JWTTimestamp) called from userModel.js
  // important: If the password was changed (true), then password changed and user
  //  must log in again
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // step: GRANT ACCESS TO PROTECTED ROUTE
  // Put the entire user data on the request (req)
  // i.e. Store currentUser in req.user for global access
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

/*TODO: Verify that User is Currently Logged; if the user is logged
    in then we want to have the user information available to the templates
  Note:
    -- This middleware is only for protected pages so the goal here,
        is NOT to protect any route.
    -- There will never be an error in this middleware.
    Important: It is important that we catch errors locally (try/catch) and
     call next() because if we do not do so we will have an
     error when we try to log out (since we are logging out
     by sending a cookie with the same name but a dummy token/text) */
exports.isLoggedIn = async (req, res, next) => {
  // For rendered pages, we will not have the token in the header
  // Authorization will come from the cookie and not Authorization header
  // Authorization header is only for API
  // NOTE:  If there is NO cookie then there is NO LOGGED IN USER
  if (req.cookies.jwt) {
    try {
      /*
       step: 1) Verify token is real; remember that example output of var
              decoded is:
           {
              id: '5c8a1d5b0190b214360dc057',
              iat: 1611762546,
              exp: 1619538546
           }
     */
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // note: In order to add catchAsync back in this must be added in
      // if (req.cookies.jwt === 'Logged Out') return next();

      // step: 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // step: 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // step: THERE IS A LOGGED IN USER; make user accessible to our templates
      //      by putting user on res.locals
      //  - This enables us to use 'user' in our templates because
      //      every template has access to res.locals
      res.locals.user = currentUser;
      return next();

      // step: If there is an error, just continue
    } catch (err) {
      return next();
    }
  }

  // step: If there is no jwt cookie, simply continue because there is no
  //    way that there is a logged in user.
  next();
};

// =========================================================================
// =========================================================================
// TODO:  V.  Authentication: Setting User Roles and Permissions
// Note: We can't pass arguments into a Middleware function,
// but in this case we really do want to; we want to pass in the roles who are
// allowed to access the resource ('admin', 'lead-guide').  So we need a way of
// passing an argument into a Middleware function (a workaround).
// How: We create a wrapper function which returns the Middleware function that
// we actually want to create.
// (...roles) = rest parameter = Array ['admin', 'lead-guide'] from tourRoutes.js
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // By default, role = 'user'
    // (...roles) = ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// =========================================================================
// =========================================================================
// TODO:  VI.  Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // step: 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  // Verify the user exists
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // step:  2) Generate Random Token
  // Create an instance method on the user because this has to to with the user itself
  // Put the function in userModel.js
  const resetToken = user.createPasswordResetToken();

  // step: 3) Now save it. If we save it without validateBeforeSave set to false, it will
  //   throw an error requesting the user's email address
  await user.save({ validateBeforeSave: false });

  // note: We use try/catch because On Error we want to reset both token and
  //      expires property
  // Important: To TEST this on POSTMAN:
  //  1. Use the Forgot Password route ( {{URL}}api/v1/users/forgotPassword )
  //  2  An email is then sent to Mailtrap, copy the new token.
  //  3. Then go to the Reset Password route
  //    => {{URL}}api/v1/users/resetPassword/0daac4f4718bf...5e2b8c7117a7
  //    and put in a new password
  //    4. Then test the email and new password on the actual site
  try {
    // step: 4) Send Random Token to user's email
    // Create a Reset URL to make it easy for the user to reset their password
    // req.protocol = http or https, etc
    // goal: Send the plain, original reset token and not the encrypted one

    let resetURL = `${req.protocol}://localhost:3000/api/v1/users/resetPassword/${resetToken}`;
    if (process.env.NODE_ENV === 'production') {
      resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
    }

    // step: 5) Send email to the client with the resetURL
    await new Email(user, resetURL).sendPasswordReset();

    // Send response - DO NOT SEND RESET TOKEN HERE!
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (e) {
    // step: On Error, reset token and expires properties
    // note: Resetting to undefined ony modifies the data, does not save it;
    //  so we must save it ourselves; this is a use case for no validation
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

// =========================================================================
// =========================================================================
// TODO:  VII.  Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // step: 1) Get user based on the token
  // Since the pwd stored in DB is encrypted and in userModel, the return is unencrypted
  // we have to encrypt it again before we compare; must use built-in crypto to decode
  // The token is in the URL => from userRoutes.js => '/resetPassword/:token'
  //   so we get it from req.params.token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Get the user based on this token; this is the only thing that can id user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // step: 2) If token has not expired, and there is a user, set new password
  // Send an error if there is not user or if the token has expired;
  //   If the token has expired it simply won't return a user.
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // step: 3) Set the Password because we would have sent the Password
  //    and passwordConfirm via the body
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // step: 4) Delete the Reset Token (passwordResetToken) and the passwordResetExpires
  //   and save to the database
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // step: 5) Save to the database and don't turn off the validators because in
  //   this case we want the validator to confirm password and passwordConfirm
  //   are the same and we want the tokens to be encrypted
  await user.save();

  // note:  Update changedPasswordAt property for current user
  //  -- Do this in userModel.js by creating a new middleware

  // step: 6) Log user in: send JWT to the web client
  /*const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });*/
  createSendToken(user, 200, res);
});

// TODO: Allow a Logged in User to Update Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // -- As a security measure, we ask the user for the current password
  //      before updating their password
  // -- The Use Case argument for validation is when a user is logged in,
  //      walks away from their computer and someone else comes along
  //      and changes their password.
  // step: 1) Get logged in user from collection by id and add DB encrypted password
  // Explicitly ask for the password because it is not included in the output.
  // This was defined on the userSchema: select: false
  const user = await User.findById(req.user.id).select('+password');
  // console.log(user);

  // step: 2) Check if POSTed current password is correct
  // Error if password is not correct; 401 = UnAuthorized
  // Compare passwords using correctPassword() from userModel.js
  // Because correctPassword() is async, we must await
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // step: 3) If password is correct, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // In order to implement validation from the userSchema, we must save
  // We do not turn off validation here because we want to check that
  //  password and passwordConfirm are the same
  // DO NOT USE findByIdAndUpdate() because Mongoose does not keep
  // validator in schema (where el === this.password) in memory
  // It only works on create() and save(), not on update()
  // DO NOT USE UPDATE ON ANYTHING RELATING TO PASSWORDS also because the
  // userschema.pre('save',..) middlewares won't work on update()
  await user.save();

  // step: 4) Log user in with new password that was just updated
  createSendToken(user, 200, res);
});
