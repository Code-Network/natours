const Tour = require('./../models/tourModel');

// =================================================================
// TODO: TOUR ROUTE HANDLERS / CONTROLLERS
// ==========================================================

// TODO: a.  GET ALL TOURS Handler / Controller --------------------
exports.getAllTours = async (req, res) => {
  // Returns an Array of every document object in the Tour Collection

  try {
    const tours = await Tour.find();
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

/* TODO: b.  GET ONE TOUR Handler / Controller
 -- By running localhost:3000/api/v1/tours/5, and console.log(req.params)
 the output to the console will be {id: 5}
 -- If we want an optional parameter:  '/api/v1/tours/:id/:x/:y?',
 then y would be undefined because it is now optional
 */
exports.getTour = (req, res) => {
  // req.params is the place where all of the variables that we define are stored
  console.log(req.params);

  //  Turn the id into a number because req.params = { id: '5' } for example
  const id = req.params.id * 1;

  // Get the '5th' tour from tours-simple.json
  // find() returns an array where the comparison el.id===id is true
  // It will return
  // const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',

    // data: {
    //   tour
    // }
  });
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
      message: 'Invalid data sent!',
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
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

//
// -----------------------------
//

// TODO:  e.  Delete Tour Handler / Controller
exports.deleteTour = (req, res) => {
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
};
