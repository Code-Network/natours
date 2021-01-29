/* eslint-disable */
import { login } from './login';

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  // Get email and password value the user puts in
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
