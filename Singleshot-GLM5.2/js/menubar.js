/* ============================================
   macOS Tahoe - Menu Bar
   ============================================ */

const MenuBar = {
  activeMenu: null,
  appMenus: [],

  init() {
    this.render();
  },

  render() {
    const bar = document.getElementById('menu-bar');
    const activeApp = this.getActiveApp();
    const appName = activeApp ? Tahoe.state.apps[activeApp].name : 'Finder';
    const menus = activeApp ? (Tahoe.getAppMenus(activeApp) || Tahoe.getAppMenus('finder')) : Tahoe.getAppMenus('finder');

    this.appMenus = [{ label: '', isApple: true, items: Tahoe.getAppleMenu() }, ...menus];

    let html = `
      <div class="menu-item apple-logo" data-menu="0">
        ${Icons.apple}
      </div>
      <div class="menu-item bold" data-menu="1">${appName}</div>
    `;

    menus.forEach((m, i) => {
      html += `<div class="menu-item" data-menu="${i + 2}">${m.label}</div>`;
    });

    html += this.renderRightSide();
    bar.innerHTML = html;
    this.attachEvents();
  },

  renderRightSide() {
    let html = '<div class="menu-bar-right">';
    const s = Tahoe.state;

    // Battery
    html += `<div class="menu-bar-extra menu-item" title="Battery">
      <span style="font-size:12px;">${s.batteryLevel}%</span>
      <span class="battery-icon">${Icons.battery}</span>
    </div>`;

    // Wifi
    html += `<div class="menu-bar-extra menu-item" title="Wi-Fi">${Icons.wifi}</div>`;

    // Spotlight
    html += `<div class="menu-bar-extra menu-item menu-bar-spotlight" title="Spotlight Search (⌘Space)">${Icons.search}</div>`;

    // Control Center
    html += `<div class="menu-bar-extra menu-item menu-bar-control-center" title="Control Center">${Icons.controlcenter}</div>`;

    // Date/Time
    html += `<div class="menu-bar-extra menu-item" id="menu-bar-clock" style="cursor:pointer;"></div>`;

    html += '</div>';
    return html;
  },

  getActiveApp() {
    if (!Tahoe.state.activeWindow) return 'finder';
    const win = Tahoe.state.windows.find(w => w.id === Tahoe.state.activeWindow);
    return win ? win.appId : 'finder';
  },

  attachEvents() {
    const items = document.querySelectorAll('.menu-bar .menu-item[data-menu]');
    items.forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(item.dataset.menu);
        if (this.activeMenu === idx) {
          this.closeAllMenus();
        } else {
          this.openMenu(idx);
        }
      });
      item.addEventListener('mouseenter', () => {
        if (this.activeMenu !== null) {
          const idx = parseInt(item.dataset.menu);
          this.openMenu(idx);
        }
      });
    });

    // Spotlight
    const sp = document.querySelector('.menu-bar-spotlight');
    if (sp) sp.addEventListener('click', (e) => { e.stopPropagation(); Tahoe.toggleSpotlight(); });

    // Control center
    const cc = document.querySelector('.menu-bar-control-center');
    if (cc) cc.addEventListener('click', (e) => { e.stopPropagation(); Tahoe.toggleControlCenter(); });

    // Clock - toggle notification center
    const clk = document.getElementById('menu-bar-clock');
    if (clk) clk.addEventListener('click', (e) => { e.stopPropagation(); this.toggleNotificationCenter(); });
  },

  openMenu(idx) {
    this.closeAllMenus();
    this.activeMenu = idx;

    const menuItems = document.querySelectorAll('.menu-bar .menu-item[data-menu]');
    if (menuItems[idx]) menuItems[idx].classList.add('active');

    const menu = this.appMenus[idx];
    if (!menu) return;

    const menuItemEl = menuItems[idx];
    const rect = menuItemEl.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.id = 'active-dropdown';

    dropdown.innerHTML = menu.items.map(item => {
      if (item.separator) return '<div class="dropdown-separator"></div>';
      let shortcut = '';
      if (item.shortcut) {
        shortcut = `<span class="shortcut">${item.shortcut}</span>`;
      }
      let check = '';
      if (item.checked) check = '<span class="check">✓</span>';
      let submenu = '';
      if (item.submenu) {
        submenu = ' <span style="margin-left:auto;">▸</span>';
      }
      return `<div class="dropdown-item ${item.disabled ? 'disabled' : ''}" data-label="${item.label}">
        ${check}
        <span>${item.label}</span>
        ${shortcut}
        ${submenu}
      </div>`;
    }).join('');

    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 'px';

    document.body.appendChild(dropdown);

    // Adjust if off screen
    const dRect = dropdown.getBoundingClientRect();
    if (dRect.right > window.innerWidth) {
      dropdown.style.left = (window.innerWidth - dRect.width - 10) + 'px';
    }

    // Attach click handlers
    const realItems = menu.items.filter(i => !i.separator);
    dropdown.querySelectorAll('.dropdown-item').forEach((el, i) => {
      const item = realItems[i];
      if (item && item.action && !item.disabled) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          item.action();
          this.closeAllMenus();
        });
      }
      if (item && item.submenu) {
        el.addEventListener('mouseenter', () => {
          // Simple submenu handling
          this.showSubmenu(el, item.submenu);
        });
      }
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('mousedown', this.outsideClickHandler);
    }, 0);
  },

  showSubmenu(parentEl, items) {
    // Remove existing submenu
    const existing = document.getElementById('active-submenu');
    if (existing) existing.remove();

    const submenu = document.createElement('div');
    submenu.className = 'dropdown-menu';
    submenu.id = 'active-submenu';

    submenu.innerHTML = items.map(item => {
      if (item.separator) return '<div class="dropdown-separator"></div>';
      return `<div class="dropdown-item ${item.disabled ? 'disabled' : ''}">
        <span>${item.label}</span>
      </div>`;
    }).join('');

    const rect = parentEl.getBoundingClientRect();
    submenu.style.left = (rect.right) + 'px';
    submenu.style.top = rect.top + 'px';

    document.body.appendChild(submenu);

    const realItems = items.filter(i => !i.separator);
    submenu.querySelectorAll('.dropdown-item').forEach((el, i) => {
      const item = realItems[i];
      if (item && item.action) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          item.action();
          this.closeAllMenus();
        });
      }
    });
  },

  closeAllMenus() {
    const dropdown = document.getElementById('active-dropdown');
    if (dropdown) dropdown.remove();
    const submenu = document.getElementById('active-submenu');
    if (submenu) submenu.remove();
    document.querySelectorAll('.menu-bar .menu-item.active').forEach(el => el.classList.remove('active'));
    this.activeMenu = null;
    document.removeEventListener('mousedown', this.outsideClickHandler);
  },

  outsideClickHandler(e) {
    if (!e.target.closest('.dropdown-menu') && !e.target.closest('.menu-item')) {
      MenuBar.closeAllMenus();
    }
  },

  toggleNotificationCenter() {
    const nc = document.getElementById('notification-center');
    if (Tahoe.state.notificationsOpen) {
      nc.style.display = 'none';
      Tahoe.state.notificationsOpen = false;
    } else {
      this.renderNotificationCenter();
      nc.style.display = 'flex';
      Tahoe.state.notificationsOpen = true;
    }
  },

  renderNotificationCenter() {
    const nc = document.getElementById('notification-center');
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Tomorrow forecast
    const tomorrowHigh = Math.round(18 + Math.random() * 8);
    const tomorrowLow = Math.round(8 + Math.random() * 6);

    nc.innerHTML = `
      <div class="notification-widget calendar-widget">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:14px;color:var(--accent-red);font-weight:700;text-transform:uppercase;">${days[now.getDay()]}</div>
          <div style="font-size:14px;color:var(--text-secondary);">${months[now.getMonth()]} ${now.getDate()}</div>
        </div>
        <div style="font-size:48px;font-weight:200;margin:8px 0;" data-clock>10:30</div>
        <div style="font-size:12px;color:var(--text-secondary);">No events today</div>
      </div>
      <div class="notification-widget weather-widget">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-size:14px;font-weight:600;">Cupertino</div>
            <div style="font-size:64px;font-weight:100;">72°</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;">Mostly Sunny</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px;">H:78° L:58°</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);">Tomorrow: ${tomorrowHigh}°/${tomorrowLow}°</div>
          </div>
        </div>
      </div>
      <div class="notification-widget" style="background:rgba(255,255,255,0.08);backdrop-filter:blur(40px);border:0.5px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Reminders</div>
        <div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:8px;">
          <div style="width:14px;height:14px;border:1.5px solid rgba(255,255,255,0.3);border-radius:50%;"></div>
          Review pull request
        </div>
        <div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:8px;margin-top:6px;">
          <div style="width:14px;height:14px;border:1.5px solid rgba(255,255,255,0.3);border-radius:50%;"></div>
          Team meeting at 2 PM
        </div>
      </div>
      <div class="notification-widget" style="background:rgba(255,255,255,0.08);backdrop-filter:blur(40px);border:0.5px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Screen Time</div>
        <div style="font-size:24px;font-weight:300;">3h 24m</div>
        <div style="font-size:11px;color:var(--text-secondary);">Today's usage</div>
        <div style="margin-top:8px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
          <div style="width:65%;height:100%;background:var(--accent-blue);border-radius:2px;"></div>
        </div>
      </div>
    `;
  },
};
