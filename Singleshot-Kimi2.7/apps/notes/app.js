import { App, registerApp } from '../../js/appRegistry.js';
import { $, load, save } from '../../js/utils.js';

class NotesApp extends App {
  constructor() {
    super({ id: 'notes', name: 'Notes', width: 780, height: 520, emoji: '📝', iconGradient: ['#ffeaa7', '#fdcb6e'], iconColor: '#5d4037' });
    this.notes = load('notes', [
      { id: '1', title: 'Welcome', body: 'Welcome to Notes!\n\nEdit this note or create a new one.', updated: Date.now() }
    ]);
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'notes';
    root.innerHTML = `
      <aside class="notes-sidebar">
        <div class="notes-toolbar"><button id="new-note">+ New Note</button></div>
        <div class="notes-list" id="list"></div>
      </aside>
      <main class="notes-editor">
        <input type="text" class="notes-title-input" id="title" placeholder="Note Title" />
        <textarea class="notes-body" id="body" placeholder="Type your note here..."></textarea>
      </main>
    `;

    const list = $('#list', root);
    const title = $('#title', root);
    const body = $('#body', root);
    let selected = this.notes[0]?.id;

    const renderList = () => {
      list.innerHTML = '';
      this.notes.sort((a, b) => b.updated - a.updated).forEach(n => {
        const el = document.createElement('div');
        el.className = 'notes-item' + (n.id === selected ? ' active' : '');
        const date = new Date(n.updated).toLocaleDateString();
        el.innerHTML = `<div class="ni-title">${n.title || 'Untitled'}</div><div class="ni-date">${date}</div>`;
        el.addEventListener('click', () => { selected = n.id; renderList(); loadNote(); });
        list.appendChild(el);
      });
    };

    const loadNote = () => {
      const n = this.notes.find(x => x.id === selected);
      if (n) { title.value = n.title; body.value = n.body; }
    };

    const saveNote = () => {
      const n = this.notes.find(x => x.id === selected);
      if (!n) return;
      n.title = title.value;
      n.body = body.value;
      n.updated = Date.now();
      save('notes', this.notes);
      renderList();
    };

    $('#new-note', root).addEventListener('click', () => {
      const n = { id: String(Date.now()), title: '', body: '', updated: Date.now() };
      this.notes.push(n);
      selected = n.id;
      renderList();
      loadNote();
      title.focus();
    });

    title.addEventListener('input', saveNote);
    body.addEventListener('input', saveNote);

    renderList();
    loadNote();
    return root;
  }
}

registerApp(new NotesApp());
