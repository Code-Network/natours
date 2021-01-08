const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // Build template

  // Render that template using tour data from 1)
  //  -- so first import the Tour Model above
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });

  next();
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};
