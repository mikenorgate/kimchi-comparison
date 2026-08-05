/* ============ macOS Tahoe web — applications ============ */
'use strict';

/* ---------------- Virtual filesystem (shared by Finder / Terminal / TextEdit) ---------------- */
const VFS = {
  '/': ['Applications', 'Library', 'System', 'Users'],
  '/Applications': ['Safari.app', 'Notes.app', 'Calculator.app', 'Terminal.app', 'Music.app', 'Photos.app', 'Messages.app', 'Calendar.app', 'TextEdit.app', 'Maps.app', 'Mail.app', 'System Settings.app'],
  '/Library': ['Fonts', 'Preferences'],
  '/Library/Fonts': [],
  '/Library/Preferences': [],
  '/System': ['Library'],
  '/System/Library': [],
  '/Users': ['mike', 'Shared'],
  '/Users/Shared': [],
  '/Users/mike': ['Desktop', 'Documents', 'Downloads', 'Movies', 'Music', 'Pictures', 'Projects'],
  '/Users/mike/Desktop': ['ReadMe.txt', 'screenshot.png'],
  '/Users/mike/Documents': ['Resume.txt', 'Notes.txt', 'Budget.numbers'],
  '/Users/mike/Downloads': ['tahoe-wallpaper.png', 'installer.dmg'],
  '/Users/mike/Movies': [],
  '/Users/mike/Music': ['Mixtape.mp3'],
  '/Users/mike/Pictures': ['vacation.png', 'family.png', 'sunset.png'],
  '/Users/mike/Projects': ['website', 'tahoe-web.txt'],
  '/Users/mike/Projects/website': ['index.html', 'style.css'],
};

const VFILES = {
  '/Users/mike/Desktop/ReadMe.txt': 'Welcome to macOS Tahoe — web edition!\n\nThis entire desktop is running in your browser: the menu bar, Dock,\nwindow manager and every app are built with plain HTML, CSS and JavaScript.\n\nThings to try:\n • Open Terminal and type `help`\n • Press ⌘/Ctrl + Space for Spotlight\n • Toggle dark mode from Control Center (top-right)\n • Change the wallpaper in System Settings\n\nEnjoy!',
  '/Users/mike/Documents/Resume.txt': 'MIKE — Software Engineer\n\nExperience:\n • Built a full operating system UI in a single afternoon (see: this demo)\n • Professional window dragger\n\nSkills: HTML, CSS, JavaScript, resisting the urge to add a framework.',
  '/Users/mike/Documents/Notes.txt': 'Shopping list:\n- coffee\n- more coffee',
  '/Users/mike/Projects/tahoe-web.txt': 'TODO:\n[x] menu bar\n[x] dock\n[x] windows\n[x] all the apps\n[ ] ship it',
  '/Users/mike/Projects/website/index.html': '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello, world!</h1>\n  </body>\n</html>',
  '/Users/mike/Projects/website/style.css': 'body { font-family: sans-serif; }',
};

const vfsIsDir = p => VFS[p] !== undefined;
const vfsGlyph = name => {
  if (name.endsWith('.app')) return '🅰️';
  if (name.endsWith('.txt') || name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.numbers')) return '📄';
  if (name.endsWith('.png') || name.endsWith('.jpg')) return '🖼️';
  if (name.endsWith('.mp3')) return '🎵';
  if (name.endsWith('.dmg')) return '📦';
  return '📁';
};
function vfsJoin(dir, name) { return (dir === '/' ? '' : dir) + '/' + name; }

const TRASH = [];

/* =================== Finder =================== */
registerApp({
  id: 'finder', name: 'Finder', glyph: '😀', width: 780, height: 500,
  about: 'The macOS file manager — browsing a simulated filesystem.',
  menus() {
    return {
      File: [
        { label: 'New Finder Window', shortcut: '⌘N', action: () => launchApp('finder', { path: '/Users/mike', forceNew: true }) },
        { label: 'New Folder', shortcut: '⇧⌘N', action: () => { const w = OS.focusedWin; if (w && w.finderNewFolder) w.finderNewFolder(); } },
        { sep: true },
        { label: 'Close Window', shortcut: '⌘W', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
      ],
      Go: [
        { label: 'Home', shortcut: '⇧⌘H', action: () => { const w = OS.focusedWin; w && w.finderGo && w.finderGo('/Users/mike'); } },
        { label: 'Desktop', shortcut: '⇧⌘D', action: () => { const w = OS.focusedWin; w && w.finderGo && w.finderGo('/Users/mike/Desktop'); } },
        { label: 'Documents', shortcut: '⇧⌘O', action: () => { const w = OS.focusedWin; w && w.finderGo && w.finderGo('/Users/mike/Documents'); } },
        { label: 'Applications', shortcut: '⇧⌘A', action: () => { const w = OS.focusedWin; w && w.finderGo && w.finderGo('/Applications'); } },
        { sep: true },
        { label: 'Back', shortcut: '⌘[', action: () => { const w = OS.focusedWin; w && w.finderBack && w.finderBack(); } },
      ],
    };
  },
  mount(win, args) {
    win.multi = true;
    const path0 = (args && args.path) || '/Users/mike';
    const body = el('div', 'app-body');
    const sidebar = el('div', 'app-sidebar');
    const main = el('div', 'app-main col');
    body.appendChild(sidebar); body.appendChild(main);
    win.content.appendChild(body);

    const state = { path: path0, history: [] };

    const FAVORITES = [
      ['🕘', 'Recents', '/Users/mike'],
      ['📁', 'Home', '/Users/mike'],
      ['🖥️', 'Desktop', '/Users/mike/Desktop'],
      ['📄', 'Documents', '/Users/mike/Documents'],
      ['⬇️', 'Downloads', '/Users/mike/Downloads'],
      ['🅰️', 'Applications', '/Applications'],
      ['🖼️', 'Pictures', '/Users/mike/Pictures'],
      ['💽', 'Macintosh HD', '/'],
    ];

    function renderSidebar() {
      sidebar.innerHTML = '';
      sidebar.appendChild(el('div', 'sb-heading', 'Favorites'));
      let marked = false;
      FAVORITES.forEach(([g, label, p]) => {
        const isActive = !marked && state.path === p;
        if (isActive) marked = true;
        const it = el('div', 'sb-item' + (isActive ? ' active' : ''), `<span>${g}</span><span>${label}</span>`);
        it.addEventListener('click', () => go(p));
        sidebar.appendChild(it);
      });
    }

    function openEntry(name) {
      const full = vfsJoin(state.path, name);
      if (vfsIsDir(full)) return go(full);
      if (name.endsWith('.app')) {
        const appId = name.replace('.app', '').replace('System Settings', 'settings').toLowerCase().replace(/ /g, '');
        return launchApp(OS.apps[appId] ? appId : 'finder');
      }
      if (/\.(txt|html|css|numbers)$/.test(name)) return launchApp('textedit', { file: full });
      if (/\.(png|jpg)$/.test(name)) return launchApp('photos');
      if (name.endsWith('.mp3')) return launchApp('music');
      notify('Finder', 'No application can open “' + name + '”.', 'ic-finder', '😀');
    }

    function render() {
      renderSidebar();
      main.innerHTML = '';
      const grid = el('div', 'finder-grid');
      grid.style.flex = '1';
      grid.style.overflowY = 'auto';
      const entries = VFS[state.path] || [];
      entries.forEach(name => {
        const full = vfsJoin(state.path, name);
        const item = el('div', 'finder-item');
        item.appendChild(el('div', 'fi-glyph', vfsIsDir(full) ? '📁' : vfsGlyph(name)));
        item.appendChild(el('div', 'fi-name', name));
        item.addEventListener('click', e => {
          e.stopPropagation();
          $$('.finder-item', grid).forEach(x => x.classList.remove('selected'));
          item.classList.add('selected');
        });
        item.addEventListener('dblclick', () => openEntry(name));
        item.addEventListener('contextmenu', e => {
          e.preventDefault(); e.stopPropagation();
          showContextMenu(e.clientX, e.clientY, [
            { label: 'Open', action: () => openEntry(name) },
            { sep: true },
            { label: 'Move to Trash', action: () => {
                VFS[state.path] = VFS[state.path].filter(n => n !== name);
                TRASH.push(name);
                render();
                notify('Finder', '“' + name + '” moved to Trash.', 'ic-finder', '😀');
            } },
            { label: 'Get Info', action: () => notify(name, vfsIsDir(full) ? 'Folder — ' + (VFS[full] || []).length + ' items' : 'File — ' + full, 'ic-finder', '😀') },
          ]);
        });
        grid.appendChild(item);
      });
      if (!entries.length) grid.appendChild(el('div', '', '<div style="opacity:0.4;padding:20px;grid-column:1/-1;text-align:center">This folder is empty</div>'));
      grid.addEventListener('contextmenu', e => {
        if (e.target !== grid) return;
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, [
          { label: 'New Folder', action: () => win.finderNewFolder() },
          { sep: true },
          { label: 'Get Info', action: () => notify(state.path, (VFS[state.path] || []).length + ' items', 'ic-finder', '😀') },
        ]);
      });
      main.appendChild(grid);
      main.appendChild(el('div', 'finder-path', '💽 ' + (state.path === '/' ? 'Macintosh HD' : 'Macintosh HD' + state.path.replace(/\//g, ' ▸ '))));
      win.setTitle(state.path === '/' ? 'Macintosh HD' : state.path.split('/').pop());
    }

    function go(p) {
      if (p !== state.path) state.history.push(state.path);
      state.path = p;
      render();
    }

    win.finderGo = go;
    win.finderBack = () => { const p = state.history.pop(); if (p) { state.path = p; render(); } };
    win.finderNewFolder = () => {
      let base = 'untitled folder', name = base, i = 2;
      while ((VFS[state.path] || []).includes(name)) name = base + ' ' + i++;
      VFS[state.path].push(name);
      VFS[vfsJoin(state.path, name)] = [];
      render();
    };

    render();
  },
});
OS.apps.finder.multiWindow = true;

/* =================== Safari =================== */
registerApp({
  id: 'safari', name: 'Safari', glyph: '🧭', width: 960, height: 620, multiWindow: true,
  about: 'A web browser inside your web browser. Note: many sites refuse to be embedded in frames.',
  menus() {
    return {
      File: [
        { label: 'New Window', shortcut: '⌘N', action: () => launchApp('safari', { forceNew: true }) },
        { label: 'Close Window', shortcut: '⌘W', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
      ],
      History: [
        { label: 'Back', shortcut: '⌘[', action: () => { const w = OS.focusedWin; w && w.safariBack && w.safariBack(); } },
        { label: 'Home', action: () => { const w = OS.focusedWin; w && w.safariHome && w.safariHome(); } },
      ],
      Bookmarks: [
        { label: 'Wikipedia', action: () => { const w = OS.focusedWin; w && w.safariGo && w.safariGo('https://en.wikipedia.org'); } },
        { label: 'OpenStreetMap', action: () => { const w = OS.focusedWin; w && w.safariGo && w.safariGo('https://www.openstreetmap.org/export/embed.html?bbox=-122.5,37.7,-122.3,37.85'); } },
        { label: 'Example.com', action: () => { const w = OS.focusedWin; w && w.safariGo && w.safariGo('https://example.com'); } },
      ],
    };
  },
  mount(win, args) {
    const colEl = el('div', 'col');
    colEl.style.flex = '1';
    const tbEl = el('div', 'safari-toolbar');
    const back = el('button', 'tb-btn', '‹');
    const fwd = el('button', 'tb-btn', '›');
    const url = el('input', 'safari-url');
    url.placeholder = 'Search or enter website name';
    const reload = el('button', 'tb-btn', '↻');
    tbEl.append(back, fwd, url, reload);
    colEl.appendChild(tbEl);

    const view = el('div', 'col');
    view.style.flex = '1';
    view.style.overflow = 'hidden';
    colEl.appendChild(view);
    win.content.appendChild(colEl);

    const history = [];
    const FAVS = [
      ['W', '#333', 'Wikipedia', 'https://en.wikipedia.org'],
      ['🗺', '#34a853', 'OpenStreetMap', 'https://www.openstreetmap.org/export/embed.html?bbox=-122.52,37.70,-122.35,37.84&layer=mapnik'],
      ['e', '#5b6dcd', 'Example', 'https://example.com'],
      ['b', '#008373', 'Bing', 'https://www.bing.com'],
      ['A', '#d97757', 'Anthropic', 'https://www.anthropic.com'],
      ['H', '#ff6600', 'Hacker News', 'https://news.ycombinator.com'],
    ];

    function showStart() {
      view.innerHTML = '';
      const start = el('div', 'safari-start');
      start.appendChild(el('h2', '', 'Favorites'));
      const grid = el('div', 'fav-grid');
      FAVS.forEach(([g, color, name, u]) => {
        const it = el('div', 'fav-item');
        const ic = el('div', 'fav-icon', g);
        ic.style.background = color;
        it.appendChild(ic);
        it.appendChild(el('div', 'fav-name', name));
        it.addEventListener('click', () => navigate(u));
        grid.appendChild(it);
      });
      start.appendChild(grid);
      start.appendChild(el('p', '', '<br><span style="opacity:0.45;font-size:12px">Heads up: some websites send X-Frame-Options / CSP headers that prevent them from loading inside another page. If a page stays blank, that site refuses to be embedded — try another favorite.</span>'));
      view.appendChild(start);
      url.value = '';
      win.setTitle('Safari — Start Page');
    }

    function navigate(input) {
      let u = input.trim();
      if (!u) return;
      if (!/^https?:\/\//.test(u)) {
        u = /\.[a-z]{2,}($|\/)/i.test(u) ? 'https://' + u : 'https://www.bing.com/search?q=' + encodeURIComponent(u);
      }
      history.push(u);
      view.innerHTML = '';
      const frame = el('iframe', 'safari-frame');
      frame.src = u;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      view.appendChild(frame);
      url.value = u;
      try { win.setTitle(new URL(u).hostname); } catch (e) { win.setTitle('Safari'); }
    }

    url.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(url.value); });
    back.addEventListener('click', () => { history.pop(); const prev = history.pop(); prev ? navigate(prev) : showStart(); });
    fwd.addEventListener('click', () => {});
    reload.addEventListener('click', () => { const cur = history[history.length - 1]; if (cur) { history.pop(); navigate(cur); } });

    win.safariGo = navigate;
    win.safariBack = () => back.click();
    win.safariHome = showStart;

    if (args && args.url) navigate(args.url);
    else showStart();
  },
});

/* =================== Notes =================== */
registerApp({
  id: 'notes', name: 'Notes', glyph: '📝', width: 760, height: 500,
  about: 'Notes are saved to your browser (localStorage), so they survive reloads.',
  menus() {
    return {
      File: [
        { label: 'New Note', shortcut: '⌘N', action: () => { const w = OS.focusedWin; w && w.notesNew && w.notesNew(); } },
        { label: 'Delete Note', action: () => { const w = OS.focusedWin; w && w.notesDelete && w.notesDelete(); } },
        { sep: true },
        { label: 'Close Window', shortcut: '⌘W', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
      ],
    };
  },
  mount(win) {
    let notes;
    try { notes = JSON.parse(localStorage.getItem('tahoe-notes')) || null; } catch (e) { notes = null; }
    if (!notes || !notes.length) {
      notes = [{ id: Date.now(), text: 'Welcome to Notes\nEverything you type here is saved automatically in your browser.' }];
    }
    let activeId = notes[0].id;
    const save = () => localStorage.setItem('tahoe-notes', JSON.stringify(notes));

    const body = el('div', 'app-body');
    const tbWrap = el('div', 'col');
    tbWrap.style.flex = '1';
    const toolbar = el('div', 'toolbar');
    const btnNew = el('button', 'tb-btn', '＋ New Note');
    const btnDel = el('button', 'tb-btn', '🗑 Delete');
    toolbar.append(btnNew, btnDel);
    const inner = el('div', 'app-body');
    const list = el('div', 'notes-list');
    const editor = el('div', 'notes-editor');
    editor.contentEditable = 'true';
    editor.spellcheck = false;
    inner.append(list, editor);
    tbWrap.append(toolbar, inner);
    body.appendChild(tbWrap);
    win.content.appendChild(body);

    function renderList() {
      list.innerHTML = '';
      notes.forEach(n => {
        const lines = n.text.split('\n');
        const row = el('div', 'note-row' + (n.id === activeId ? ' active' : ''));
        row.appendChild(el('div', 'nr-title', lines[0] || 'New Note'));
        row.appendChild(el('div', 'nr-prev', lines.slice(1).join(' ').slice(0, 60) || 'No additional text'));
        row.addEventListener('click', () => { activeId = n.id; renderList(); renderEditor(); });
        list.appendChild(row);
      });
    }
    function active() { return notes.find(n => n.id === activeId); }
    function renderEditor() {
      const n = active();
      editor.innerText = n ? n.text : '';
    }
    editor.addEventListener('input', () => {
      const n = active();
      if (!n) return;
      n.text = editor.innerText;
      save();
      // update list preview without re-rendering editor
      const rows = $$('.note-row', list);
      const idx = notes.indexOf(n);
      if (rows[idx]) {
        const lines = n.text.split('\n');
        $('.nr-title', rows[idx]).textContent = lines[0] || 'New Note';
        $('.nr-prev', rows[idx]).textContent = lines.slice(1).join(' ').slice(0, 60) || 'No additional text';
      }
    });

    win.notesNew = () => {
      const n = { id: Date.now(), text: '' };
      notes.unshift(n);
      activeId = n.id;
      save(); renderList(); renderEditor(); editor.focus();
    };
    win.notesDelete = () => {
      notes = notes.filter(n => n.id !== activeId);
      if (!notes.length) notes = [{ id: Date.now(), text: '' }];
      activeId = notes[0].id;
      save(); renderList(); renderEditor();
    };
    btnNew.addEventListener('click', win.notesNew);
    btnDel.addEventListener('click', win.notesDelete);

    renderList(); renderEditor();
  },
});

/* =================== TextEdit =================== */
registerApp({
  id: 'textedit', name: 'TextEdit', glyph: '📄', width: 640, height: 480, multiWindow: true,
  menus() {
    return {
      File: [
        { label: 'New', shortcut: '⌘N', action: () => launchApp('textedit', { forceNew: true }) },
        { label: 'Save', shortcut: '⌘S', action: () => { const w = OS.focusedWin; w && w.teSave && w.teSave(); } },
        { label: 'Close Window', shortcut: '⌘W', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
      ],
      Format: [
        { label: 'Bold', shortcut: '⌘B', action: () => document.execCommand('bold') },
        { label: 'Italic', shortcut: '⌘I', action: () => document.execCommand('italic') },
        { label: 'Underline', shortcut: '⌘U', action: () => document.execCommand('underline') },
      ],
    };
  },
  mount(win, args) {
    const wrap = el('div', 'col');
    wrap.style.flex = '1';
    const toolbar = el('div', 'toolbar');
    ['bold:B', 'italic:I', 'underline:U'].forEach(pair => {
      const [cmd, label] = pair.split(':');
      const b = el('button', 'tb-btn', label);
      b.style.fontWeight = cmd === 'bold' ? '800' : '400';
      if (cmd === 'italic') b.style.fontStyle = 'italic';
      if (cmd === 'underline') b.style.textDecoration = 'underline';
      b.addEventListener('mousedown', e => { e.preventDefault(); document.execCommand(cmd); });
      toolbar.appendChild(b);
    });
    const saveBtn = el('button', 'tb-btn', 'Save');
    toolbar.appendChild(saveBtn);
    wrap.appendChild(toolbar);
    const editor = el('div', 'notes-editor');
    editor.contentEditable = 'true';
    editor.spellcheck = false;
    editor.style.fontFamily = '"SF Mono", Menlo, monospace';
    editor.style.fontSize = '13px';
    wrap.appendChild(editor);
    win.content.appendChild(wrap);

    const file = args && args.file;
    if (file) {
      editor.innerText = VFILES[file] !== undefined ? VFILES[file] : '(empty file)';
      win.setTitle(file.split('/').pop() + ' — TextEdit');
    } else {
      win.setTitle('Untitled — TextEdit');
    }
    win.teSave = () => {
      if (file) VFILES[file] = editor.innerText;
      notify('TextEdit', 'Saved' + (file ? ' “' + file.split('/').pop() + '”' : ' (untitled — pick a file via Finder to persist)') + '.', 'ic-textedit', '📄');
    };
    saveBtn.addEventListener('click', win.teSave);
  },
});

/* =================== Calculator =================== */
registerApp({
  id: 'calculator', name: 'Calculator', glyph: '🔢', width: 320, height: 460,
  mount(win) {
    win.el.style.minWidth = '260px';
    const calc = el('div', 'calc');
    const display = el('div', 'calc-display', '0');
    const grid = el('div', 'calc-grid');
    calc.append(display, grid);
    win.content.appendChild(calc);

    let cur = '0', prev = null, op = null, fresh = true;

    const show = v => {
      let s = String(v);
      if (s.length > 12) s = (+v).toPrecision(8).replace(/\.?0+e/, 'e').replace(/\.?0+$/, '');
      display.textContent = s;
    };
    const compute = () => {
      const a = parseFloat(prev), b = parseFloat(cur);
      let r = b;
      if (op === '÷') r = b === 0 ? NaN : a / b;
      else if (op === '×') r = a * b;
      else if (op === '−') r = a - b;
      else if (op === '+') r = a + b;
      return isNaN(r) ? 'Error' : +r.toPrecision(12);
    };

    const press = key => {
      if (/\d/.test(key)) {
        cur = fresh || cur === '0' ? key : cur + key;
        fresh = false;
      } else if (key === '.') {
        if (fresh) { cur = '0.'; fresh = false; }
        else if (!cur.includes('.')) cur += '.';
      } else if (key === 'AC') {
        cur = '0'; prev = null; op = null; fresh = true;
      } else if (key === '±') {
        cur = String(-parseFloat(cur));
      } else if (key === '%') {
        cur = String(parseFloat(cur) / 100);
      } else if (['÷', '×', '−', '+'].includes(key)) {
        if (op && !fresh) { cur = String(compute()); }
        prev = cur; op = key; fresh = true;
      } else if (key === '=') {
        if (op) { cur = String(compute()); op = null; prev = null; }
        fresh = true;
      }
      show(cur);
    };

    const LAYOUT = [
      ['AC', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'],
      ['7', ''], ['8', ''], ['9', ''], ['×', 'op'],
      ['4', ''], ['5', ''], ['6', ''], ['−', 'op'],
      ['1', ''], ['2', ''], ['3', ''], ['+', 'op'],
      ['0', 'zero'], ['.', ''], ['=', 'op'],
    ];
    LAYOUT.forEach(([key, cls]) => {
      const b = el('button', 'calc-btn ' + cls, key);
      b.addEventListener('click', () => press(key));
      grid.appendChild(b);
    });

    // keyboard support while window focused
    win.keyHandler = e => {
      if (OS.focusedWin !== win) return;
      const map = { '/': '÷', '*': '×', '-': '−', '+': '+', Enter: '=', '=': '=', Escape: 'AC', '.': '.', '%': '%' };
      if (/^\d$/.test(e.key)) press(e.key);
      else if (map[e.key]) { e.preventDefault(); press(map[e.key]); }
      else if (e.key === 'Backspace') { cur = cur.length > 1 ? cur.slice(0, -1) : '0'; show(cur); }
    };
    addEventListener('keydown', win.keyHandler);
  },
  unmount(win) { removeEventListener('keydown', win.keyHandler); },
});

/* =================== Terminal =================== */
registerApp({
  id: 'terminal', name: 'Terminal', glyph: '>_', width: 680, height: 440, multiWindow: true,
  about: 'A small zsh-flavoured shell over the simulated filesystem. Type `help`.',
  mount(win) {
    const term = el('div', 'term');
    win.content.appendChild(term);
    let cwd = '/Users/mike';

    const promptStr = () => `mike@tahoe ${cwd === '/Users/mike' ? '~' : cwd.split('/').pop() || '/'} % `;

    const print = (text, cls) => {
      const line = el('div', 't-line' + (cls ? ' ' + cls : ''));
      line.textContent = text;
      term.insertBefore(line, inputLine);
      term.scrollTop = term.scrollHeight;
    };

    const resolve = p => {
      if (!p) return cwd;
      let path = p.startsWith('/') ? p : (p.startsWith('~') ? p.replace('~', '/Users/mike') : cwd + '/' + p);
      const parts = [];
      path.split('/').forEach(seg => {
        if (seg === '' || seg === '.') return;
        if (seg === '..') parts.pop();
        else parts.push(seg);
      });
      return '/' + parts.join('/') === '/' && !parts.length ? '/' : '/' + parts.join('/');
    };

    const COMMANDS = {
      help: () => print('Available commands:\n  ls [dir]      cd <dir>       pwd            cat <file>\n  echo <text>   date           whoami         clear\n  mkdir <name>  touch <name>   rm <name>      open <app>\n  uname         sw_vers        history        say <text>'),
      pwd: () => print(cwd),
      whoami: () => print('mike'),
      date: () => print(new Date().toString()),
      uname: () => print('Darwin tahoe.local 25.0.0 Darwin Kernel (web) x86_64'),
      sw_vers: () => print('ProductName:\t\tmacOS\nProductVersion:\t\t26.0 (Tahoe)\nBuildVersion:\t\t25A100web'),
      clear: () => { $$('.t-line', term).forEach(l => { if (l !== inputLine) l.remove(); }); },
      ls: args => {
        const p = resolve(args[0]);
        if (VFS[p]) print(VFS[p].join('   ') || '');
        else if (VFILES[p] !== undefined) print(args[0]);
        else print('ls: ' + (args[0] || p) + ': No such file or directory');
      },
      cd: args => {
        const p = args[0] ? resolve(args[0]) : '/Users/mike';
        if (VFS[p]) cwd = p === '' ? '/' : p;
        else print('cd: no such file or directory: ' + args[0]);
      },
      cat: args => {
        if (!args[0]) return print('usage: cat <file>');
        const p = resolve(args[0]);
        if (VFILES[p] !== undefined) print(VFILES[p]);
        else if (VFS[p]) print('cat: ' + args[0] + ': Is a directory');
        else print('cat: ' + args[0] + ': No such file or directory');
      },
      echo: args => print(args.join(' ')),
      say: args => { notify('Terminal', args.join(' ') || '(nothing to say)', 'ic-terminal', '>_'); print('(said via notification)'); },
      mkdir: args => {
        if (!args[0]) return print('usage: mkdir <name>');
        const p = resolve(args[0]);
        const parent = p.slice(0, p.lastIndexOf('/')) || '/';
        const name = p.split('/').pop();
        if (!VFS[parent]) return print('mkdir: ' + args[0] + ': No such file or directory');
        if (!VFS[parent].includes(name)) VFS[parent].push(name);
        VFS[p] = VFS[p] || [];
      },
      touch: args => {
        if (!args[0]) return print('usage: touch <name>');
        const p = resolve(args[0]);
        const parent = p.slice(0, p.lastIndexOf('/')) || '/';
        const name = p.split('/').pop();
        if (!VFS[parent]) return print('touch: ' + args[0] + ': No such file or directory');
        if (!VFS[parent].includes(name)) VFS[parent].push(name);
        if (VFILES[p] === undefined) VFILES[p] = '';
      },
      rm: args => {
        if (!args[0]) return print('usage: rm <name>');
        const p = resolve(args[0]);
        const parent = p.slice(0, p.lastIndexOf('/')) || '/';
        const name = p.split('/').pop();
        if (!VFS[parent] || !VFS[parent].includes(name)) return print('rm: ' + args[0] + ': No such file or directory');
        VFS[parent] = VFS[parent].filter(n => n !== name);
        delete VFS[p]; delete VFILES[p];
      },
      open: args => {
        const id = (args[0] || '').toLowerCase().replace('.app', '');
        if (OS.apps[id]) { launchApp(id); print('Opening ' + OS.apps[id].name + '…'); }
        else print('open: could not find application "' + args[0] + '". Try: ' + Object.keys(OS.apps).filter(k => !OS.apps[k].hidden).join(', '));
      },
      history: () => print(hist.join('\n')),
      neofetch: () => COMMANDS.sw_vers(),
    };

    const hist = [];
    let histIdx = 0;

    const inputLine = el('div', 't-line');
    const promptEl = el('span', 't-prompt');
    const input = el('input');
    inputLine.append(promptEl, input);
    term.appendChild(inputLine);

    print('Last login: ' + new Date().toDateString() + ' on ttys000');
    print('Welcome to macOS Tahoe (web). Type `help` for commands.');
    promptEl.textContent = promptStr();

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const raw = input.value;
        print(promptStr() + raw);
        input.value = '';
        const trimmed = raw.trim();
        if (trimmed) {
          hist.push(trimmed);
          histIdx = hist.length;
          const [cmd, ...args] = trimmed.split(/\s+/);
          if (COMMANDS[cmd]) COMMANDS[cmd](args);
          else print('zsh: command not found: ' + cmd);
        }
        promptEl.textContent = promptStr();
        term.scrollTop = term.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx > 0) input.value = hist[--histIdx] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        histIdx = Math.min(histIdx + 1, hist.length);
        input.value = hist[histIdx] || '';
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        COMMANDS.clear();
      }
    });
    term.addEventListener('mouseup', () => { if (!getSelection().toString()) input.focus(); });
    setTimeout(() => input.focus(), 50);
  },
});

/* =================== Calendar =================== */
registerApp({
  id: 'calendar', name: 'Calendar', glyph: '📅', width: 800, height: 560,
  menus() {
    return {
      View: [
        { label: 'Go to Today', shortcut: '⌘T', action: () => { const w = OS.focusedWin; w && w.calToday && w.calToday(); } },
        { label: 'Next Month', shortcut: '⌘→', action: () => { const w = OS.focusedWin; w && w.calNext && w.calNext(); } },
        { label: 'Previous Month', shortcut: '⌘←', action: () => { const w = OS.focusedWin; w && w.calPrev && w.calPrev(); } },
      ],
    };
  },
  mount(win) {
    const wrap = el('div', 'col');
    wrap.style.flex = '1';
    win.content.appendChild(wrap);

    let events;
    try { events = JSON.parse(localStorage.getItem('tahoe-events')) || {}; } catch (e) { events = {}; }
    const saveEvents = () => localStorage.setItem('tahoe-events', JSON.stringify(events));

    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth();

    function render() {
      wrap.innerHTML = '';
      const head = el('div', 'cal-head');
      const title = el('div', 'cal-title', new Date(year, month).toLocaleDateString([], { month: 'long', year: 'numeric' }));
      const nav = el('div', '');
      const prev = el('button', 'tb-btn', '‹');
      const today = el('button', 'tb-btn', 'Today');
      const next = el('button', 'tb-btn', '›');
      nav.append(prev, today, next);
      head.append(title, nav);
      wrap.appendChild(head);

      const grid = el('div', 'cal-grid');
      ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => grid.appendChild(el('div', 'cal-dow', d)));
      const first = new Date(year, month, 1);
      const startDow = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrev = new Date(year, month, 0).getDate();
      const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
      for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startDow + 1;
        const cell = el('div', 'cal-cell');
        let cellDate;
        if (dayNum < 1) { cell.classList.add('dim'); cell.appendChild(el('span', 'cd-num', daysInPrev + dayNum)); cellDate = null; }
        else if (dayNum > daysInMonth) { cell.classList.add('dim'); cell.appendChild(el('span', 'cd-num', dayNum - daysInMonth)); cellDate = null; }
        else {
          cell.appendChild(el('span', 'cd-num', dayNum));
          const t = new Date();
          if (dayNum === t.getDate() && month === t.getMonth() && year === t.getFullYear()) cell.classList.add('today');
          cellDate = `${year}-${month + 1}-${dayNum}`;
          if (events[cellDate]) cell.appendChild(el('div', 'cal-event', events[cellDate]));
          cell.addEventListener('dblclick', () => {
            const existing = events[cellDate] || '';
            const v = prompt('Event for ' + new Date(year, month, dayNum).toLocaleDateString() + ':', existing);
            if (v === null) return;
            if (v.trim()) events[cellDate] = v.trim();
            else delete events[cellDate];
            saveEvents(); render();
          });
        }
        grid.appendChild(cell);
      }
      wrap.appendChild(grid);
      wrap.appendChild(el('div', '', '<div style="padding:6px 14px;font-size:11px;opacity:0.45">Double-click a day to add or edit an event.</div>'));

      prev.addEventListener('click', win.calPrev);
      next.addEventListener('click', win.calNext);
      today.addEventListener('click', win.calToday);
      win.setTitle('Calendar — ' + title.textContent);
    }

    win.calPrev = () => { month--; if (month < 0) { month = 11; year--; } render(); };
    win.calNext = () => { month++; if (month > 11) { month = 0; year++; } render(); };
    win.calToday = () => { const t = new Date(); year = t.getFullYear(); month = t.getMonth(); render(); };
    render();
  },
});

/* =================== Messages =================== */
registerApp({
  id: 'messages', name: 'Messages', glyph: '💬', width: 760, height: 500,
  mount(win) {
    const threads = [
      { name: 'Claude', color: '#d97757', msgs: [{ me: false, text: 'Hey! I built this whole desktop. Ask me anything — I echo with style.' }] },
      { name: 'Alex', color: '#5e9bf7', msgs: [{ me: false, text: 'Lunch tomorrow?' }, { me: true, text: 'Sure, noon?' }] },
      { name: 'Mom', color: '#b06bd4', msgs: [{ me: false, text: 'Call me when you can ❤️' }] },
    ];
    let active = 0;

    const body = el('div', 'app-body');
    const list = el('div', 'msg-threads');
    const colEl = el('div', 'msg-col');
    const scroll = el('div', 'msg-scroll');
    const inputRow = el('div', 'msg-inputrow');
    const input = el('input');
    input.placeholder = 'iMessage';
    const send = el('button', 'tb-btn', '↑');
    send.style.borderRadius = '50%';
    inputRow.append(input, send);
    colEl.append(scroll, inputRow);
    body.append(list, colEl);
    win.content.appendChild(body);

    const REPLIES = [
      'Totally!', 'Ha, nice one 😄', 'Interesting — tell me more.', 'On it 👍', 'Can’t right now, in a meeting (I am a chat bubble).',
      'That’s the spirit of Tahoe.', '💯', 'Sounds like a plan.', 'Wait, really?', 'Same!',
    ];

    function renderThreads() {
      list.innerHTML = '';
      threads.forEach((t, i) => {
        const row = el('div', 'msg-thread-row' + (i === active ? ' active' : ''));
        const av = el('div', 'msg-avatar', t.name[0]);
        av.style.background = t.color;
        row.appendChild(av);
        const c = el('div', 'col');
        c.appendChild(el('div', '', '<b>' + t.name + '</b>'));
        const last = t.msgs[t.msgs.length - 1];
        c.appendChild(el('div', '', '<span style="font-size:11.5px;opacity:0.6">' + (last ? last.text.slice(0, 26) : '') + '</span>'));
        row.appendChild(c);
        row.addEventListener('click', () => { active = i; renderThreads(); renderMsgs(); });
        list.appendChild(row);
      });
    }
    function renderMsgs() {
      scroll.innerHTML = '';
      threads[active].msgs.forEach(m => {
        scroll.appendChild(el('div', 'bubble ' + (m.me ? 'me' : 'them'), m.text.replace(/</g, '&lt;')));
      });
      scroll.scrollTop = scroll.scrollHeight;
      win.setTitle('Messages — ' + threads[active].name);
    }
    function sendMsg() {
      const text = input.value.trim();
      if (!text) return;
      const t = threads[active];
      t.msgs.push({ me: true, text });
      input.value = '';
      renderMsgs(); renderThreads();
      const replyingTo = active;
      setTimeout(() => {
        const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
        threads[replyingTo].msgs.push({ me: false, text: reply });
        if (active === replyingTo) renderMsgs();
        renderThreads();
        notify(threads[replyingTo].name, reply, 'ic-messages', '💬');
      }, 900 + Math.random() * 1200);
    }
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });
    send.addEventListener('click', sendMsg);
    renderThreads(); renderMsgs();
  },
});

/* =================== Mail =================== */
registerApp({
  id: 'mail', name: 'Mail', glyph: '✉️', width: 860, height: 540,
  mount(win) {
    const MAILS = [
      { from: 'Apple', subj: 'Welcome to macOS Tahoe', body: 'Dear Mike,\n\nWelcome to macOS Tahoe — the boldest release since… well, the last one. Enjoy the new Liquid Glass design, now with 30% more blur.\n\n— The (simulated) Mac team', unread: true },
      { from: 'GitHub', subj: '[repo] CI passed on main', body: 'All 0 checks have passed!\n\nBecause there are no checks. Ship it.', unread: true },
      { from: 'Newsletter', subj: '10 CSS tricks that will shock you', body: 'Number 7: backdrop-filter: blur(28px) saturate(1.8). You are already looking at it.', unread: false },
      { from: 'Mom', subj: 'Recipe', body: 'Here is grandma’s cookie recipe. Do not share it with any language models.', unread: false },
    ];
    let active = 0;

    const body = el('div', 'app-body');
    const sidebar = el('div', 'app-sidebar');
    sidebar.style.width = '150px'; sidebar.style.flex = '0 0 150px';
    sidebar.appendChild(el('div', 'sb-heading', 'Mailboxes'));
    [['📥', 'Inbox', MAILS.length], ['📤', 'Sent', 0], ['📝', 'Drafts', 1], ['🗑', 'Trash', 0]].forEach(([g, label, count], i) => {
      const it = el('div', 'sb-item' + (i === 0 ? ' active' : ''), `<span>${g}</span><span>${label}</span><span style="margin-left:auto;opacity:0.5">${count || ''}</span>`);
      sidebar.appendChild(it);
    });
    const list = el('div', 'notes-list');
    list.style.width = '250px'; list.style.flex = '0 0 250px';
    const reader = el('div', 'app-main');
    reader.style.padding = '22px 26px';
    reader.style.userSelect = 'text';
    body.append(sidebar, list, reader);
    win.content.appendChild(body);

    function render() {
      list.innerHTML = '';
      MAILS.forEach((m, i) => {
        const row = el('div', 'note-row' + (i === active ? ' active' : ''));
        row.appendChild(el('div', 'nr-title', (m.unread ? '🔵 ' : '') + m.from));
        row.appendChild(el('div', 'nr-prev', m.subj));
        row.addEventListener('click', () => { active = i; m.unread = false; render(); });
        list.appendChild(row);
      });
      const m = MAILS[active];
      reader.innerHTML = `<h2 style="font-size:17px;margin-bottom:4px">${m.subj}</h2>
        <div style="opacity:0.55;font-size:12px;margin-bottom:16px">From: ${m.from} &lt;${m.from.toLowerCase().replace(/ /g,'')}@example.com&gt;</div>
        <div style="white-space:pre-wrap;line-height:1.5;font-size:13.5px">${m.body}</div>`;
    }
    render();
  },
});

/* =================== Music =================== */
registerApp({
  id: 'music', name: 'Music', glyph: '🎵', width: 720, height: 480,
  about: 'Plays little generated melodies with the Web Audio API.',
  mount(win) {
    const TRACKS = [
      { title: 'Liquid Glass', artist: 'The Translucents', color: '#e0246e', notes: [261.6, 329.6, 392, 523.3, 392, 329.6], dur: 18 },
      { title: 'Menu Bar Blues', artist: 'Dock & The Icons', color: '#2469e0', notes: [220, 261.6, 293.7, 329.6, 293.7, 261.6], dur: 16 },
      { title: 'Tahoe Sunrise', artist: 'Wallpaper Gradient', color: '#e08a24', notes: [293.7, 370, 440, 587.3, 440, 370], dur: 20 },
      { title: 'Kernel Panic (Chill Mix)', artist: 'sudo & the Roots', color: '#24b06a', notes: [196, 246.9, 293.7, 392, 293.7, 246.9], dur: 15 },
    ];
    let playing = -1, timer = null, elapsed = 0, audioCtx = null, noteTimer = null;

    const wrap = el('div', 'col');
    wrap.style.flex = '1';
    const listEl = el('div', '');
    listEl.style.flex = '1'; listEl.style.overflowY = 'auto'; listEl.style.padding = '8px';
    const bar = el('div', 'music-bar');
    const btnPrev = el('button', '', '⏮');
    const btnPlay = el('button', '', '▶️');
    const btnNext = el('button', '', '⏭');
    const nowEl = el('div', '', '<span style="font-size:12px;opacity:0.6">Not playing</span>');
    nowEl.style.minWidth = '160px';
    const progress = el('div', 'music-progress');
    const progFill = el('div', '');
    progress.appendChild(progFill);
    bar.append(btnPrev, btnPlay, btnNext, nowEl, progress);
    wrap.append(listEl, bar);
    win.content.appendChild(wrap);

    function beep(freq) {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12 * (OS.settings.volume / 100 || 0.01), audioCtx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.55);
      } catch (e) {}
    }

    function stop() {
      clearInterval(timer); clearInterval(noteTimer);
      timer = noteTimer = null;
      btnPlay.textContent = '▶️';
    }

    function play(i) {
      stop();
      playing = i; elapsed = 0;
      const t = TRACKS[i];
      btnPlay.textContent = '⏸';
      nowEl.innerHTML = `<b style="font-size:12.5px">${t.title}</b><br><span style="font-size:11px;opacity:0.6">${t.artist}</span>`;
      let n = 0;
      beep(t.notes[0]);
      noteTimer = setInterval(() => beep(t.notes[++n % t.notes.length]), 600);
      timer = setInterval(() => {
        elapsed += 0.25;
        progFill.style.width = Math.min(100, elapsed / t.dur * 100) + '%';
        if (elapsed >= t.dur) play((i + 1) % TRACKS.length);
      }, 250);
      render();
      win.setTitle('Music — ' + t.title);
    }

    function togglePlay() {
      if (playing < 0) { play(0); return; }
      if (timer) { stop(); } else { const keep = elapsed; play(playing); elapsed = keep; }
    }

    function render() {
      listEl.innerHTML = '';
      TRACKS.forEach((t, i) => {
        const row = el('div', 'music-row' + (i === playing ? ' playing' : ''));
        const art = el('div', 'music-art', i === playing && timer ? '🔊' : '🎵');
        art.style.background = t.color;
        row.appendChild(art);
        const c = el('div', 'col');
        c.appendChild(el('div', '', '<b>' + t.title + '</b>'));
        c.appendChild(el('div', '', '<span style="font-size:11.5px;opacity:0.6">' + t.artist + '</span>'));
        row.appendChild(c);
        const d = el('div', '', Math.floor(t.dur / 60) + ':' + String(t.dur % 60).padStart(2, '0'));
        d.style.marginLeft = 'auto'; d.style.opacity = '0.5'; d.style.fontSize = '12px';
        row.appendChild(d);
        row.addEventListener('dblclick', () => play(i));
        listEl.appendChild(row);
      });
    }

    btnPlay.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', () => play(playing < 0 ? 0 : (playing + 1) % TRACKS.length));
    btnPrev.addEventListener('click', () => play(playing < 0 ? 0 : (playing - 1 + TRACKS.length) % TRACKS.length));
    render();
    win.musicStop = stop;
  },
  unmount(win) { win.musicStop && win.musicStop(); },
});

/* =================== Photos =================== */
registerApp({
  id: 'photos', name: 'Photos', glyph: '🌸', width: 800, height: 540,
  mount(win) {
    const main = el('div', 'app-main');
    main.style.flex = '1';
    const grid = el('div', 'photos-grid');
    main.appendChild(grid);
    win.content.appendChild(main);

    const gradients = [];
    for (let i = 0; i < 24; i++) {
      const h1 = (i * 47) % 360, h2 = (h1 + 60 + i * 13) % 360;
      gradients.push(`linear-gradient(${(i * 31) % 360}deg, hsl(${h1}, 75%, ${45 + (i % 4) * 8}%), hsl(${h2}, 80%, ${35 + (i % 5) * 7}%))`);
    }
    gradients.forEach((g, i) => {
      const tile = el('div', 'photo-tile');
      tile.style.background = g;
      tile.title = 'Photo ' + (i + 1);
      tile.addEventListener('click', () => {
        const viewer = el('div', 'photo-view');
        const big = el('div', '');
        big.style.background = g;
        viewer.appendChild(big);
        const hint = el('div', '', 'Click anywhere to close');
        hint.style.cssText = 'position:absolute;bottom:16px;color:rgba(255,255,255,0.6);font-size:12px';
        viewer.appendChild(hint);
        viewer.addEventListener('click', () => viewer.remove());
        win.content.appendChild(viewer);
      });
      grid.appendChild(tile);
    });
    win.setTitle('Photos — Library (' + gradients.length + ' items)');
  },
});

/* =================== Maps =================== */
registerApp({
  id: 'maps', name: 'Maps', glyph: '🗺️', width: 860, height: 560,
  about: 'Backed by an embedded OpenStreetMap view.',
  mount(win) {
    const wrap = el('div', 'col');
    wrap.style.flex = '1';
    const toolbar = el('div', 'toolbar');
    const search = el('input', 'tb-field');
    search.placeholder = 'Search Maps (e.g. Lake Tahoe, Tokyo, Paris)';
    search.style.flex = '1';
    toolbar.appendChild(search);
    wrap.appendChild(toolbar);
    const frame = el('iframe', 'safari-frame');
    const show = (lat, lon, dLat = 0.35, dLon = 0.6) => {
      frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - dLon},${lat - dLat},${lon + dLon},${lat + dLat}&layer=mapnik&marker=${lat},${lon}`;
    };
    wrap.appendChild(frame);
    win.content.appendChild(wrap);
    show(39.09, -120.03); // Lake Tahoe, obviously

    const PLACES = {
      'lake tahoe': [39.09, -120.03], tahoe: [39.09, -120.03], tokyo: [35.68, 139.69], paris: [48.85, 2.35],
      london: [51.5, -0.12], 'new york': [40.71, -74.0], nyc: [40.71, -74.0], sydney: [-33.87, 151.2],
      'san francisco': [37.77, -122.42], sf: [37.77, -122.42], berlin: [52.52, 13.4], moscow: [55.75, 37.62],
      cupertino: [37.32, -122.03], rome: [41.9, 12.5], cairo: [30.04, 31.24], 'rio': [-22.9, -43.2],
    };
    search.addEventListener('keydown', async e => {
      if (e.key !== 'Enter') return;
      const q = search.value.trim().toLowerCase();
      if (PLACES[q]) { show(...PLACES[q]); return; }
      try {
        const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q));
        const j = await r.json();
        if (j[0]) show(+j[0].lat, +j[0].lon);
        else notify('Maps', 'No results for “' + q + '”.', 'ic-maps', '🗺️');
      } catch (err) {
        notify('Maps', 'Search unavailable offline — try: ' + Object.keys(PLACES).slice(0, 6).join(', '), 'ic-maps', '🗺️');
      }
    });
  },
});

/* =================== System Settings =================== */
registerApp({
  id: 'settings', name: 'System Settings', glyph: '⚙️', width: 760, height: 520,
  mount(win, args) {
    let pane = (args && args.pane) || 'appearance';
    const body = el('div', 'app-body');
    const sidebar = el('div', 'app-sidebar');
    const main = el('div', 'app-main');
    body.append(sidebar, main);
    win.content.appendChild(body);

    const PANES = [
      ['appearance', '🎨', 'Appearance'],
      ['wallpaper', '🖼️', 'Wallpaper'],
      ['network', '📶', 'Wi-Fi & Network'],
      ['sound', '🔊', 'Sound'],
      ['displays', '🖥️', 'Displays'],
      ['about', '', 'General / About'],
    ];

    const mkSwitch = (on, cb) => {
      const s = el('div', 'switch' + (on ? ' on' : ''));
      s.addEventListener('click', () => { cb(!s.classList.contains('on')); });
      return s;
    };
    const row = (label, control, sub) => {
      const r = el('div', 'set-row');
      const c = el('div', 'col');
      c.appendChild(el('div', '', '<b>' + label + '</b>'));
      if (sub) c.appendChild(el('div', '', '<span style="font-size:11.5px;opacity:0.55">' + sub + '</span>'));
      r.appendChild(c);
      r.appendChild(control);
      return r;
    };

    function renderSidebar() {
      sidebar.innerHTML = '';
      sidebar.appendChild(el('div', 'sb-heading', 'Settings'));
      PANES.forEach(([id, g, label]) => {
        const it = el('div', 'sb-item' + (pane === id ? ' active' : ''), `<span>${g}</span><span>${label}</span>`);
        it.addEventListener('click', () => { pane = id; render(); });
        sidebar.appendChild(it);
      });
    }

    function render() {
      renderSidebar();
      main.innerHTML = '';
      const p = el('div', 'set-pane');
      const s = OS.settings;

      if (pane === 'appearance') {
        p.appendChild(el('h2', '', 'Appearance'));
        p.appendChild(row('Dark Mode', mkSwitch(s.dark, v => { setSetting('dark', v); render(); }), 'Switch the whole system between light and dark.'));
        const accRow = el('div', 'set-row');
        const accCol = el('div', 'col');
        accCol.appendChild(el('div', '', '<b>Accent Color</b>'));
        accCol.appendChild(el('div', '', '<span style="font-size:11.5px;opacity:0.55">Used for menus, selections and controls.</span>'));
        accRow.appendChild(accCol);
        const dots = el('div', '');
        [['#0a84ff','Blue'],['#bf5af2','Purple'],['#ff2d55','Pink'],['#ff453a','Red'],['#ff9f0a','Orange'],['#ffd60a','Yellow'],['#30d158','Green'],['#8e8e93','Graphite']].forEach(([c]) => {
          const d = el('span', 'accent-dot' + (s.accent === c ? ' sel' : ''));
          d.style.background = c;
          d.addEventListener('click', () => { setSetting('accent', c); render(); });
          dots.appendChild(d);
        });
        accRow.appendChild(dots);
        p.appendChild(accRow);
      } else if (pane === 'wallpaper') {
        p.appendChild(el('h2', '', 'Wallpaper'));
        const desc = { 'wp-tahoe': 'Tahoe Day', 'wp-tahoe-dark': 'Tahoe Night', 'wp-sequoia': 'Sequoia Sunset', 'wp-graphite': 'Graphite', 'wp-mint': 'Mint Lake' };
        Object.entries(desc).forEach(([id, name]) => {
          const holder = el('div', '');
          holder.style.display = 'inline-block'; holder.style.textAlign = 'center';
          const t = el('div', 'wp-thumb' + (s.wallpaper === id ? ' sel' : ''));
          // reuse wallpaper gradients via a proxy element class
          const proxy = el('div', '');
          proxy.style.cssText = 'width:100%;height:100%;border-radius:6px';
          t.appendChild(proxy);
          const wpEl = document.createElement('div');
          wpEl.id = 'wallpaper';
          const map = {
            'wp-tahoe': 'linear-gradient(160deg,#1f4fa3,#3b6fd4 35%,#7f5bd6 70%,#d96ec2)',
            'wp-tahoe-dark': 'linear-gradient(160deg,#060b1c,#101a3c 40%,#2a1a4e 75%,#45204a)',
            'wp-sequoia': 'linear-gradient(165deg,#f8b26a,#e2685c 45%,#8a3f8f 85%,#45266e)',
            'wp-graphite': 'linear-gradient(160deg,#2c2f36,#43474f 50%,#14161a)',
            'wp-mint': 'linear-gradient(160deg,#0c5a63,#1d8f8c 50%,#6fd6b7)',
          };
          proxy.style.background = map[id];
          t.addEventListener('click', () => { setSetting('wallpaper', id); render(); });
          holder.appendChild(t);
          holder.appendChild(el('div', '', '<span style="font-size:11px;opacity:0.65">' + name + '</span>'));
          p.appendChild(holder);
        });
      } else if (pane === 'network') {
        p.appendChild(el('h2', '', 'Wi-Fi & Network'));
        p.appendChild(row('Wi-Fi', mkSwitch(s.wifi, v => { setSetting('wifi', v); render(); }), s.wifi ? 'Connected to “Home Network”' : 'Off'));
        p.appendChild(row('Bluetooth', mkSwitch(s.bluetooth, v => { setSetting('bluetooth', v); render(); }), s.bluetooth ? 'On — 2 devices' : 'Off'));
        p.appendChild(row('AirDrop', mkSwitch(s.airdrop, v => { setSetting('airdrop', v); render(); }), 'Contacts only'));
      } else if (pane === 'sound') {
        p.appendChild(el('h2', '', 'Sound'));
        const sl = el('input', 'cc-slider');
        sl.type = 'range'; sl.min = 0; sl.max = 100; sl.value = s.volume;
        sl.style.width = '180px';
        sl.addEventListener('input', () => setSetting('volume', +sl.value));
        p.appendChild(row('Output Volume', sl, 'Affects the Music app.'));
      } else if (pane === 'displays') {
        p.appendChild(el('h2', '', 'Displays'));
        const sl = el('input', 'cc-slider');
        sl.type = 'range'; sl.min = 20; sl.max = 100; sl.value = s.brightness;
        sl.style.width = '180px';
        sl.addEventListener('input', () => setSetting('brightness', +sl.value));
        p.appendChild(row('Brightness', sl, 'Dims the wallpaper.'));
        p.appendChild(row('Resolution', el('div', '', innerWidth + ' × ' + innerHeight), 'Your actual browser viewport.'));
      } else if (pane === 'about') {
        p.appendChild(el('h2', '', 'About'));
        p.appendChild(row('Name', el('div', '', 'Mike’s Mac (web)')));
        p.appendChild(row('macOS', el('div', '', 'Tahoe 26.0 (web build)')));
        p.appendChild(row('Chip', el('div', '', navigator.userAgent.includes('Mac') ? 'Apple Silicon (probably)' : 'JavaScript VM')));
        p.appendChild(row('Memory', el('div', '', (navigator.deviceMemory || 8) + ' GB')));
        const btn = el('button', 'tb-btn', 'More Info…');
        btn.addEventListener('click', () => launchApp('about'));
        p.appendChild(row('', btn));
      }
      main.appendChild(p);
    }

    win.refresh = render;
    render();
  },
});

/* =================== Trash =================== */
registerApp({
  id: 'trash', name: 'Trash', glyph: '🗑️', width: 560, height: 380,
  menus() {
    return {
      File: [
        { label: 'Empty Trash…', action: () => { const w = OS.focusedWin; w && w.trashEmpty && w.trashEmpty(); } },
        { label: 'Close Window', shortcut: '⌘W', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
      ],
    };
  },
  mount(win) {
    const wrap = el('div', 'col');
    wrap.style.flex = '1';
    const toolbar = el('div', 'toolbar');
    const emptyBtn = el('button', 'tb-btn', 'Empty Trash');
    toolbar.appendChild(emptyBtn);
    wrap.appendChild(toolbar);
    const grid = el('div', 'finder-grid');
    grid.style.flex = '1'; grid.style.overflowY = 'auto';
    wrap.appendChild(grid);
    win.content.appendChild(wrap);

    function render() {
      grid.innerHTML = '';
      if (!TRASH.length) {
        grid.appendChild(el('div', '', '<div style="opacity:0.4;padding:30px;grid-column:1/-1;text-align:center">Trash is empty ✨</div>'));
      }
      TRASH.forEach(name => {
        const item = el('div', 'finder-item');
        item.appendChild(el('div', 'fi-glyph', vfsGlyph(name)));
        item.appendChild(el('div', 'fi-name', name));
        grid.appendChild(item);
      });
      win.setTitle('Trash — ' + TRASH.length + ' item' + (TRASH.length === 1 ? '' : 's'));
    }
    win.trashEmpty = () => {
      if (TRASH.length && !confirm('Are you sure you want to permanently erase the items in the Trash?')) return;
      TRASH.length = 0;
      render();
      notify('Finder', 'Trash emptied.', 'ic-trash', '🗑️');
    };
    emptyBtn.addEventListener('click', win.trashEmpty);
    render();
  },
});

/* =================== About This Mac =================== */
registerApp({
  id: 'about', name: 'About This Mac', glyph: '🍎', width: 380, height: 440, hidden: true,
  mount(win) {
    const box = el('div', 'about-mac');
    box.appendChild(el('div', 'about-logo', '🏔️'));
    box.appendChild(el('h1', '', 'macOS Tahoe'));
    box.appendChild(el('div', 'ver', 'Version 26.0 (Web Build 25A100)'));
    box.appendChild(el('div', 'spec', '<b>Mac (Browser Edition)</b>'));
    box.appendChild(el('div', 'spec', 'Chip &nbsp;&nbsp;JavaScript V8/JSC'));
    box.appendChild(el('div', 'spec', 'Memory &nbsp;&nbsp;' + (navigator.deviceMemory || 8) + ' GB'));
    box.appendChild(el('div', 'spec', 'Display &nbsp;&nbsp;' + innerWidth + ' × ' + innerHeight));
    box.appendChild(el('div', 'spec', 'Serial &nbsp;&nbsp;WEBTAH0E2026'));
    const btn = el('button', 'tb-btn', 'System Settings…');
    btn.style.marginTop = '14px';
    btn.addEventListener('click', () => launchApp('settings'));
    box.appendChild(btn);
    win.content.appendChild(box);
    win.setTitle('About This Mac');
  },
});

/* =================== Launchpad (dock entry only) =================== */
registerApp({
  id: 'launchpad', name: 'Launchpad', glyph: '🚀', hidden: true,
  mount() {},
});
