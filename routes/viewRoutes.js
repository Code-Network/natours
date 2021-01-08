const express = require('express');

const router = express.Router();

// PUG ROUTES
// Create a route from which we will access the base.pug template
// We generally use .get() when rendering pages in the browser.
// URL is the route we will use, which will be the root of our website => '/'
// Handler function is (req, res) => {}
router.get('/', (req, res) => {
  // Set status to 200 and render base pug; no need to specify .pug
  // tour and user are locals in the pug file
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Jonas'
  });
});

// Create /overview route in get() and create overview.pug (put in render)
//    and render passing local - title
router.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours'
  });
});

// Create /tour route in get() and create tour.pug (put in render)
//    and render passing local - title
router.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
});
router;

module.exports = router;
