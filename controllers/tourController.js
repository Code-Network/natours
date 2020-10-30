const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// TODO:  Prefill the fields required for the /top-5-cheap route
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// =================================================================
// TODO: TOUR ROUTE HANDLERS / CONTROLLERS
// ==========================================================

// TODO: a.  GET ALL TOURS Handler / Controller --------------------
exports.getAllTours = catchAsync(async (req, res, next) => {
  // TODO:  EXECUTE THE QUERY
  // TODO:  Run code for the API filtering functionality
  //    using the new class APIFeatures filter() method
  // From constructor(query, queryString)
  // Tour.find() is a query object ==> APIFeartures Mongooose query parameter
  // req.query is APIFeatures Express queryString parameter
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // TODO: NOTE: features.query
  // features.query => query is not from APIFeatures param this.query = query
  // In the APIFeatures filter() we have this.query.find(JSON.parse(queryStr));
  //    so, this.query, or query, now has the entire Tour query
  const tours = await features.query;

  // TODO:  SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// -------------------------------------------
// -------------------------------------------
// TODO: b.  GET ONE TOUR Handler / Controller
// -------------------------------------------
// -------------------------------------------
/*
 -- By running localhost:3000/api/v1/tours/5, and console.log(req.params)
 the output to the console will be {id: 5}
 -- If we want an optional parameter:  '/api/v1/tours/:id/:x/:y?',
 then y would be undefined because it is now optional
 */
exports.getTour = catchAsync(async (req, res, next) => {
  // req.params is where are stored all of the parameters
  //    as in tourRoutes.js, line 30, where we named the '/:id' route
  //    so that we can find ex. localhost:3000/api/v1/tours/5f73ed16b967eb1a40fa8150
  // Same as:  Tour.findOne({ _id: req.params.id })
  const tour = await Tour.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError('No tour found with that ID', 404));
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// ---------------------------------
// ---------------------------------
// TODO:  c.  POST Handler / Controller to CREATE NEW TOUR

// With a post request, we can send data from the client to the server
// -- req.body holds all the info about the request that was done.
// And if the client sent some data, it will be on req var.
// -- Out of the box, Express does not put that data on the request, so in order
// to have that data available, we have to use middleware:
//        app.use(express.json())
// -- app.use(express.json()) is just a step that the request goes through while
// it is being processed.
// -- With app.use(express.json()), the data the client sent,
//    which is in var req,
// is added to var req object.
//    data === req.body, so 'body' is added by this middleware
// NOTE: With async/await, we need to check for errors using try/catch syntax
exports.createTour = catchAsync(async (req, res, next) => {
  // We used to create a new tour this way, which returned a PROMISE
  // This called the method on the new document directly
  // const newTour = new Tour({some data});
  // newTour.save();

  // Alternatively we can call the method directly on the model itself => Tour
  // The create() method also returns a PROMISE;
  // You can use .then() to gain access to data in doc
  // OR use async/await.
  // So we make this an async function
  // and 'await' the promise of Tour.create and save the result
  //   of this PROMISE in the newTour variable
  // For the data, pass in the req.body, which is the data that comes
  //    with the POST REQUEST == req.body
  // This will be stored in the Database.
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//
// -----------------------------
//

/* TODO:  d.  PATCH Handler / Controller to UPDATE TOUR
 -- There are 2 HTTP Requests which update data: PATCH and PUT
 - With PUT, we expect our application to receive the entire new updated Object
 - With PATCH, we only expect the properties that should actually
 be updated on the Object
 */
exports.updateTour = catchAsync(async (req, res, next) => {
  // Query for the document we want to update (by ID) and then update
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
    (err) => {
      if (err) {
        return next(new AppError('No tour found with that ID', 404));
      }
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//
// -----------------------------
//

// TODO:  e.  Delete Tour Handler / Controller
exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id, (err) => {
    if (err) {
      return next(new AppError('No tour found with that ID', 404));
    }
  });

  // This is just testing using API files
  // status 204 = No Content, because as a result we usually
  //     don't send any data back, maybe just null to show that
  //     the tour no longer exists.
  // Output on Postman doesn't even send the JSON we sent back.  Just 204.
  // status 204 is No Content
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//
// -----------------------------
//

// TODO:  f.  Get Tour Stats Handler / Controller
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        // _id: '$difficulty',
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        // avgPrice: 1 for ascending
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

//
// -----------------------------
//

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      // pass a field path operand or doc operand to unwind an array field
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },

        // How many tours in the above month?
        numTourStarts: { $sum: 1 },

        // $push creates an ARRAY of the field names of the tours
        // Answers the question: Which tours?
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        /*
         We give each of the field names a 0 or a 1
         0 =>  id no longer shows up,   1 => _id shows up
         We remove the _id because we want $addFields: { month: '$_id' }
         to calculate the month
         */
        _id: 0,
      },
    },
    {
      /*
       Sort by the number of tour starts.
       value 1 is for ascending order and value -1 is for descending.
       Highest to lowest.
       */
      $sort: { numTourStarts: -1 },
    },
    {
      // Allows to display only 6 documents
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
