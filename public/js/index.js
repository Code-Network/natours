/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

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

// TODO:  Set an event listener to update name, email and photo from
//    form on account.pug ( API Method )
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    /* Note: Because we are using the Multer to upload the user photo,
          Multer requires the form attribute enctype='multipart/form-data',
          Since we must use the API we need to programmatically
          set this attribute; a good way to do this is to use FormData():
      Note: From MDN: 'The FormData interface provides a way to easily
         construct a set of key/value pairs representing form fields and their
         values, which can then be easily sent using the
         XMLHttpRequest.send() method. It uses the same format a form would
         use if the encoding type were set to "multipart/form-data".'*/
    const form = new FormData();

    // Get email and password value the user puts in by appending key/value pairs
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    /* TODO: Append photo value in files which is an Array;
        since there is only one element in the Array, we select the first one
      Note: From MDN: 'A file input's value attribute contains a DOMString that
        represents the path to the selected file(s). If the user selected
        multiple files, the value represents the first file in the list of
        files they selected. The other files can be identified using the
        input's HTMLInputElement.files property.'
      Note: From MDN: 'An object of this type is returned by the files property
        of the HTML <input> element; this lets you access the list of files
        selected with the <input type="file"> element.
        -- All <input> element nodes have a files attribute of type FileList
         on them which allows access to the items in this list.
          - For example, if the HTML includes the following file input:
              -- <input id="fileItem" type="file">
          - The following line of code fetches the first file in the
            node's file list as a File object:
              -- var file = document.getElementById('fileItem').files[0];'
        */
    form.append('photo', document.getElementById('photo').files[0]);

    // Axios will recognize const form as an object and work the same as before
    updateSettings(form, 'data');
  });
}

// TODO: Set an event listener to update user password from the Accounts Page
// account.pug class => API property names
// #password-current => passwordCurrent
// #password => password
// #password-confirm => passwordConfirm

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async evt => {
    evt.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// TODO:  Booking
const bookBtn = document.getElementById('book-tour');
if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
