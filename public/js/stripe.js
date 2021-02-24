/* eslint-disable */
import axios from 'axios';
const stripe = Stripe('pk_test_wD5MlN7eIOjyjhwwUqzimlkC00plhdq1vC');

/*
  TODO: Create a Stripe Checkout Session

   Note: We will get the tourId from index.js where this function will be
     called when the user clicks on the book tour button;  when that happens,
     the tourId on the button's data attribute will pass onclick to this
     bookTour function; it will pass to the URL and begin a
     Stripe Checkout Session.
 */
export const bookTour = async tourId => {
  try {
    // step: 1) Get the checkout session from the server/endpoint/API onto
    //    client side => /checkout-session/:tourId;
    //    -- store the session in const session
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log('STRIPE CHECKOUT SESSION CREATED:  ', session);

    /* note: In order to look as this session object in our console,
     connect this function we just created inside of stripe.js to the tour.pug
     green button from tour.pug; do this in index.js  */
    console.log(session);

    // step: 2) Use the Stripe object to automatically Create checkout form
    //    + charge/process the credit card for us
  } catch (e) {
    console.log(e);
  }
};
