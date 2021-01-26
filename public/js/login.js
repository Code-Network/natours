/* eslint-disable */
// Create login function
const login = async (email, password) => {
  await axios({
    method: 'POST',
    url: 'http://127.0.0.1:3000/api/v1/users/login',
    data: {
      email: email,
      password: password
    }
  });
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  // Get email and password value the user puts in
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
