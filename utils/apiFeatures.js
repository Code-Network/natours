// TODO: Create a Class for getAllTours methods to create a reusable module
// constructor arguments:
//    1. Mongoose query object => query = Tour.find()
//    2. Express queryString (coming from the route = req.query)

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // TODO:  1) Filtering
  // ---------------------------------
  filter() {
    // 1A Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));

    return this;
  }

  // TODO:  2) Sorting
  // ---------------------------------
  sort() {
    // Use sort() to organize the queries by price values in ascending order
    // But if there is a tie in price, then we must sort them by a second criteria.
    // In Mongoose: sort('price ratingAverage'),
    //    or sort('price -ratingAverage') for highest ratingsAverage first in a price tie
    // Use a comma for second criteria:
    //    localhost:3000/api/v1/tours?sort=price,ratingsAverage
    //    localhost:3000/api/v1/tours?sort=price,-ratingsAverage
    // We will then have to replace the comma with a space
    // Ex. localhost:3000/api/v1/tours?sort=price
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      // console.log(sortBy); // price ratingsAverage
      this.query = this.query.sort(sortBy);

      // Add a default in case the user does not specify
      //    any sort field in the URL query string
      //  i.e. localhost:3000/api/v1/tours
      // We will then sort by createdAt in descending order
      //    so that the newest ones will show up first
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // TODO:  3) Field Limiting
  // ---------------------------------
  limitFields() {
    // URL: localhost:3000/api/v1/tours?fields=name,duration,difficulty,price
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      // When client selects the fields via URL
      // URL: localhost:3000/api/v1/tours?fields=name,duration,difficulty,price OR
      // URL: localhost:3000/api/v1/tours?fields=-name,-duration
      this.query = this.query.select(fields);
    } else {
      // excluding only the __v field, including all other fields
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // TODO: 4) Pagination
  // ---------------------------------
  paginate() {
    // Default a limit to the amount of results the user can get
    // By Default we want page #1
    // req.query.page * 1 converts a string to a number
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // Query:  ?page=2&limit=10, 1-10 = page 1, 11 - 20 = page 2
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
