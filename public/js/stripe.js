/* eslint-disable */
import axios from 'axios';
import { hideAlert, showAlert } from './alert';
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
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
