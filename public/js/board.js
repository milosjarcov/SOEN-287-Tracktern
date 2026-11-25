// The board page: loads your applications from the server and shows them in 6 columns.
// You can add, edit and delete applications, and drag cards between columns.

const stages = ['saved', 'applied', 'oa', 'interview', 'offer', 'rejected'];

let applications = []; // the applications on the board
let editingId = null;  // id of the application being edited (null when adding a new one)

const message = document.getElementById('message');
const form = document.getElementById('application-form');
const formTitle = document.getElementById('form-title');
const formError = document.getElementById('form-error');
const companyInput = document.getElementById('company');
const roleInput = document.getElementById('role');
const linkInput = document.getElementById('link');
const deadlineInput = document.getElementById('deadline');
const stageInput = document.getElementById('stage');
const notesInput = document.getElementById('notes');


// ---------- Show the board ----------

// Get this user's applications from the server, then put each card in the column of its stage.
async function loadBoard() {
  const response = await fetch('/api/applications');
  const result = await response.json();
  if (!response.ok) {
    message.textContent = result.error;
    return;
  }
  applications = result;

  for (const stage of stages) {
    document.getElementById(stage + '-cards').textContent = ''; // empty the column
  }
  for (const application of applications) {
    document.getElementById(application.stage + '-cards').appendChild(makeCard(application));
  }
}

// Adds one line of text to a card.
// textContent shows the text exactly as typed, so HTML or a <script> typed by a user never runs.
function addText(card, tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  card.appendChild(element);
}

// Builds the card for one application.
function makeCard(application) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;

  addText(card, 'h4', application.company);
  addText(card, 'p', application.role);
  if (application.deadline !== '') {
    addText(card, 'p', 'Due ' + application.deadline);
  }
  if (application.notes !== '') {
    addText(card, 'p', application.notes);
  }

  // Link to the job posting. The server only accepts links that start with http:// or https://
  if (application.link !== '') {
    const link = document.createElement('a');
    link.href = application.link;
    link.target = '_blank';
    link.textContent = 'Posting';
    card.appendChild(link);
  }

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.onclick = function () {
    openForm(application);
  };
  card.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = function () {
    deleteApplication(application.id);
  };
  card.appendChild(deleteButton);

  // Drag and drop: when the drag starts, remember which application this card is.
  card.ondragstart = function (event) {
    event.dataTransfer.setData('text/plain', application.id);
  };

  return card;
}


loadBoard();
