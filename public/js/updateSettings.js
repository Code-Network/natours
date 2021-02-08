/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// TODO: Create a function that receives updated name and email from account page
// name and email are what we want to update
export const updateData = async (name, email) => {
  try {
    // Note: If there is an issue, we want to import showAlert from ./alert
    /*
    todo:  Use Axios to create the API call itself ( import from module )

    Note: Hit 'Update Current User' route {{URL}}api/v1/users/updateMe
     which receives in the body only the data the user wants to update
     (name/email).
     - We get the name and email from req.user.
     - In this route, we do not have to specify the User ID as a URL parameter
          as we had to in the 'Update User' route
          => {{URL}}api/v1/users/5fe25ef513a0d114fb35a6a0
  */
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe',
      data: {
        name: name,
        email: email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');
    }
  } catch (err) {
    // Note: This message property is the one we are defining on the server
    //    whenever there is an error.
    showAlert('error', err.response.data.message);
  }
};
