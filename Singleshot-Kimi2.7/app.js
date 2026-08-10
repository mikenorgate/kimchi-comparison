/* macOS Tahoe Web App — app.js */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

const WALLPAPERS = [
  { id: 'aurora', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: 'mountain', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop' },
  { id: 'forest', url: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2560&auto=format&fit=crop' },
  { id: 'space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2560&auto=format&fit=crop' }
];

const APP_DEFS = [
  { id: 'finder', name: 'Finder', icon: '🔍', color: '#1c1c1e', dock: true },
  { id: 'safari', name: 'Safari', icon: '🧭', color: '#0a84ff', dock: true },
  { id: 'terminal', name: 'Terminal', icon: '💻', color: '#1e1e1e', dock: true },
  { id: 'calculator', name: 'Calculator', icon: '🧮', color: '#ff9f0a', dock: true },
  { id: 'notes', name: 'Notes', icon: '📝', color: '#ffcc00', dock: true },
  { id: 'settings', name: 'System Settings', icon: '⚙️', color: '#8e8e93', dock: true },
  { id: 'photos', name: 'Photos', icon: '🖼️', color: '#ff3b30', dock: true },
  { id: 'music', name: 'Music', icon: '🎵', color: '#ff2d55', dock: true },
  { id: 'mail', name: 'Mail', icon: '✉️', color: '#007aff', dock: true },
  { id: 'messages', name: 'Messages', icon: '💬', color: '#34c759', dock: true }
];

const DESKTOP_ICONS = [
  { id: 'finder', label: 'Macintosh HD', icon: '💾' }
];

const state = {
  theme: 'auto',
  wallpaper: WALLPAPERS[0].id,
  dockPosition: 'bottom',
  autoHideDock: false,
  windows: [],
  nextWinId: 1,
  zBase: 100,
  activeAppId: 'finder',
  fileTree: null,
  notes: [],
  currentUser: 'user'
};

/* ==========================
   Helpers
   ========================== */

function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(d = new Date()) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${h}:${m} ${ampm}`;
}

function setWallpaper(id) {
  const wp = WALLPAPERS.find(w => w.id === id) || WALLPAPERS[0];
  $('#wallpaper').style.backgroundImage = `url('${wp.url}')`;
  state.wallpaper = id;
}

function applyTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = state.theme === 'auto' ? (prefersDark ? 'dark' : 'light') : state.theme;
  document.documentElement.setAttribute('data-theme', theme);
}

function getApp(id) { return APP_DEFS.find(a => a.id === id); }

function saveSettings() {
  localStorage.setItem('tahoeSettings', JSON.stringify({
    theme: state.theme,
    wallpaper: state.wallpaper,
    dockPosition: state.dockPosition,
    autoHideDock: state.autoHideDock
  }));
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('tahoeSettings'));
    if (s) {
      state.theme = s.theme || 'auto';
      state.wallpaper = s.wallpaper || WALLPAPERS[0].id;
      state.dockPosition = s.dockPosition || 'bottom';
      state.autoHideDock = !!s.autoHideDock;
    }
  } catch {}
}

/* ==========================
   File System
   ========================== */

function createFileTree() {
  function dir(name, children = []) { return { type: 'folder', name, children }; }
  function file(name) { return { type: 'file', name }; }

  return dir('Home', [
    dir('Desktop', [file('Readme.txt'), file('Screenshot.png')]),
    dir('Documents', [dir('Work', [file('Report.docx'), file('Budget.xlsx')]), file('Resume.pdf')]),
    dir('Downloads', [file('Installer.dmg'), file('Archive.zip')]),
    dir('Applications', APP_DEFS.map(a => file(`${a.name}.app`))),
    dir('Pictures', [file('Vacation.jpg'), file('Portrait.png')]),
    file('todo.txt'),
    file('.zshrc')
  ]);
}

function findPath(node, path) {
  if (!path.length || path[0] === node.name) return node;
  const next = path[1];
  if (!next) return node;
  const child = node.children.find(c => c.name === next);
  return child ? findPath(child, path.slice(1)) : null;
}

function resolvePath(pathStr) {
  const parts = pathStr.split('/').filter(Boolean);
  return findPath(state.fileTree, parts.length ? parts : [state.fileTree.name]);
}

/* ==========================
   Window Manager
   ========================== */

function createWindow(appId, options = {}) {
  const app = getApp(appId);
  const id = state.nextWinId++;
  const width = options.width || 720;
  const height = options.height || 460;
  const x = options.x ?? Math.max(40, (window.innerWidth - width) / 2 + (state.windows.length * 24) % 200);
  const y = options.y ?? Math.max(60, (window.innerHeight - height) / 2 + (state.windows.length * 24) % 150);

  const winEl = document.createElement('div');
  winEl.className = 'window focused';
  winEl.id = `win-${id}`;
  winEl.style.left = `${x}px`;
  winEl.style.top = `${y}px`;
  winEl.style.width = `${width}px`;
  winEl.style.height = `${height}px`;
  winEl.style.zIndex = ++state.zBase;

  winEl.innerHTML = `
    <div class="window-titlebar">
      <div class="traffic-lights">
        <div class="light close" data-action="close" title="Close"></div>
        <div class="light min" data-action="minimize" title="Minimize"></div>
        <div class="light max" data-action="maximize" title="Maximize"></div>
      </div>
      <div class="window-title">${app.name}</div>
    </div>
    <div class="window-content"></div>
    <div class="resize-handle"></div>
  `;

  $('#windows-container').appendChild(winEl);

  const win = {
    id,
    appId,
    el: winEl,
    content: $('.window-content', winEl),
    minimized: false,
    maximized: false,
    prevRect: null
  };

  state.windows.push(win);
  setActiveWindow(win);
  wireWindowEvents(win);
  renderApp(win);
  updateDock();

  return win;
}

function closeWindow(win) {
  win.el.remove();
  state.windows = state.windows.filter(w => w !== win);
  const next = state.windows[state.windows.length - 1];
  if (next) setActiveWindow(next);
  else {
    state.activeAppId = 'finder';
    $('#active-app-name').textContent = 'Finder';
  }
  updateDock();
}

function minimizeWindow(win) {
  win.minimized = true;
  win.el.classList.add('minimized');
  const next = state.windows.filter(w => w !== win && !w.minimized).pop();
  if (next) setActiveWindow(next);
  updateDock();
}

function restoreWindow(win) {
  win.minimized = false;
  win.el.classList.remove('minimized');
  setActiveWindow(win);
}

function toggleMaximize(win) {
  if (win.maximized) {
    const r = win.prevRect;
    win.el.style.left = r.left;
    win.el.style.top = r.top;
    win.el.style.width = r.width;
    win.el.style.height = r.height;
    win.maximized = false;
  } else {
    win.prevRect = {
      left: win.el.style.left,
      top: win.el.style.top,
      width: win.el.style.width,
      height: win.el.style.height
    };
    win.el.style.left = '0px';
    win.el.style.top = '28px';
    win.el.style.width = '100vw';
    win.el.style.height = 'calc(100vh - 28px)';
    win.maximized = true;
  }
  setActiveWindow(win);
}

function setActiveWindow(win) {
  state.windows.forEach(w => w.el.classList.remove('focused'));
  win.el.classList.add('focused');
  win.el.style.zIndex = ++state.zBase;
  state.activeAppId = win.appId;
  $('#active-app-name').textContent = getApp(win.appId).name;
  updateDock();
}

function wireWindowEvents(win) {
  const titlebar = $('.window-titlebar', win.el);
  const resize = $('.resize-handle', win.el);

  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('.traffic-lights')) return;
    setActiveWindow(win);
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = win.el.offsetLeft;
    const startTop = win.el.offsetTop;

    function onMove(ev) {
      win.el.style.left = `${startLeft + ev.clientX - startX}px`;
      win.el.style.top = `${Math.max(28, startTop + ev.clientY - startY)}px`;
      if (win.maximized) win.maximized = false;
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  win.el.addEventListener('mousedown', () => setActiveWindow(win));

  $$('.traffic-lights .light', win.el).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'close') closeWindow(win);
      if (action === 'minimize') minimizeWindow(win);
      if (action === 'maximize') toggleMaximize(win);
    });
  });

  resize.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.el.offsetWidth;
    const startH = win.el.offsetHeight;

    function onMove(ev) {
      win.el.style.width = `${Math.max(260, startW + ev.clientX - startX)}px`;
      win.el.style.height = `${Math.max(160, startH + ev.clientY - startY)}px`;
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

/* ==========================
   App Renderers
   ========================== */

function renderApp(win) {
  const app = getApp(win.appId);
  win.content.innerHTML = '';
  win.content.style.background = '';
  win.content.style.color = '';
  switch (app.id) {
    case 'finder': renderFinder(win); break;
    case 'safari': renderSafari(win); break;
    case 'terminal': renderTerminal(win); break;
    case 'calculator': renderCalculator(win); break;
    case 'notes': renderNotes(win); break;
    case 'settings': renderSettings(win); break;
    case 'photos': renderPhotos(win); break;
    case 'music': renderMusic(win); break;
    case 'mail': renderMail(win); break;
    case 'messages': renderMessages(win); break;
    default: win.content.textContent = app.name;
  }
}

/* Finder */

function renderFinder(win) {
  win.currentPath = win.currentPath || [state.fileTree.name];
  const node = findPath(state.fileTree, win.currentPath) || state.fileTree;

  const container = document.createElement('div');
  container.className = 'finder';
  container.innerHTML = `
    <div class="finder-sidebar">
      <h4>Favorites</h4>
      <div class="finder-item ${win.currentPath.length === 1 && win.currentPath[0] === state.fileTree.name ? 'active' : ''}" data-path="${state.fileTree.name}">🏠 Home</div>
      <div class="finder-item" data-path="${state.fileTree.name}/Desktop">🖥️ Desktop</div>
      <div class="finder-item" data-path="${state.fileTree.name}/Documents">📄 Documents</div>
      <div class="finder-item" data-path="${state.fileTree.name}/Downloads">⬇️ Downloads</div>
      <div class="finder-item" data-path="${state.fileTree.name}/Applications">🧩 Applications</div>
      <div class="finder-item" data-path="${state.fileTree.name}/Pictures">🖼️ Pictures</div>
    </div>
    <div class="finder-main">
      <div class="finder-toolbar">
        <span>🔙</span>
        <span class="path">${node.name}</span>
      </div>
      <div class="finder-grid"></div>
    </div>
  `;

  const grid = $('.finder-grid', container);
  const children = node.children || [];
  if (!children.length) {
    grid.innerHTML = '<div style="opacity:.5;padding:20px">This folder is empty.</div>';
  } else {
    children.forEach(child => {
      const item = document.createElement('div');
      item.className = 'file-item';
      const icon = child.type === 'folder' ? '📁' : '📄';
      item.innerHTML = `<div class="file-icon">${icon}</div><div class="file-name">${child.name}</div>`;
      item.addEventListener('dblclick', () => {
        if (child.type === 'folder') {
          win.currentPath = [...win.currentPath, child.name];
          renderFinder(win);
        } else {
          alert(`Opening "${child.name}" is not implemented in this demo.`);
        }
      });
      grid.appendChild(item);
    });
  }

  $$('.finder-item', container).forEach(item => {
    item.addEventListener('click', () => {
      win.currentPath = item.dataset.path.split('/').filter(Boolean);
      renderFinder(win);
    });
  });

  win.content.appendChild(container);
}

/* Safari */

function renderSafari(win) {
  const container = document.createElement('div');
  container.className = 'safari';
  container.innerHTML = `
    <div class="safari-tabs">
      <div class="safari-tab active">New Tab</div>
    </div>
    <div class="safari-toolbar">
      <button data-action="back">◀</button>
      <button data-action="forward">▶</button>
      <button data-action="reload">↻</button>
      <input type="text" value="https://example.com" placeholder="Search or enter address" />
    </div>
    <iframe class="safari-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  `;

  const input = $('.safari-toolbar input', container);
  const frame = $('.safari-frame', container);
  const tab = $('.safari-tab', container);

  function loadUrl(raw) {
    let url = raw.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    input.value = url;
    tab.textContent = new URL(url).hostname;
    frame.src = url;
  }

  input.addEventListener('keydown', e => { if (e.key === 'Enter') loadUrl(input.value); });
  $$('.safari-toolbar button', container).forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'back') frame.contentWindow?.history.back();
      if (btn.dataset.action === 'forward') frame.contentWindow?.history.forward();
      if (btn.dataset.action === 'reload') frame.src = input.value;
    });
  });

  frame.addEventListener('load', () => {
    try {
      tab.textContent = frame.contentDocument?.title || new URL(input.value).hostname;
    } catch {}
  });

  loadUrl('https://example.com');
  win.content.appendChild(container);
}

/* Terminal */

function renderTerminal(win) {
  win.cwd = win.cwd || `/${state.fileTree.name}`;
  win.history = win.history || [];
  win.histIdx = -1;

  const container = document.createElement('div');
  container.className = 'terminal';
  const output = document.createElement('div');
  output.className = 'terminal-output';
  container.appendChild(output);

  function print(text) {
    const line = document.createElement('div');
    line.textContent = text;
    output.appendChild(line);
    container.scrollTop = container.scrollHeight;
  }

  function prompt() {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const promptText = document.createElement('span');
    promptText.textContent = `${state.currentUser}@tahoe:${win.cwd}$`;
    const input = document.createElement('input');
    input.type = 'text';
    input.spellcheck = false;
    input.autocomplete = 'off';
    input.autofocus = true;
    line.appendChild(promptText);
    line.appendChild(input);
    output.appendChild(line);
    container.scrollTop = container.scrollHeight;

    input.focus();
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.disabled = true;
        if (cmd) {
          win.history.push(cmd);
          win.histIdx = win.history.length;
          runCommand(cmd, print, win);
        }
        prompt();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (win.histIdx > 0) {
          win.histIdx--;
          input.value = win.history[win.histIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (win.histIdx < win.history.length - 1) {
          win.histIdx++;
          input.value = win.history[win.histIdx];
        } else {
          win.histIdx = win.history.length;
          input.value = '';
        }
      }
    });
  }

  print('Last login: ' + new Date().toUTCString());
  print('Welcome to Tahoe. Type "help" for a list of commands.');
  prompt();
  win.content.appendChild(container);
}

function runCommand(line, print, win) {
  const parts = line.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      print('Available commands: help, ls, cd, pwd, cat, clear, echo, whoami, date, open');
      break;
    case 'ls':
      print(listDir(win.cwd));
      break;
    case 'cd': {
      const target = args[0] || `/${state.fileTree.name}`;
      const newPath = resolveCd(win.cwd, target);
      if (newPath) {
        const node = resolvePath(newPath);
        if (node && node.type === 'folder') win.cwd = newPath;
        else print(`cd: not a directory: ${target}`);
      } else print(`cd: no such file or directory: ${target}`);
      break;
    }
    case 'pwd':
      print(win.cwd);
      break;
    case 'cat': {
      if (!args[0]) { print('cat: missing file'); break; }
      const file = resolveRelative(win.cwd, args[0]);
      if (file && file.type === 'file') print(`Contents of ${file.name}:\nHello from Tahoe!`);
      else print(`cat: ${args[0]}: No such file`);
      break;
    }
    case 'clear':
      win.content.querySelector('.terminal-output').innerHTML = '';
      break;
    case 'echo':
      print(args.join(' '));
      break;
    case 'whoami':
      print(state.currentUser);
      break;
    case 'date':
      print(new Date().toString());
      break;
    case 'open':
      print(`Opening ${args[0] || 'nothing'} is not implemented in this demo.`);
      break;
    default:
      print(`command not found: ${cmd}`);
  }
}

function listDir(path) {
  const node = resolvePath(path);
  if (!node) return 'No such directory';
  if (node.type === 'file') return node.name;
  return node.children.map(c => c.type === 'folder' ? c.name + '/' : c.name).join('  ');
}

function resolveCd(cwd, target) {
  if (target.startsWith('/')) return target;
  const base = cwd.split('/').filter(Boolean);
  target.split('/').filter(Boolean).forEach(part => {
    if (part === '..') base.pop();
    else base.push(part);
  });
  return '/' + base.join('/');
}

function resolveRelative(cwd, target) {
  const full = resolveCd(cwd, target);
  return resolvePath(full);
}

/* Calculator */

function renderCalculator(win) {
  win.calc = { current: '0', prev: null, op: null, reset: false };
  const container = document.createElement('div');
  container.className = 'calculator';
  const display = document.createElement('div');
  display.className = 'calc-display';
  display.textContent = '0';
  container.appendChild(display);

  const buttons = [
    ['AC','gray'],['±','gray'],['%','gray'],['÷','orange'],
    ['7','num'],['8','num'],['9','num'],['×','orange'],
    ['4','num'],['5','num'],['6','num'],['−','orange'],
    ['1','num'],['2','num'],['3','num'],['+','orange'],
    ['0','num zero'],['.','num'],['=','orange']
  ];

  buttons.forEach(([label, cls]) => {
    const btn = document.createElement('button');
    btn.className = `calc-btn ${cls}`;
    btn.textContent = label;
    btn.addEventListener('click', () => handleCalc(label, win.calc, display));
    container.appendChild(btn);
  });

  win.content.appendChild(container);
}

function handleCalc(label, calc, display) {
  if (/[0-9]/.test(label)) {
    if (calc.reset || calc.current === '0') { calc.current = label; calc.reset = false; }
    else calc.current += label;
  } else if (label === '.') {
    if (!calc.current.includes('.')) calc.current += '.';
  } else if (label === '±') {
    calc.current = String(parseFloat(calc.current) * -1);
  } else if (label === '%') {
    calc.current = String(parseFloat(calc.current) / 100);
  } else if (label === 'AC') {
    calc.current = '0'; calc.prev = null; calc.op = null;
  } else if (['+','−','×','÷'].includes(label)) {
    calc.prev = parseFloat(calc.current);
    calc.op = label;
    calc.reset = true;
  } else if (label === '=') {
    if (calc.op !== null && calc.prev !== null) {
      const cur = parseFloat(calc.current);
      let res = 0;
      switch (calc.op) {
        case '+': res = calc.prev + cur; break;
        case '−': res = calc.prev - cur; break;
        case '×': res = calc.prev * cur; break;
        case '÷': res = cur === 0 ? NaN : calc.prev / cur; break;
      }
      calc.current = String(Number.isFinite(res) ? parseFloat(res.toPrecision(12)) : 'Error');
      calc.op = null; calc.prev = null; calc.reset = true;
    }
  }
  display.textContent = calc.current;
}

/* Notes */

function loadNotes() {
  try {
    const n = JSON.parse(localStorage.getItem('tahoeNotes'));
    state.notes = Array.isArray(n) ? n : [];
  } catch { state.notes = []; }
  if (!state.notes.length) {
    state.notes = [{ id: 1, title: 'Welcome', body: 'Welcome to Notes. This note is saved locally in your browser.' }];
  }
}

function saveNotes() {
  localStorage.setItem('tahoeNotes', JSON.stringify(state.notes));
}

function renderNotes(win) {
  loadNotes();
  win.activeNoteId = win.activeNoteId || state.notes[0]?.id;
  const container = document.createElement('div');
  container.className = 'notes';
  container.innerHTML = `
    <div class="notes-sidebar">
      <div class="notes-header"><span>Notes</span><button id="new-note">+ New</button></div>
      <div class="notes-list"></div>
    </div>
    <div class="notes-editor">
      <input type="text" id="note-title" placeholder="Title" />
      <textarea id="note-body" placeholder="Type your note..."></textarea>
    </div>
  `;

  const list = $('.notes-list', container);
  const titleInput = $('#note-title', container);
  const bodyInput = $('#note-body', container);

  function renderList() {
    list.innerHTML = '';
    state.notes.forEach(note => {
      const item = document.createElement('div');
      item.className = 'note-item' + (note.id === win.activeNoteId ? ' active' : '');
      item.innerHTML = `<h5>${escapeHtml(note.title || 'Untitled')}</h5><p>${escapeHtml(note.body.slice(0, 40))}</p>`;
      item.addEventListener('click', () => { win.activeNoteId = note.id; renderList(); loadEditor(); });
      list.appendChild(item);
    });
  }

  function loadEditor() {
    const note = state.notes.find(n => n.id === win.activeNoteId);
    titleInput.value = note ? note.title : '';
    bodyInput.value = note ? note.body : '';
  }

  function updateActive() {
    const note = state.notes.find(n => n.id === win.activeNoteId);
    if (note) {
      note.title = titleInput.value;
      note.body = bodyInput.value;
      saveNotes();
      renderList();
    }
  }

  $('#new-note', container).addEventListener('click', () => {
    const id = Date.now();
    state.notes.unshift({ id, title: 'New Note', body: '' });
    win.activeNoteId = id;
    saveNotes();
    renderList();
    loadEditor();
  });

  titleInput.addEventListener('input', updateActive);
  bodyInput.addEventListener('input', updateActive);

  renderList();
  loadEditor();
  win.content.appendChild(container);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* Settings */

function renderSettings(win) {
  const container = document.createElement('div');
  container.className = 'settings';
  container.innerHTML = `
    <div class="settings-sidebar">
      <div class="settings-item active" data-pane="appearance">🎨 Appearance</div>
      <div class="settings-item" data-pane="wallpaper">🖼️ Wallpaper</div>
      <div class="settings-item" data-pane="dock">🚢 Dock</div>
    </div>
    <div class="settings-pane"></div>
  `;

  const pane = $('.settings-pane', container);
  let currentPane = 'appearance';

  function renderPane() {
    pane.innerHTML = '';
    if (currentPane === 'appearance') {
      pane.innerHTML = `<h2>Appearance</h2>
        <div class="setting-row"><span>Appearance</span>
          <select id="theme-select">
            <option value="light" ${state.theme==='light'?'selected':''}>Light</option>
            <option value="dark" ${state.theme==='dark'?'selected':''}>Dark</option>
            <option value="auto" ${state.theme==='auto'?'selected':''}>Auto</option>
          </select>
        </div>`;
      $('#theme-select', pane).addEventListener('change', e => {
        state.theme = e.target.value;
        applyTheme();
        saveSettings();
      });
    } else if (currentPane === 'wallpaper') {
      pane.innerHTML = `<h2>Wallpaper</h2><div class="wallpaper-grid"></div>`;
      const grid = $('.wallpaper-grid', pane);
      WALLPAPERS.forEach(wp => {
        const thumb = document.createElement('div');
        thumb.className = 'wallpaper-thumb' + (state.wallpaper === wp.id ? ' active' : '');
        thumb.style.backgroundImage = `url('${wp.url}')`;
        thumb.addEventListener('click', () => {
          setWallpaper(wp.id);
          saveSettings();
          renderPane();
        });
        grid.appendChild(thumb);
      });
    } else if (currentPane === 'dock') {
      pane.innerHTML = `<h2>Dock</h2>
        <div class="setting-row"><span>Position on screen</span>
          <select id="dock-pos">
            <option value="bottom" ${state.dockPosition==='bottom'?'selected':''}>Bottom</option>
            <option value="left" ${state.dockPosition==='left'?'selected':''}>Left</option>
            <option value="right" ${state.dockPosition==='right'?'selected':''}>Right</option>
          </select>
        </div>
        <div class="setting-row"><span>Automatically hide and show the Dock</span>
          <input type="checkbox" id="dock-autohide" ${state.autoHideDock?'checked':''} />
        </div>`;
      $('#dock-pos', pane).addEventListener('change', e => {
        state.dockPosition = e.target.value;
        positionDock();
        saveSettings();
      });
      $('#dock-autohide', pane).addEventListener('change', e => {
        state.autoHideDock = e.target.checked;
        positionDock();
        saveSettings();
      });
    }
  }

  $$('.settings-item', container).forEach(item => {
    item.addEventListener('click', () => {
      $$('.settings-item', container).forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentPane = item.dataset.pane;
      renderPane();
    });
  });

  renderPane();
  win.content.appendChild(container);
}

/* Photos */

function renderPhotos(win) {
  const container = document.createElement('div');
  container.className = 'photos';
  const grid = document.createElement('div');
  grid.className = 'photos-grid';
  for (let i = 0; i < 24; i++) {
    const thumb = document.createElement('div');
    thumb.className = 'photo-thumb';
    thumb.style.backgroundImage = `url('https://picsum.photos/seed/${i + 1}/300/300')`;
    grid.appendChild(thumb);
  }
  container.appendChild(grid);
  win.content.appendChild(container);
}

/* Music */

function renderMusic(win) {
  const tracks = [
    { title: 'Midnight Drive', artist: 'Synthwave Boy' },
    { title: 'Ocean Breeze', artist: 'Lo-Fi Chill' },
    { title: 'Mountain High', artist: 'Indie Folk' },
    { title: 'Urban Lights', artist: 'Electro Pop' },
    { title: 'Golden Hour', artist: 'Acoustic Soul' }
  ];
  const container = document.createElement('div');
  container.className = 'music';
  const list = document.createElement('div');
  list.className = 'music-list';
  tracks.forEach(t => {
    const row = document.createElement('div');
    row.className = 'music-row';
    row.innerHTML = `<div class="art"></div><div class="music-info"><h5>${t.title}</h5><p>${t.artist}</p></div><span>${Math.floor(Math.random()*3+2)}:22</span>`;
    list.appendChild(row);
  });
  const player = document.createElement('div');
  player.className = 'music-player';
  player.innerHTML = '<button>⏮</button><button>▶</button><button>⏭</button>';
  container.appendChild(list);
  container.appendChild(player);
  win.content.appendChild(container);
}

/* Mail */

function renderMail(win) {
  const emails = [
    { from: 'Apple', subject: 'Welcome to your new Mac', preview: 'Get started with macOS Tahoe...', body: 'Thank you for choosing Mac. Here is how to get the most out of your new experience.' },
    { from: 'GitHub', subject: 'Security alert', preview: 'We noticed a new sign-in...', body: 'A new device signed in to your GitHub account. If this was you, no action is needed.' },
    { from: 'Newsletter', subject: 'Weekly digest', preview: 'Top stories this week...', body: 'Here are the top stories from this week that you might have missed.' }
  ];
  const container = document.createElement('div');
  container.className = 'mail';
  container.innerHTML = `
    <div class="mail-sidebar">
      <div class="mail-box active">📥 Inbox</div>
      <div class="mail-box">📝 Drafts</div>
      <div class="mail-box">✉️ Sent</div>
      <div class="mail-box">🗑️ Trash</div>
    </div>
    <div class="mail-list"></div>
    <div class="mail-read"></div>
  `;

  const list = $('.mail-list', container);
  const read = $('.mail-read', container);

  function showEmail(email) {
    read.innerHTML = `<h2>${email.subject}</h2><div class="meta">From: ${email.from}</div><p>${email.body}</p>`;
  }

  emails.forEach((email, i) => {
    const item = document.createElement('div');
    item.className = 'mail-item' + (i === 0 ? ' active' : '');
    item.innerHTML = `<h5>${email.from}</h5><p><strong>${email.subject}</strong> — ${email.preview}</p>`;
    item.addEventListener('click', () => {
      $$('.mail-item', container).forEach(x => x.classList.remove('active'));
      item.classList.add('active');
      showEmail(email);
    });
    list.appendChild(item);
  });

  showEmail(emails[0]);
  win.content.appendChild(container);
}

/* Messages */

function renderMessages(win) {
  const convos = [
    { name: 'Mom', last: 'Call me when you can!' },
    { name: 'Work Group', last: 'Meeting at 3pm' },
    { name: 'Alex', last: 'Want to grab lunch?' }
  ];
  const messages = [
    { text: 'Hey! How is it going?', out: false },
    { text: 'Pretty good, just checking out this Tahoe web app.', out: true },
    { text: 'Looks amazing!', out: false }
  ];

  const container = document.createElement('div');
  container.className = 'messages';
  container.innerHTML = `
    <div class="msg-sidebar"></div>
    <div class="msg-chat">
      <div class="msg-bubbles"></div>
      <div class="msg-input"><input type="text" placeholder="iMessage" /><button>➤</button></div>
    </div>
  `;

  const sidebar = $('.msg-sidebar', container);
  convos.forEach((c, i) => {
    const item = document.createElement('div');
    item.className = 'msg-convo' + (i === 0 ? ' active' : '');
    item.innerHTML = `<div class="msg-avatar">${c.name[0]}</div><div class="msg-preview"><h5>${c.name}</h5><p>${c.last}</p></div>`;
    sidebar.appendChild(item);
  });

  const bubbles = $('.msg-bubbles', container);
  messages.forEach(m => {
    const b = document.createElement('div');
    b.className = 'bubble ' + (m.out ? 'out' : 'in');
    b.textContent = m.text;
    bubbles.appendChild(b);
  });

  const input = $('.msg-input input', container);
  $('.msg-input button', container).addEventListener('click', () => {
    if (!input.value.trim()) return;
    const b = document.createElement('div');
    b.className = 'bubble out';
    b.textContent = input.value;
    bubbles.appendChild(b);
    input.value = '';
    bubbles.scrollTop = bubbles.scrollHeight;
    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'bubble in';
      reply.textContent = 'Nice!';
      bubbles.appendChild(reply);
      bubbles.scrollTop = bubbles.scrollHeight;
    }, 1000);
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') $('.msg-input button', container).click(); });
  win.content.appendChild(container);
}

/* ==========================
   Desktop Shell
   ========================== */

function renderDesktopIcons() {
  const container = $('#desktop-icons');
  container.innerHTML = '';
  DESKTOP_ICONS.forEach(item => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<div class="icon">${item.icon}</div><div class="label">${item.label}</div>`;
    el.addEventListener('dblclick', () => openApp(item.id));
    container.appendChild(el);
  });
}

function renderDock() {
  const apps = $('#dock-apps');
  const bin = $('#dock-bin');
  apps.innerHTML = '';
  bin.innerHTML = '';

  APP_DEFS.filter(a => a.dock).forEach(app => {
    const isRunning = state.windows.some(w => w.appId === app.id);
    const el = document.createElement('div');
    el.className = 'dock-icon' + (isRunning ? ' running' : '');
    el.style.background = app.color;
    el.textContent = app.icon;
    el.title = app.name;
    el.addEventListener('click', () => {
      const existing = state.windows.filter(w => w.appId === app.id && !w.minimized);
      if (existing.length) {
        const top = existing.reduce((a, b) => a.el.style.zIndex > b.el.style.zIndex ? a : b);
        if (top.el.classList.contains('focused')) minimizeWindow(top);
        else setActiveWindow(top);
      } else {
        const minimized = state.windows.find(w => w.appId === app.id && w.minimized);
        if (minimized) restoreWindow(minimized);
        else openApp(app.id);
      }
    });
    apps.appendChild(el);
  });

  const trash = document.createElement('div');
  trash.className = 'dock-icon';
  trash.textContent = '🗑️';
  trash.title = 'Bin';
  bin.appendChild(trash);
}

function updateDock() {
  renderDock();
}

function openApp(appId) {
  const app = getApp(appId);
  if (!app) return;
  const sizes = {
    finder: [720, 460], safari: [860, 560], terminal: [640, 400],
    calculator: [260, 360], notes: [700, 460], settings: [620, 420],
    photos: [720, 500], music: [620, 420], mail: [760, 480], messages: [640, 440]
  };
  const [w, h] = sizes[appId] || [600, 400];
  createWindow(appId, { width: w, height: h });
}

function showContextMenu(x, y) {
  const menu = $('#context-menu');
  menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - 120)}px`;
  menu.classList.remove('hidden');
}

function hideContextMenu() {
  $('#context-menu').classList.add('hidden');
}

function positionDock() {
  const dock = $('#dock');
  dock.style.left = '';
  dock.style.right = '';
  dock.style.top = '';
  dock.style.bottom = '';
  dock.style.transform = '';
  dock.style.flexDirection = 'row';

  if (state.autoHideDock) {
    dock.style.opacity = '0';
    dock.style.pointerEvents = 'none';
    return;
  }
  dock.style.opacity = '1';
  dock.style.pointerEvents = 'auto';

  if (state.dockPosition === 'bottom') {
    dock.style.left = '50%';
    dock.style.bottom = '12px';
    dock.style.transform = 'translateX(-50%)';
  } else if (state.dockPosition === 'left') {
    dock.style.left = '12px';
    dock.style.top = '50%';
    dock.style.transform = 'translateY(-50%)';
    dock.style.flexDirection = 'column';
  } else {
    dock.style.right = '12px';
    dock.style.top = '50%';
    dock.style.transform = 'translateY(-50%)';
    dock.style.flexDirection = 'column';
  }
}

/* ==========================
   Init & Events
   ========================== */

function init() {
  loadSettings();
  applyTheme();
  setWallpaper(state.wallpaper);
  state.fileTree = createFileTree();
  loadNotes();

  renderDesktopIcons();
  renderDock();
  positionDock();

  setInterval(() => { $('#clock').textContent = formatDate(); }, 1000);
  $('#clock').textContent = formatDate();

  $('#desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.window') || e.target.closest('#dock') || e.target.closest('#menu-bar')) return;
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#context-menu')) hideContextMenu();
  });

  $('#context-menu').addEventListener('click', e => {
    const action = e.target.dataset.action;
    if (action === 'new-folder') {
      alert('New Folder created on Desktop (demo).');
    } else if (action === 'change-wallpaper') {
      openApp('settings');
    }
    hideContextMenu();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'auto') applyTheme();
  });
}

init();
