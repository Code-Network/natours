const Tour = require('./../models/tourModel');

exports.getOverview = (req, res) => {
  // 1) Get tour data from collection

  // Build template

  // Render that template using tour data from 1)
  //  -- so first import the Tour Model above
  res.status(200).render('overview', {
    title: 'All Tours'
  });
};

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};
