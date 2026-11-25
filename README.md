# Tracktern

An internship application tracker for students. Each user gets a private board with one column per stage, and drags a card to a new column when an application moves forward.

SOEN 287 (Web Programming) course project, Fall 2026.

## Team

- Milos Jarcov (solo), Team 7, Section Q

## Tech stack

- Front end: HTML5, plain CSS (flexbox and one media query for phones), plain JavaScript with the DOM and `fetch`
- Back end: Node.js with Express 4
- Login: sessions with `express-session`, passwords hashed with `bcryptjs`
- Data: JSON files (`data/users.json` and `data/applications.json`)
- Config: `dotenv` reads the secret from a `.env` file that is not in Git

## Features

- Public home page
- Sign up, log in and log out. Passwords are hashed with bcrypt, never stored as plain text
- A private board with six columns: Saved, Applied, OA (online assessment), Interview, Offer, Rejected
- Add, edit and delete applications (company, role, link, deadline, stage, notes)
- Drag a card to another column to change its stage (on a phone, change the stage with Edit)
- The browser checks the forms (`required`, `type="email"`, `minlength`), and the server checks every request again
- Each user only sees and changes their own applications
- Works at phone width

## Run it on your computer

You need Node.js 18 or newer.

1. Install the packages:

   ```
   npm install
   ```

2. Create the `.env` file from the example (PowerShell shown, use `cp` on Mac or Linux):

   ```
   Copy-Item .env.example .env
   ```

3. Open `.env` and replace `SESSION_SECRET` with a long random string. This command prints one:

   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Start the server:

   ```
   npm start
   ```

5. Open http://localhost:3000

## Project structure

```
server.js            All the server code, in 6 parts: setup, helper functions, the board page,
                     sign up / log in / log out, the applications API, errors
private/board.html   The board page. It is not in public, so the server only sends it after login
public/index.html    Home page
public/login.html    Log in page
public/signup.html   Sign up page
public/css/style.css All the styles
public/js/board.js   The board: loads the cards, add / edit / delete, drag and drop
public/js/signup.js  Sends the sign up form to the server
public/js/login.js   Sends the log in form to the server
data/                users.json and applications.json (made by the server, not in Git)
```

## API

- `POST /api/signup` create an account and log in
- `POST /api/login` log in
- `POST /api/logout` log out
- `GET /api/applications` the logged-in user's applications
- `POST /api/applications` add an application
- `PUT /api/applications/:id` change an application (the edit form and drag and drop)
- `DELETE /api/applications/:id` delete an application

## Data model

`data/users.json`

```json
[
  {
    "id": "073c0b12-...",
    "name": "Milos",
    "email": "milos@example.com",
    "passwordHash": "$2b$10$..."
  }
]
```

`data/applications.json`

```json
[
  {
    "company": "CAE",
    "role": "Software Developer Intern",
    "link": "https://example.com/posting",
    "deadline": "2026-11-28",
    "stage": "saved",
    "notes": "Cover letter needed.",
    "id": "e377d351-...",
    "userId": "073c0b12-..."
  }
]
```

`userId` links each application to its owner. The server always takes it from the session, never from the page.

## Security notes

- Passwords are hashed with bcrypt. The hash never leaves the server.
- The session cookie is `httpOnly` (page JavaScript cannot read it) and `sameSite: lax`.
- The session secret is read from `.env`, which Git ignores. The server does not start without it.
- Every applications route checks the login. Another user's application gives "not found", the same as an id that does not exist.
- The server only keeps the 6 known fields of an application, so a request cannot change `id` or `userId`.
- User text is shown with `textContent`, so HTML or scripts typed into a card show as plain text (no XSS).
- Links must start with `http://` or `https://`, which blocks `javascript:` links.
- If something goes wrong, the user gets a short message. Details only go to the server console.
