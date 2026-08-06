/* ============================================================
   macOS Tahoe — Dock
   ============================================================ */

const Dock = (() => {
    const dockEl = document.getElementById('dock');

    // Dock app list (order matters)
    const dockApps = [
        'finder', 'safari', 'messages', 'mail', 'maps', 'photos',
        'notes', 'reminders', 'calendar', 'music', 'podcasts', 'tv',
        'appstore', 'clock', 'weather', 'calculator', 'terminal',
        'settings', 'phone', 'games', 'journal',
    ];

    // Separators after these apps
    const dividersAfter = new Set(['maps', 'tv', 'settings', 'journal']);

    function getDockIcon(appId) {
        const app = OS.getApp(appId);
        if (!app) return '';
        return app.dockIcon || app.icon || '📦';
    }

    function getAppName(appId) {
        const app = OS.getApp(appId);
        return app ? app.name : appId;
    }

    function render() {
        dockEl.innerHTML = '';

        dockApps.forEach(appId => {
            const app = OS.getApp(appId);
            if (!app) return;

            const item = document.createElement('div');
            item.className = 'dock-item';
            item.dataset.appId = appId;
            item.innerHTML = `
                <div class="dock-label">${getAppName(appId)}</div>
                <div class="dock-icon ${app.iconClass}">
                    ${app.dockIcon || app.icon || '📦'}
                </div>
                <div class="dock-indicator"></div>
            `;
            item.addEventListener('click', () => launchApp(appId));
            dockEl.appendChild(item);

            if (dividersAfter.has(appId)) {
                const div = document.createElement('div');
                div.className = 'dock-divider';
                dockEl.appendChild(div);
            }
        });

        updateRunning();
    }

    function launchApp(appId) {
        const app = OS.getApp(appId);
        if (!app) return;

        // If already running, focus the window (or unminimize)
        const windows = OS.getWindowsByApp(appId);
        if (windows.length > 0) {
            const visible = windows.find(w => !w.minimized);
            if (visible) {
                OS.focusWindow(visible.id);
            } else {
                OS.unminimizeWindow(windows[0].id);
            }
            return;
        }

        // Bounce animation
        const dockItem = dockEl.querySelector(`.dock-item[data-app-id="${appId}"]`);
        if (dockItem) {
            dockItem.classList.add('dock-bounce');
            setTimeout(() => dockItem.classList.remove('dock-bounce'), 500);
        }

        // Open window
        OS.openWindow(appId);
    }

    function updateRunning() {
        dockEl.querySelectorAll('.dock-item').forEach(item => {
            const appId = item.dataset.appId;
            const running = OS.isAppRunning(appId);
            item.classList.toggle('running', running);
        });
    }

    function init() {
        render();
    }

    return { init, render, updateRunning, launchApp };
})();

window.Dock = Dock;
