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


// ---------- Drag and drop ----------

for (const stage of stages) {
  const column = document.getElementById(stage + '-cards');

  // The browser does not allow dropping by default. preventDefault() allows it.
  column.ondragover = function (event) {
    event.preventDefault();
  };

  // A card was dropped here: give it this column's stage and save it on the server.
  column.ondrop = async function (event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const application = applications.find(function (item) {
      return item.id === id;
    });
    if (!application) {
      return;
    }
    application.stage = stage;

    const response = await fetch('/api/applications/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application)
    });
    if (!response.ok) {
      message.textContent = 'Could not move the card.';
    }
    loadBoard(); // draw the board again with what the server saved
  };
}


// ---------- Add and edit ----------

// Opens the form: filled in to edit an application, or empty to add a new one.
function openForm(application) {
  form.reset();
  formError.textContent = '';
  editingId = null;
  formTitle.textContent = 'Add an application';

  if (application) {
    editingId = application.id;
    formTitle.textContent = 'Edit application';
    companyInput.value = application.company;
    roleInput.value = application.role;
    linkInput.value = application.link;
    deadlineInput.value = application.deadline;
    stageInput.value = application.stage;
    notesInput.value = application.notes;
  }
  form.hidden = false;
}

document.getElementById('add-button').onclick = function () {
  openForm(null);
};

document.getElementById('cancel-button').onclick = function () {
  form.hidden = true;
};

form.onsubmit = async function (event) {
  event.preventDefault(); // stop the browser from reloading the page

  // Adding uses POST. Editing uses PUT with the id in the address.
  let method = 'POST';
  let url = '/api/applications';
  if (editingId !== null) {
    method = 'PUT';
    url = '/api/applications/' + editingId;
  }

  const response = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company: companyInput.value,
      role: roleInput.value,
      link: linkInput.value,
      deadline: deadlineInput.value,
      stage: stageInput.value,
      notes: notesInput.value
    })
  });
  const result = await response.json();
  if (!response.ok) {
    formError.textContent = result.error; // the server's message, for example about a bad link
    return;
  }

  form.hidden = true;
  loadBoard();
};


// ---------- Delete and log out ----------

async function deleteApplication(id) {
  if (confirm('Delete this application?')) {
    await fetch('/api/applications/' + id, { method: 'DELETE' });
    loadBoard();
  }
}

document.getElementById('logout-button').onclick = async function () {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
};


loadBoard();
