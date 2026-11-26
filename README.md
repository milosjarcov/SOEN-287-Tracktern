# Tracktern

A simple internship tracker for students. You make an account, add the internships you are applying to, and move each one across your board as it goes from saved to applied to interview and so on.

Made for SOEN 287 (Web Programming), Fall 2026.

## Team

Milos Jarcov (solo), Team 7, Section Q

## Tech stack

- HTML, CSS and plain JavaScript (fetch to talk to the server)
- Node.js and Express
- express-session for logins and bcryptjs for hashing passwords
- JSON files for the data
- dotenv for the session secret

## Features

- Sign up, log in and log out
- A private board with six columns: Saved, Applied, OA, Interview, Offer, Rejected
- Add, edit and delete applications
- Drag a card to another column to change its stage
- You only see your own applications
- Works on a phone

## How to run it

You need Node.js.

1. Run `npm install`
2. Copy `.env.example` to a new file called `.env` and set `SESSION_SECRET` to any long random text
3. Run `npm start`
4. Open http://localhost:3000

The server saves everything in a `data` folder that it creates by itself.
