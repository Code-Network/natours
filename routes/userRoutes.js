const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// ex. localhost:3000/api/v1/users/signup POST Request
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Forgot Password only receives the email address
router.post('/forgotPassword', authController.forgotPassword);

// Reset Password receives a random token, not JSON web token
// as well as the new password to reset password
router.patch('/resetPassword/:token', authController.resetPassword);

// Update Password of Logged in user
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

// User updates their data, name and email only (for now)
router.patch('/updateMe', authController.protect, userController.updateMe);

// Even though we do not delete the user data, we render it no longer accessible
// Since data is no longer accessible, we can use the DELETE method
router.delete('/deleteMe', authController.protect, userController.deleteMe);

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
