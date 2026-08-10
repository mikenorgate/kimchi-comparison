/* ============================ macOS Tahoe 26 - Core System ============================ */
const MacOS = {
  windows: {},
  windowZ: 100,
  activeWindow: null,
  activeApp: 'finder',
  apps: {},
  wallpapers: [
    'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 20%, #5b2a8c 40%, #8e44ad 55%, #e84393 70%, #fd79a8 82%, #ffeaa7 100%)',
    'linear-gradient(180deg, #0f2027 0%, #203a43 30%, #2c5364 60%, #4a7c8c 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #f8b500 100%)',
    'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 30%, #16213e 60%, #0f3460 100%)',
    'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    'linear-gradient(135deg, #232526 0%, #414345 100%)',
    'linear-gradient(135deg, #834d9b 0%, #d04ed6 50%, #834d9b 100%)',
    'linear-gradient(180deg, #f7971e 0%, #ffd200 50%, #fff5b7 100%)',
  ],
  wallpaperIndex: 0,
  darkMode: false,
  appearance: 'tinted', // tinted, light, dark
  accentColor: '#0a84ff',

  init() {
    this.boot();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.initMenuBar();
    this.initSpotlight();
    this.initControlCenter();
    this.initNotifications();
    this.initContextMenu();
    this.setWallpaper(0);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#menubar') && !e.target.closest('.menu-dropdown')) {
        this.closeMenus();
      }
      if (!e.target.closest('#control-center') && !e.target.closest('#control-center-item')) {
        document.getElementById('control-center').classList.add('hidden');
      }
      if (!e.target.closest('#notification-center') && !e.target.closest('#datetime-item')) {
        document.getElementById('notification-center').classList.add('hidden');
      }
      if (!e.target.closest('#context-menu')) {
        document.getElementById('context-menu').classList.add('hidden');
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        this.toggleSpotlight();
      }
      if (e.key === 'Escape') {
        this.closeSpotlight();
        this.closeMenus();
        document.getElementById('context-menu').classList.add('hidden');
      }
    });
  },

  // ============================ BOOT ============================
  boot() {
    const bar = document.getElementById('boot-bar');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15 + Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          document.getElementById('boot-screen').classList.add('hidden');
          this.openApp('finder');
          this.toast('Welcome to macOS Tahoe 26');
        }, 400);
      }
      bar.style.width = progress + '%';
    }, 300);
  },

  // ============================ CLOCK ============================
  updateClock() {
    const now = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;
    const timeStr = `${h12}:${m} ${ampm}`;
    document.getElementById('datetime-text').textContent = timeStr;
    const notifTime = document.getElementById('notif-time');
    const notifDate = document.getElementById('notif-date');
    if (notifTime) notifTime.textContent = timeStr;
    if (notifDate) notifDate.textContent = dateStr;
    // clock hands
    const hourEl = document.getElementById('clock-hour');
    const minEl = document.getElementById('clock-min');
    if (hourEl && minEl) {
      const hourAngle = (h % 12) * 30 + now.getMinutes() * 0.5;
      const minAngle = now.getMinutes() * 6;
      hourEl.setAttribute('transform', `rotate(${hourAngle} 20 20)`);
      minEl.setAttribute('transform', `rotate(${minAngle} 20 20)`);
    }
    const dockDay = document.getElementById('dock-calendar-day');
    if (dockDay) dockDay.textContent = now.getDate();
  },

  // ============================ WALLPAPER ============================
  setWallpaper(index) {
    this.wallpaperIndex = index;
    document.getElementById('wallpaper').style.background = this.wallpapers[index];
  },
  nextWallpaper() {
    this.setWallpaper((this.wallpaperIndex + 1) % this.wallpapers.length);
  },

  // ============================ APP MANAGEMENT ============================
  openApp(appId) {
    if (this.apps[appId]) {
      if (this.windows[appId]) {
        this.focusWindow(appId);
        if (this.windows[appId].minimized) {
          this.windows[appId].minimized = false;
          this.windows[appId].el.classList.remove('minimized', 'minimizing');
        }
        return;
      }
      this.createWindow(appId);
    }
  },

  createWindow(appId) {
    const app = this.apps[appId];
    if (!app) return;

    const win = document.createElement('div');
    win.className = 'window opening';
    const defaults = { width: 800, height: 560, x: 120, y: 60, title: app.name };
    const config = { ...defaults, ...app.windowConfig };
    win.style.width = config.width + 'px';
    win.style.height = config.height + 'px';
    win.style.left = (config.x + Object.keys(this.windows).length * 30) + 'px';
    win.style.top = (config.y + Object.keys(this.windows).length * 30) + 'px';
    win.style.minWidth = (config.minWidth || 320) + 'px';
    win.style.minHeight = (config.minHeight || 200) + 'px';

    const content = app.render ? app.render() : '<div class="window-content"></div>';
    win.innerHTML = `
      <div class="window-titlebar">
        <div class="traffic-lights">
          <div class="traffic-light close" onclick="MacOS.closeWindow('${appId}')" title="Close"><span class="tl-icon close"><svg viewBox="0 0 8 8"><path d="M1 1l6 6M7 1l-6 6" stroke="#000" stroke-width="1.2" stroke-linecap="round"/></svg></span></div>
          <div class="traffic-light minimize" onclick="MacOS.minimizeWindow('${appId}')" title="Minimize"><span class="tl-icon minimize"><svg viewBox="0 0 8 8"><path d="M1 4h6" stroke="#000" stroke-width="1.2" stroke-linecap="round"/></svg></span></div>
          <div class="traffic-light zoom" onclick="MacOS.zoomWindow('${appId}')" title="Zoom"><span class="tl-icon zoom"><svg viewBox="0 0 8 8"><path d="M1 3l3-3M7 3l-3-3M1 5l3 3M7 5l-3 3" stroke="#000" stroke-width="1.2" stroke-linecap="round"/></svg></span></div>
        </div>
        <div class="window-title">${config.title}</div>
        <div class="window-toolbar">${config.toolbar || ''}</div>
      </div>
      <div class="window-content">${content}</div>
      <div class="window-resize n" data-dir="n"></div>
      <div class="window-resize s" data-dir="s"></div>
      <div class="window-resize e" data-dir="e"></div>
      <div class="window-resize w" data-dir="w"></div>
      <div class="window-resize ne" data-dir="ne"></div>
      <div class="window-resize nw" data-dir="nw"></div>
      <div class="window-resize se" data-dir="se"></div>
      <div class="window-resize sw" data-dir="sw"></div>
    `;

    document.getElementById('windows-layer').appendChild(win);
    this.windowZ++;
    win.style.zIndex = this.windowZ;

    const winData = { el: win, appId, config, minimized: false, maximized: false, prevRect: null };
    this.windows[appId] = winData;
    this.activeWindow = appId;
    this.setActiveApp(appId);
    this.updateDockRunning();

    // Dragging
    this.makeDraggable(win, winData);
    // Resizing
    this.makeResizable(win, winData);
    // Focus on click
    win.addEventListener('mousedown', () => this.focusWindow(appId));

    // Init app-specific logic
    if (app.init) {
      setTimeout(() => app.init(win), 10);
    }
    setTimeout(() => win.classList.remove('opening'), 300);
  },

  closeWindow(appId) {
    const win = this.windows[appId];
    if (!win) return;
    win.el.classList.add('closing');
    setTimeout(() => {
      win.el.remove();
      delete this.windows[appId];
      this.updateDockRunning();
      if (this.activeWindow === appId) {
        this.activeWindow = null;
        this.setActiveApp('finder');
      }
    }, 200);
  },

  minimizeWindow(appId) {
    const win = this.windows[appId];
    if (!win) return;
    win.el.classList.add('minimizing');
    setTimeout(() => {
      win.el.classList.remove('minimizing');
      win.el.classList.add('minimized');
      win.minimized = true;
    }, 250);
  },

  zoomWindow(appId) {
    const win = this.windows[appId];
    if (!win) return;
    if (win.maximized) {
      const r = win.prevRect;
      win.el.style.width = r.width + 'px';
      win.el.style.height = r.height + 'px';
      win.el.style.left = r.left + 'px';
      win.el.style.top = r.top + 'px';
      win.maximized = false;
    } else {
      win.prevRect = {
        width: win.el.offsetWidth, height: win.el.offsetHeight,
        left: win.el.offsetLeft, top: win.el.offsetTop
      };
      win.el.style.width = '100%';
      win.el.style.height = (window.innerHeight - 50) + 'px';
      win.el.style.left = '0px';
      win.el.style.top = '28px';
      win.maximized = true;
    }
  },

  focusWindow(appId) {
    const win = this.windows[appId];
    if (!win) return;
    if (win.minimized) {
      win.minimized = false;
      win.el.classList.remove('minimized', 'minimizing');
    }
    this.windowZ++;
    win.el.style.zIndex = this.windowZ;
    this.activeWindow = appId;
    this.setActiveApp(appId);
    document.querySelectorAll('.window').forEach(w => w.classList.add('inactive'));
    win.el.classList.remove('inactive');
  },

  setActiveApp(appId) {
    this.activeApp = appId;
    const app = this.apps[appId];
    const nameEl = document.getElementById('active-app-name');
    nameEl.textContent = app ? app.name : 'Finder';
    // Show/hide app-specific menus
    this.updateMenus();
  },

  updateDockRunning() {
    document.querySelectorAll('.dock-item').forEach(item => {
      const appId = item.dataset.app;
      if (this.windows[appId]) {
        item.classList.add('running');
      } else {
        item.classList.remove('running');
      }
    });
  },

  // ============================ WINDOW DRAGGING ============================
  makeDraggable(win) {
    const titlebar = win.querySelector('.window-titlebar');
    let isDragging = false, startX, startY, startLeft, startTop;
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.traffic-light')) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      startLeft = win.offsetLeft; startTop = win.offsetTop;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    function onMove(e) {
      if (!isDragging) return;
      let nx = startLeft + (e.clientX - startX);
      let ny = startTop + (e.clientY - startY);
      ny = Math.max(28, ny);
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    }
    function onUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
  },

  makeResizable(win) {
    win.querySelectorAll('.window-resize').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const dir = handle.dataset.dir;
        const startX = e.clientX, startY = e.clientY;
        const startW = win.offsetWidth, startH = win.offsetHeight;
        const startL = win.offsetLeft, startT = win.offsetTop;
        const minW = parseInt(win.style.minWidth) || 320;
        const minH = parseInt(win.style.minHeight) || 200;

        function onMove(e) {
          const dx = e.clientX - startX, dy = e.clientY - startY;
          if (dir.includes('e')) { win.style.width = Math.max(minW, startW + dx) + 'px'; }
          if (dir.includes('w')) { const nw = Math.max(minW, startW - dx); win.style.width = nw + 'px'; win.style.left = (startL + (startW - nw)) + 'px'; }
          if (dir.includes('s')) { win.style.height = Math.max(minH, startH + dy) + 'px'; }
          if (dir.includes('n')) { const nh = Math.max(minH, startH - dy); win.style.height = nh + 'px'; win.style.top = Math.max(28, startT + (startH - nh)) + 'px'; }
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  },

  // ============================ MENU BAR ============================
  initMenuBar() {
    document.querySelectorAll('.menu-item[data-menu]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuName = item.dataset.menu;
        this.toggleMenu(menuName, item);
      });
      item.addEventListener('mouseenter', () => {
        if (document.querySelector('.menu-dropdown')) {
          const menuName = item.dataset.menu;
          this.openMenu(menuName, item);
        }
      });
    });
  },

  menuDefinitions: {
    apple: [
      { label: 'About This Mac', action: () => MacOS.openApp('settings') },
      { sep: true },
      { label: 'System Settings…', action: () => MacOS.openApp('settings'), shortcut: '' },
      { label: 'App Store…', action: () => MacOS.toast('App Store coming soon') },
      { sep: true },
      { label: 'Recent Items', disabled: true },
      { sep: true },
      { label: 'Force Quit…', action: () => MacOS.toast('Nothing to force quit'), shortcut: '⌥⌘⎋' },
      { sep: true },
      { label: 'Sleep', action: () => MacOS.sleep() },
      { label: 'Restart…', action: () => { this.toast('Restarting…'); setTimeout(() => location.reload(), 1000); } },
      { label: 'Shut Down…', action: () => MacOS.shutdown() },
      { sep: true },
      { label: 'Lock Screen', action: () => MacOS.lockScreen(), shortcut: '⌃⌘Q' },
      { label: 'Log Out…', action: () => { MacOS.toast('Logging out…'); setTimeout(() => location.reload(), 1000); }, shortcut: '⇧⌘Q' },
    ],
    file: [
      { label: 'New Window', action: () => MacOS.openApp(MacOS.activeApp), shortcut: '⌘N' },
      { label: 'New Tab', action: () => MacOS.toast('New Tab'), shortcut: '⌘T' },
      { sep: true },
      { label: 'Open…', action: () => MacOS.toast('Open'), shortcut: '⌘O' },
      { label: 'Open Recent', disabled: true },
      { sep: true },
      { label: 'Close', action: () => MacOS.closeWindow(MacOS.activeApp), shortcut: '⌘W' },
      { label: 'Save…', action: () => MacOS.toast('Saved'), shortcut: '⌘S' },
      { sep: true },
      { label: 'Page Setup…', disabled: true },
      { label: 'Print…', action: () => MacOS.toast('Printing…'), shortcut: '⌘P' },
    ],
    edit: [
      { label: 'Undo', action: () => document.execCommand('undo'), shortcut: '⌘Z' },
      { label: 'Redo', action: () => document.execCommand('redo'), shortcut: '⇧⌘Z' },
      { sep: true },
      { label: 'Cut', action: () => document.execCommand('cut'), shortcut: '⌘X' },
      { label: 'Copy', action: () => document.execCommand('copy'), shortcut: '⌘C' },
      { label: 'Paste', action: () => document.execCommand('paste'), shortcut: '⌘V' },
      { label: 'Select All', action: () => document.execCommand('selectAll'), shortcut: '⌘A' },
      { sep: true },
      { label: 'Find', action: () => MacOS.toggleSpotlight(), shortcut: '⌘F' },
    ],
    view: [
      { label: 'Toggle Dark Mode', action: () => MacOS.toggleDarkMode(), shortcut: '⌃⌘D' },
      { label: 'Change Wallpaper', action: () => MacOS.nextWallpaper() },
      { sep: true },
      { label: 'Show Desktop', action: () => MacOS.showDesktop() },
      { label: 'Enter Full Screen', action: () => { if (MacOS.activeWindow) MacOS.zoomWindow(MacOS.activeWindow); }, shortcut: '⌃⌘F' },
      { sep: true },
      { label: 'Show All Windows', action: () => MacOS.expose() },
    ],
    window: [
      { label: 'Minimize', action: () => MacOS.minimizeWindow(MacOS.activeApp), shortcut: '⌘M' },
      { label: 'Zoom', action: () => MacOS.zoomWindow(MacOS.activeApp) },
      { sep: true },
      { label: 'Bring All to Front', action: () => { if (MacOS.activeWindow) MacOS.focusWindow(MacOS.activeWindow); } },
    ],
    help: [
      { label: 'macOS Tahoe 26 Help', action: () => MacOS.toast('Help: This is a web recreation of macOS Tahoe 26') },
      { label: 'About This App', action: () => MacOS.toast('macOS Tahoe Web — Liquid Glass Edition') },
      { sep: true },
      { label: 'Keyboard Shortcuts', action: () => MacOS.toast('⌘+Space: Spotlight, ⌘+W: Close, ⌘+M: Minimize') },
    ],
  },

  toggleMenu(name, anchor) {
    const existing = document.querySelector('.menu-dropdown');
    if (existing && existing.dataset.menuName === name) {
      this.closeMenus();
      return;
    }
    this.openMenu(name, anchor);
  },

  openMenu(name, anchor) {
    this.closeMenus();
    const items = this.menuDefinitions[name];
    if (!items) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'menu-dropdown';
    dropdown.dataset.menuName = name;

    items.forEach(item => {
      if (item.sep) {
        const sep = document.createElement('div');
        sep.className = 'menu-separator';
        dropdown.appendChild(sep);
      } else {
        const el = document.createElement('div');
        el.className = 'menu-dropdown-item' + (item.disabled ? ' disabled' : '');
        el.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}`;
        if (!item.disabled && item.action) {
          el.addEventListener('click', () => {
            item.action();
            this.closeMenus();
          });
        }
        dropdown.appendChild(el);
      }
    });

    document.getElementById('menu-dropdown-container').appendChild(dropdown);
    const rect = anchor.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 'px';

    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    anchor.classList.add('active');
    document.getElementById('menubar').classList.add('has-dropdown');
  },

  closeMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(d => d.remove());
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById('menubar').classList.remove('has-dropdown');
  },

  updateMenus() {
    // Menus are dynamically populated; nothing to update statically
  },

  // ============================ SPOTLIGHT ============================
  initSpotlight() {
    const input = document.getElementById('spotlight-input');
    input.addEventListener('input', () => this.searchSpotlight(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const selected = document.querySelector('.spotlight-result.selected') || document.querySelector('.spotlight-result');
        if (selected) {
          const appId = selected.dataset.app;
          if (appId) { this.openApp(appId); this.closeSpotlight(); }
        }
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const results = [...document.querySelectorAll('.spotlight-result')];
        const idx = results.findIndex(r => r.classList.contains('selected'));
        results.forEach(r => r.classList.remove('selected'));
        let next = e.key === 'ArrowDown' ? (idx + 1) % results.length : (idx - 1 + results.length) % results.length;
        if (results[next]) results[next].classList.add('selected');
      }
    });
    document.getElementById('spotlight-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'spotlight-overlay') this.closeSpotlight();
    });
  },

  toggleSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    if (overlay.classList.contains('hidden')) {
      overlay.classList.remove('hidden');
      const input = document.getElementById('spotlight-input');
      input.value = '';
      input.focus();
      this.searchSpotlight('');
    } else {
      this.closeSpotlight();
    }
  },

  closeSpotlight() {
    document.getElementById('spotlight-overlay').classList.add('hidden');
  },

  searchSpotlight(query) {
    const resultsEl = document.getElementById('spotlight-results');
    query = query.toLowerCase().trim();
    const appList = [
      { id: 'finder', name: 'Finder', type: 'App', icon: '🗂️' },
      { id: 'safari', name: 'Safari', type: 'App', icon: '🧭' },
      { id: 'notes', name: 'Notes', type: 'App', icon: '📝' },
      { id: 'calculator', name: 'Calculator', type: 'App', icon: '🧮' },
      { id: 'terminal', name: 'Terminal', type: 'App', icon: '⬛' },
      { id: 'settings', name: 'System Settings', type: 'App', icon: '⚙️' },
      { id: 'photos', name: 'Photos', type: 'App', icon: '📷' },
      { id: 'calendar', name: 'Calendar', type: 'App', icon: '📅' },
      { id: 'music', name: 'Music', type: 'App', icon: '🎵' },
      { id: 'messages', name: 'Messages', type: 'App', icon: '💬' },
      { id: 'weather', name: 'Weather', type: 'App', icon: '🌤️' },
      { id: 'maps', name: 'Maps', type: 'App', icon: '🗺️' },
      { id: 'textedit', name: 'TextEdit', type: 'App', icon: '📄' },
    ];

    const actions = [
      { name: 'Change Wallpaper', type: 'Action', icon: '🎨', action: () => this.nextWallpaper() },
      { name: 'Toggle Dark Mode', type: 'Action', icon: '🌙', action: () => this.toggleDarkMode() },
      { name: 'Lock Screen', type: 'Action', icon: '🔒', action: () => this.lockScreen() },
      { name: 'Sleep', type: 'Action', icon: '😴', action: () => this.sleep() },
      { name: 'Restart', type: 'Action', icon: '🔄', action: () => location.reload() },
    ];

    let results = [];
    if (!query) {
      results = appList.slice(0, 6);
    } else {
      results = [...appList, ...actions].filter(a => a.name.toLowerCase().includes(query));
    }

    resultsEl.innerHTML = results.map((r, i) => `
      <div class="spotlight-result ${i === 0 ? 'selected' : ''}" data-app="${r.id || ''}" data-action="${r.action ? '1' : ''}">
        <span class="result-icon">${r.icon}</span>
        <div>
          <div class="result-name">${r.name}</div>
          <div class="result-type">${r.type}</div>
        </div>
      </div>
    `).join('');

    resultsEl.querySelectorAll('.spotlight-result').forEach(el => {
      el.addEventListener('click', () => {
        const appId = el.dataset.app;
        if (appId) { this.openApp(appId); this.closeSpotlight(); }
        else {
          const action = actions.find(a => a.name === el.querySelector('.result-name').textContent);
          if (action) { action.action(); this.closeSpotlight(); }
        }
      });
    });
  },

  // ============================ CONTROL CENTER ============================
  toggleControlCenter() {
    const cc = document.getElementById('control-center');
    const notif = document.getElementById('notification-center');
    notif.classList.add('hidden');
    cc.classList.toggle('hidden');
  },

  toggleCCToggle(id) {
    const el = document.getElementById(id);
    el.classList.toggle('active');
    const sublabel = el.querySelector('.cc-sublabel');
    if (sublabel) {
      if (id === 'cc-wifi') sublabel.textContent = el.classList.contains('active') ? 'Home' : 'Off';
      if (id === 'cc-bluetooth') sublabel.textContent = el.classList.contains('active') ? 'On' : 'Off';
    }
  },

  // ============================ NOTIFICATIONS ============================
  toggleNotifications() {
    const nc = document.getElementById('notification-center');
    const cc = document.getElementById('control-center');
    cc.classList.add('hidden');
    nc.classList.toggle('hidden');
  },

  initNotifications() {},

  // ============================ CONTEXT MENU ============================
  initContextMenu() {
    document.getElementById('desktop').addEventListener('contextmenu', (e) => {
      if (e.target.closest('.window') || e.target.closest('#menubar') || e.target.closest('#dock-container')) return;
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY, [
        { label: 'New Folder', icon: '📁', action: () => this.toast('New Folder created') },
        { label: 'Get Info', icon: 'ℹ️', action: () => this.toast('Macintosh HD — 500 GB') },
        { sep: true },
        { label: 'Change Desktop Background…', icon: '🎨', action: () => this.nextWallpaper() },
        { label: 'Toggle Dark Mode', icon: '🌙', action: () => this.toggleDarkMode() },
        { sep: true },
        { label: 'Use Stacks', disabled: true },
        { label: 'Sort By', disabled: true },
        { label: 'Clean Up', action: () => this.toast('Desktop cleaned up') },
      ]);
    });
  },

  showContextMenu(x, y, items) {
    const menu = document.getElementById('context-menu');
    menu.innerHTML = '';
    items.forEach(item => {
      if (item.sep) {
        const sep = document.createElement('div');
        sep.className = 'menu-separator';
        menu.appendChild(sep);
      } else {
        const el = document.createElement('div');
        el.className = 'menu-dropdown-item' + (item.disabled ? ' disabled' : '');
        el.innerHTML = `<span>${item.icon || ''} ${item.label}</span>`;
        if (!item.disabled && item.action) {
          el.addEventListener('click', () => { item.action(); menu.classList.add('hidden'); });
        }
        menu.appendChild(el);
      }
    });
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
  },

  // ============================ SYSTEM ACTIONS ============================
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.style.setProperty('--glass-bg', 'rgba(40,40,50,0.35)');
      document.documentElement.style.setProperty('--glass-bg-heavy', 'rgba(40,40,50,0.5)');
      document.documentElement.style.setProperty('--text-primary', '#f5f5f7');
      document.documentElement.style.setProperty('--text-secondary', 'rgba(235,235,245,0.6)');
      document.body.classList.add('dark');
    } else {
      document.documentElement.style.setProperty('--glass-bg', 'rgba(255,255,255,0.18)');
      document.documentElement.style.setProperty('--glass-bg-heavy', 'rgba(255,255,255,0.28)');
      document.documentElement.style.setProperty('--text-primary', '#1d1d1f');
      document.documentElement.style.setProperty('--text-secondary', 'rgba(60,60,67,0.6)');
      document.body.classList.remove('dark');
    }
    this.toast(this.darkMode ? 'Dark Mode On' : 'Dark Mode Off');
  },

  setAppearance(mode) {
    this.appearance = mode;
    this.toast(`Appearance: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  },

  setAccentColor(color) {
    this.accentColor = color;
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-light', color + '40');
  },

  sleep() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;opacity:0;transition:opacity 0.5s;cursor:pointer;';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 10);
    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    });
  },

  shutdown() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1s;';
    overlay.innerHTML = '<svg viewBox="0 0 100 120" style="width:60px;height:72px;opacity:0.5;"><path fill="#fff" d="M70 55c0-12 10-18 10-18-5-8-13-10-16-10-7 0-13 4-17 4s-9-4-15-4c-8 0-15 4-19 12-8 14-2 34 6 46 4 6 8 12 14 12s8-4 14-4 8 4 14 4c6 0 10-6 13-11 4-7 6-13 6-13 0 0-14-6-14-21z"/></svg>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 10);
  },

  lockScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'lock-screen';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:linear-gradient(135deg,#1a1a3e,#5b2a8c,#8e44ad);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;cursor:pointer;opacity:0;transition:opacity 0.5s;';
    const now = new Date();
    const time = now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    overlay.innerHTML = `
      <div style="color:#fff;font-size:72px;font-weight:200;">${time}</div>
      <div style="color:rgba(255,255,255,0.7);font-size:18px;">${now.toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'})}</div>
      <div style="margin-top:40px;color:rgba(255,255,255,0.5);font-size:13px;">Click to unlock</div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 10);
    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    });
  },

  showDesktop() {
    Object.keys(this.windows).forEach(appId => {
      if (!this.windows[appId].minimized) this.minimizeWindow(appId);
    });
  },

  expose() {
    // Simple expose: arrange windows in a row
    const wins = Object.values(this.windows).filter(w => !w.minimized);
    if (wins.length === 0) return;
    const w = window.innerWidth;
    const slotW = w / wins.length;
    wins.forEach((win, i) => {
      win.el.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
      win.el.style.left = (i * slotW + 20) + 'px';
      win.el.style.top = '60px';
      win.el.style.width = (slotW - 40) + 'px';
      win.el.style.height = '300px';
      setTimeout(() => { win.el.style.transition = ''; }, 300);
    });
  },

  toggleTrash() {
    if (this.windows['trash']) {
      this.closeWindow('trash');
    } else {
      this.createWindow('trash');
    }
  },

  // ============================ TOAST ============================
  toast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
  },
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => MacOS.init());
