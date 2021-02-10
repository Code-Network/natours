const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// -----------------------
// -----------------------
// ROUTES WHERE YOU DO NOT NEED TO BE LOGGED IN INITIALLY
// ex. localhost:3000/api/v1/users/signup POST Request
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// /logout route will be a GET route because we just get a cookie and will
// not be sending any data along with the request or changing anything
router.get('/logout', authController.logout);

// Forgot Password only receives the email address
router.post('/forgotPassword', authController.forgotPassword);

// Reset Password receives a random token, not JSON web token
// as well as the new password to reset password
router.patch('/resetPassword/:token', authController.resetPassword);

// -----------------------
// -----------------------
// REQUIRES AUTHENTICATION

// Protect all of the routes that come after this middleware
// It will only call the next middleware if the user is authenticated
router.use(authController.protect);

// Update Password of Logged in user
router.patch('/updateMyPassword', authController.updatePassword);

// Create a '/me' route for the user
//  to getUser based on current logged on UserId and not the URL params
// -- A bit of a hack
// .protect() gives access to current user id == req.user.id
router.get('/me', userController.getMe, userController.getUser);

// User updates their data, name, email and photo
// TODO: Use multer const upload middleware to update one single image from the
//  Accounts Settings /updateMe route Use multer's .single( fieldname )
//    to upload the photo to /public/img/users
// Note: 'photo' is the name of the field that will hold the image to upload
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

// Even though we do not delete the user data, we render it no longer accessible
// Since data is no longer accessible, we can use the DELETE method
router.delete('/deleteMe', userController.deleteMe);

// Only allow role: 'admin' to have access to every route after this point
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
