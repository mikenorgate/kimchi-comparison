/* ============================================================
   macOS Tahoe — Boot & Initialization
   ============================================================ */

(function() {
    'use strict';

    function boot() {
        // Initialize all subsystems
        MenuBar.init();
        Dock.init();
        Spotlight.init();
        ControlCenter.init();
        NotificationCenter.init();

        // Add wallpaper mountains
        const wallpaper = document.getElementById('wallpaper');
        if (wallpaper && !wallpaper.querySelector('.wallpaper-mountains')) {
            const mtns = document.createElement('div');
            mtns.className = 'wallpaper-mountains';
            wallpaper.appendChild(mtns);
        }

        // Add desktop icons
        const desktop = document.getElementById('desktop');
        if (desktop && !desktop.querySelector('.desktop-icons')) {
            const icons = document.createElement('div');
            icons.className = 'desktop-icons';
            icons.innerHTML = `
                <div class="desktop-icon" data-app="finder">
                    <div class="desktop-icon-img">📁</div>
                    <div class="desktop-icon-label">Documents</div>
                </div>
                <div class="desktop-icon" data-app="textedit">
                    <div class="desktop-icon-img">📄</div>
                    <div class="desktop-icon-label">readme.txt</div>
                </div>
            `;
            desktop.appendChild(icons);

            icons.querySelectorAll('.desktop-icon').forEach(icon => {
                icon.addEventListener('dblclick', () => {
                    const appId = icon.dataset.app;
                    if (appId) Dock.launchApp(appId);
                });
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    icons.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                    icon.classList.add('selected');
                });
            });

            // Click desktop to deselect
            document.getElementById('wallpaper').addEventListener('click', () => {
                icons.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            });
        }

        // Right-click context menu on desktop
        document.getElementById('wallpaper').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, [
                { label: 'New Folder', action: () => OS.notify({ app: 'Finder', title: 'New Folder', body: 'Created "Untitled Folder"', iconChar: '📁' }) },
                { label: 'Get Info' },
                { divider: true },
                { label: 'Change Wallpaper…', action: () => OS.openWindow('settings', { data: { panel: 'wallpaper' } }) },
                { label: 'Customize…' },
                { divider: true },
                { label: 'Use Stacks' },
                { label: 'Sort By', submenu: [] },
                { label: 'Clean Up' },
                { divider: true },
                { label: 'Show View Options' },
            ]);
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd+Q → "quit" (reload for demo)
            if (e.metaKey && e.key === 'q') {
                e.preventDefault();
                const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
                if (top) OS.closeWindow(top.id);
            }
            // Cmd+W → close window
            if (e.metaKey && e.key === 'w' && !e.shiftKey) {
                const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
                if (top) {
                    e.preventDefault();
                    OS.closeWindow(top.id);
                }
            }
            // Cmd+M → minimize
            if (e.metaKey && e.key === 'm') {
                const top = OS.state.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0];
                if (top) {
                    e.preventDefault();
                    OS.minimizeWindow(top.id);
                }
            }
        });

        // Show welcome notification after boot
        setTimeout(() => {
            OS.notify({
                app: 'macOS Tahoe',
                title: 'Welcome to macOS Tahoe',
                body: 'Explore the new Liquid Glass design. Click apps in the Dock to get started.',
                iconChar: '',
                iconBg: '#0a84ff',
                duration: 6000,
            });
        }, 1500);

        // Remove boot screen
        setTimeout(() => {
            const bootScreen = document.getElementById('boot-screen');
            if (bootScreen) {
                bootScreen.classList.add('hidden');
                setTimeout(() => bootScreen.remove(), 600);
            }
        }, 2000);
    }

    // Context menu helper
    function showContextMenu(x, y, items) {
        const menu = document.getElementById('context-menu');
        let html = '';
        items.forEach(item => {
            if (item.divider) {
                html += '<div class="menu-divider"></div>';
            } else {
                const action = item.action ? `data-action="${items.indexOf(item)}"` : '';
                const submenu = item.submenu ? '<span style="opacity:0.4">▶</span>' : '';
                html += `<div class="menu-item-row" ${action}><span>${item.label}</span>${submenu}</div>`;
            }
        });
        menu.innerHTML = html;
        menu.style.left = Math.min(x, window.innerWidth - 220) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - 300) + 'px';
        menu.classList.remove('hidden');

        // Wire actions
        menu.querySelectorAll('.menu-item-row[data-action]').forEach(row => {
            row.addEventListener('click', () => {
                const idx = parseInt(row.dataset.action);
                if (items[idx] && items[idx].action) items[idx].action();
                menu.classList.add('hidden');
            });
        });
    }

    // Click anywhere to close context menu
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#context-menu')) {
            document.getElementById('context-menu').classList.add('hidden');
        }
    });

    // Boot sequence
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootSequence);
    } else {
        bootSequence();
    }

    function bootSequence() {
        // Animate boot progress bar
        const bar = document.querySelector('.boot-progress-bar');
        if (bar) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    boot();
                }
                bar.style.width = progress + '%';
            }, 100);
        } else {
            boot();
        }
    }
})();
