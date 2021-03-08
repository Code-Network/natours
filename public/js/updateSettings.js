/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

/* TODO: Create a function to update name and/or email XOR update password
   Note: Body comes from req.user
type = data or password
type = 'data' = Update Current User = http://localhost:3000/api/v1/users/updateMe
       Body = {"name": "Bee", "email": "email@email.com"}
type = 'password' = 'Update Current Password' = http://localhost:3000/api/v1/users/updateMyPassword
       Body = {
         "passwordCurrent": "newpassword",
         "password": "newpassword2",
         "passwordConfirm": "newpassword2"
       }

 Important Update before deployment: because API and website are using the same
   URL, we will remove the protocol and host; if we were hosting the API on one
   URL and the website on  another, it would not work this way.
*/
export const updateSettings = async (data, type) => {
  try {
    //
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} was successfully updated`);
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// TODO: Create a function that receives updated name and email from account page.
// Note: name and email are what we want to update
// export const updateData = async (name, email) => {
//   try {
//     /*
//     step:  Use Axios to create the API call itself ( import from module )
//
//     Note: Hit 'Update Current User' route {{URL}}api/v1/users/updateMe
//      which receives in the body only the data the user wants to update
//      (name/email).
//      - We get the name and email from req.user.
//      - In this route, we do not have to specify the User ID as a URL parameter
//           as we had to in the 'Update User' route
//           => {{URL}}api/v1/users/5fe25ef513a0d114fb35a6a0
//   */
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://localhost:3000/api/v1/users/updateMe',
//       data: {
//         name: name,
//         email: email
//       }
//     });
//
//     if (res.data.status === 'success') {
//       showAlert('success', 'Data updated successfully!');
//     }
//   } catch (err) {
//     // Note: This message property is the one we are defining on the server
//     //    whenever there is an error.
//     showAlert('error', err.response.data.message);
//   }
// };
