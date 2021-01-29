/* eslint-disable */
import axios from 'axios';
import { hideAlert, showAlert } from './alert';

// Create login function
// Note: This is client facing code and only the most modern browsers can run
//   async/await functions
export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password
      }
    });

    /*
        todo: When a user logs in, the user must refresh their page for their
              image and name to show up on the top right of the page; here we
              correct this by displaying an alert which informs the user that
              they have logged in successfully and then redirect them to the
              home page

        Note: The window.location read-only property returns a Location
         object with information about the current location of the document.
         -- Though Window.location is a read-only Location object, you can also
            assign a DOMString to it. This means that you can work with
            location as if it were a string in most cases:
            location = 'http://www.example.com' is a synonym of
            location.href = 'http://www.example.com'. (from MDN)

        Note:
         -- The location.assign( url ) method causes the window to load and
            display the document at the URL specified. After the navigation
            occurs, the user can navigate back to the page that called
            location.assign( url ) by pressing the "back" button.
         -- If the assignment can't happen because of a security
            violation, a DOMException of the SECURITY_ERROR type is thrown.
            This happens if the origin of the script calling the method is
            different from the origin of the page originally described by
            the Location object, mostly when the script is hosted on a
            different domain.  (from MDN - I included the parameter)
            -- If the provided URL is not valid, a DOMException of the
            SYNTAX_ERROR type is thrown.
     */
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
