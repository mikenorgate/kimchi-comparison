/* ============================================
   macOS Tahoe - Core System
   ============================================ */

const Tahoe = {
  // Global state
  state: {
    booted: false,
    activeWindow: null,
    windows: [],
    windows_z: 1000,
    apps: {},
    wallpaper: 'default',
    darkMode: true,
    accentColor: 'blue',
    dockSize: 'normal',
    dockMagnification: true,
    dockPosition: 'bottom',
    dockAutohide: false,
    wifiOn: true,
    bluetoothOn: true,
    airdropOn: true,
    focusMode: false,
    doNotDisturb: false,
    nightShift: false,
    brightness: 80,
    volume: 50,
    batteryLevel: 78,
    batteryCharging: false,
    spotlightOpen: false,
    controlCenterOpen: false,
    notificationsOpen: false,
    currentUser: 'Mike',
    currentWallpaperIndex: 0,
  },

  // Wallpaper options
  wallpapers: ['default', 'sequoia', 'sonoma'],

  // Init the system
  init() {
    this.startBoot();
  },

  // Boot sequence
  startBoot() {
    const bootBar = document.querySelector('.boot-progress-bar');
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');

    setTimeout(() => {
      bootScreen.classList.add('hidden');
      desktop.classList.add('booted');
      this.state.booted = true;
      this.setWallpaper('default');

      // Start clock
      this.startClock();

      // Init all systems
      MenuBar.init();
      Dock.init();
      WindowManager.init();
      this.initApps();

      // Keyboard shortcuts
      this.initKeyboard();

      // Desktop click handler
      document.getElementById('desktop').addEventListener('mousedown', (e) => {
        if (e.target.id === 'desktop' || e.target.classList.contains('wallpaper') || e.target.classList.contains('desktop-icons')) {
          this.closeAllMenus();
          WindowManager.focusWindow(null);
        }
      });

      // Show welcome notification
      setTimeout(() => {
        this.showNotification('Welcome to macOS Tahoe', 'The all-new Liquid Glass interface is ready.');
      }, 1500);
    }, 2600);
  },

  // Set wallpaper
  setWallpaper(name) {
    const wp = document.getElementById('wallpaper');
    wp.className = 'wallpaper ' + name;
    this.state.wallpaper = name;
  },

  // Start clock
  startClock() {
    const update = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];

      // Menu bar clock
      const clockEl = document.getElementById('menu-bar-clock');
      if (clockEl) {
        let h = now.getHours();
        const m = now.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        clockEl.textContent = `${day} ${month} ${date}  ${h}:${m} ${ampm}`;
      }

      // Other clock displays
      document.querySelectorAll('[data-clock]').forEach(el => {
        if (el.dataset.clock === 'world') return;
        const tz = el.dataset.clock;
        const opts = { hour: '2-digit', minute: '2-digit', hour12: true };
        if (tz) opts.timeZone = tz;
        el.textContent = now.toLocaleTimeString('en-US', opts);
      });
    };
    update();
    setInterval(update, 1000);
  },

  // Initialize all apps
  initApps() {
    this.state.apps = {
      finder: { name: 'Finder', icon: Icons.finder, running: true, pinned: true },
      calculator: { name: 'Calculator', icon: Icons.calculator, running: false, pinned: true },
      notes: { name: 'Notes', icon: Icons.notes, running: false, pinned: true },
      terminal: { name: 'Terminal', icon: Icons.terminal, running: false, pinned: true },
      safari: { name: 'Safari', icon: Icons.safari, running: false, pinned: true },
      settings: { name: 'System Settings', icon: Icons.settings, running: false, pinned: true },
      calendar: { name: 'Calendar', icon: Icons.calendar, running: false, pinned: true },
      textedit: { name: 'TextEdit', icon: Icons.textedit, running: false, pinned: true },
      weather: { name: 'Weather', icon: Icons.weather, running: false, pinned: true },
      clock: { name: 'Clock', icon: Icons.clock, running: false, pinned: true },
      music: { name: 'Music', icon: Icons.music, running: false, pinned: true },
      photos: { name: 'Photos', icon: Icons.photos, running: false, pinned: true },
      maps: { name: 'Maps', icon: Icons.maps, running: false, pinned: true },
      mail: { name: 'Mail', icon: Icons.mail, running: false, pinned: true },
      messages: { name: 'Messages', icon: Icons.messages, running: false, pinned: true },
      launchpad: { name: 'Launchpad', icon: Icons.launchpad, running: false, pinned: true },
      trash: { name: 'Trash', icon: Icons.trash, running: false, pinned: true },
      about: { name: 'About This Mac', icon: Icons.apple, running: false, pinned: false },
    };
    Dock.render();
  },

  // Launch an app
  launchApp(appId) {
    const app = this.state.apps[appId];
    if (!app) return;

    // If already running, focus the window
    const existing = this.state.windows.find(w => w.appId === appId);
    if (existing) {
      if (existing.minimized) {
        WindowManager.unminimize(existing.id);
      } else {
        WindowManager.focusWindow(existing.id);
      }
      return;
    }

    // Bounce the dock icon
    const dockItem = document.querySelector(`.dock-item[data-app="${appId}"]`);
    if (dockItem) {
      dockItem.classList.add('bouncing', 'running');
      setTimeout(() => dockItem.classList.remove('bouncing'), 600);
    }

    app.running = true;

    // Create the window
    const config = this.getAppConfig(appId);
    if (config) {
      WindowManager.createWindow(appId, app.name, config);
    }

    // Special handling for non-window apps
    if (appId === 'launchpad') {
      this.showLaunchpad();
      app.running = false;
      const di = document.querySelector(`.dock-item[data-app="launchpad"]`);
      if (di) di.classList.remove('running');
    }
  },

  // Get app window configuration
  getAppConfig(appId) {
    const configs = {
      finder:       { width: 800, height: 520, x: 100, y: 80, minW: 500, minH: 300, render: Finder.render, light: false },
      calculator:   { width: 300, height: 440, x: 200, y: 120, minW: 280, minH: 420, render: Calculator.render, light: false, resizable: false },
      notes:        { width: 720, height: 480, x: 140, y: 100, minW: 500, minH: 300, render: Notes.render, light: false },
      terminal:     { width: 680, height: 420, x: 120, y: 100, minW: 400, minH: 200, render: Terminal.render, light: false },
      safari:       { width: 960, height: 600, x: 80, y: 60, minW: 600, minH: 400, render: Safari.render, light: false },
      settings:     { width: 720, height: 500, x: 120, y: 80, minW: 500, minH: 350, render: Settings.render, light: false },
      calendar:     { width: 820, height: 560, x: 100, y: 60, minW: 600, minH: 400, render: Calendar.render, light: false },
      textedit:     { width: 600, height: 480, x: 160, y: 100, minW: 400, minH: 300, render: TextEdit.render, light: false },
      weather:      { width: 420, height: 560, x: 200, y: 80, minW: 380, minH: 500, render: Weather.render, light: false },
      clock:        { width: 380, height: 500, x: 220, y: 80, minW: 340, minH: 400, render: Clock.render, light: false },
      music:        { width: 840, height: 560, x: 90, y: 60, minW: 600, minH: 400, render: Music.render, light: false },
      photos:       { width: 800, height: 540, x: 100, y: 70, minW: 600, minH: 400, render: Photos.render, light: false },
      maps:         { width: 820, height: 560, x: 90, y: 60, minW: 600, minH: 400, render: Maps.render, light: false },
      mail:         { width: 880, height: 560, x: 80, y: 60, minW: 600, minH: 400, render: Mail.render, light: false },
      messages:     { width: 720, height: 520, x: 120, y: 80, minW: 500, minH: 350, render: Messages.render, light: false },
      about:        { width: 400, height: 360, x: 300, y: 150, minW: 400, minH: 360, render: About.render, light: false, resizable: false },
    };
    return configs[appId] || null;
  },

  // Get app menus
  getAppMenus(appId) {
    const menus = {
      finder: [
        { label: 'File', items: [
          { label: 'New Finder Window', shortcut: '⌘N', action: () => this.launchApp('finder') },
          { label: 'New Folder', shortcut: '⇧⌘N', action: () => Finder.newFolder() },
          { separator: true },
          { label: 'Open', shortcut: '⌘O', action: () => Finder.openSelected() },
          { label: 'Close Window', shortcut: '⌘W', action: () => WindowManager.closeActive() },
        ]},
        { label: 'Edit', items: [
          { label: 'Undo', shortcut: '⌘Z', disabled: true },
          { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
          { separator: true },
          { label: 'Cut', shortcut: '⌘X', disabled: true },
          { label: 'Copy', shortcut: '⌘C', disabled: true },
          { label: 'Paste', shortcut: '⌘V', disabled: true },
        ]},
        { label: 'View', items: [
          { label: 'as Icons', shortcut: '⌘1', action: () => Finder.setView('icons') },
          { label: 'as List', shortcut: '⌘2', action: () => Finder.setView('list') },
          { separator: true },
          { label: 'Show Toolbar', checked: true },
          { label: 'Show Sidebar', checked: true },
          { label: 'Show Path Bar', checked: true },
        ]},
        { label: 'Go', items: [
          { label: 'Back', shortcut: '⌘[', action: () => Finder.back() },
          { label: 'Forward', shortcut: '⌘]', action: () => Finder.forward() },
          { separator: true },
          { label: 'Documents', action: () => Finder.goTo('Documents') },
          { label: 'Desktop', action: () => Finder.goTo('Desktop') },
          { label: 'Downloads', action: () => Finder.goTo('Downloads') },
          { label: 'Applications', shortcut: '⇧⌘A', action: () => Finder.goTo('Applications') },
        ]},
        { label: 'Window', items: [
          { label: 'Minimize', shortcut: '⌘M', action: () => WindowManager.minimizeActive() },
          { label: 'Zoom', action: () => WindowManager.zoomActive() },
        ]},
        { label: 'Help', items: [
          { label: 'macOS Help', shortcut: '⌘?', action: () => this.showNotification('Help', 'macOS Tahoe Help Center') },
        ]},
      ],
    };

    if (menus[appId]) return menus[appId];

    // Default menus for other apps
    const appName = this.state.apps[appId] ? this.state.apps[appId].name : 'App';
    return [
      { label: 'File', items: [
        { label: 'New', shortcut: '⌘N', action: () => {} },
        { label: 'Open...', shortcut: '⌘O', action: () => {} },
        { separator: true },
        { label: 'Close Window', shortcut: '⌘W', action: () => WindowManager.closeActive() },
      ]},
      { label: 'Edit', items: [
        { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo') },
        { separator: true },
        { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
        { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
      ]},
      { label: 'View', items: [
        { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => WindowManager.toggleFullscreen() },
      ]},
      { label: 'Window', items: [
        { label: 'Minimize', shortcut: '⌘M', action: () => WindowManager.minimizeActive() },
        { label: 'Zoom', action: () => WindowManager.zoomActive() },
      ]},
      { label: 'Help', items: [
        { label: appName + ' Help', shortcut: '⌘?', action: () => this.showNotification('Help', appName + ' Help Center') },
      ]},
    ];
  },

  // Apple menu
  getAppleMenu() {
    return [
      { label: 'About This Mac', action: () => this.launchApp('about') },
      { separator: true },
      { label: 'System Settings...', action: () => this.launchApp('settings') },
      { separator: true },
      { label: 'App Store...', action: () => this.showNotification('App Store', 'Coming soon') },
      { separator: true },
      { label: 'Recent Items', submenu: [
        { label: 'Applications', separator: true },
        { label: 'Calculator', action: () => this.launchApp('calculator') },
        { label: 'Notes', action: () => this.launchApp('notes') },
        { label: 'Safari', action: () => this.launchApp('safari') },
        { label: 'Terminal', action: () => this.launchApp('terminal') },
      ]},
      { separator: true },
      { label: 'Force Quit...', shortcut: '⌥⌘⎋', action: () => this.forceQuit() },
      { separator: true },
      { label: 'Sleep', action: () => this.sleep() },
      { label: 'Restart...', action: () => this.restart() },
      { label: 'Shut Down...', action: () => this.shutdown() },
      { separator: true },
      { label: 'Lock Screen', shortcut: '⌃⌘Q', action: () => this.lockScreen() },
      { label: 'Log Out ' + this.state.currentUser + '...', shortcut: '⇧⌘Q', action: () => this.logout() },
    ];
  },

  // Show notification
  showNotification(title, body) {
    const nc = document.getElementById('notification-center');
    if (!nc) return;
    const notif = document.createElement('div');
    notif.className = 'notification-widget';
    notif.style.cssText = 'padding:14px;border-radius:14px;background:rgba(255,255,255,0.1);backdrop-filter:blur(40px);border:0.5px solid rgba(255,255,255,0.1);margin-bottom:8px;';
    notif.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:13px;font-weight:600;flex:1;">${title}</div>
        <div style="font-size:11px;color:var(--text-secondary);now</div>
      </div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${body}</div>
    `;
    nc.appendChild(notif);
    setTimeout(() => { notif.style.transition='opacity 0.5s'; notif.style.opacity='0'; setTimeout(()=>notif.remove(), 500); }, 4000);
  },

  // Close all menus
  closeAllMenus() {
    MenuBar.closeAllMenus();
    this.closeContextMenu();
    if (this.state.spotlightOpen) this.closeSpotlight();
  },

  // Keyboard shortcuts
  initKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Cmd+Space - Spotlight
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        this.toggleSpotlight();
        return;
      }
      // Cmd+Q - Quit (close active window)
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        WindowManager.closeActive();
        return;
      }
      // Cmd+W - Close window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        WindowManager.closeActive();
        return;
      }
      // Cmd+M - Minimize
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        WindowManager.minimizeActive();
        return;
      }
      // Escape - close menus
      if (e.key === 'Escape') {
        this.closeAllMenus();
      }
    });
  },

  // Spotlight
  toggleSpotlight() {
    if (this.state.spotlightOpen) {
      this.closeSpotlight();
    } else {
      this.openSpotlight();
    }
  },

  openSpotlight() {
    const sp = document.getElementById('spotlight');
    sp.style.display = 'flex';
    this.state.spotlightOpen = true;
    const input = document.getElementById('spotlight-input');
    input.value = '';
    input.focus();
    this.renderSpotlightResults('');
  },

  closeSpotlight() {
    const sp = document.getElementById('spotlight');
    sp.style.display = 'none';
    this.state.spotlightOpen = false;
  },

  renderSpotlightResults(query) {
    const results = document.getElementById('spotlight-results');
    query = query.toLowerCase().trim();

    if (!query) {
      results.innerHTML = '<div class="spotlight-results-empty">Type to search apps, files, and more</div>';
      return;
    }

    const matches = [];
    // Search apps
    Object.entries(this.state.apps).forEach(([id, app]) => {
      if (id === 'trash' || id === 'launchpad') return;
      if (app.name.toLowerCase().includes(query)) {
        matches.push({ type: 'Application', name: app.name, icon: app.icon, action: () => { this.launchApp(id); this.closeSpotlight(); } });
      }
    });

    // Search calculator
    if (query.match(/^[\d+\-*/().\s]+$/)) {
      try {
        const result = eval(query);
        if (result !== undefined && !isNaN(result)) {
          matches.push({ type: 'Calculation', name: `${query} = ${result}`, icon: Icons.calculator, action: () => { this.closeSpotlight(); } });
        }
      } catch(e) {}
    }

    // Search definitions
    if (query.length > 2) {
      matches.push({ type: 'Web Search', name: `Search the web for "${query}"`, icon: Icons.safari, action: () => { this.launchApp('safari'); this.closeSpotlight(); } });
    }

    if (matches.length === 0) {
      results.innerHTML = '<div class="spotlight-results-empty">No results found</div>';
      return;
    }

    results.innerHTML = matches.map((m, i) => `
      <div class="spotlight-result-item ${i === 0 ? 'selected' : ''}" data-idx="${i}">
        <div class="result-icon">${m.icon}</div>
        <div>
          <div class="result-name">${m.name}</div>
          <div class="result-type">${m.type}</div>
        </div>
      </div>
    `).join('');

    results.querySelectorAll('.spotlight-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        matches[idx].action();
      });
    });
  },

  // Control Center
  toggleControlCenter() {
    const cc = document.getElementById('control-center');
    if (this.state.controlCenterOpen) {
      cc.style.display = 'none';
      this.state.controlCenterOpen = false;
    } else {
      this.renderControlCenter();
      cc.style.display = 'grid';
      this.state.controlCenterOpen = true;
    }
  },

  renderControlCenter() {
    const cc = document.getElementById('control-center');
    const s = this.state;
    cc.innerHTML = `
      <div class="cc-tile ${s.wifiOn ? 'active' : ''}" onclick="Tahoe.toggleCC('wifiOn')">
        <div class="cc-tile-row">
          <div class="cc-icon-circle">
            <svg viewBox="0 0 16 16"><path d="M8 12.5a1 1 0 100-2 1 1 0 000 2zM8 9.5c1.1 0 2.1.4 2.8 1.2l1.4-1.4C11 7.9 9.6 7.3 8 7.3s-3 .6-4.2 1.8l1.4 1.4c.7-.7 1.7-1 2.8-1zM8 6c2 0 3.8.8 5.2 2.1l1.4-1.4C12.9 4.9 10.6 4 8 4S3.1 4.9 1.4 6.6l1.4 1.4C4.2 6.8 6 6 8 6z"/></svg>
          </div>
          <div>
            <div class="cc-label">Wi-Fi</div>
            <div class="cc-value">${s.wifiOn ? 'Home Network' : 'Off'}</div>
          </div>
        </div>
      </div>
      <div class="cc-tile ${s.bluetoothOn ? 'active' : ''}" onclick="Tahoe.toggleCC('bluetoothOn')">
        <div class="cc-tile-row">
          <div class="cc-icon-circle">
            <svg viewBox="0 0 16 16"><path d="M8 1l4 4-4 3 4 3-4 4V1zm0 7L5 5l1.5-1.5L8 6V8zm0 0l3 3-1.5 1.5L8 10v-2z" fill="currentColor"/></svg>
          </div>
          <div>
            <div class="cc-label">Bluetooth</div>
            <div class="cc-value">${s.bluetoothOn ? 'On' : 'Off'}</div>
          </div>
        </div>
      </div>
      <div class="cc-tile ${s.airdropOn ? 'active' : ''}" onclick="Tahoe.toggleCC('airdropOn')">
        <div class="cc-tile-row">
          <div class="cc-icon-circle">
            <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2"/><path d="M8 4a4 4 0 014 4M8 2a6 6 0 016 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div>
            <div class="cc-label">AirDrop</div>
            <div class="cc-value">${s.airdropOn ? 'Everyone' : 'Off'}</div>
          </div>
        </div>
      </div>
      <div class="cc-tile ${s.focusMode ? 'active' : ''}" onclick="Tahoe.toggleCC('focusMode')">
        <div class="cc-tile-row">
          <div class="cc-icon-circle">
            <svg viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12A5 5 0 118 2a5 5 0 010 11z"/></svg>
          </div>
          <div>
            <div class="cc-label">Focus</div>
            <div class="cc-value">${s.focusMode ? 'On' : 'Off'}</div>
          </div>
        </div>
      </div>
      <div class="cc-tile wide">
        <div class="cc-slider">
          <div class="cc-slider-icon">
            <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>
          </div>
          <div class="cc-slider-track" onclick="Tahoe.setBrightness(event)">
            <div class="cc-slider-fill" style="width:${s.brightness}%"></div>
          </div>
        </div>
        <div class="cc-label">Display</div>
      </div>
      <div class="cc-tile wide">
        <div class="cc-slider">
          <div class="cc-slider-icon">
            <svg viewBox="0 0 16 16"><path d="M3 6v4l3 2V8L3 6zm6-3v10l6-5-6-5z" fill="currentColor"/></svg>
          </div>
          <div class="cc-slider-track" onclick="Tahoe.setVolume(event)">
            <div class="cc-slider-fill" style="width:${s.volume}%"></div>
          </div>
        </div>
        <div class="cc-label">Sound</div>
      </div>
      <div class="cc-tile ${s.darkMode ? 'active' : ''}" onclick="Tahoe.toggleCC('darkMode')" style="grid-column:span 1;">
        <div class="cc-tile-row">
          <div class="cc-icon-circle">
            <svg viewBox="0 0 16 16"><path d="M8 1a7 7 0 000 14 5 5 0 010-10 3 3 0 000-4z"/></svg>
          </div>
          <div>
            <div class="cc-label">Dark Mode</div>
          </div>
        </div>
      </div>
      <div class="cc-tile ${s.nightShift ? 'active' : ''}" onclick="Tahoe.toggleCC('nightShift')">
        <div class="cc-tile-row">
          <div class="cc-icon-circle">
            <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>
          </div>
          <div>
            <div class="cc-label">Night Shift</div>
          </div>
        </div>
      </div>
    `;
  },

  toggleCC(key) {
    this.state[key] = !this.state[key];
    this.renderControlCenter();
    MenuBar.renderRightSide();
    if (key === 'darkMode') {
      WindowManager.updateAllWindowThemes();
    }
  },

  setBrightness(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    this.state.brightness = Math.max(10, Math.min(100, pct));
    document.getElementById('desktop').style.filter = `brightness(${0.4 + this.state.brightness / 100 * 0.6})`;
    this.renderControlCenter();
  },

  setVolume(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    this.state.volume = Math.max(0, Math.min(100, pct));
    this.renderControlCenter();
  },

  // Context menu
  showContextMenu(x, y, items) {
    const cm = document.getElementById('context-menu');
    cm.innerHTML = items.map(item => {
      if (item.separator) return '<div class="dropdown-separator"></div>';
      return `<div class="dropdown-item ${item.disabled ? 'disabled' : ''}" data-action="${item.action ? '1' : '0'}">${item.label}</div>`;
    }).join('');

    cm.style.left = x + 'px';
    cm.style.top = y + 'px';
    cm.style.display = 'block';

    // Adjust if off screen
    const rect = cm.getBoundingClientRect();
    if (rect.right > window.innerWidth) cm.style.left = (window.innerWidth - rect.width - 10) + 'px';
    if (rect.bottom > window.innerHeight) cm.style.top = (window.innerHeight - rect.height - 10) + 'px';

    cm.querySelectorAll('.dropdown-item').forEach((el, i) => {
      const item = items.filter(it => !it.separator)[i];
      if (item && item.action) {
        el.addEventListener('click', () => {
          item.action();
          this.closeContextMenu();
        });
      }
    });
  },

  closeContextMenu() {
    document.getElementById('context-menu').style.display = 'none';
  },

  // System actions
  sleep() {
    this.showNotification('Sleep', 'Display is going to sleep...');
    const desktop = document.getElementById('desktop');
    desktop.style.transition = 'opacity 1s';
    desktop.style.opacity = '0';
    setTimeout(() => {
      desktop.addEventListener('click', () => {
        desktop.style.opacity = '1';
        desktop.removeEventListener('click', arguments.callee);
      }, { once: true });
    }, 1000);
  },

  restart() {
    this.showNotification('Restart', 'Your Mac is restarting...');
    setTimeout(() => location.reload(), 2000);
  },

  shutdown() {
    this.showNotification('Shut Down', 'Your Mac is shutting down...');
    const desktop = document.getElementById('desktop');
    desktop.style.transition = 'opacity 1.5s';
    desktop.style.opacity = '0';
    setTimeout(() => {
      document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;color:#666;font-family:Inter,sans-serif;font-size:14px;">Press the power button to start up your Mac.</div>';
    }, 1500);
  },

  lockScreen() {
    this.showNotification('Lock Screen', 'Screen locked');
  },

  logout() {
    this.showNotification('Log Out', 'Logging out ' + this.state.currentUser + '...');
    setTimeout(() => location.reload(), 1500);
  },

  forceQuit() {
    const items = this.state.windows.map(w => ({
      label: this.state.apps[w.appId].name,
      action: () => { WindowManager.closeWindow(w.id); this.closeContextMenu(); }
    }));
    if (items.length === 0) {
      this.showNotification('Force Quit', 'No applications running');
      return;
    }
    this.showContextMenu(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100, items);
  },

  showLaunchpad() {
    // Create a launchpad overlay
    let lp = document.getElementById('launchpad-overlay');
    if (!lp) {
      lp = document.createElement('div');
      lp.id = 'launchpad-overlay';
      lp.className = 'launchpad-overlay';
      lp.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;opacity:0;transition:opacity 0.3s;';
      document.body.appendChild(lp);
    }

    const appIds = Object.keys(this.state.apps).filter(id => id !== 'trash' && id !== 'launchpad');
    lp.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:40px 60px;max-width:800px;">
        ${appIds.map(id => {
          const app = this.state.apps[id];
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;" data-app="${id}">
            <div style="width:80px;height:80px;">${app.icon}</div>
            <div style="font-size:12px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${app.name}</div>
          </div>`;
        }).join('')}
      </div>
    `;

    lp.style.opacity = '0';
    lp.style.display = 'flex';
    requestAnimationFrame(() => { lp.style.opacity = '1'; });

    lp.querySelectorAll('[data-app]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.app;
        lp.style.opacity = '0';
        setTimeout(() => lp.style.display = 'none', 300);
        this.launchApp(id);
      });
    });

    lp.addEventListener('click', (e) => {
      if (e.target === lp) {
        lp.style.opacity = '0';
        setTimeout(() => lp.style.display = 'none', 300);
      }
    });
  },
};

/* ============================================
   SVG Icon Library
   ============================================ */
const Icons = {
  apple: `<svg viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg"><path d="M150.37,130.25c-2.45,5.66-5.35,10.87-8.71,15.66c-4.58,6.53-8.33,11.05-11.22,13.56 c-4.48,4.12-9.28,6.23-14.42,6.35c-3.69,0-8.14-1.05-13.32-3.18c-5.19-2.12-9.96-3.17-14.34-3.17c-4.58,0-9.5,1.05-14.76,3.17 c-5.27,2.13-9.52,3.24-12.78,3.35c-4.93,0.21-9.84-1.96-14.75-6.52c-3.13-2.73-7.03-7.41-11.7-14.04 c-5.02-7.08-9.15-15.29-12.39-24.67c-3.46-10.12-5.19-19.92-5.19-29.43c0-10.88,2.35-20.26,7.06-28.12 c3.7-6.31,8.62-11.29,14.78-14.95c6.16-3.66,12.81-5.52,19.97-5.64c3.91,0,9.04,1.21,15.42,3.59 c6.35,2.39,10.42,3.6,12.18,3.6c1.33,0,5.84-1.42,13.48-4.24c7.21-2.61,13.29-3.69,18.25-3.28 c13.5,1.09,23.65,6.41,30.39,16.01c-12.07,7.31-18.04,17.56-17.91,30.71c0.12,10.24,3.82,18.76,11.08,25.51 c3.29,3.13,6.97,5.55,11.08,7.27C155.48,121.13,153.06,125.82,150.37,130.25z M116.53,5.99 c0,8.03-2.93,15.53-8.79,22.48c-7.07,8.26-15.62,13.03-24.87,12.28c-0.12-0.96-0.18-1.97-0.18-3.03 c0-7.71,3.36-15.97,9.34-22.73c2.98-3.42,6.77-6.26,11.37-8.52c4.59-2.22,8.93-3.45,13.01-3.66 C116.44,3.85,116.53,4.92,116.53,5.99z"/></svg>`,
  
  finder: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="finder-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3aa9ff"/><stop offset="100%" stop-color="#0066cc"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#finder-grad)"/><rect x="4" y="4" width="56" height="28" rx="14" fill="rgba(255,255,255,0.15)"/><path d="M20 18 Q20 14 22 14 Q24 14 24 18 L24 30 Q24 34 22 34 Q20 34 20 30 Z" fill="#fff"/><path d="M40 18 Q40 14 42 14 Q44 14 44 18 L44 30 Q44 34 42 34 Q40 34 40 30 Z" fill="#fff"/><path d="M28 40 Q32 44 36 40" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  calculator: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="calc-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4a4a4a"/><stop offset="100%" stop-color="#1a1a1a"/></linearGradient></defs><rect x="6" y="4" width="52" height="56" rx="10" fill="url(#calc-grad)"/><rect x="12" y="10" width="40" height="14" rx="3" fill="#0a0a0a"/><text x="48" y="21" font-family="Inter,sans-serif" font-size="12" fill="#4af626" text-anchor="end">0</text><circle cx="16" cy="34" r="4" fill="#ff9f0a"/><circle cx="32" cy="34" r="4" fill="#333"/><circle cx="48" cy="34" r="4" fill="#333"/><circle cx="16" cy="48" r="4" fill="#333"/><circle cx="32" cy="48" r="4" fill="#333"/><circle cx="48" cy="48" r="4" fill="#ff9f0a"/></svg>`,
  
  notes: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="notes-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff5b8"/><stop offset="100%" stop-color="#ffd60a"/></linearGradient></defs><rect x="8" y="4" width="48" height="56" rx="6" fill="url(#notes-grad)"/><rect x="8" y="4" width="48" height="12" rx="6" fill="#f5a623"/><line x1="16" y1="24" x2="48" y2="24" stroke="#d4a000" stroke-width="2"/><line x1="16" y1="32" x2="48" y2="32" stroke="#d4a000" stroke-width="2"/><line x1="16" y1="40" x2="40" y2="40" stroke="#d4a000" stroke-width="2"/><line x1="16" y1="48" x2="36" y2="48" stroke="#d4a000" stroke-width="2"/></svg>`,
  
  terminal: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="term-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#2a2a2a"/><stop offset="100%" stop-color="#0a0a0a"/></linearGradient></defs><rect x="4" y="8" width="56" height="48" rx="8" fill="url(#term-grad)"/><rect x="4" y="8" width="56" height="12" rx="8" fill="#3a3a3a"/><circle cx="12" cy="14" r="2" fill="#ff5f57"/><circle cx="20" cy="14" r="2" fill="#febc2e"/><circle cx="28" cy="14" r="2" fill="#28c840"/><text x="12" y="38" font-family="monospace" font-size="14" fill="#4af626">&gt;_</text></svg>`,
  
  safari: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="safari-grad" cx="50%" cy="50%"><stop offset="0%" stop-color="#1a9fff"/><stop offset="100%" stop-color="#0066cc"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#safari-grad)"/><circle cx="32" cy="32" r="24" fill="#0a4d9e"/><circle cx="32" cy="32" r="20" fill="#e8e8e8"/><polygon points="32,32 44,20 36,36" fill="#ff3b30"/><polygon points="32,32 20,44 28,28" fill="#fff"/><text x="32" y="20" font-family="Inter,sans-serif" font-size="6" fill="#888" text-anchor="middle">12</text><text x="44" y="35" font-family="Inter,sans-serif" font-size="6" fill="#888" text-anchor="middle">3</text><text x="32" y="50" font-family="Inter,sans-serif" font-size="6" fill="#888" text-anchor="middle">6</text><text x="20" y="35" font-family="Inter,sans-serif" font-size="6" fill="#888" text-anchor="middle">9</text></svg>`,
  
  settings: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="set-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8a8a8a"/><stop offset="100%" stop-color="#4a4a4a"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#set-grad)"/><path d="M32 18c1 0 2 .2 3 .5l2-3.5 4 2.3-2 3.5c1.4 1 2.5 2.3 3.3 3.8l4-.5.7 4.6-4 .5c-.1 1.7-.6 3.3-1.4 4.7l3 2.8-3.1 3.4-3-2.8c-1.3 1-2.8 1.7-4.5 2l-.5 4-4.6-.5.5-4c-1.7-.4-3.2-1.2-4.5-2.3l-3 2.8-3.1-3.4 3-2.8c-.8-1.4-1.3-3-1.4-4.7l-4-.5.7-4.6 4 .5c.8-1.5 1.9-2.8 3.3-3.8l-2-3.5 4-2.3 2 3.5c1-.3 2-.5 3-.5zm0 8a6 6 0 100 12 6 6 0 000-12z" fill="#fff"/></svg>`,
  
  calendar: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cal-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e0e0e0"/></linearGradient></defs><rect x="6" y="8" width="52" height="52" rx="8" fill="url(#cal-grad)"/><rect x="6" y="8" width="52" height="14" rx="8" fill="#ff3b30"/><rect x="6" y="16" width="52" height="6" fill="#ff3b30"/><text x="32" y="44" font-family="Inter,sans-serif" font-size="24" font-weight="300" fill="#333" text-anchor="middle">${new Date().getDate()}</text></svg>`,
  
  textedit: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="te-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#e8e8e8"/><stop offset="100%" stop-color="#b0b0b0"/></linearGradient></defs><rect x="8" y="6" width="48" height="52" rx="4" fill="url(#te-grad)"/><path d="M16 18 L40 18 M16 26 L48 26 M16 34 L48 34 M16 42 L44 42 M16 50 L36 50" stroke="#666" stroke-width="2" stroke-linecap="round"/><path d="M44 12 L52 4 L56 8 L48 16 L40 18 Z" fill="#ff9f0a"/></svg>`,
  
  weather: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="w-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#2196f3"/><stop offset="100%" stop-color="#0d47a1"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#w-grad)"/><circle cx="24" cy="26" r="10" fill="#ffd60a"/><path d="M20 44 Q14 44 14 38 Q14 32 20 32 Q22 28 28 28 Q36 28 38 34 Q46 34 46 42 Q46 48 40 48 L20 48 Q16 48 16 44 Q16 44 20 44 Z" fill="#fff"/></svg>`,
  
  clock: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="clk-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1a1a1a"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#clk-grad)"/><circle cx="32" cy="32" r="22" fill="#fff"/><circle cx="32" cy="32" r="20" fill="none" stroke="#333" stroke-width="1"/><line x1="32" y1="32" x2="32" y2="16" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="32" x2="44" y2="32" stroke="#333" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="2" fill="#ff9f0a"/></svg>`,
  
  music: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mus-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fa233b"/><stop offset="100%" stop-color="#f60256"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#mus-grad)"/><path d="M26 16 L44 12 L44 40 Q44 46 38 46 Q32 46 32 40 Q32 36 38 36 Q40 36 42 37 L42 20 L30 23 L30 44 Q30 50 24 50 Q18 50 18 44 Q18 40 24 40 Q26 40 28 41 L28 16 Z" fill="#fff"/></svg>`,
  
  photos: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ph-grad" cx="50%" cy="50%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#e8e8e8"/></radialGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="#fff"/><g transform="translate(32 32)"><circle r="6" cx="0" cy="-16" fill="#ffd60a"/><circle r="6" cx="14" cy="-8" fill="#ff9f0a"/><circle r="6" cx="14" cy="8" fill="#ff453a"/><circle r="6" cx="0" cy="16" fill="#ff2d55"/><circle r="6" cx="-14" cy="8" fill="#bf5af2"/><circle r="6" cx="-14" cy="-8" fill="#0a84ff"/><circle r="8" cx="0" cy="0" fill="#fff" stroke="#ccc" stroke-width="1"/></g></svg>`,
  
  maps: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="map-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a8d8a8"/><stop offset="100%" stop-color="#7ab87a"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#map-grad)"/><path d="M10 20 L24 16 L40 22 L54 18 L54 48 L40 52 L24 46 L10 50 Z" fill="#b8d8e8" stroke="#8ab8c8" stroke-width="0.5"/><path d="M24 16 L24 46 M40 22 L40 52" stroke="#8ab8c8" stroke-width="0.5" fill="none"/><circle cx="32" cy="32" r="4" fill="#ff3b30"/><path d="M32 28 Q28 28 28 24 Q28 18 32 14 Q36 18 36 24 Q36 28 32 28 Z" fill="#ff3b30"/></svg>`,
  
  mail: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mail-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4ac8ff"/><stop offset="100%" stop-color="#0080ff"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#mail-grad)"/><rect x="10" y="18" width="44" height="28" rx="3" fill="#fff"/><path d="M10 20 L32 36 L54 20" fill="none" stroke="#0080ff" stroke-width="2"/><path d="M10 46 L24 32 M54 46 L40 32" fill="none" stroke="#0080ff" stroke-width="1" opacity="0.5"/></svg>`,
  
  messages: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="msg-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#5ee86e"/><stop offset="100%" stop-color="#2ad450"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#msg-grad)"/><path d="M32 14 Q18 14 18 26 Q18 36 28 38 L28 46 L36 38 Q46 34 46 26 Q46 14 32 14 Z" fill="#fff"/></svg>`,
  
  launchpad: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lp-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#888"/><stop offset="100%" stop-color="#444"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#lp-grad)"/><g fill="rgba(255,255,255,0.8)"><rect x="14" y="14" width="10" height="10" rx="2"/><rect x="27" y="14" width="10" height="10" rx="2"/><rect x="40" y="14" width="10" height="10" rx="2"/><rect x="14" y="27" width="10" height="10" rx="2"/><rect x="27" y="27" width="10" height="10" rx="2"/><rect x="40" y="27" width="10" height="10" rx="2"/><rect x="14" y="40" width="10" height="10" rx="2"/><rect x="27" y="40" width="10" height="10" rx="2"/><rect x="40" y="40" width="10" height="10" rx="2"/></g></svg>`,
  
  trash: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="trash-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#e8e8e8"/><stop offset="100%" stop-color="#b0b0b0"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#trash-grad)"/><path d="M20 24 L22 50 Q22 54 26 54 L38 54 Q42 54 42 50 L44 24 Z" fill="#666"/><path d="M18 20 L46 20" stroke="#666" stroke-width="3" stroke-linecap="round"/><path d="M26 20 L26 16 Q26 14 28 14 L36 14 Q38 14 38 16 L38 20" fill="none" stroke="#666" stroke-width="2"/><line x1="28" y1="28" x2="28" y2="50" stroke="#999" stroke-width="1.5"/><line x1="32" y1="28" x2="32" y2="50" stroke="#999" stroke-width="1.5"/><line x1="36" y1="28" x2="36" y2="50" stroke="#999" stroke-width="1.5"/></svg>`,
  
  // Menu bar icons
  wifi: `<svg class="stroke" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M1 6 Q9 -1 17 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3.5 9 Q9 3 14.5 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 12 Q9 8.5 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/></svg>`,
  
  battery: `<svg viewBox="0 0 28 14" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="1" width="24" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><rect x="2" y="3" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="25" y="4.5" width="2" height="5" rx="1" fill="currentColor" opacity="0.5"/></svg>`,
  
  search: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  
  controlcenter: `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="6" height="6" rx="2" fill="currentColor" opacity="0.5"/><rect x="10" y="2" width="6" height="6" rx="2" fill="currentColor"/><rect x="2" y="10" width="6" height="6" rx="2" fill="currentColor"/><rect x="10" y="10" width="6" height="6" rx="2" fill="currentColor" opacity="0.5"/></svg>`,
  
  spotlight: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  
  // Folder icons
  folder: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fld-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#7ab8ff"/><stop offset="100%" stop-color="#3a9bff"/></linearGradient></defs><path d="M6 14 Q6 10 10 10 L24 10 L28 14 L54 14 Q58 14 58 18 L58 48 Q58 52 54 52 L10 52 Q6 52 6 48 Z" fill="url(#fld-grad)"/><path d="M6 18 L58 18 L58 22 L6 22 Z" fill="rgba(255,255,255,0.2)"/></svg>`,
  
  file: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M14 6 L40 6 L52 18 L52 56 Q52 60 48 60 L14 60 Q10 60 10 56 L10 10 Q10 6 14 6 Z" fill="#e8e8e8"/><path d="M40 6 L40 18 L52 18 Z" fill="#b0b0b0"/><line x1="18" y1="28" x2="44" y2="28" stroke="#888" stroke-width="2"/><line x1="18" y1="36" x2="44" y2="36" stroke="#888" stroke-width="2"/><line x1="18" y1="44" x2="36" y2="44" stroke="#888" stroke-width="2"/></svg>`,
  
  app: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="52" height="52" rx="12" fill="#8a8a8a"/><path d="M32 18 L32 46 M18 32 L46 32" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  
  image: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="52" height="44" rx="4" fill="#fff"/><rect x="6" y="10" width="52" height="44" rx="4" fill="none" stroke="#ccc" stroke-width="1"/><circle cx="20" cy="24" r="4" fill="#ffd60a"/><path d="M10 48 L24 34 L34 44 L46 28 L54 38 L54 50 L10 50 Z" fill="#4ac8ff"/></svg>`,
  
  // Common UI icons
  back: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M10 3 L4 8 L10 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  forward: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6 3 L12 8 L6 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  reload: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M13 8 A5 5 0 1 1 8 3 L8 1 L12 3 L8 5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  share: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 2 L8 10 M5 5 L8 2 L11 5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="10" width="10" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`,
  add: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 3 L8 13 M3 8 L13 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  play: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 3 L13 8 L4 13 Z" fill="currentColor"/></svg>`,
  pause: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor"/><rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor"/></svg>`,
  next: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 3 L11 8 L3 13 Z" fill="currentColor"/><rect x="12" y="3" width="2" height="10" rx="1" fill="currentColor"/></svg>`,
  prev: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M13 3 L5 8 L13 13 Z" fill="currentColor"/><rect x="2" y="3" width="2" height="10" rx="1" fill="currentColor"/></svg>`,
  list: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="1.5"/></svg>`,
  grid: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="4" height="4" rx="1" fill="currentColor"/><rect x="10" y="2" width="4" height="4" rx="1" fill="currentColor"/><rect x="2" y="10" width="4" height="4" rx="1" fill="currentColor"/><rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor"/></svg>`,
  lock: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M5 7 V5 A3 3 0 0 1 11 5 V7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
};
