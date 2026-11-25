// Sign up page: sends the form to the server, then goes to the board.
// The browser already checks the fields (required, type="email", minlength) before this runs.

const form = document.getElementById('signup-form');
const formError = document.getElementById('form-error');

form.onsubmit = async function (event) {
  event.preventDefault(); // stop the browser from reloading the page

  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  const result = await response.json();

  if (response.ok) {
    window.location.href = '/board.html'; // the account was created and we are logged in
  } else {
    formError.textContent = result.error; // for example "An account with this email already exists."
  }
};
