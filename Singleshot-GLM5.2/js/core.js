/* ============================================================
   macOS Tahoe — Core OS (Window Manager, App Registry, State)
   ============================================================ */

const OS = (() => {
    // ---- State ----
    const state = {
        windows: [],         // { id, appId, title, el, zIndex, minimized, maximized, prevState }
        zIndexCounter: 100,
        activeApp: 'finder',
        apps: {},             // registered app definitions
        darkMode: false,
        wallpaperIndex: 0,
    };

    let winIdCounter = 0;

    // ---- App Registry ----
    function registerApp(id, config) {
        state.apps[id] = {
            id,
            name: config.name,
            icon: config.icon,
            iconClass: config.iconClass || `icon-${id}`,
            dockIcon: config.dockIcon || config.icon,
            windowWidth: config.windowWidth || 800,
            windowHeight: config.windowHeight || 560,
            minWidth: config.minWidth || 400,
            minHeight: config.minHeight || 300,
            titlebar: config.titlebar !== false,
            resizable: config.resizable !== false,
            maximizable: config.maximizable !== false,
            singleton: config.singleton || false,
            menus: config.menus || null,
            onOpen: config.onOpen || null,
            onClose: config.onClose || null,
            render: config.render,
        };
    }

    function getApp(id) { return state.apps[id]; }

    // ---- Window Management ----
    function openWindow(appId, options = {}) {
        const app = state.apps[appId];
        if (!app) { console.error('Unknown app:', appId); return null; }

        // Singleton check
        if (app.singleton) {
            const existing = state.windows.find(w => w.appId === appId);
            if (existing) {
                if (existing.minimized) unminimizeWindow(existing.id);
                focusWindow(existing.id);
                return existing;
            }
        }

        const id = ++winIdCounter;
        const width = options.width || app.windowWidth;
        const height = options.height || app.windowHeight;
        const left = options.left ?? Math.max(40, (window.innerWidth - width) / 2 + (state.windows.length % 5) * 30 - 60);
        const top = options.top ?? Math.max(40, (window.innerHeight - height) / 2 + (state.windows.length % 5) * 30 - 60);

        const win = document.createElement('div');
        win.className = 'app-window';
        win.dataset.id = id;
        win.dataset.appId = appId;
        win.style.width = width + 'px';
        win.style.height = height + 'px';
        win.style.left = left + 'px';
        win.style.top = top + 'px';
        win.style.zIndex = ++state.zIndexCounter;

        // Title bar
        const titlebar = document.createElement('div');
        titlebar.className = 'window-titlebar';

        // Traffic lights
        const tl = document.createElement('div');
        tl.className = 'traffic-lights';
        tl.innerHTML = `
            <button class="tl-btn close" title="Close"><svg viewBox="0 0 7 7"><path fill="none" stroke="#4d0000" stroke-width="1.2" stroke-linecap="round" d="M1.5 1.5L5.5 5.5M5.5 1.5L1.5 5.5"/></svg></button>
            <button class="tl-btn minimize" title="Minimize"><svg viewBox="0 0 7 7"><path fill="none" stroke="#4d3500" stroke-width="1.5" stroke-linecap="round" d="M1.5 3.5h4"/></svg></button>
            <button class="tl-btn maximize" title="Zoom"><svg viewBox="0 0 7 7"><path fill="none" stroke="#003d00" stroke-width="1.2" d="M2 1.5h3v3M5 5.5H2v-3"/></svg></button>
        `;

        titlebar.appendChild(tl);

        const titleEl = document.createElement('div');
        titleEl.className = 'window-title';
        titleEl.textContent = options.title || app.name;
        titlebar.appendChild(titleEl);

        win.appendChild(titlebar);

        // Content container
        const content = document.createElement('div');
        content.className = 'window-content';
        win.appendChild(content);

        // Resize handles
        if (app.resizable) {
            ['rh-n','rh-s','rh-e','rh-w','rh-ne','rh-nw','rh-se','rh-sw'].forEach(cls => {
                const h = document.createElement('div');
                h.className = `resize-handle ${cls}`;
                win.appendChild(h);
            });
        }

        // State record
        const winState = { id, appId, title: options.title || app.name, el: win, zIndex: state.zIndexCounter, minimized: false, maximized: false, prevState: null };
        state.windows.push(winState);

        // Append to DOM
        document.getElementById('windows-container').appendChild(win);

        // Focus
        focusWindow(id);

        // Render app content
        if (app.render) {
            try {
                app.render(content, winState, options.data);
            } catch (e) {
                console.error('App render error:', e);
                content.innerHTML = `<div style="padding:20px;color:#ff3b30;">Error loading ${app.name}</div>`;
            }
        }

        // Wire up events
        wireWindowEvents(win, winState, app);

        // Update dock
        Dock.updateRunning();

        // Update menu bar
        MenuBar.setActiveApp(appId);

        // onOpen callback
        if (app.onOpen) app.onOpen(winState);

        return winState;
    }

    function wireWindowEvents(win, winState, app) {
        // Traffic lights
        win.querySelector('.tl-btn.close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeWindow(winState.id);
        });
        win.querySelector('.tl-btn.minimize').addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeWindow(winState.id);
        });
        win.querySelector('.tl-btn.maximize').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMaximize(winState.id);
        });

        // Double-click titlebar to maximize
        win.querySelector('.window-titlebar').addEventListener('dblclick', (e) => {
            if (e.target.closest('.traffic-lights')) return;
            toggleMaximize(winState.id);
        });

        // Focus on mousedown
        win.addEventListener('mousedown', () => focusWindow(winState.id));

        // Drag
        makeDraggable(win, winState);

        // Resize
        if (app.resizable) {
            makeResizable(win, winState, app);
        }
    }

    function makeDraggable(win, winState) {
        const titlebar = win.querySelector('.window-titlebar');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.traffic-lights') || e.target.closest('.window-toolbar')) return;
            if (winState.maximized) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(win.style.left);
            startTop = parseInt(win.style.top);
            win.classList.add('dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newLeft = startLeft + e.clientX - startX;
            let newTop = startTop + e.clientY - startY;
            // Constrain to screen (keep titlebar accessible)
            newTop = Math.max(28, newTop);
            newLeft = Math.max(-parseInt(win.style.width) + 100, Math.min(window.innerWidth - 80, newLeft));
            win.style.left = newLeft + 'px';
            win.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                win.classList.remove('dragging');
            }
        });
    }

    function makeResizable(win, winState, app) {
        const handles = win.querySelectorAll('.resize-handle');
        let resizing = false;
        let direction = '';
        let startX, startY, startW, startH, startLeft, startTop;

        handles.forEach(h => {
            h.addEventListener('mousedown', (e) => {
                if (winState.maximized) return;
                resizing = true;
                direction = h.className.replace('resize-handle ', '').replace('rh-', '');
                startX = e.clientX;
                startY = e.clientY;
                startW = parseInt(win.style.width);
                startH = parseInt(win.style.height);
                startLeft = parseInt(win.style.left);
                startTop = parseInt(win.style.top);
                e.preventDefault();
                e.stopPropagation();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!resizing) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let newW = startW, newH = startH, newLeft = startLeft, newTop = startTop;

            if (direction.includes('e')) newW = startW + dx;
            if (direction.includes('w')) { newW = startW - dx; newLeft = startLeft + dx; }
            if (direction.includes('s')) newH = startH + dy;
            if (direction.includes('n')) { newH = startH - dy; newTop = startTop + dy; }

            // Enforce min sizes
            const minW = app.minWidth || 400;
            const minH = app.minHeight || 300;
            if (newW < minW) { if (direction.includes('w')) newLeft -= (minW - newW); newW = minW; }
            if (newH < minH) { if (direction.includes('n')) newTop -= (minH - newH); newH = minH; }

            win.style.width = newW + 'px';
            win.style.height = newH + 'px';
            win.style.left = newLeft + 'px';
            win.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            resizing = false;
        });
    }

    function focusWindow(id) {
        const winState = state.windows.find(w => w.id === id);
        if (!winState) return;
        if (winState.minimized) return;

        state.windows.forEach(w => w.el.classList.remove('focused'));
        winState.el.classList.add('focused');
        winState.el.style.zIndex = ++state.zIndexCounter;
        winState.zIndex = state.zIndexCounter;

        state.activeApp = winState.appId;
        MenuBar.setActiveApp(winState.appId);
    }

    function closeWindow(id) {
        const idx = state.windows.findIndex(w => w.id === id);
        if (idx === -1) return;
        const winState = state.windows[idx];
        const app = state.apps[winState.appId];

        if (app && app.onClose) {
            const result = app.onClose(winState);
            if (result === false) return; // prevent close
        }

        winState.el.classList.add('closing');
        setTimeout(() => {
            winState.el.remove();
            state.windows.splice(idx, 1);
            Dock.updateRunning();

            // Focus next window
            const top = state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
            if (top) {
                focusWindow(top.id);
            } else {
                MenuBar.setActiveApp('finder');
            }
        }, 200);
    }

    function minimizeWindow(id) {
        const winState = state.windows.find(w => w.id === id);
        if (!winState || winState.minimized) return;

        winState.minimized = true;
        winState.el.classList.add('minimizing');
        setTimeout(() => {
            winState.el.style.display = 'none';
            winState.el.classList.remove('minimizing');
        }, 400);

        // Focus next visible window
        const top = state.windows.filter(w => !w.minimized && w.id !== id).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (top) focusWindow(top.id);
        else MenuBar.setActiveApp('finder');
    }

    function unminimizeWindow(id) {
        const winState = state.windows.find(w => w.id === id);
        if (!winState || !winState.minimized) return;

        winState.minimized = false;
        winState.el.style.display = '';
        winState.el.style.zIndex = ++state.zIndexCounter;
        winState.el.classList.add('focused');
        state.windows.forEach(w => { if (w.id !== id) w.el.classList.remove('focused'); });
        state.activeApp = winState.appId;
        MenuBar.setActiveApp(winState.appId);
        Dock.updateRunning();
    }

    function toggleMaximize(id) {
        const winState = state.windows.find(w => w.id === id);
        if (!winState) return;
        const app = state.apps[winState.appId];
        if (app && !app.maximizable) return;

        if (winState.maximized) {
            // Restore
            winState.maximized = false;
            winState.el.classList.remove('maximized');
            if (winState.prevState) {
                winState.el.style.width = winState.prevState.width;
                winState.el.style.height = winState.prevState.height;
                winState.el.style.left = winState.prevState.left;
                winState.el.style.top = winState.prevState.top;
            }
        } else {
            winState.prevState = {
                width: winState.el.style.width,
                height: winState.el.style.height,
                left: winState.el.style.left,
                top: winState.el.style.top,
            };
            winState.maximized = true;
            winState.el.classList.add('maximized');
        }
    }

    function getWindowsByApp(appId) {
        return state.windows.filter(w => w.appId === appId);
    }

    function isAppRunning(appId) {
        return state.windows.some(w => w.appId === appId);
    }

    // ---- Notifications ----
    function notify(opts) {
        const container = document.getElementById('notifications-container');
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `
            <div class="notif-header">
                <div class="notif-app-icon" style="background:${opts.iconBg || '#0a84ff'};color:#fff;">${opts.iconChar || '•'}</div>
                <div class="notif-app-name">${opts.app || 'Notification'}</div>
                <div class="notif-time">now</div>
            </div>
            <div class="notif-title">${opts.title || ''}</div>
            <div class="notif-body">${opts.body || ''}</div>
        `;
        container.appendChild(notif);
        setTimeout(() => {
            notif.classList.add('closing');
            setTimeout(() => notif.remove(), 300);
        }, opts.duration || 5000);
    }

    // ---- Utility ----
    function el(tag, className, html) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    function toggleDarkMode() {
        state.darkMode = !state.darkMode;
        document.body.classList.toggle('dark-mode', state.darkMode);
    }

    // ---- Public API ----
    return {
        state,
        registerApp,
        getApp,
        openWindow,
        closeWindow,
        minimizeWindow,
        unminimizeWindow,
        toggleMaximize,
        focusWindow,
        getWindowsByApp,
        isAppRunning,
        notify,
        el,
        toggleDarkMode,
    };
})();

// Make available globally
window.OS = OS;
