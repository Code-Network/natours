const express = require('express');
const User = require('./../models/userModel');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Apply isLoggedIn to every single route we create on this page
// router.use(authController.isLoggedIn);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

// NOTE: Test Only: protect getTour and test by removing cookie
// router.get('/tour/:slug', authController.protect, viewsController.getTour);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

// POST route used with form on account.pug
// Note: We protect this route because we want to ensure that only the
//  user can update their settings ( name, email and password )
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
