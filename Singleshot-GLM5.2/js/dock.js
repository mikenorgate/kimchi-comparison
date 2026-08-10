/* ============================================
   macOS Tahoe - Dock
   ============================================ */

const Dock = {
  init() {
    this.render();
    this.initMagnification();
  },

  render() {
    const dock = document.getElementById('dock');
    const apps = Tahoe.state.apps;

    let html = '';
    const mainApps = Object.entries(apps).filter(([id, app]) => app.pinned && id !== 'trash');

    mainApps.forEach(([id, app]) => {
      html += this.renderDockItem(id, app);
    });

    // Separator
    html += '<div class="dock-separator"></div>';

    // Trash
    const trash = apps.trash;
    html += this.renderDockItem('trash', trash);

    dock.innerHTML = html;
    this.attachEvents();
  },

  renderDockItem(id, app) {
    const running = app.running ? 'running' : '';
    return `
      <div class="dock-item ${running}" data-app="${id}">
        <div class="dock-icon">${app.icon}</div>
        <div class="dock-indicator"></div>
        <div class="dock-tooltip">${app.name}</div>
      </div>
    `;
  },

  attachEvents() {
    document.querySelectorAll('.dock-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = item.dataset.app;
        if (appId === 'trash') {
          this.showTrashContextMenu(e);
        } else {
          Tahoe.launchApp(appId);
        }
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const appId = item.dataset.app;
        this.showDockItemContextMenu(e, appId);
      });
    });
  },

  showTrashContextMenu(e) {
    Tahoe.showContextMenu(e.clientX, e.clientY, [
      { label: 'Open Trash', action: () => Tahoe.launchApp('finder') },
      { separator: true },
      { label: 'Empty Trash...', action: () => Tahoe.showNotification('Trash', 'Trash has been emptied.') },
    ]);
  },

  showDockItemContextMenu(e, appId) {
    const app = Tahoe.state.apps[appId];
    const isRunning = app.running;
    const items = [
      { label: isRunning ? 'Quit ' + app.name : 'Open ' + app.name, action: () => {
        if (isRunning) {
          const win = Tahoe.state.windows.find(w => w.appId === appId);
          if (win) WindowManager.closeWindow(win.id);
        } else {
          Tahoe.launchApp(appId);
        }
      }},
      { separator: true },
      { label: 'Options', submenu: true },
      { separator: true },
      { label: 'Show in Finder', action: () => Tahoe.launchApp('finder') },
    ];
    Tahoe.showContextMenu(e.clientX, e.clientY, items);
  },

  initMagnification() {
    const dock = document.getElementById('dock');
    if (!dock) return;

    dock.addEventListener('mousemove', (e) => {
      const items = dock.querySelectorAll('.dock-item .dock-icon');
      items.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(e.clientX - center);
        const maxDist = 120;
        if (distance < maxDist) {
          const scale = 1 + (1 - distance / maxDist) * 0.5;
          const lift = (1 - distance / maxDist) * 12;
          icon.style.transform = `scale(${scale}) translateY(-${lift}px)`;
        } else {
          icon.style.transform = '';
        }
      });
    });

    dock.addEventListener('mouseleave', () => {
      const items = dock.querySelectorAll('.dock-item .dock-icon');
      items.forEach(icon => { icon.style.transform = ''; });
    });
  },

  updateRunningState(appId) {
    const item = document.querySelector(`.dock-item[data-app="${appId}"]`);
    if (!item) return;
    const app = Tahoe.state.apps[appId];
    if (app && app.running) {
      item.classList.add('running');
    } else {
      item.classList.remove('running');
    }
  },
};
