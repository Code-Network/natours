const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');
const router = express.Router();

// Param Middleware
/*router.param('id', (req, res, next, value, name) => {
  console.log(`User id is: ${value}`); // 3, or whatever id in url localhost:3000/api/v1/tours/3
  console.log(`User name is: ${name}`); // id
  next();
});*/

//
// ----------------------------------------------------------
//

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
