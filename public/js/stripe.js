/* eslint-disable */
const stripe = Stripe('put your real test publishable API key here');

export const bookTour = async tourId => {
  // goal: 1) Get the checkout session from the server/endpoint/API onto
  //    client side - /checkout-session/:tourId
  const session = await axios.get('/checkout-session/:tourId');

  // goal: 2) Use the Stripe object to automatically Create checkout form
  //    plus charge/process the credit card for us
};
