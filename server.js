// Tracktern server. All the server code is in this file, in this order:
//   1. Setup
//   2. Helper functions
//   3. The board page
//   4. Sign up, log in, log out
//   5. Applications: list, add, edit, delete
//   6. Errors


// ---------- 1. Setup ----------

// Read the secret from the .env file (quiet: true stops dotenv from printing a message).
require('dotenv').config({ quiet: true });

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// The session secret must come from the .env file, never from the code.
if (!process.env.SESSION_SECRET) {
  console.log('SESSION_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Read the JSON that the pages send. It ends up in req.body.
app.use(express.json());

// Sessions remember who is logged in: after login we put the user's id in req.session.userId.
// The browser only gets a cookie with a random session id.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,              // only save the session when it changed
  saveUninitialized: false,   // no cookie until someone logs in
  cookie: {
    httpOnly: true,              // JavaScript on the page cannot read the cookie
    sameSite: 'lax',             // the cookie is not sent with requests from other websites
    maxAge: 8 * 60 * 60 * 1000   // log out after 8 hours
  }
}));

// Anyone can open the files in the public folder: home page, log in, sign up, CSS, JavaScript.
app.use(express.static(path.join(__dirname, 'public')));


// ---------- 2. Helper functions ----------

const dataFolder = path.join(__dirname, 'data');

// Create the data folder the first time the server starts.
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

// Read a list from a JSON file in the data folder (an empty list if the file does not exist yet).
function readData(fileName) {
  const filePath = path.join(dataFolder, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Save a list to a JSON file in the data folder.
function saveData(fileName, list) {
  fs.writeFileSync(path.join(dataFolder, fileName), JSON.stringify(list, null, 2));
}

// Turn a value sent by the page into clean text.
// Anything that is not text (a number, a list, nothing at all) becomes '', so it cannot crash the server.
function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

// ---------- 4. Sign up, log in, log out ----------

app.post('/api/signup', function (req, res) {
  const name = cleanText(req.body.name);
  const email = cleanText(req.body.email).toLowerCase();
  const password = cleanText(req.body.password);

  // Check everything here, even though the browser checks the form too.
  if (name === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of at least 8 characters.' });
  }

  const users = readData('users.json');
  const existingUser = users.find(function (item) {
    return item.email === email;
  });
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = {
    id: crypto.randomUUID(),
    name: name,
    email: email,
    // Never save the real password. bcrypt turns it into a hash that cannot be turned back.
    passwordHash: bcrypt.hashSync(password, 10)
  };
  users.push(user);
  saveData('users.json', users);

  req.session.userId = user.id; // log the new user in right away
  res.json({ ok: true });
});

app.listen(PORT, function () {
  console.log('Tracktern is running at http://localhost:' + PORT);
});
