// Log in page: sends the email and password to the server, then goes to the board.

const form = document.getElementById('login-form');
const formError = document.getElementById('form-error');

form.onsubmit = async function (event) {
  event.preventDefault(); // stop the browser from reloading the page

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  const result = await response.json();

  if (response.ok) {
    window.location.href = '/board.html';
  } else {
    formError.textContent = result.error; // "Wrong email or password."
  }
};
