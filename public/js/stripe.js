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

  Important Update before deployment: because API and website are using the
     same URL, we will remove the protocol and host; if we were hosting the
     API on one URL and the website on  another, it would not work this way.

     From this: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
     To this: `/api/v1/bookings/checkout-session/${tourId}`
 */
export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
