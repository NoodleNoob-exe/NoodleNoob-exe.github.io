// admin.js
const PENDING_FILE = 'pending_ideas.json';
const APPROVED_FILE = 'approved_ideas.json';

// Load pending ideas on page load
document.addEventListener('DOMContentLoaded', loadPendingIdeas);

function loadPendingIdeas() {
  fetch(PENDING_FILE)
    .then(res => res.json())
    .then(ideas => {
      displayIdeas(ideas);
    })
    .catch(err => {
      console.error('Error loading ideas:', err);
      document.getElementById('ideas_list').innerHTML = '<div class="admin_container"><p id="no_ideas">No pending ideas yet.</p></div>';
    });
}

function displayIdeas(ideas) {
  const container = document.getElementById('ideas_list');
  
  if (ideas.length === 0) {
    container.innerHTML = '<div class="admin_container"><p id="no_ideas">No pending ideas yet.</p></div>';
    return;
  }

  container.innerHTML = '';
  ideas.forEach((idea, index) => {
    const div = document.createElement('div');
    div.className = 'admin_container idea_item';
    div.innerHTML = `
      <div class="idea_name">${escapeHtml(idea.name)}</div>
      <div class="idea_text">${escapeHtml(idea.idea)}</div>
      <div class="button_group">
        <button class="approve_button" onclick="approveIdea(${index})">Approve</button>
        <button class="delete_button" onclick="deleteIdea(${index})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function approveIdea(index) {
  fetch(PENDING_FILE)
    .then(res => res.json())
    .then(ideas => {
      const idea = ideas[index];
      // Remove from pending
      const remaining = ideas.filter((_, i) => i !== index);
      // Add to approved
      fetch(APPROVED_FILE)
        .then(res => res.json())
        .then(approved => {
          const updatedApproved = [...approved, idea];
          // Save approved ideas
          saveFile(APPROVED_FILE, updatedApproved);
          // Save remaining pending
          saveFile(PENDING_FILE, remaining);
          // Reload page
          window.location.reload();
        });
    });
}

function deleteIdea(index) {
  fetch(PENDING_FILE)
    .then(res => res.json())
    .then(ideas => {
      const remaining = ideas.filter((_, i) => i !== index);
      saveFile(PENDING_FILE, remaining);
      window.location.reload();
    });
}

function saveFile(filename, data) {
  fetch('/' + filename, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (res.ok) {
      console.log('File saved:', filename);
    } else {
      console.error('Failed to save file:', filename);
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
