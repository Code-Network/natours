/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';

// DOM ELEMENTS
// Note: We ran into some problems where an error showed up when we were
//  not on the tour page where a map is displayed;
// TODO: Create an if statement which checks which page we are on;
//  if we are on a tour page, only then attempt to display a map
const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// TODO: Remove submit event listener on pages where the form DNE
// Note: We had to add .form--login to login.pug form because it
//  interfered with User Account Settings page, '/me'
const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get email and password value the user puts in
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// TODO: Set an event on the Logout link
// Log out link class added to _header.pug because it interfered with form on
//   user form from account.pug
const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn) logOutBtn.addEventListener('click', logout);
