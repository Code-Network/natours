const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

// On upload, store tour images and tour imageCover in memory
const multerStorage = multer.memoryStorage();

// Ensure uploads are definitely images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

/*
  TODO: Create the middleware from the upload
  Note: Since we have two fields in the tourSchema which contain images,
        Multer requires this syntax with
     --  name: 'field name', maxCount: max # of images

  Note: If we only had to deal with one tourSchema property,
    but multiple photos, then the syntax may be:
     -- exports.uploadTourPhotos = upload.array('images', 5);

  Note: If we only required one field and one image, then, as in
   userController photo uploaded from the Accounts Settings page:
   -- exports.uploadUserPhoto = upload.single('photo');
   */
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// TODO:  Process Tour Images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  /*
    Notes on Multer
    Note:
      1. upload.single('image') produces req.file
      2. upload.array('images', 5) produces req.files
      3. upload.fields({...}, {...}) produces req.files

    Note: Partial OP of req.files ( even imageCover is an Array with 1 obj ):
   [Object: null prototype] {
     imageCover: [
       {
         fieldname: 'imageCover',
         originalname: 'new-tour-1.jpg',
         encoding: '7bit',
         mimetype: 'image/jpeg',
         buffer: <Buffer ff d8 ... 01 ... 1857218 more bytes>,
         size: 1857268
       }
     ],
     images: [
       {
         fieldname: 'images',
         originalname: 'new-tour-2.jpg',
         encoding: '7bit',
         mimetype: 'image/jpeg',
         buffer: <Buffer ff ... 01 ... 2321585 more bytes>,
         size: 2321635
       },
       {...}
     ]
  }
   */

  // step: If there are no images uploaded,
  //  i.e. if imageCover OR images DNE (both must exist), return next()
  if (!req.files.imageCover || !req.files.images) return next();

  // Important: Ensure the updateFile tour handler picks up the
  //  new imageCover file name by putting it right on the body
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // step: Use sharp to process the tour images if exists
  // resize to a 3:2 ratio
  // req.params.id is the tourId
  // store in public/img/tours/tourId-date-cover.jpeg
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // step: Tour Images in a loop
  //   Process images: [String] (besides the imageCover) in one iteration
  // step:  Ensure that req.body.images is an empty Array
  req.body.images = [];

  // Note: Here we are not using async/await correctly as it will not stop from
  //  going to next() middleware before the PROMISE is resolved; if we use map,
  //  instead of forEach, we can save an Array of all of the PROMISES and
  //  use Promise.all() to await all of them.
  // Note: Without Promise.all() none of the image files will persist to the DB
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      // note: Remember that each image is in file.buffer
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  // console.log(req.body);

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//
//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// });

/* Note:  Because getTour previously used populate() we set options:
  Just a reminder of a function we used reviewModel.js at one point;
   here is the syntax which lets us get away with using path/select:
     reviewSchema.pre(/^find/, function(next) {
       this.populate({
         path: 'tour',
         select: 'name'
       }).populate({
         path: 'user',
         select: 'name photo'
       });
*/
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

/*
exports.getTour = catchAsync(async (req, res, next) => {
  // Using Mongoose => const tour = await Tour.findById(req.params.id);
  // -------
  // In MongoDB => Tour.findOne({ _id: req.params.id })
  // -------
  // Adding the Population process to fill up the guides field from the
  //      tour model which always happens in a Query
  // const tour = await Tour.findById(req.params.id).populate('guides');
  // -------
  // Get rid of unnecessary fields in populate options.
  // Note that populate is a query and may affect performance slightly on small
  //    applications and moreso on bigger ones
  // Because we would need to use this in multiple request and it is not
  // populating in getAllTours, for instance, we will pre /^find/ on tourModel.js
  // const tour = await Tour.findById(req.params.id).populate({
  //   path: 'guides',
  //   select: '-__v -passwordChangedAt'
  // });
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});
*/

exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });
//
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }

    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

// '/tours-within/:distance/center/:latlng/unit/:unit'
// '/tours-within/233/center/34.073880,118.201625/unit/mi'
// Use the following URL in POSTMAN for testing:
// {{URL}}api/v1/tours/tours-within/400/center/34.111745,-118.11349/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  // Use destructuring to get  all route parameter data at once
  const { distance, latlng, unit } = req.params;

  // TODO: Get coordinates latlng (string) and put in their own variables
  // latlng is a string separating latitude and longitude
  // Use split() with comma as separator to create an Array
  // Use destructuring to save each into their own variables
  // lat and lng are strings
  const [lat, lng] = latlng.split(',');

  // TODO: Convert units to radians (divide distance by radius of the earth)
  // Note: In order to do geospatial queries we need to first attribute an
  //    index (in tourModel.js) to the field where the geospatial data
  //    that we are searching for is stored.
  //    -- So, in this case, we need to add an index to startLocation
  //        in the tourModel.js file
  // ---------
  // MongoDB expects radius of sphere to be in radians.
  // For miles to radians ==> radians = x miles / 9365.2 miles;
  // For kilometers to radians ==> radians = x km / 6378.1 km
  // Tutorial:  https://docs.mongodb.com/manual/tutorial/geospatial-tutorial/

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // Check to see if lat/lng is defined, because if they are not then that
  // means they may not have been specified in correct format
  // If not, throw an Error with status code 400 for Bad Request
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }

  // TODO:  Write the Geospatial Query
  // Geospatial queries are similar to regular queries
  // Specify the filter object in find( { filter object } )
  // In the filter object we want to query for 'startLocation' because the
  //   startLocation field is what holds the geospatial point where each tour
  //   starts
  // ----------
  // NOTE
  //
  // If specifying latitude and longitude coordinates, list the longitude
  //    first and then latitude:
  //
  //   Valid longitude values are between -180 and 180, both inclusive.
  //   Valid latitude values are between -90 and 90, both inclusive.

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  // console.log('distance is: ', distance);
  // console.log('The unit is: ', unit);
  // console.log('lat is: ', lat);
  // console.log('lng is: ', lng);
  // console.log(tours);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

// TODO: Create a function which calculates the distances of
//  tours in our collection from a certain point using the
//  Geospatial Aggregation pipeline
exports.getDistances = catchAsync(async (req, res, next) => {
  // Get all route parameter data
  const { latlng, unit } = req.params;

  // Conversion from meters to miles
  // Set the multiplier to 0.000621371 if unit = mi or 0.001 if unit = km
  // 1 meter = 0.000621371 miles; 1 meter = 0.001 kilometers
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  // Separate latitude and longitude into their own variables within an Array
  //   -- Remember that these numbers are Strings
  const [lat, lng] = latlng.split(',');

  // Throw an AppError with a status code of 400 for Bad Request if a
  // latitude or a longitude is undefined or in a format we do not recognize
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }

  /*
   TODO:  Calculate the distance of the tours from a coordinate
    using the Aggregation pipeline which in called on the Model itself.
   - $geoNear is the first stage in the pipeline; it outputs documents
      in order of nearest to farthest from a specified point.
   - Specify all distances in the same units s those of the processed
      documents' coordinate system
   - $geoNear requires that at least one of the fields contain
      a GeoSpatial Index
   - In tourModel.js, we have tourSchema.index({startLocation: '2dsphere'}).
   - If there is only one field with a GeoSpatial index, then $geoNear stage
       will automatically use that index to perform calculation.
   - distanceField is the name of the field that will be created
      and where all of the calculated distances will be stored
        - This will add a distance field with total distance in meters
        from latlng to each tour
  - Ex. Endpoint: {{URL}}api/v1/tours/distances/34.111745,-118.11349/unit/mi
  - $project specifies the inclusion, addition, computed, or excluded fields,
       or the resetting of values of existing fields.
      1 = true to include, 0 = false, to exclude
  - In $geoNear, add the distanceMultiplier property to convert meters to km
      - Multiplyiing by 0.001 is the same as dividing by 1,000
   */
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1 /* 1 = true, specifies inclusion of distance field*/,
        name: 1 /* 1 = true, specifies inclusion of name field */
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
