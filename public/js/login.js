/* eslint-disable */
// Create login function

// Note: This is client facing code and only the most modern browsers can run
//   async/await functions
const login = async (email, password) => {
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

    console.log('This is res!  ', res);
  } catch (err) {
    console.log('THIS IS THE ERROR', err.response.data);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  // Get email and password value the user puts in
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
