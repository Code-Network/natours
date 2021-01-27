const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Apply isLoggedIn to every single route we create on this page
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);

// Test Only: protect getTour and test by removing cookie
// router.get('/tour/:slug', authController.protect, viewsController.getTour);

router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

module.exports = router;
