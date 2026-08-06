import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

const notes = [
  { id: 1, title: 'Welcome', body: 'This is a simple notes app. Click any note to edit it.' },
  { id: 2, title: 'Ideas', body: '• Build a macOS clone\n• Learn CSS glassmorphism\n• Drink water' },
  { id: 3, title: 'Shopping', body: 'Milk\nEggs\nBread' }
];
let openCount = 0;

export function openNotes() {
  openCount++;
  openWindow('notes', 'Notes', `
    <div class="notes">
      <div class="notes-sidebar">
        <div class="notes-sidebar-header">Notes</div>
        <div class="notes-list">
          ${notes.map(n => `
            <div class="notes-item" data-id="${n.id}">
              <h5>${escapeHtml(n.title)}</h5>
              <p>${escapeHtml(n.body).substring(0, 35).replace(/\n/g, ' ')}...</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="notes-editor">
        <input type="text" class="notes-title" value="${escapeHtml(notes[0].title)}">
        <textarea class="notes-body">${escapeHtml(notes[0].body)}</textarea>
      </div>
    </div>
  `, {
    width: 680, height: 460,
    onMount: (el) => {
      markAppRunning('notes', true);
      initNotes(el);
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="notes"]')) markAppRunning('notes', false);
      });
    }
  });
}

function initNotes(el) {
  const titleInput = el.querySelector('.notes-title');
  const bodyInput = el.querySelector('.notes-body');
  let activeId = notes[0].id;

  function select(id) {
    activeId = id;
    const note = notes.find(n => n.id === id);
    titleInput.value = note.title;
    bodyInput.value = note.body;
    el.querySelectorAll('.notes-item').forEach(i => i.classList.toggle('active', parseInt(i.dataset.id) === id));
  }

  el.querySelectorAll('.notes-item').forEach(item => {
    item.addEventListener('click', () => select(parseInt(item.dataset.id)));
  });
  select(notes[0].id);

  titleInput.addEventListener('input', () => {
    const note = notes.find(n => n.id === activeId);
    if (note) {
      note.title = titleInput.value;
      const item = el.querySelector(`.notes-item[data-id="${activeId}"] h5`);
      if (item) item.textContent = note.title;
    }
  });

  bodyInput.addEventListener('input', () => {
    const note = notes.find(n => n.id === activeId);
    if (note) {
      note.body = bodyInput.value;
      const item = el.querySelector(`.notes-item[data-id="${activeId}"] p`);
      if (item) item.textContent = note.body.substring(0, 35).replace(/\n/g, ' ') + '...';
    }
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
