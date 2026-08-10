/* ============================================
   App: Notes
   ============================================ */

const Notes = {
  notes: [
    { id: 1, title: 'Welcome to Notes', content: 'Welcome to Notes!\n\nThis is your first note. You can:\n• Create new notes\n• Edit existing notes\n• Delete notes you no longer need\n\nClick the + button to create a new note.', date: new Date() },
    { id: 2, title: 'Shopping List', content: 'Shopping List\n\n• Milk\n• Bread\n• Eggs\n• Coffee beans\n• Olive oil\n• Pasta\n• Tomatoes\n• Basil', date: new Date(Date.now() - 86400000) },
    { id: 3, title: 'Meeting Notes - Aug 8', content: 'Meeting Notes - August 8, 2026\n\nAttendees: Sarah, John, Mike, Lisa\n\nAgenda:\n1. Q3 roadmap review\n2. New feature priorities\n3. Budget allocation\n\nAction items:\n- Mike: Draft technical spec by Friday\n- Sarah: Schedule design review\n- John: Update stakeholder deck\n- Lisa: Coordinate with marketing', date: new Date(Date.now() - 172800000) },
    { id: 4, title: 'Book Recommendations', content: 'Books to Read\n\nFiction:\n1. The Midnight Library - Matt Haig\n2. Project Hail Mary - Andy Weir\n3. Klara and the Sun - Kazuo Ishiguro\n\nNon-fiction:\n1. Thinking in Systems - Donella Meadows\n2. Range - David Epstein\n3. The Beginning of Infinity - David Deutsch', date: new Date(Date.now() - 259200000) },
    { id: 5, title: 'Recipe: Pasta Carbonara', content: 'Pasta Carbonara\n\nIngredients (serves 4):\n• 400g spaghetti\n• 200g pancetta\n• 4 large egg yolks\n• 100g Pecorino Romano\n• Black pepper\n• Salt\n\nMethod:\n1. Boil salted water, cook pasta al dente\n2. Fry pancetta until crispy\n3. Whisk yolks with grated cheese and pepper\n4. Combine pasta with pancetta off heat\n5. Add egg mixture, toss quickly\n6. Serve immediately with extra cheese', date: new Date(Date.now() - 345600000) },
  ],
  activeNoteId: 1,
  nextId: 6,

  render(container, winData) {
    container.innerHTML = `
      <div class="notes-app">
        <div class="notes-sidebar">
          <div class="window-toolbar" style="border-bottom:0.5px solid rgba(255,255,255,0.06);">
            <button class="toolbar-btn" id="${winData.id}-new" title="New Note">${Icons.add}</button>
            <button class="toolbar-btn" id="${winData.id}-delete" title="Delete Note">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 5 L3 14 Q3 15 4 15 L12 15 Q13 15 13 14 L13 5 Z M6 2 L10 2 L11 3 L14 3 L14 5 L2 5 L2 3 L5 3 Z" fill="currentColor"/></svg>
            </button>
            <div style="flex:1"></div>
          </div>
          <div class="notes-list" id="${winData.id}-list">
            ${this.notes.map(note => this.renderNoteItem(note)).join('')}
          </div>
        </div>
        <div class="note-editor">
          <div class="note-toolbar">
            <span style="font-size:12px;color:var(--text-secondary);" id="${winData.id}-date"></span>
            <div style="flex:1"></div>
            <button class="toolbar-btn" title="Bold" data-cmd="bold"><b>B</b></button>
            <button class="toolbar-btn" title="Italic" data-cmd="italic"><i>I</i></button>
            <button class="toolbar-btn" title="Underline" data-cmd="underline"><u>U</u></button>
          </div>
          <div class="note-content" contenteditable="true" id="${winData.id}-editor"></div>
        </div>
      </div>
    `;

    this.loadNote(winData);
    this.attachEvents(winData);
  },

  renderNoteItem(note) {
    const active = note.id === this.activeNoteId ? 'active' : '';
    const preview = note.content.split('\n').slice(1).join(' ').substring(0, 50);
    const dateStr = this.formatDate(note.date);
    return `
      <div class="note-list-item ${active}" data-id="${note.id}">
        <div class="note-title">${note.title}</div>
        <div class="note-preview"><span style="color:var(--text-secondary);">${dateStr}</span> ${preview}</div>
      </div>
    `;
  },

  formatDate(date) {
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  loadNote(winData) {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    const editor = document.getElementById(`${winData.id}-editor`);
    const dateEl = document.getElementById(`${winData.id}-date`);
    if (editor) {
      editor.innerHTML = `<h2>${note.title}</h2><br>${note.content.split('\n').slice(1).join('<br>')}`;
    }
    if (dateEl) {
      dateEl.textContent = this.formatDate(note.date) + ' · ' + note.content.split('\n').length + ' lines';
    }
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');

    // Note list selection
    container.querySelectorAll('.note-list-item').forEach(item => {
      item.addEventListener('click', () => {
        this.activeNoteId = parseInt(item.dataset.id);
        container.querySelectorAll('.note-list-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.loadNote(winData);
      });
    });

    // New note
    const newBtn = document.getElementById(`${winData.id}-new`);
    if (newBtn) {
      newBtn.addEventListener('click', () => this.createNote(winData));
    }

    // Delete note
    const delBtn = document.getElementById(`${winData.id}-delete`);
    if (delBtn) {
      delBtn.addEventListener('click', () => this.deleteNote(winData));
    }

    // Editor input - save on change
    const editor = document.getElementById(`${winData.id}-editor`);
    if (editor) {
      editor.addEventListener('input', () => {
        const note = this.notes.find(n => n.id === this.activeNoteId);
        if (note) {
          const lines = editor.innerText.split('\n');
          note.title = lines[0] || 'Untitled';
          note.content = editor.innerText;
          note.date = new Date();

          // Update list item
          const item = container.querySelector(`.note-list-item[data-id="${note.id}"]`);
          if (item) {
            item.querySelector('.note-title').textContent = note.title;
            item.querySelector('.note-preview').innerHTML = `<span style="color:var(--text-secondary);">${this.formatDate(note.date)}</span> ${note.content.split('\n').slice(1).join(' ').substring(0, 50)}`;
          }
        }
      });
    }

    // Formatting buttons
    container.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, null);
        editor.focus();
      });
    });
  },

  createNote(winData) {
    const note = {
      id: this.nextId++,
      title: 'New Note',
      content: 'New Note\n\nStart writing...',
      date: new Date(),
    };
    this.notes.unshift(note);
    this.activeNoteId = note.id;
    this.render(winData.el.querySelector('.window-content'), winData);
  },

  deleteNote(winData) {
    if (this.notes.length <= 1) {
      Tahoe.showNotification('Notes', 'Cannot delete the last note.');
      return;
    }
    const idx = this.notes.findIndex(n => n.id === this.activeNoteId);
    this.notes.splice(idx, 1);
    this.activeNoteId = this.notes[0]?.id || 1;
    this.render(winData.el.querySelector('.window-content'), winData);
  },
};
