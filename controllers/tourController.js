
const Tour = require('./../models/tourModel');




// =================================================================
// TODO: TOUR ROUTE HANDLERS / CONTROLLERS
// ==========================================================

// TODO: a.  GET ALL TOURS Handler / Controller --------------------
exports.getAllTours = (req, res) => {
  // console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    // requestedAt: req.requestTime,
    // data: {
    //   tours
    // }
  });
};

//
// --------------------------
//

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
// --req holds all the info about the request that was done.
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
exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour
    // }
  });

  // Requires Middleware app.use(express.json())
  // console.log(req.body);

  // Take the ID of the last object in JSON file and add one to it
  // const newId = tours[tours.length - 1].id + 1;

  /*
	 Object.assign enables us to create a new Object
	 by merging two existing Objects together

	 Can also do:  req.body.id = newId, but we do not want to
	 mutate the original body object
	 */
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);

  // Overwrite file
  // fs.writeFile(filename, data, [encoding], [callback])
  /*fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      console.log('Error in var newTour', err);
      // status 201 means CREATED
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );*/
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
      tour: '<Updated tour here...>'
    }
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
    data: null
  });
};
