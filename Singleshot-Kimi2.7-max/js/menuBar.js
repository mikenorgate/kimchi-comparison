const appMenus = {};

export function initMenuBar(apps) {
  setupDropdown('apple-menu', [
    { label: 'About This Mac' },
    { label: 'System Settings...', action: () => apps.settings.open() },
    { divider: true },
    { label: 'App Store...', action: () => apps.appStore.open() },
    { divider: true },
    { label: 'Recent Items', disabled: true },
    { divider: true },
    { label: 'Force Quit...', shortcut: '⌥⌘⎋' },
    { divider: true },
    { label: 'Sleep' },
    { label: 'Restart...' },
    { label: 'Shut Down...' },
    { divider: true },
    { label: 'Lock Screen', shortcut: '⌃⌘Q' },
    { label: 'Log Out User...', shortcut: '⇧⌘Q' }
  ]);

  appMenus.finder = [
    { label: 'About Finder' },
    { divider: true },
    { label: 'Preferences...', shortcut: '⌘,' },
    { divider: true },
    { label: 'Empty Bin...', shortcut: '⇧⌘⌫' },
    { divider: true },
    { label: 'Services' },
    { divider: true },
    { label: 'Hide Finder', shortcut: '⌘H' },
    { label: 'Hide Others', shortcut: '⌥⌘H' },
    { label: 'Show All' },
    { divider: true },
    { label: 'Quit Finder', shortcut: '⌘Q' }
  ];

  appMenus.settings = [
    { label: 'About System Settings' },
    { divider: true },
    { label: 'Preferences...', shortcut: '⌘,' },
    { divider: true },
    { label: 'Hide System Settings', shortcut: '⌘H' },
    { label: 'Quit System Settings', shortcut: '⌘Q' }
  ];

  appMenus.calculator = [
    { label: 'About Calculator' },
    { divider: true },
    { label: 'Hide Calculator', shortcut: '⌘H' },
    { label: 'Quit Calculator', shortcut: '⌘Q' }
  ];

  appMenus.notes = [
    { label: 'About Notes' },
    { divider: true },
    { label: 'Preferences...', shortcut: '⌘,' },
    { divider: true },
    { label: 'Hide Notes', shortcut: '⌘H' },
    { label: 'Quit Notes', shortcut: '⌘Q' }
  ];

  appMenus.safari = [
    { label: 'About Safari' },
    { divider: true },
    { label: 'Preferences...', shortcut: '⌘,' },
    { divider: true },
    { label: 'Hide Safari', shortcut: '⌘H' },
    { label: 'Quit Safari', shortcut: '⌘Q' }
  ];

  appMenus.terminal = [
    { label: 'About Terminal' },
    { divider: true },
    { label: 'Preferences...', shortcut: '⌘,' },
    { divider: true },
    { label: 'Hide Terminal', shortcut: '⌘H' },
    { label: 'Quit Terminal', shortcut: '⌘Q' }
  ];

  appMenus.calendar = [
    { label: 'About Calendar' },
    { divider: true },
    { label: 'Hide Calendar', shortcut: '⌘H' },
    { label: 'Quit Calendar', shortcut: '⌘Q' }
  ];

  appMenus.photos = [
    { label: 'About Photos' },
    { divider: true },
    { label: 'Hide Photos', shortcut: '⌘H' },
    { label: 'Quit Photos', shortcut: '⌘Q' }
  ];

  appMenus.appStore = [
    { label: 'About App Store' },
    { divider: true },
    { label: 'Hide App Store', shortcut: '⌘H' },
    { label: 'Quit App Store', shortcut: '⌘Q' }
  ];

  setupDropdown('app-menu', appMenus.finder);

  setupDropdown('file-menu', [
    { label: 'New Finder Window', shortcut: '⌘N', action: () => apps.finder.open() },
    { label: 'New Folder', shortcut: '⇧⌘N' },
    { label: 'New Smart Folder' },
    { divider: true },
    { label: 'Open', shortcut: '⌘O' },
    { label: 'Close Window', shortcut: '⌘W' },
    { divider: true },
    { label: 'Get Info', shortcut: '⌘I' },
    { divider: true },
    { label: 'Compress' }
  ]);

  setupDropdown('edit-menu', [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⇧⌘Z' },
    { divider: true },
    { label: 'Cut', shortcut: '⌘X' },
    { label: 'Copy', shortcut: '⌘C' },
    { label: 'Paste', shortcut: '⌘V' },
    { label: 'Select All', shortcut: '⌘A' }
  ]);

  setupDropdown('view-menu', [
    { label: 'as Icons', shortcut: '⌘1' },
    { label: 'as List', shortcut: '⌘2' },
    { label: 'as Columns', shortcut: '⌘3' },
    { label: 'as Gallery', shortcut: '⌘4' },
    { divider: true },
    { label: 'Show Preview' },
    { label: 'Show Path Bar' },
    { divider: true },
    { label: 'Enter Full Screen', shortcut: '⌃⌘F' }
  ]);

  setupDropdown('go-menu', [
    { label: 'Back', shortcut: '⌘[' },
    { label: 'Forward', shortcut: '⌘]' },
    { label: 'Enclosing Folder', shortcut: '⌘↑' },
    { divider: true },
    { label: 'Home', shortcut: '⇧⌘H' },
    { label: 'Documents', shortcut: '⇧⌘O' },
    { label: 'Downloads', shortcut: '⌥⌘L' },
    { label: 'Applications', shortcut: '⇧⌘A' }
  ]);

  setupDropdown('window-menu', [
    { label: 'Minimise', shortcut: '⌘M' },
    { label: 'Zoom' },
    { divider: true },
    { label: 'Show Previous Tab', shortcut: '⇧⌃⇥' },
    { label: 'Show Next Tab', shortcut: '⌃⇥' },
    { divider: true },
    { label: 'Bring All to Front' }
  ]);

  setupDropdown('help-menu', [
    { label: 'macOS Help', shortcut: '⌘?' },
    { divider: true },
    { label: "What's New in macOS Tahoe" }
  ]);

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.menu-item.active').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.menu-item.active').forEach(i => i.classList.remove('active'));
  });

  updateClock();
  setInterval(updateClock, 1000);
}

function setupDropdown(id, items) {
  const container = document.getElementById(id);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    if (item.divider) {
      const div = document.createElement('div');
      div.className = 'menu-dropdown-divider';
      container.appendChild(div);
    } else {
      const el = document.createElement('div');
      el.className = 'menu-dropdown-item';
      el.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}`;
      if (item.disabled) el.style.opacity = '0.45';
      else el.addEventListener('click', () => {
        if (item.action) item.action();
        document.querySelectorAll('.menu-item.active').forEach(i => i.classList.remove('active'));
      });
      container.appendChild(el);
    }
  });
}

export function setActiveApp(appId, title) {
  const nameEl = document.getElementById('menu-app-name');
  if (nameEl) nameEl.textContent = title;
  const items = appMenus[appId] || appMenus.finder;
  setupDropdown('app-menu', items);
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const el = document.getElementById('status-time');
  if (el) el.textContent = `${date}  ${time}`;
}
