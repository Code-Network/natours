/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login } from './login';

// DOM ELEMENTS
// Note: We ran into some problems where an error showed up when we were not on the tour page where a map is displayed;
// TODO: Create an if statement which checks which page we are on; if we are on a tour page, only then attempt to
//  display a map
const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  // Call displayMap function from mapbox.js and pass in locations array
  displayMap(locations);
}

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  // Get email and password value the user puts in
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
