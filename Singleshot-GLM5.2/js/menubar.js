/* ============================================================
   macOS Tahoe — Menu Bar
   ============================================================ */

const MenuBar = (() => {
    const dropdown = document.getElementById('menu-dropdown');
    let currentMenu = null;
    let currentMenuTarget = null;

    // ---- Clock ----
    function updateClock() {
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dateEl = document.getElementById('menu-date');
        const timeEl = document.getElementById('menu-time');
        if (dateEl) dateEl.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        // NC clock
        const ncTime = document.getElementById('nc-clock-time');
        const ncDate = document.getElementById('nc-clock-date');
        if (ncTime) ncTime.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        if (ncDate) ncDate.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    }

    // ---- Menu Definitions ----
    const appleMenu = [
        { label: 'About This Mac', action: () => OS.openWindow('aboutmac') },
        { divider: true },
        { label: 'System Settings…', action: () => OS.openWindow('settings'), shortcut: '⌘,' },
        { divider: true },
        { label: 'App Store…', action: () => OS.openWindow('appstore') },
        { label: 'Recent Items', submenu: [] },
        { divider: true },
        { label: 'Force Quit…', action: () => forceQuit(), shortcut: '⌥⌘⎋' },
        { divider: true },
        { label: 'Sleep', action: () => OS.notify({ app: 'System', title: 'Sleeping', body: 'The display is now sleeping.', iconChar: '◐' }) },
        { label: 'Restart…', action: () => location.reload() },
        { label: 'Shut Down…', action: () => shutdownScreen() },
        { label: 'Lock Screen', action: () => lockScreen(), shortcut: '⌃⌘Q' },
        { label: 'Log Out…', action: () => location.reload(), shortcut: '⇧⌘Q' },
    ];

    const finderMenu = [
        { label: 'About Finder' },
        { divider: true },
        { label: 'Settings…', action: () => OS.openWindow('settings') },
        { divider: true },
        { label: 'Hide Finder', shortcut: '⌘H' },
        { label: 'Hide Others', shortcut: '⌥⌘H' },
        { divider: true },
        { label: 'Show All' },
    ];

    const fileMenu = [
        { label: 'New Finder Window', action: () => OS.openWindow('finder'), shortcut: '⌘N' },
        { label: 'New Folder', action: () => OS.notify({ app: 'Finder', title: 'New Folder', body: 'Created "Untitled Folder"', iconChar: '📁' }), shortcut: '⇧⌘N' },
        { label: 'New Tab', shortcut: '⌘T' },
        { divider: true },
        { label: 'Open', shortcut: '⌘O' },
        { label: 'Open With', submenu: [] },
        { divider: true },
        { label: 'Close Window', action: closeActiveWindow, shortcut: '⌘W' },
        { label: 'Get Info', shortcut: '⌘I' },
        { divider: true },
        { label: 'Move to Trash', shortcut: '⌘⌫' },
        { label: 'Eject', shortcut: '⌘E' },
    ];

    const editMenu = [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { divider: true },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'Select All', shortcut: '⌘A' },
        { divider: true },
        { label: 'Show Emoji & Symbols', shortcut: '⌃⌘Space' },
    ];

    const viewMenu = [
        { label: 'as Icons', shortcut: '⌘1', checked: true },
        { label: 'as List', shortcut: '⌘2' },
        { label: 'as Columns', shortcut: '⌘3' },
        { label: 'as Gallery', shortcut: '⌘4' },
        { divider: true },
        { label: 'Show Sidebar', shortcut: '⌥⌘S', checked: true },
        { label: 'Show Toolbar', checked: true },
        { label: 'Show Path Bar', checked: true },
        { divider: true },
        { label: 'Enter Full Screen', action: toggleFullscreen, shortcut: '⌃⌘F' },
    ];

    const windowMenu = [
        { label: 'Minimize', action: minimizeActiveWindow, shortcut: '⌘M' },
        { label: 'Zoom', action: maximizeActiveWindow },
        { divider: true },
        { label: 'Bring All to Front' },
    ];

    const helpMenu = [
        { label: 'macOS Help', shortcut: '⌘?' },
        { label: 'Search', submenu: [] },
        { divider: true },
        { label: 'macOS Tips' },
        { label: 'Keyboard Shortcuts' },
    ];

    const menus = {
        apple: appleMenu,
        app: finderMenu, // Updated dynamically
        file: fileMenu,
        edit: editMenu,
        view: viewMenu,
        window: windowMenu,
        help: helpMenu,
    };

    // ---- App-specific menus ----
    const appMenus = {
        finder: {
            app: [
                { label: 'About Finder' },
                { divider: true },
                { label: 'Settings…', action: () => OS.openWindow('settings') },
                { divider: true },
                { label: 'Hide Finder', shortcut: '⌘H' },
            ],
            file: fileMenu,
            edit: editMenu,
            view: viewMenu,
            window: windowMenu,
            help: helpMenu,
        },
        safari: {
            app: [
                { label: 'About Safari' },
                { divider: true },
                { label: 'Settings…', action: () => OS.openWindow('settings'), shortcut: '⌘,' },
                { divider: true },
                { label: 'Hide Safari', shortcut: '⌘H' },
            ],
            file: [
                { label: 'New Window', action: () => OS.openWindow('safari'), shortcut: '⌘N' },
                { label: 'New Tab', shortcut: '⌘T' },
                { divider: true },
                { label: 'Open Location…', shortcut: '⌘L' },
                { label: 'Close Tab', shortcut: '⌘W' },
                { divider: true },
                { label: 'Save As…', shortcut: '⌘S' },
                { label: 'Print…', shortcut: '⌘P' },
            ],
            edit: editMenu,
            view: [
                { label: 'Show Toolbar', checked: true },
                { label: 'Show Favorites Bar', shortcut: '⇧⌘B', checked: true },
                { label: 'Show Tab Bar', shortcut: '⇧⌘T', checked: true },
                { divider: true },
                { label: 'Reload Page', shortcut: '⌘R' },
                { label: 'Stop', shortcut: '⌘.' },
                { divider: true },
                { label: 'Enter Full Screen', action: toggleFullscreen, shortcut: '⌃⌘F' },
            ],
            window: windowMenu,
            help: helpMenu,
        },
        notes: {
            app: [{ label: 'About Notes' }, { divider: true }, { label: 'Settings…', action: () => OS.openWindow('settings') }],
            file: [
                { label: 'New Note', action: () => OS.notify({ app: 'Notes', title: 'New Note', body: 'Created a new note', iconChar: '📝' }), shortcut: '⌘N' },
                { divider: true },
                { label: 'Pin Note', shortcut: '⌘P' },
                { label: 'Delete Note', shortcut: '⌫' },
                { divider: true },
                { label: 'Close Window', action: closeActiveWindow, shortcut: '⌘W' },
            ],
            edit: editMenu,
            view: [
                { label: 'as List', checked: true },
                { label: 'as Gallery', shortcut: '⌘2' },
                { divider: true },
                { label: 'Sort By', submenu: [] },
                { divider: true },
                { label: 'Enter Full Screen', action: toggleFullscreen, shortcut: '⌃⌘F' },
            ],
            window: windowMenu,
            help: helpMenu,
        },
    };

    function getAppMenu(appId, menuKey) {
        if (appMenus[appId] && appMenus[appId][menuKey]) return appMenus[appId][menuKey];
        return menus[menuKey];
    }

    // ---- Menu Actions ----
    function closeActiveWindow() {
        const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (top) OS.closeWindow(top.id);
    }

    function minimizeActiveWindow() {
        const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (top) OS.minimizeWindow(top.id);
    }

    function maximizeActiveWindow() {
        const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (top) OS.toggleMaximize(top.id);
    }

    function toggleFullscreen() {
        const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (top) OS.toggleMaximize(top.id);
    }

    function forceQuit() {
        OS.notify({ app: 'Force Quit', title: 'Force Quit Applications', body: 'Select an app to force quit.', iconChar: '⚡' });
    }

    function lockScreen() {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:100000;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;';
        overlay.innerHTML = `
            <div style="font-size:60px;margin-bottom:20px;">🔒</div>
            <div style="color:#fff;font-size:20px;margin-bottom:8px;">${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:14px;">Click to unlock</div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => overlay.remove());
    }

    function shutdownScreen() {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:100001;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `<div style="width:24px;height:24px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;"></div>`;
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    // ---- Menu Rendering ----
    function showMenu(menuKey, target) {
        hideMenu();
        currentMenu = menuKey;
        currentMenuTarget = target;

        target.classList.add('active');
        const items = getAppMenu(OS.state.activeApp, menuKey);

        const rect = target.getBoundingClientRect();
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom) + 'px';

        renderMenu(items);
        dropdown.classList.remove('hidden');
    }

    function renderMenu(items) {
        let html = '';
        items.forEach(item => {
            if (item.divider) {
                html += '<div class="menu-divider"></div>';
            } else if (item.submenu) {
                html += `<div class="menu-item-row"><span>${item.label}</span><span style="opacity:0.4">▶</span></div>`;
            } else {
                const checkmark = item.checked ? '<span class="check">✓</span>' : '<span class="check"></span>';
                const shortcut = item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : '';
                const action = item.action ? `data-action="${items.indexOf(item)}"` : '';
                html += `<div class="menu-item-row" ${action}>${checkmark}<span>${item.label}</span>${shortcut}</div>`;
            }
        });
        dropdown.innerHTML = html;

        // Wire actions
        dropdown.querySelectorAll('.menu-item-row[data-action]').forEach((row, i) => {
            const idx = parseInt(row.dataset.action);
            const item = items[idx];
            if (item && item.action) {
                row.addEventListener('click', () => {
                    item.action();
                    hideMenu();
                });
            }
        });
    }

    function hideMenu() {
        dropdown.classList.add('hidden');
        document.querySelectorAll('.menu-item.active').forEach(el => el.classList.remove('active'));
        currentMenu = null;
        currentMenuTarget = null;
    }

    // ---- Active App ----
    function setActiveApp(appId) {
        const app = OS.getApp(appId);
        const nameEl = document.getElementById('active-app-name');
        if (app && nameEl) nameEl.textContent = app.name;
        OS.state.activeApp = appId;
    }

    // ---- Init ----
    function init() {
        // Menu clicks
        document.querySelectorAll('.menu-bar-left .menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const menuKey = item.dataset.menu;
                if (currentMenu === menuKey) {
                    hideMenu();
                } else {
                    showMenu(menuKey, item);
                }
            });
        });

        // Hover to switch menus when one is open
        document.querySelectorAll('.menu-bar-left .menu-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (currentMenu && item.dataset.menu !== currentMenu) {
                    showMenu(item.dataset.menu, item);
                }
            });
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#menu-dropdown') && !e.target.closest('.menu-bar-left .menu-item')) {
                hideMenu();
            }
        });

        // Spotlight click
        document.getElementById('status-search').addEventListener('click', () => Spotlight.show());

        // Control Center click
        document.getElementById('status-control-center').addEventListener('click', (e) => {
            e.stopPropagation();
            ControlCenter.toggle();
        });

        // Date/Time click → Notification Center
        document.getElementById('status-datetime').addEventListener('click', (e) => {
            e.stopPropagation();
            NotificationCenter.toggle();
        });

        // Clock
        updateClock();
        setInterval(updateClock, 1000);
    }

    return { init, setActiveApp, showMenu, hideMenu };
})();

window.MenuBar = MenuBar;
