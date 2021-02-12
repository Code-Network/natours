const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// Note: Switch to multer memory storage
// TODO: Use multer to store user uploaded image with unique name into our
//       file system - public/img/users.
/*const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    /!*
      An example of req.file:
     req.file from multer middleware {
         fieldname: 'photo',
         originalname: 'leo.jpg',
         encoding: '7bit',
         mimetype: 'image/jpeg',
         destination: 'public/img/users',
         filename: 'd12d5825d3c6fc76f7451556983adb1c',
         path: 'public/img/users/d12d5825d3c6fc76f7451556983adb1c',
         size: 207078
     }*!/
    // extract fileExtention from the upload file stored in req.file
    const ext = file.mimetype.split('/')[1]; // i.e. jpeg

    /!*
    todo: Call the cb with no error (i.e. null) and then the unique filename
     that we want to specify; this is a complete definition of where we want to
     store our files ( with the destination and the filename )

    Example of unique filename to be used for storage names
      user-userID-currentTimestamp-fileExtension
     public/img/users/user-5c8a1f292f8fb814b56fa184-1612903766758.jpeg
    *!/
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});*/

// TODO: Switch to multer memory storage so that the user directed upload
//  image can be stored as a Buffer
// Note: When we put the file into memory req.file is not set, and we will
//  need req.file and req.file.filename in
//  exports.resizeUserPhoto and in exports.updateMe middleware functions.
const multerStorage = multer.memoryStorage();

// TODO:  Create a Multer Filter
// Goal:  Test to see if the uploaded file is an image; if it is so, we pass
//     true into the callback function, if not then pass false with error.
//-- We do this because we do not want files that are not images to be uploaded.
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // status code 400 = Bad Request
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

/*
 TODO: Configure a Multer upload to save all of the photos the user
     would like to upload into public/img/users; this will be
     used in the Accounts Settings page where the user gets to
     'Choose new photo'
 Note: Multer adds a body object and a file/files object to the request
     object; the body object contains the values of the text fields of
     the form, the file or files object contains the files uploaded via
     the form.
 Note: Images are not uploaded to the database directly; we just
     upload them into our file system and then in the DB, we put a
     link which points to that image; so in this case, in each
     user document, we will have the name of the uploaded file.
 NOTE: Multer will not process any form which is not multipart
     (multipart/form-data).
     -- Don't forget the enctype="multipart/form-data" in form.
 */
// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

//  upload.single('photo'),
exports.uploadUserPhoto = upload.single('photo');

// TODO: Resize user uploaded images
// Note: npm install sharp
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // If the user has not uploaded an image, go on to next middleware
  if (!req.file) return next();

  /*
   todo: Use sharp for image processing
   Note: When doing image processing like this, right after uploading a file,
   it's best to not save the file to the disk, but, instead, save it
   to memory so that it can be stored as a Buffer.
   The image will then be available at req.file.buffer
   So, we must change our multer storage to:
   const multerStorage = multer.memoryStorage()
   Note: This is more efficient.  Instead of having to write the file to the
   disk and then here read it again, we simply keep the image in
   memory and just read it here
   Note:  Because req.file.filename was not set when we switched to
   multer.memoryStorage, we must set req.file.filename here */
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// param obj = req.body
// param ...allowedFields will be an array containing 'name' and 'email' so far
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // Object.keys(obj) is an Array containing all the keys of param obj = req.body
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// TODO:  Middleware for '/me' route which gets current user ID
// Route /me => this will be similar to factoryHandler's getOne()
// except that getMe() will Get the document based on User id
// from .protect() and pass it on to getUser() in userModel.js
// Gets data from (currently logged in User) and not URL params
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// TODO: User UPDATES CURRENTLY AUTHENTICATED SELF - '/updateMe'
//  Logged in User gains ability to update their own data here.
// Note: Currently, the user only update their name and email address
exports.updateMe = catchAsync(async (req, res, next) => {
  /*
    Note: req.file example output
   req.file from multer middleware {
       fieldname: 'photo',
       originalname: 'leo.jpg',
       encoding: '7bit',
       mimetype: 'image/jpeg',
       destination: 'public/img/users',
       filename: 'user-5c8a1f292f8fb814b56fa184-1612903766758.jpeg',
       path: 'public/img/users/user-5c8a1f292f8fb814b56fa184-1612903766758.jpeg',
       size: 207078
   }
   */
  // console.log('req.file from multer middleware', req.file);
  // console.log('req.body after multer middleware', req.body);

  // todo: 1) Create Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    // Status Code 400 = Bad Request
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // TODO: Filter out unwanted field names that are not allowed
  //  to be updated
  // Filter req.body so that it only contains name and email
  const filteredBody = filterObj(req.body, 'name', 'email');
  // We rely on req.file.filename in order to save the filename into DB
  if (req.file) filteredBody.photo = req.file.filename;

  // todo: 3) Update user document
  // filteredBody => data that gets updated - name, email, photo
  // We use filteredBody instead of req.body because we don't want to update all in the body
  //    We want to prevent user from updating role field, for instance
  //    User could have set req.body.role: 'admin' for instance
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not defined and never will be! Please use /signup instead'
  });
};

// Admins Only:  to update user
// NOTE: Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);

exports.deleteMe = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);

// LEGACY CODE BELOW
/*
 exports.getAllUsers = catchAsync(async (req, res, next) => {
 const users = await User.find();

 // SEND RESPONSE
 res.status(200).json({
 status: 'success',
 results: users.length,
 data: {
 users
 }
 });
 });
 */

// TODO:  Give the User the Capability of deleting their account
// exports.deleteMe = catchAsync(async (req, res, next) => {
//   // The data we want to update is the active property in the userSchema in userModel.js
//   await User.findByIdAndUpdate(req.user.id, { active: false });
//
//   // status code 204 => Deleted
//   // set data to null because they want to delete their account and we do not
//   //   want to return their data to them
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

// This error message fires here:
//  localhost:3000/api/v1/signup
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined - wrong endpoint!'
//   });
// };

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };
