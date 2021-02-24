/* eslint-disable */
import axios from 'axios';
// const stripe = Stripe('put your real test publishable API key here');
const stripe = Stripe('pk_test_wD5MlN7eIOjyjhwwUqzimlkC00plhdq1vC');

export const bookTour = async tourId => {
  // goal: 1) Get the checkout session from the server/endpoint/API onto
  //    client side - /checkout-session/:tourId
  const session = await axios.get(
    `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
  );

  /* note: In order to look as this session object in our console,
      connect this function we just created inside of stripe.js to the tour.pug
       green button from tour.pug; do this in index.js  */
  console.log(session);

  // goal: 2) Use the Stripe object to automatically Create checkout form
  //    plus charge/process the credit card for us
};
