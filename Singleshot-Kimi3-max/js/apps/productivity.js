/* productivity.js — Notes, Reminders, Calendar, TextEdit */
(function () {
  const Mac = window.Mac, h = Mac.h;

  /* ============================ NOTES ============================ */
  const NOTES_DEFAULT = {
    folders: ['Notes', 'Work', 'Ideas'],
    notes: [
      { id: 'n1', folder: 'Notes', title: 'Welcome to Notes', html: '<h1>Welcome to Notes</h1><p>This is a fully working rich-text notes app.</p><p>Try the toolbar: <b>bold</b>, <i>italic</i>, <u>underline</u>, lists and headings. Everything autosaves.</p>', updated: Date.now() - 3600000 },
      { id: 'n2', folder: 'Work', title: 'Ship checklist', html: '<h2>Ship checklist</h2><ul><li>Dock bounce ✓</li><li>Traffic lights ✓</li><li>Spotlight calc ✓</li><li>Menus everywhere</li></ul>', updated: Date.now() - 86400000 },
      { id: 'n3', folder: 'Ideas', title: 'Dark mode, but darker', html: '<p>What about a mode so dark it absorbs nearby light sources? Feasibility: low. Vibes: immaculate.</p>', updated: Date.now() - 172800000 },
    ]
  };
  let notesDB = Mac.loadJSON('mac.notes', NOTES_DEFAULT);
  const saveNotes = () => Mac.saveJSON('mac.notes', notesDB);

  function openNotes() {
    const st = { folder: 'Notes', sel: notesDB.notes.find(n => n.folder === 'Notes')?.id || null, query: '' };
    const win = Mac.wm.createWindow({
      app: 'notes', title: 'Notes', width: 900, height: 560, minW: 640, minH: 380,
      build(body, w) { buildNotes(body, w, st); },
    });
    win._notesState = st;
    return win;
  }

  function buildNotes(body, win, st) {
    const newBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.compose, title: 'New Note' });
    newBtn.addEventListener('click', () => newNote(win));
    const delBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.trash, title: 'Delete Note' });
    delBtn.addEventListener('click', () => deleteNote(win));
    const bBtn = fmtBtn('B', 'bold', { fontWeight: '700' });
    const iBtn = fmtBtn('I', 'italic', { fontStyle: 'italic' });
    const uBtn = fmtBtn('U', 'underline', { textDecoration: 'underline' });
    const h1Btn = fmtBtn('Aa', 'h1', { fontWeight: '800', fontSize: '15px' });
    const ulBtn = fmtBtn('•≡', 'insertUnorderedList', {});
    const olBtn = fmtBtn('1≡', 'insertOrderedList', {});
    function fmtBtn(txt, cmd, style) {
      const b = h('button', { class: 'tb-btn', style }, txt);
      b.addEventListener('mousedown', e => e.preventDefault());
      b.addEventListener('click', () => {
        const ed = win._noteEd;
        if (!ed) return;
        ed.focus();
        if (cmd === 'h1') document.execCommand('formatBlock', false, '<h2>');
        else document.execCommand(cmd, false, null);
        ed.dispatchEvent(new Event('input'));
      });
      return b;
    }
    const search = h('input', { class: 'inp', placeholder: 'Search' });
    search.addEventListener('input', Mac.debounce(() => { st.query = search.value.trim().toLowerCase(); renderNotesLists(win); }, 200));
    const toolbar = h('div', { class: 'toolbar' }, newBtn, delBtn, h('span', { style: { width: '4px' } }), h1Btn, bBtn, iBtn, uBtn, ulBtn, olBtn, h('div', { class: 'tb-search' }, h('span', { class: 'glyph', html: Mac.GLYPH.search }), search));

    const folders = h('div', { class: 'sidebar', style: { width: '150px' } });
    folders.append(h('div', { class: 'side-h' }, 'iCloud'));
    notesDB.folders.forEach(f => {
      const count = notesDB.notes.filter(n => n.folder === f).length;
      const el = h('div', { class: 'side-item', 'data-f': f }, h('span', { class: 'glyph', html: Mac.GLYPH.folder }), f, h('span', { class: 'si-count' }, count));
      el.addEventListener('click', () => { st.folder = f; const first = notesDB.notes.filter(n => n.folder === f).sort((a, b) => b.updated - a.updated)[0]; st.sel = first ? first.id : null; renderNotesLists(win); renderNoteEditor(win); });
      folders.append(el);
    });
    const addF = h('div', { class: 'side-item' }, h('span', { class: 'glyph', html: Mac.GLYPH.plus }), 'New Folder');
    addF.addEventListener('click', () => {
      const inp = h('input', { class: 'inp', style: { width: '100%', marginTop: '8px' }, placeholder: 'Folder name' });
      Mac.System.alert({
        title: 'New Folder', message: 'Name for the new folder:', icon: 'notes',
        extra: inp,
        buttons: [{ label: 'Cancel' }, { label: 'Create', primary: true }]
      }).then(i => {
        if (i !== 1) return;
        const v = inp.value.trim();
        if (v && !notesDB.folders.includes(v)) { notesDB.folders.push(v); saveNotes(); }
      });
      setTimeout(() => inp.focus(), 50);
    });
    folders.append(addF);

    const list = h('div', { class: 'notes-list' });
    const edWrap = h('div', { class: 'note-editor' });
    const ed = h('div', { class: 'note-body', contenteditable: 'true' });
    ed.addEventListener('input', Mac.debounce(() => {
      const n = notesDB.notes.find(x => x.id === st.sel);
      if (!n) return;
      n.html = ed.innerHTML;
      n.title = (ed.innerText.split('\n')[0] || 'New Note').trim().slice(0, 60) || 'New Note';
      n.updated = Date.now();
      saveNotes(); renderNotesLists(win);
    }, 350));
    edWrap.append(ed);
    body.append(toolbar, h('div', { class: 'split' }, folders, list, edWrap));
    Object.assign(win, { _noteFolders: folders, _noteList: list, _noteEd: ed });
    renderNotesLists(win); renderNoteEditor(win);
  }

  function newNote(win) {
    const st = win._notesState;
    const n = { id: Mac.uid(), folder: st.folder, title: 'New Note', html: '', updated: Date.now() };
    notesDB.notes.unshift(n); saveNotes();
    st.sel = n.id; renderNotesLists(win); renderNoteEditor(win);
    setTimeout(() => win._noteEd && win._noteEd.focus(), 40);
  }
  function deleteNote(win) {
    const st = win._notesState;
    if (!st.sel) return;
    const n = notesDB.notes.find(x => x.id === st.sel);
    Mac.System.confirm(`Delete “${n ? n.title : 'note'}”? This cannot be undone.`, 'Delete').then(ok => {
      if (!ok) return;
      notesDB.notes = notesDB.notes.filter(x => x.id !== st.sel);
      saveNotes();
      st.sel = (notesDB.notes.filter(x => x.folder === st.folder)[0] || {}).id || null;
      renderNotesLists(win); renderNoteEditor(win);
      foldersFix(win);
    });
  }
  function foldersFix(win) { /* counts could drift; simple rerender of folders */ }

  function renderNotesLists(win) {
    const st = win._notesState, list = win._noteList;
    list.innerHTML = '';
    let items = notesDB.notes.filter(n => n.folder === st.folder);
    if (st.query) items = notesDB.notes.filter(n => (n.title + n.html.replace(/<[^>]+>/g, ' ')).toLowerCase().includes(st.query));
    items.sort((a, b) => b.updated - a.updated);
    items.forEach(n => {
      const plain = n.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const el = h('div', { class: 'note-item' + (st.sel === n.id ? ' sel' : '') },
        h('div', { class: 'nt' }, n.title),
        h('div', { class: 'np' }, Mac.fmtDate(n.updated) + '  ' + plain.slice(0, 42)));
      el.addEventListener('click', () => { st.sel = n.id; renderNotesLists(win); renderNoteEditor(win); });
      list.append(el);
    });
    if (!items.length) list.append(h('div', { class: 'empty-pane', style: { height: '120px' } }, 'No Notes'));
    win._noteFolders.querySelectorAll('.side-item[data-f]').forEach(el => el.classList.toggle('sel', el.dataset.f === st.folder));
  }
  function renderNoteEditor(win) {
    const st = win._notesState, ed = win._noteEd;
    const n = notesDB.notes.find(x => x.id === st.sel);
    ed.innerHTML = n ? n.html : '';
    ed.setAttribute('contenteditable', n ? 'true' : 'false');
  }

  /* ============================ REMINDERS ============================ */
  const REM_DEFAULT = {
    lists: [{ id: 'r1', name: 'Reminders', color: '#0A84FF' }, { id: 'r2', name: 'Groceries', color: '#30D158' }, { id: 'r3', name: 'Work', color: '#FF9F0A' }],
    items: [
      { id: 'i1', list: 'r1', text: 'Try Spotlight (⌘Space)', done: false, flag: true },
      { id: 'i2', list: 'r1', text: 'Toggle Dark Mode in Control Center', done: false, flag: false },
      { id: 'i3', list: 'r2', text: 'Coffee beans', done: false, flag: false },
      { id: 'i4', list: 'r2', text: 'Oat milk', done: true, flag: false },
      { id: 'i5', list: 'r3', text: 'Ship Tahoe web demo', done: false, flag: true },
    ]
  };
  let remDB = Mac.loadJSON('mac.reminders', REM_DEFAULT);
  const saveRems = () => Mac.saveJSON('mac.reminders', remDB);

  function openReminders() {
    const st = { view: 'today' }; // 'today'|'scheduled'|'all'|listId
    const win = Mac.wm.createWindow({
      app: 'reminders', title: 'Reminders', width: 780, height: 540, minW: 560, minH: 340,
      build(body, w) { buildRems(body, w, st); },
    });
    win._remState = st;
    return win;
  }

  function buildRems(body, win, st) {
    const side = h('div', { class: 'sidebar', style: { width: '200px' } });
    const main = h('div', { class: 'rem-main' });
    body.append(h('div', { class: 'split' }, side, main));
    Object.assign(win, { _remSide: side, _remMain: main });
    renderRems(win);
  }
  function currentList(st) { return remDB.lists.find(l => l.id === st.view) || remDB.lists[0]; }
  function visibleItems(st) {
    if (st.view === 'flagged') return remDB.items.filter(i => i.flag);
    if (st.view === 'all') return remDB.items.slice();
    return remDB.items.filter(i => i.list === st.view);
  }

  function renderRems(win) {
    const st = win._remState, side = win._remSide, main = win._remMain;
    side.innerHTML = '';
    side.append(h('div', { class: 'side-h' }, 'Smart Lists'));
    [['Flagged', 'flagged', 'flag', '#FF9F0A'], ['All', 'all', 'list', '#0A84FF']].forEach(([label, id, ico, col]) => {
      const count = remDB.items.filter(i => id === 'flagged' ? i.flag : true).filter(i => !i.done).length;
      const el = h('div', { class: 'side-item' + (st.view === id ? ' sel' : '') }, h('span', { class: 'glyph', style: { color: col }, html: Mac.GLYPH[ico] }), label, h('span', { class: 'si-count' }, count));
      el.addEventListener('click', () => { st.view = id; renderRems(win); });
      side.append(el);
    });
    side.append(h('div', { class: 'side-h' }, 'My Lists'));
    remDB.lists.forEach(l => {
      const count = remDB.items.filter(i => i.list === l.id && !i.done).length;
      const el = h('div', { class: 'side-item' + (st.view === l.id ? ' sel' : '') },
        h('span', { style: { width: '14px', height: '14px', borderRadius: '50%', background: l.color, flexShrink: '0', display: 'inline-block' } }),
        l.name, h('span', { class: 'si-count' }, count));
      el.addEventListener('click', () => { st.view = l.id; renderRems(win); });
      side.append(el);
    });

    main.innerHTML = '';
    const isList = remDB.lists.some(l => l.id === st.view);
    const color = isList ? currentList(st).color : '#FF9F0A';
    const title = isList ? currentList(st).name : Mac.cap(st.view);
    main.append(h('div', { class: 'rem-title', style: { color } }, title));
    visibleItems(st).sort((a, b) => a.done - b.done).forEach(it => {
      const circle = h('div', { class: 'rem-circle' + (it.done ? ' done' : ''), style: { '--rc': color } }, it.done ? '✓' : '');
      circle.addEventListener('click', () => { it.done = !it.done; saveRems(); renderRems(win); });
      const txt = h('span', { class: 'rem-text', contenteditable: 'true' }, it.text);
      txt.addEventListener('blur', () => { it.text = txt.textContent.trim(); saveRems(); });
      txt.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); txt.blur(); } e.stopPropagation(); });
      const flag = h('span', { class: 'rem-flag', title: 'Flag' }, it.flag ? '⚑' : '');
      flag.addEventListener('click', () => { it.flag = !it.flag; saveRems(); renderRems(win); });
      const del = h('button', { class: 'tb-btn', html: Mac.GLYPH.x, title: 'Delete' });
      del.addEventListener('click', () => { remDB.items = remDB.items.filter(x => x !== it); saveRems(); renderRems(win); });
      main.append(h('div', { class: 'rem-row' + (it.done ? ' done' : '') }, circle, txt, flag, del));
    });
    if (isList || st.view === 'all') {
      const inp = h('input', { placeholder: 'New Reminder' });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter' && inp.value.trim()) {
          const listId = isList ? st.view : remDB.lists[0].id;
          remDB.items.push({ id: Mac.uid(), list: listId, text: inp.value.trim(), done: false, flag: false });
          saveRems(); renderRems(win);
          setTimeout(() => win._remMain.querySelector('.rem-new input')?.focus(), 30);
        }
        e.stopPropagation();
      });
      main.append(h('div', { class: 'rem-new' }, h('span', { class: 'plus' }, '+'), inp));
    }
  }

  /* ============================ CALENDAR ============================ */
  const CAL_DEFAULT = [
    { id: 'e1', date: Mac.todayStr(), title: 'Coffee with Priya', time: '09:00', color: '#0A84FF' },
    { id: 'e2', date: Mac.todayStr(), title: 'Design review', time: '14:00', color: '#30D158' },
    { id: 'e3', date: offsetDay(3), title: 'Ship Tahoe web', time: '10:00', color: '#FF375F' },
    { id: 'e4', date: offsetDay(7), title: 'WWDC rehearsal', time: '11:00', color: '#BF5AF2' },
  ];
  function offsetDay(d) { const t = new Date(); t.setDate(t.getDate() + d); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
  let calEvents = Mac.loadJSON('mac.calendar', CAL_DEFAULT);
  const saveCal = () => Mac.saveJSON('mac.calendar', calEvents);
  Mac.CalData = { eventsFor: dateStr => calEvents.filter(e => e.date === dateStr) };

  function openCalendar() {
    const now = new Date();
    const st = { y: now.getFullYear(), m: now.getMonth() };
    const win = Mac.wm.createWindow({
      app: 'calendar', title: 'Calendar', width: 920, height: 600, minW: 640, minH: 420,
      build(body, w) { buildCal(body, w, st); },
    });
    win._calState = st;
    return win;
  }

  function buildCal(body, win, st) {
    const title = h('div', { class: 'cal-title' });
    const prevBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-l'] });
    const nextBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-r'] });
    const todayBtn = h('button', { class: 'btn' }, 'Today');
    const addBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.plus, title: 'New Event' });
    prevBtn.addEventListener('click', () => { st.m--; if (st.m < 0) { st.m = 11; st.y--; } renderCal(win); });
    nextBtn.addEventListener('click', () => { st.m++; if (st.m > 11) { st.m = 0; st.y++; } renderCal(win); });
    todayBtn.addEventListener('click', () => { const n = new Date(); st.y = n.getFullYear(); st.m = n.getMonth(); renderCal(win); });
    addBtn.addEventListener('click', e => addEventPop(win, e.clientX, e.clientY, Mac.todayStr()));
    const head = h('div', { class: 'cal-head' }, title, h('div', { style: { flex: '1' } }), todayBtn, h('div', { class: 'seg' }, prevBtn, nextBtn), addBtn);
    const grid = h('div', { class: 'cal-grid' });
    body.append(head, grid);
    Object.assign(win, { _calTitle: title, _calGrid: grid });
    renderCal(win);
  }

  function renderCal(win) {
    const st = win._calState;
    const { y, m } = st;
    const monthName = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long' });
    win._calTitle.innerHTML = '';
    win._calTitle.append(monthName + ' ', h('span', { class: 'y' }, y));
    const grid = win._calGrid;
    grid.innerHTML = '';
    grid.append(h('div', { class: 'cal-dows' }, ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => h('div', {}, d))));
    const cells = h('div', { class: 'cal-cells' });
    const first = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const prevDim = new Date(y, m, 0).getDate();
    const total = Math.ceil((first + dim) / 7) * 7;
    const todayStr = Mac.todayStr();
    for (let i = 0; i < total; i++) {
      let dayNum, month, other = false;
      if (i < first) { dayNum = prevDim - first + 1 + i; month = m - 1; other = true; }
      else if (i >= first + dim) { dayNum = i - first - dim + 1; month = m + 1; other = true; }
      else { dayNum = i - first + 1; month = m; }
      const yy = month < 0 ? y - 1 : month > 11 ? y + 1 : y;
      const mm = (month + 12) % 12;
      const ds = yy + '-' + String(mm + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
      const cell = h('div', { class: 'cal-cell' + (other ? ' other' : '') + (ds === todayStr ? ' today' : '') },
        h('span', { class: 'dnum' }, dayNum));
      Mac.CalData.eventsFor(ds).forEach(ev => {
        const e = h('div', { class: 'cal-ev', style: { background: ev.color || '#0A84FF' }, title: ev.title }, ev.title);
        e.addEventListener('dblclick', e2 => {
          e2.stopPropagation();
          Mac.System.confirm(`Delete event “${ev.title}”?`, 'Delete', 'Calendar').then(ok => {
            if (!ok) return;
            calEvents = calEvents.filter(x => x !== ev); saveCal(); renderCal(win);
          });
        });
        cell.append(e);
      });
      cell.addEventListener('dblclick', e => addEventPop(win, e.clientX, e.clientY, ds));
      cells.append(cell);
    }
    grid.append(cells);
    win.setTitle('Calendar — ' + monthName + ' ' + y);
  }

  function addEventPop(win, x, y, dateStr) {
    document.querySelectorAll('.cal-pop').forEach(p => p.remove());
    const time = h('input', { class: 'inp', type: 'time', value: '10:00' });
    const title = h('input', { class: 'inp', placeholder: 'Event title' });
    const colorSel = h('select', { class: 'inp' }, ...['#0A84FF', '#30D158', '#FF375F', '#FF9F0A', '#BF5AF2'].map(c => h('option', { value: c }, c === '#0A84FF' ? 'Blue' : c === '#30D158' ? 'Green' : c === '#FF375F' ? 'Pink' : c === '#FF9F0A' ? 'Orange' : 'Purple')));
    const pop = h('div', { class: 'cal-pop' },
      h('div', { style: { fontWeight: '700', fontSize: '13px', marginBottom: '8px' } }, 'New Event — ' + Mac.fmtDate(dateStr)),
      title, time, colorSel,
      h('div', { style: { display: 'flex', gap: '8px', marginTop: '6px' } },
        h('button', { class: 'btn', style: { flex: '1' }, onclick: () => pop.remove() }, 'Cancel'),
        h('button', {
          class: 'btn primary', style: { flex: '1' }, onclick: () => {
            if (!title.value.trim()) return;
            calEvents.push({ id: Mac.uid(), date: dateStr, title: title.value.trim(), time: time.value, color: colorSel.value });
            saveCal(); pop.remove();
            Mac.wm.windowsFor('calendar').forEach(w => renderCal(w));
            Mac.System.notify({ title: 'Calendar', body: 'Event added: ' + title.value.trim(), icon: 'calendar' });
          }
        }, 'Add')));
    document.body.append(pop);
    pop.style.left = Mac.clamp(x - 40, 8, innerWidth - 258) + 'px';
    pop.style.top = Mac.clamp(y - 20, 34, innerHeight - 200) + 'px';
    setTimeout(() => {
      title.focus();
      const close = e => { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('pointerdown', close, true); } };
      document.addEventListener('pointerdown', close, true);
    }, 20);
  }

  /* ============================ TEXTEDIT ============================ */
  function openTextEdit(args) {
    args = args || {};
    const win = Mac.wm.createWindow({
      app: 'textedit', title: args.path ? Mac.FS.base(args.path) : 'Untitled', width: 780, height: 560, minW: 480, minH: 320,
      build(body, w) { buildTextEdit(body, w, args); },
      onClose(w) { delete w._teState; },
    });
    return win;
  }

  function buildTextEdit(body, win, args) {
    const st = { path: args.path || null, dirty: false };
    win._teState = st;
    const ed = h('div', { class: 'te-page', contenteditable: 'true' });
    const b = (txt, cmd, style) => {
      const btn = h('button', { class: 'tb-btn', style }, txt);
      btn.addEventListener('mousedown', e => e.preventDefault());
      btn.addEventListener('click', () => {
        ed.focus();
        if (cmd === '__heading') document.execCommand('formatBlock', false, '<h2>');
        else document.execCommand(cmd, false, null);
        ed.dispatchEvent(new Event('input'));
      });
      return btn;
    };
    const openBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.folder, title: 'Open…' });
    openBtn.addEventListener('click', () => teOpenDialog(win));
    const saveBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.download, title: 'Save — style has rotated 90° for fun' });
    saveBtn.addEventListener('click', () => teSave(win, false));
    const toolbar = h('div', { class: 'toolbar te-toolbar' },
      openBtn, saveBtn,
      h('span', { style: { width: '6px' } }),
      b('B', 'bold', { fontWeight: '700' }), b('I', 'italic', { fontStyle: 'italic' }), b('U', 'underline', { textDecoration: 'underline' }),
      b('H', '__heading', {}),
      b('•≡', 'insertUnorderedList', {}), b('1≡', 'insertOrderedList', {}));
    const wrap = h('div', { class: 'te-body' }, ed);
    body.append(toolbar, wrap);
    win._teEd = ed;
    if (st.path) {
      const content = Mac.FS.read(st.path);
      ed.innerText = content || '';
      win.setTitle(Mac.FS.base(st.path));
    } else ed.innerHTML = '';
    ed.addEventListener('input', () => {
      if (!st.dirty) { st.dirty = true; win.setTitle((st.path ? Mac.FS.base(st.path) : 'Untitled') + ' — Edited'); }
    });
    win.addEventListener('close', () => { });
  }

  function teSave(win, saveAs) {
    const st = win._teState, ed = win._teEd;
    const doWrite = (path) => {
      Mac.FS.write(path, ed.innerText);
      st.path = path; st.dirty = false;
      win.setTitle(Mac.FS.base(path));
      Mac.System.notify({ title: 'TextEdit', body: 'Saved to ' + path, icon: 'textedit' });
    };
    if (st.path && !saveAs) { doWrite(st.path); return; }
    const input = h('input', { class: 'inp', style: { width: '100%', marginTop: '8px' }, value: (st.path ? Mac.FS.base(st.path) : 'Untitled.txt') });
    Mac.System.alert({
      title: 'Save As', message: 'Saved to ~/Documents:', icon: 'textedit', extra: input,
      buttons: [{ label: 'Cancel' }, { label: 'Save', primary: true }]
    }).then(i => {
      if (i !== 1) return;
      let name = input.value.trim(); if (!name) return;
      if (!name.includes('.')) name += '.txt';
      doWrite(Mac.FS.HOME + '/Documents/' + name);
    });
    setTimeout(() => input.focus(), 50);
  }

  function teOpenDialog(win) {
    const files = [];
    Mac.FS.walk((p, n) => { if (n.type === 'file' && (n.kind === 'text') && !p.startsWith(Mac.FS.TRASH)) files.push(p); });
    if (!files.length) { Mac.System.alert({ title: 'TextEdit', message: 'No text documents found in this virtual Mac.', icon: 'textedit' }); return; }
    let sel = null;
    const rows = files.map(p => {
      const r = h('div', { class: 'te-openrow' }, h('span', { class: 'glyph', html: Mac.GLYPH.doc }), p.replace(Mac.FS.HOME, '~'));
      r.addEventListener('click', () => { rows.forEach(x => x.classList.remove('sel')); r.classList.add('sel'); sel = p; });
      r.addEventListener('dblclick', () => { document.querySelector('.alert .btn.primary')?.click(); });
      return r;
    });
    const listEl = h('div', { class: 'te-list', style: { maxHeight: '220px', overflowY: 'auto' } }, ...rows);
    Mac.System.alert({
      title: 'Open Document', icon: 'textedit', extra: listEl,
      buttons: [{ label: 'Cancel' }, { label: 'Open', primary: true }]
    }).then(i => {
      if (i !== 1 || !sel) return;
      const st = win._teState;
      win._teEd.innerText = Mac.FS.read(sel) || '';
      st.path = sel; st.dirty = false;
      win.setTitle(Mac.FS.base(sel));
    });
  }

  /* ============================ menus ============================ */
  const notesMenus = () => [{
    title: 'File', items: [
      Mac.Menus.item('New Note', '⌘N', () => { const t = Mac.wm.topWin(); if (t && t._notesState) newNote(t); }),
      Mac.Menus.item('Delete Note', '⌘⌫', () => { const t = Mac.wm.topWin(); if (t && t._notesState) deleteNote(t); }),
      Mac.Menus.SEP,
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'notes') t.close(); }),
    ]
  }, Mac.Std.editMenu()];
  const remMenus = () => [{
    title: 'File', items: [
      Mac.Menus.item('New Reminder', '⌘N', () => { const t = Mac.wm.topWin(); if (t && t._remState) { const inp = t._remMain.querySelector('.rem-new input'); if (inp) inp.focus(); } }),
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'reminders') t.close(); }),
    ]
  }, Mac.Std.editMenu()];
  const calMenus = () => [{
    title: 'File', items: [
      Mac.Menus.item('New Event', '⌘N', e => { const t = Mac.wm.topWin(); if (t && t._calState) addEventPop(t, innerWidth / 2, innerHeight / 3, Mac.todayStr()); }),
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'calendar') t.close(); }),
    ]
  }, Mac.Std.editMenu(),
  {
    title: 'View', items: [
      Mac.Menus.item('Go to Today', '⌘T', () => { const t = Mac.wm.topWin(); if (t && t._calState) { const n = new Date(); t._calState.y = n.getFullYear(); t._calState.m = n.getMonth(); renderCal(t); } }),
      Mac.Menus.item('Next Month', '⌘→', () => { const t = Mac.wm.topWin(); if (t && t._calState) { t._calState.m++; if (t._calState.m > 11) { t._calState.m = 0; t._calState.y++; } renderCal(t); } }),
      Mac.Menus.item('Previous Month', '⌘←', () => { const t = Mac.wm.topWin(); if (t && t._calState) { t._calState.m--; if (t._calState.m < 0) { t._calState.m = 11; t._calState.y--; } renderCal(t); } }),
    ]
  }];
  const teMenus = () => [{
    title: 'File', items: [
      Mac.Menus.item('New', '⌘N', () => openTextEdit({})),
      Mac.Menus.item('Open…', '⌘O', () => { const t = Mac.wm.topWin(); if (t && t._teState) teOpenDialog(t); }),
      Mac.Menus.SEP,
      Mac.Menus.item('Save', '⌘S', () => { const t = Mac.wm.topWin(); if (t && t._teState) teSave(t, false); }),
      Mac.Menus.item('Save As…', '⇧⌘S', () => { const t = Mac.wm.topWin(); if (t && t._teState) teSave(t, true); }),
      Mac.Menus.SEP,
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'textedit') t.close(); }),
    ]
  }, Mac.Std.editMenu(),
  {
    title: 'Format', items: [
      Mac.Menus.item('Bold', '⌘B', () => { try { document.execCommand('bold'); } catch (e) { } }),
      Mac.Menus.item('Italic', '⌘I', () => { try { document.execCommand('italic'); } catch (e) { } }),
      Mac.Menus.item('Underline', '⌘U', () => { try { document.execCommand('underline'); } catch (e) { } }),
      Mac.Menus.SEP,
      Mac.Menus.item('Heading', '⌥⌘T', () => { try { document.execCommand('formatBlock', false, '<h2>'); } catch (e) { } }),
      Mac.Menus.item('Body Text', null, () => { try { document.execCommand('formatBlock', false, '<p>'); } catch (e) { } }),
    ]
  }];

  /* ============================ registration ============================ */
  Mac.wm.register({ id: 'notes', name: 'Notes', icon: 'notes', menus: notesMenus, help: 'Rich-text notes with folders. Everything autosaves to this browser.', open: openNotes });
  Mac.wm.register({ id: 'reminders', name: 'Reminders', icon: 'reminders', menus: remMenus, help: 'To-dos with lists, flags, and completion circles that actually tick.', open: openReminders });
  Mac.wm.register({ id: 'calendar', name: 'Calendar', icon: 'calendar', menus: calMenus, help: 'A month-view calendar. Double-click any day to add an event; double-click an event to remove it.', open: openCalendar });
  Mac.wm.register({ id: 'textedit', name: 'TextEdit', icon: 'textedit', menus: teMenus, help: 'Rich text editor backed by the virtual filesystem. ⌘S saves to ~/Documents.', open: openTextEdit });
})();
