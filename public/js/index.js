/* eslint-disable */
import '@babel/polyfill';
import { display, displayMap } from './mapbox';
import { login } from './login';

/*
 Get location data

 -- Ran into an error where const locations returned an
 Uncaught TypeError: Cannot read property 'dataset' of null

 because the script script(src='/js/mapbox.js')
 was integrated at the beginning of tour.pug while it
 really should be at the bottom of the tour.pug page
 because the DOM is not yet loaded in the beginning.

 -- To fix this error, we remove the script tag from tour.pug
 and put it under the footer in base.pug

 -- Note:  PUG files do not trigger a restart of our server
 */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

displayMap(locations);

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  // Get email and password value the user puts in
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
