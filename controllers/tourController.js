const Tour = require('./../models/tourModel');

// =================================================================
// TODO: TOUR ROUTE HANDLERS / CONTROLLERS
// ==========================================================

// TODO: a.  GET ALL TOURS Handler / Controller --------------------
exports.getAllTours = async (req, res) => {
  // This returns the url query key/value pairs
  // console.log(req.query);

  // Returns an Array of every document object in the Tour Collection
  try {
    console.log('This is req.query', req.query);

    // TODO:  BUILD THE QUERY
    // TODO:  1A)  Filtering
    // TODO:  Create a shallow copy of req.query - - Filtering
    // We cannot do const queryObj = req.query because that will change req.query
    // We need a hard copy that does not affect req.query
    // In ES6, there is a very nice trick to doing this.
    //    First use destructuring and make an object out of it
    // The three dots (destructuring) will first take all of the fields out of the object
    //   When we add the curly braces { }, we turn it into a new object
    const queryObj = { ...req.query };

    // TODO:  Now, create an Array of all of the fields we want to exclude
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // TODO: Now, remove all of these fields from our queryObj
    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log('This is queryObj', queryObj);
    // console.log('This is req.query', req.query);

    // TODO:  Two ways to run a database query
    //  1.  Filter Object -- RETURNS A QUERY
    //   -- If we await tours now then we can't await again and
    //   there is still much we have to do, so let's get a copy
    //   of tours at this point and await tours later
    // const tours = await Tour.find(queryObj);

    // TODO:  1B) Advanced Filtering
    // { difficulty: 'easy', sort: '1', duration: { $gte: 5 } }
    // { difficulty: 'easy', sort: '1', duration: { gte: '5' } }

    // Convert object to string so that we can replace any lte to $lte, etc
    let queryStr = JSON.stringify(queryObj);

    // Replace gte, gt, let, and lt with $gte, $gt, $lte, $lt
    // The \b is for exact, | means OR, /.. /  opens a regex
    //  The 'g' at the end means that it will happen multiple times.
    //  Without the 'g', it would only replace the first occurrence.
    // replace() gives an option for a callback.
    // The match argument in the callback will be what actually matched
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // To test to see if queryStr.replace() worked,
    // we will turn it back into a JavaScript object
    // OP EX.  queryStr is now { difficulty: 'easy', duration: { '$gte': '5' } }
    console.log('queryStr is now', JSON.parse(queryStr));

    // const query = Tour.find(queryObj);
    let query = Tour.find(JSON.parse(queryStr));

    // TODO:  2) Sorting
    // Use sort() to organize the queries by price values in ascending order
    // Ex. localhost:3000/api/v1/tours?sort=price
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    }
    // 3) Sorting
    // TODO:  EXECUTE THE QUERY
    const tours = await query;

    // TODO:  NOTES
    /*
     TODO:  The Mongoose Method of writing Database Queries
     2.  Mongoose Method
     other methods we can use:  .lte(), lt(), gte(), gt()

    Manually writing mongo to filter out duration >= 5
     { difficulty: 'easy', duration: {$gte: 5} }
    In the URL with the query string, it would be written like this:
    127.0.0.1:3000/api/v1/tours?difficulty=easy&sort=1&duration[gte]=5
    While the above would bring an error, when we log req.query to the
     console, we get
          { difficulty: 'easy', sort: '1', duration: { gte: '5' } }

    const query = Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
  */

    // TODO:  SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

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
exports.getTour = async (req, res) => {
  try {
    // req.params is where are stored all of the parameters
    //    as in tourRoutes.js, line 30, where we named the '/:id' route
    //    so that we can find ex. localhost:3000/api/v1/tours/5f73ed16b967eb1a40fa8150
    // Same as:  Tour.findOne({ _id: req.params.id })
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

//
// ---------------------------
//

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
exports.createTour = async (req, res) => {
  try {
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
  } catch (err) {
    // Validation errors would be caught here (ex. missing a required field)
    // If you have a validation error, the PROMISE would be rejected
    // 400 stands for 'Bad Request'
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

//
// -----------------------------
//

/* TODO:  d.  PATCH Handler / Controller to UPDATE TOUR
 -- There are 2 HTTP Requests which update data: PATCH and PUT
 - With PUT, we expect our application to receive the entire new updated Object
 - With PATCH, we only expect the properties that should actually
 be updated on the Object
 */
exports.updateTour = async (req, res) => {
  try {
    // Query for the document we want to update (by ID) and then update
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

//
// -----------------------------
//

// TODO:  e.  Delete Tour Handler / Controller
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
