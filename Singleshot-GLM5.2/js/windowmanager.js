/* ============================================
   macOS Tahoe - Window Manager
   ============================================ */

const WindowManager = {
  windows: [],
  zCounter: 1000,
  windowId: 0,

  init() {
    // Open Finder by default after boot
    setTimeout(() => {
      Tahoe.launchApp('finder');
    }, 500);
  },

  createWindow(appId, title, config) {
    const id = 'win-' + (++this.windowId);
    const layer = document.getElementById('window-layer');

    const win = document.createElement('div');
    win.className = 'window opening' + (config.light ? ' light-theme' : '');
    win.id = id;
    win.style.width = config.width + 'px';
    win.style.height = config.height + 'px';
    win.style.left = (config.x || 100) + 'px';
    win.style.top = (config.y || 80) + 'px';
    win.style.zIndex = ++this.zCounter;

    win.dataset.appId = appId;
    win.dataset.resizable = config.resizable !== false;

    // Title bar with traffic lights
    win.innerHTML = `
      <div class="window-titlebar draggable">
        <div class="traffic-lights">
          <div class="traffic-light red" data-action="close">
            <svg viewBox="0 0 8 8"><path d="M2 2 L6 6 M6 2 L2 6" stroke="#4d0000" stroke-width="1.2" stroke-linecap="round"/></svg>
          </div>
          <div class="traffic-light yellow" data-action="minimize">
            <svg viewBox="0 0 8 8"><path d="M2 4 L6 4" stroke="#5d4500" stroke-width="1.2" stroke-linecap="round"/></svg>
          </div>
          <div class="traffic-light green" data-action="zoom">
            <svg viewBox="0 0 8 8"><path d="M3 3 L5 3 L5 5 Z M5 5 L3 5 L3 3 Z" fill="#0d4d00"/></svg>
          </div>
        </div>
        <div class="window-title">${title}</div>
      </div>
      <div class="window-content" id="${id}-content"></div>
      ${config.resizable !== false ? `
        <div class="resize-handle n"></div>
        <div class="resize-handle s"></div>
        <div class="resize-handle e"></div>
        <div class="resize-handle w"></div>
        <div class="resize-handle ne"></div>
        <div class="resize-handle nw"></div>
        <div class="resize-handle se"></div>
        <div class="resize-handle sw"></div>
      ` : ''}
    `;

    layer.appendChild(win);

    // Store window data
    const winData = {
      id, appId, title, config,
      el: win,
      minimized: false,
      maximized: false,
      prevRect: null,
    };
    this.windows.push(winData);

    // Render app content
    const contentEl = document.getElementById(`${id}-content`);
    if (config.render) {
      config.render(contentEl, winData);
    }

    // Attach handlers
    this.attachWindowHandlers(winData);
    this.focusWindow(id);

    // Remove opening animation
    setTimeout(() => win.classList.remove('opening'), 300);

    return winData;
  },

  attachWindowHandlers(winData) {
    const win = winData.el;

    // Focus on click
    win.addEventListener('mousedown', () => {
      this.focusWindow(winData.id);
    });

    // Traffic lights
    win.querySelectorAll('.traffic-light').forEach(light => {
      light.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = light.dataset.action;
        if (action === 'close') this.closeWindow(winData.id);
        else if (action === 'minimize') this.minimizeWindow(winData.id);
        else if (action === 'zoom') this.zoomWindow(winData.id);
      });
    });

    // Dragging
    const titlebar = win.querySelector('.window-titlebar');
    if (titlebar) {
      this.attachDrag(win, titlebar);
    }

    // Resizing
    if (winData.config.resizable !== false) {
      win.querySelectorAll('.resize-handle').forEach(handle => {
        this.attachResize(win, handle, winData);
      });
    }

    // Double-click titlebar to zoom
    if (titlebar) {
      titlebar.addEventListener('dblclick', (e) => {
        if (!e.target.closest('.traffic-light')) {
          this.zoomWindow(winData.id);
        }
      });
    }
  },

  attachDrag(win, handle) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.traffic-light')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(win.style.left);
      startTop = parseInt(win.style.top);
      handle.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = Math.max(28, startTop + dy); // Keep below menu bar
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        handle.classList.remove('dragging');
      }
    });
  },

  attachResize(win, handle, winData) {
    let isResizing = false;
    let startX, startY, startW, startH, startL, startT;
    const dir = handle.className.split(' ')[1];

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = parseInt(win.style.width);
      startH = parseInt(win.style.height);
      startL = parseInt(win.style.left);
      startT = parseInt(win.style.top);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const minW = winData.config.minW || 300;
      const minH = winData.config.minH || 200;

      if (dir.includes('e')) {
        win.style.width = Math.max(minW, startW + dx) + 'px';
      }
      if (dir.includes('s')) {
        win.style.height = Math.max(minH, startH + dy) + 'px';
      }
      if (dir.includes('w')) {
        const newW = Math.max(minW, startW - dx);
        win.style.width = newW + 'px';
        win.style.left = (startL + (startW - newW)) + 'px';
      }
      if (dir.includes('n')) {
        const newH = Math.max(minH, startH - dy);
        win.style.height = newH + 'px';
        win.style.top = Math.max(28, startT + (startH - newH)) + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  },

  focusWindow(id) {
    // Deactivate all
    this.windows.forEach(w => {
      w.el.classList.add('inactive');
      w.el.querySelectorAll('.traffic-lights').forEach(tl => tl.classList.add('inactive'));
    });

    if (!id) {
      Tahoe.state.activeWindow = null;
      MenuBar.render();
      return;
    }

    const winData = this.windows.find(w => w.id === id);
    if (!winData) return;

    winData.el.classList.remove('inactive');
    winData.el.querySelectorAll('.traffic-lights').forEach(tl => tl.classList.remove('inactive'));
    winData.el.style.zIndex = ++this.zCounter;
    Tahoe.state.activeWindow = id;

    // Update menu bar
    MenuBar.render();
  },

  closeWindow(id) {
    const winData = this.windows.find(w => w.id === id);
    if (!winData) return;

    winData.el.classList.add('closing');
    setTimeout(() => {
      winData.el.remove();
      this.windows = this.windows.filter(w => w.id !== id);

      // Update app running state
      const app = Tahoe.state.apps[winData.appId];
      if (app) {
        const stillRunning = this.windows.some(w => w.appId === winData.appId);
        if (!stillRunning) {
          app.running = false;
          Dock.updateRunningState(winData.appId);
        }
      }

      // Focus next window
      if (Tahoe.state.activeWindow === id) {
        const lastWin = this.windows[this.windows.length - 1];
        if (lastWin) {
          this.focusWindow(lastWin.id);
        } else {
          this.focusWindow(null);
        }
      }
    }, 250);
  },

  closeActive() {
    if (Tahoe.state.activeWindow) {
      this.closeWindow(Tahoe.state.activeWindow);
    }
  },

  minimizeWindow(id) {
    const winData = this.windows.find(w => w.id === id);
    if (!winData) return;

    winData.minimized = true;
    winData.el.classList.add('minimizing');
    setTimeout(() => {
      winData.el.style.display = 'none';
      winData.el.classList.remove('minimizing');
    }, 400);

    // Focus next visible window
    const visible = this.windows.filter(w => !w.minimized);
    if (visible.length > 0) {
      this.focusWindow(visible[visible.length - 1].id);
    } else {
      this.focusWindow(null);
    }
  },

  minimizeActive() {
    if (Tahoe.state.activeWindow) {
      this.minimizeWindow(Tahoe.state.activeWindow);
    }
  },

  unminimize(id) {
    const winData = this.windows.find(w => w.id === id);
    if (!winData) return;
    winData.minimized = false;
    winData.el.style.display = '';
    winData.el.classList.add('opening');
    setTimeout(() => winData.el.classList.remove('opening'), 300);
    this.focusWindow(id);
  },

  zoomWindow(id) {
    const winData = this.windows.find(w => w.id === id);
    if (!winData) return;

    if (winData.maximized) {
      // Restore
      if (winData.prevRect) {
        winData.el.style.width = winData.prevRect.w + 'px';
        winData.el.style.height = winData.prevRect.h + 'px';
        winData.el.style.left = winData.prevRect.x + 'px';
        winData.el.style.top = winData.prevRect.y + 'px';
      }
      winData.maximized = false;
    } else {
      // Maximize
      winData.prevRect = {
        w: parseInt(winData.el.style.width),
        h: parseInt(winData.el.style.height),
        x: parseInt(winData.el.style.left),
        y: parseInt(winData.el.style.top),
      };
      winData.el.style.width = '100%';
      winData.el.style.height = 'calc(100% - 28px)';
      winData.el.style.left = '0';
      winData.el.style.top = '28px';
      winData.maximized = true;
    }
  },

  zoomActive() {
    if (Tahoe.state.activeWindow) {
      this.zoomWindow(Tahoe.state.activeWindow);
    }
  },

  toggleFullscreen() {
    this.zoomActive();
  },

  updateAllWindowThemes() {
    this.windows.forEach(w => {
      if (Tahoe.state.darkMode) {
        w.el.classList.remove('light-theme');
      } else {
        w.el.classList.add('light-theme');
      }
    });
  },
};
