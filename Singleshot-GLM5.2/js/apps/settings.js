/* ============================================
   App: System Settings
   ============================================ */

const Settings = {
  activeSection: 'appearance',

  sections: [
    { id: 'appearance', name: 'Appearance', icon: '🎨', color: '#000', items: [
      { name: 'Dark Mode', type: 'segmented', options: ['Light', 'Dark', 'Auto'], key: 'darkMode' },
      { name: 'Accent Color', type: 'colorPicker', key: 'accentColor' },
      { name: 'Show scroll bars', type: 'segmented', options: ['Automatically', 'When scrolling', 'Always'] },
    ]},
    { id: 'wallpaper', name: 'Wallpaper', icon: '🖼', color: '#0066cc', items: [] },
    { id: 'dock', name: 'Desktop & Dock', icon: '📊', color: '#0066cc', items: [
      { name: 'Dock Size', type: 'slider', value: 50 },
      { name: 'Magnification', type: 'toggle', key: 'dockMagnification' },
      { name: 'Position on screen', type: 'segmented', options: ['Left', 'Bottom', 'Right'] },
      { name: 'Minimize windows using', type: 'dropdown', options: ['Genie Effect', 'Scale Effect'] },
      { name: 'Automatically hide and show the Dock', type: 'toggle', key: 'dockAutohide' },
    ]},
    { id: 'wifi', name: 'Wi-Fi', icon: '📶', color: '#0066cc', items: [
      { name: 'Wi-Fi', type: 'toggle', key: 'wifiOn' },
    ]},
    { id: 'bluetooth', name: 'Bluetooth', icon: '🔵', color: '#0066cc', items: [
      { name: 'Bluetooth', type: 'toggle', key: 'bluetoothOn' },
    ]},
    { id: 'network', name: 'Network', icon: '🌐', color: '#8e8e93', items: [] },
    { id: 'notifications', name: 'Notifications', icon: '🔔', color: '#ff3b30', items: [] },
    { id: 'sound', name: 'Sound', icon: '🔊', color: '#ff2d55', items: [
      { name: 'Output Volume', type: 'slider', key: 'volume' },
      { name: 'Alert Volume', type: 'slider', value: 60 },
      { name: 'Play sound on startup', type: 'toggle', value: true },
    ]},
    { id: 'focus', name: 'Focus', icon: '🌙', color: '#5e5ce6', items: [
      { name: 'Do Not Disturb', type: 'toggle', key: 'doNotDisturb' },
      { name: 'Focus', type: 'toggle', key: 'focusMode' },
    ]},
    { id: 'battery', name: 'Battery', icon: '🔋', color: '#30d158', items: [
      { name: 'Low Power Mode', type: 'toggle', value: false },
      { name: 'Battery Level', type: 'display', value: '78%' },
    ]},
    { id: 'general', name: 'General', icon: '⚙️', color: '#8e8e93', items: [
      { name: 'About', type: 'display', value: 'macOS Tahoe 26.0' },
      { name: 'Software Update', type: 'display', value: 'Your Mac is up to date' },
      { name: 'Storage', type: 'display', value: '248 GB available' },
      { name: 'Apple Account', type: 'display', value: 'mike@apple.com' },
    ]},
  ],

  wallpaperOptions: [
    { id: 'default', name: 'Tahoe', colors: 'linear-gradient(135deg, #1a0033, #001a44, #0a0024, #1a0040)' },
    { id: 'sequoia', name: 'Sequoia', colors: 'linear-gradient(135deg, #2a0a14, #4a1500, #6a1b00, #8a2a00)' },
    { id: 'sonoma', name: 'Sonoma', colors: 'linear-gradient(135deg, #1a0024, #240034, #1a0030, #2a0040)' },
  ],

  accentColors: [
    { id: 'blue', color: '#0a84ff' },
    { id: 'purple', color: '#a855f7' },
    { id: 'pink', color: '#ec4899' },
    { id: 'red', color: '#ff453a' },
    { id: 'orange', color: '#ff9f0a' },
    { id: 'yellow', color: '#ffd60a' },
    { id: 'green', color: '#30d158' },
    { id: 'graphite', color: '#8e8e93' },
  ],

  render(container, winData) {
    container.innerHTML = `
      <div class="settings-app">
        <div class="settings-sidebar">
          <div class="settings-profile">
            <div class="settings-profile-avatar">M</div>
            <div>
              <div style="font-size:13px;font-weight:600;">${Tahoe.state.currentUser}</div>
              <div style="font-size:11px;color:var(--text-secondary);">Apple Account</div>
            </div>
          </div>
          <input type="text" class="settings-search" placeholder="Search" id="${winData.id}-search">
          <div id="${winData.id}-list">
            ${this.sections.map(s => `
              <div class="settings-item ${s.id === this.activeSection ? 'active' : ''}" data-section="${s.id}">
                <div class="settings-icon" style="background:${s.color};">${this.getSectionIcon(s.id)}</div>
                <span>${s.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="settings-main" id="${winData.id}-main"></div>
      </div>
    `;

    this.renderSection(winData);
    this.attachEvents(winData);
  },

  getSectionIcon(id) {
    const icons = {
      appearance: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M8 2 A6 6 0 0 1 8 14 Z" fill="#fff"/></svg>`,
      wallpaper: `<svg viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="5" cy="6" r="1.5" fill="#fff"/><path d="M2 12 L6 8 L10 12 L14 7" fill="none" stroke="#fff" stroke-width="1.5"/></svg>`,
      dock: `<svg viewBox="0 0 16 16"><rect x="2" y="9" width="12" height="4" rx="1" fill="#fff" opacity="0.4"/><rect x="3" y="6" width="2" height="7" rx="1" fill="#fff"/><rect x="6" y="5" width="2" height="8" rx="1" fill="#fff"/><rect x="9" y="7" width="2" height="6" rx="1" fill="#fff"/><rect x="12" y="6" width="1" height="7" rx="1" fill="#fff"/></svg>`,
      wifi: `<svg viewBox="0 0 16 16"><path d="M2 6 Q8 1 14 6 M4 9 Q8 5 12 9 M6 12 Q8 10 10 12" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="13.5" r="1" fill="#fff"/></svg>`,
      bluetooth: `<svg viewBox="0 0 16 16"><path d="M6 3 L10 5 L6 7 L10 9 L6 11 L10 13 L6 15" fill="none" stroke="#fff" stroke-width="1.5"/></svg>`,
      network: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="#fff"/><circle cx="3" cy="3" r="1.5" fill="#fff"/><circle cx="13" cy="3" r="1.5" fill="#fff"/><circle cx="3" cy="13" r="1.5" fill="#fff"/><circle cx="13" cy="13" r="1.5" fill="#fff"/><line x1="8" y1="8" x2="3" y2="3" stroke="#fff" stroke-width="1"/><line x1="8" y1="8" x2="13" y2="3" stroke="#fff" stroke-width="1"/><line x1="8" y1="8" x2="3" y2="13" stroke="#fff" stroke-width="1"/><line x1="8" y1="8" x2="13" y2="13" stroke="#fff" stroke-width="1"/></svg>`,
      notifications: `<svg viewBox="0 0 16 16"><path d="M8 1 Q4 1 4 5 V9 L3 11 H13 L12 9 V5 Q12 1 8 1 Z" fill="#fff"/><circle cx="8" cy="14" r="1.5" fill="#fff"/></svg>`,
      sound: `<svg viewBox="0 0 16 16"><path d="M3 6 V10 H6 L10 13 V3 L6 6 Z" fill="#fff"/><path d="M12 5 Q14 8 12 11" fill="none" stroke="#fff" stroke-width="1.5"/></svg>`,
      focus: `<svg viewBox="0 0 16 16"><path d="M8 1 A7 7 0 1 0 8 15 Q5 12 5 8 Q5 4 8 1 Z" fill="#fff"/></svg>`,
      battery: `<svg viewBox="0 0 16 16"><rect x="1" y="4" width="12" height="8" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="13" y="6" width="2" height="4" rx="1" fill="#fff"/><rect x="3" y="6" width="8" height="4" rx="1" fill="#fff"/></svg>`,
      general: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M8 1 V3 M8 13 V15 M1 8 H3 M13 8 H15 M3 3 L4.5 4.5 M11.5 11.5 L13 13 M3 13 L4.5 11.5 M11.5 4.5 L13 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    };
    return icons[id] || '';
  },

  renderSection(winData) {
    const main = document.getElementById(`${winData.id}-main`);
    if (!main) return;
    const section = this.sections.find(s => s.id === this.activeSection);

    if (this.activeSection === 'wallpaper') {
      main.innerHTML = this.renderWallpaperSection();
      this.attachWallpaperEvents(winData);
      return;
    }

    if (this.activeSection === 'wifi') {
      main.innerHTML = this.renderWifiSection(winData);
      return;
    }

    if (this.activeSection === 'bluetooth') {
      main.innerHTML = this.renderBluetoothSection(winData);
      return;
    }

    if (this.activeSection === 'battery') {
      main.innerHTML = this.renderBatterySection();
      return;
    }

    // Default settings rendering
    main.innerHTML = `
      <div class="settings-section-title">${section.name}</div>
      <div class="settings-group">
        ${section.items.map(item => this.renderSettingRow(item, winData)).join('')}
      </div>
    `;
    this.attachRowEvents(winData);
  },

  renderSettingRow(item, winData) {
    let control = '';
    switch (item.type) {
      case 'toggle':
        const isOn = item.key ? Tahoe.state[item.key] : item.value;
        control = `<div class="toggle-switch ${isOn ? 'on' : ''}" data-key="${item.key || ''}"></div>`;
        break;
      case 'slider':
        const val = item.key ? Tahoe.state[item.key] : item.value;
        control = `
          <div style="width:120px;">
            <div class="cc-slider-track" data-key="${item.key || ''}" data-slider="1">
              <div class="cc-slider-fill" style="width:${val}%"></div>
            </div>
          </div>`;
        break;
      case 'segmented':
        const current = item.key ? (Tahoe.state[item.key] ? 1 : 0) : 0;
        control = `
          <div class="segmented-control">
            ${item.options.map((opt, i) => `
              <button class="segment-btn ${i === current ? 'active' : ''}" data-opt="${opt}" data-key="${item.key || ''}">${opt}</button>
            `).join('')}
          </div>`;
        break;
      case 'colorPicker':
        control = `
          <div style="display:flex;gap:8px;">
            ${this.accentColors.map(c => `
              <div style="width:24px;height:24px;border-radius:50%;background:${c.color};cursor:pointer;border:2px solid ${Tahoe.state.accentColor === c.id ? '#fff' : 'transparent'};" data-accent="${c.id}"></div>
            `).join('')}
          </div>`;
        break;
      case 'dropdown':
        control = `<select style="background:rgba(255,255,255,0.1);color:#fff;border:0.5px solid rgba(255,255,255,0.15);border-radius:6px;padding:4px 8px;font-family:inherit;font-size:13px;">${item.options.map(o => `<option>${o}</option>`).join('')}</select>`;
        break;
      case 'display':
        control = `<span style="color:var(--text-secondary);">${item.value}</span>`;
        break;
      default:
        control = '';
    }

    return `
      <div class="settings-row">
        <span class="row-label">${item.name}</span>
        <div class="row-control">${control}</div>
      </div>
    `;
  },

  renderWallpaperSection() {
    return `
      <div class="settings-section-title">Wallpaper</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
        ${this.wallpaperOptions.map(wp => `
          <div data-wallpaper="${wp.id}" style="cursor:pointer;">
            <div style="aspect-ratio:16/10;background:${wp.colors};border-radius:12px;border:2px solid ${Tahoe.state.wallpaper === wp.id ? '#fff' : 'rgba(255,255,255,0.1)'};margin-bottom:8px;"></div>
            <div style="font-size:13px;text-align:center;">${wp.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  attachWallpaperEvents(winData) {
    const main = document.getElementById(`${winData.id}-main`);
    if (!main) return;
    main.querySelectorAll('[data-wallpaper]').forEach(el => {
      el.addEventListener('click', () => {
        Tahoe.setWallpaper(el.dataset.wallpaper);
        this.renderSection(winData);
      });
    });
  },

  renderWifiSection(winData) {
    const networks = [
      { name: 'Home Network', strength: 4, secured: true, connected: true },
      { name: 'Neighbor_5G', strength: 3, secured: true },
      { name: 'Coffee Shop WiFi', strength: 2, secured: false },
      { name: 'Xfinity Hotspot', strength: 2, secured: false },
      { name: 'Linksys-2847', strength: 1, secured: true },
    ];

    return `
      <div class="settings-section-title">Wi-Fi</div>
      <div class="settings-group">
        <div class="settings-row">
          <span class="row-label">Wi-Fi</span>
          <div class="toggle-switch ${Tahoe.state.wifiOn ? 'on' : ''}" data-key="wifiOn"></div>
        </div>
      </div>
      ${Tahoe.state.wifiOn ? `
        <div class="settings-section-title" style="font-size:14px;margin-top:16px;">Networks</div>
        <div class="settings-group">
          ${networks.map(net => `
            <div class="settings-row" style="cursor:pointer;">
              ${net.connected ? '<span style="color:var(--accent-blue);">✓</span>' : '<span style="width:16px;"></span>'}
              <span class="row-label">${net.name}</span>
              <span style="color:var(--text-secondary);font-size:13px;">${'▮'.repeat(net.strength)}${'▯'.repeat(4-net.strength)}</span>
              ${net.secured ? '<span style="color:var(--text-secondary);">🔒</span>' : ''}
            </div>
          `).join('')}
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:8px;">
          Connected to Home Network · IP: 192.168.1.42
        </div>
      ` : ''}
    `;
  },

  renderBluetoothSection(winData) {
    const devices = [
      { name: 'AirPods Pro', type: 'Earbuds', connected: true },
      { name: 'Magic Keyboard', type: 'Keyboard', connected: true },
      { name: 'Magic Mouse', type: 'Mouse', connected: true },
      { name: 'HomePod mini', type: 'Speaker', connected: false },
      { name: 'Apple Watch', type: 'Watch', connected: false },
    ];

    return `
      <div class="settings-section-title">Bluetooth</div>
      <div class="settings-group">
        <div class="settings-row">
          <span class="row-label">Bluetooth</span>
          <div class="toggle-switch ${Tahoe.state.bluetoothOn ? 'on' : ''}" data-key="bluetoothOn"></div>
        </div>
      </div>
      ${Tahoe.state.bluetoothOn ? `
        <div class="settings-section-title" style="font-size:14px;margin-top:16px;">My Devices</div>
        <div class="settings-group">
          ${devices.map(d => `
            <div class="settings-row">
              <span style="width:16px;color:${d.connected ? 'var(--accent-green)' : 'var(--text-tertiary)'};">●</span>
              <span class="row-label">${d.name}</span>
              <span class="row-value">${d.connected ? 'Connected' : 'Not Connected'}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  renderBatterySection() {
    return `
      <div class="settings-section-title">Battery</div>
      <div class="settings-group">
        <div class="settings-row">
          <span class="row-label">Battery Level</span>
          <span class="row-value">${Tahoe.state.batteryLevel}%</span>
        </div>
        <div class="settings-row">
          <span class="row-label">Power Source</span>
          <span class="row-value">${Tahoe.state.batteryCharging ? 'Power Adapter' : 'Battery'}</span>
        </div>
        <div class="settings-row">
          <span class="row-label">Low Power Mode</span>
          <div class="toggle-switch"></div>
        </div>
      </div>
      <div style="margin-top:16px;padding:16px;background:rgba(255,255,255,0.05);border-radius:12px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Battery Health</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;">
          <span>Condition</span>
          <span style="color:var(--accent-green);">Normal</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px;">
          <span>Cycle Count</span>
          <span style="color:var(--text-secondary);">142</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px;">
          <span>Maximum Capacity</span>
          <span style="color:var(--text-secondary);">97%</span>
        </div>
      </div>
    `;
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');
    container.querySelectorAll('.settings-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.settings-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeSection = item.dataset.section;
        this.renderSection(winData);
      });
    });

    // Search
    const search = document.getElementById(`${winData.id}-search`);
    if (search) {
      search.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        container.querySelectorAll('.settings-item').forEach(item => {
          const name = item.querySelector('span').textContent.toLowerCase();
          item.style.display = name.includes(query) ? '' : 'none';
        });
      });
    }
  },

  attachRowEvents(winData) {
    const main = document.getElementById(`${winData.id}-main`);
    if (!main) return;

    // Toggles
    main.querySelectorAll('.toggle-switch[data-key]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const key = toggle.dataset.key;
        if (key) {
          Tahoe.toggleCC(key);
          toggle.classList.toggle('on');
          if (key === 'darkMode') {
            WindowManager.updateAllWindowThemes();
          }
        }
      });
    });

    // Sliders
    main.querySelectorAll('[data-slider]').forEach(slider => {
      slider.addEventListener('click', (e) => {
        const rect = slider.getBoundingClientRect();
        const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const key = slider.dataset.key;
        if (key) {
          Tahoe.state[key] = Math.max(0, Math.min(100, pct));
        }
        slider.querySelector('.cc-slider-fill').style.width = pct + '%';
      });
    });

    // Segmented controls
    main.querySelectorAll('.segment-btn[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const siblings = btn.parentElement.querySelectorAll('.segment-btn');
        if (key === 'darkMode') {
          siblings.forEach(s => s.classList.remove('active'));
          btn.classList.add('active');
          Tahoe.state.darkMode = btn.dataset.opt === 'Dark';
          WindowManager.updateAllWindowThemes();
          Tahoe.renderControlCenter();
          MenuBar.renderRightSide();
        }
      });
    });

    // Accent colors
    main.querySelectorAll('[data-accent]').forEach(el => {
      el.addEventListener('click', () => {
        Tahoe.state.accentColor = el.dataset.accent;
        this.renderSection(winData);
      });
    });
  },
};
