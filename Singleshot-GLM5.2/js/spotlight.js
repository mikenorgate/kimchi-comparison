/* ============================================================
   macOS Tahoe — Spotlight Search
   ============================================================ */

const Spotlight = (() => {
    const overlay = document.getElementById('spotlight-overlay');
    const input = document.getElementById('spotlight-input');
    const resultsEl = document.getElementById('spotlight-results');
    let selectedIndex = 0;
    let currentResults = [];

    function show() {
        overlay.classList.remove('hidden');
        input.value = '';
        resultsEl.innerHTML = '';
        currentResults = [];
        setTimeout(() => input.focus(), 50);
    }

    function hide() {
        overlay.classList.add('hidden');
    }

    function search(query) {
        query = query.toLowerCase().trim();
        if (!query) {
            resultsEl.innerHTML = '';
            currentResults = [];
            return;
        }

        const results = [];

        // Search apps
        Object.values(OS.state.apps).forEach(app => {
            if (app.name.toLowerCase().includes(query) || app.id.includes(query)) {
                results.push({
                    type: 'app',
                    label: app.name,
                    sublabel: 'Application',
                    icon: app.dockIcon || app.icon || '📦',
                    iconClass: app.iconClass,
                    action: () => { hide(); Dock.launchApp(app.id); },
                });
            }
        });

        // Search "actions"
        const actions = [
            { label: 'New Note', sublabel: 'Action', icon: '📝', keywords: ['note', 'new note', 'create note'], action: () => { hide(); OS.openWindow('notes'); } },
            { label: 'New Email', sublabel: 'Action', icon: '✉️', keywords: ['email', 'mail', 'new email'], action: () => { hide(); OS.openWindow('mail'); } },
            { label: 'New Reminder', sublabel: 'Action', icon: '✅', keywords: ['remind', 'reminder', 'todo'], action: () => { hide(); OS.openWindow('reminders'); } },
            { label: 'Open Terminal', sublabel: 'Action', icon: '⬛', keywords: ['terminal', 'shell', 'command'], action: () => { hide(); OS.openWindow('terminal'); } },
            { label: 'Calculator', sublabel: 'Action', icon: '🧮', keywords: ['calc', 'calculate', 'math'], action: () => { hide(); OS.openWindow('calculator'); } },
            { label: 'Search the Web', sublabel: 'Action', icon: '🌐', keywords: ['web', 'google', 'search web'], action: () => { hide(); OS.openWindow('safari', { data: { url: 'https://www.google.com/search?q=' + encodeURIComponent(query) } }); } },
        ];

        actions.forEach(a => {
            if (a.keywords.some(k => k.includes(query) || query.includes(k))) {
                results.push({ type: 'action', label: a.label, sublabel: a.sublabel, icon: a.icon, action: a.action });
            }
        });

        // Calculator result
        if (/^[\d\s+\-*/().%^]+$/.test(query) && query.length > 1) {
            try {
                const result = Function('"use strict";return (' + query.replace(/%/g, '/100') + ')')();
                if (typeof result === 'number' && !isNaN(result)) {
                    results.unshift({
                        type: 'calc',
                        label: result.toString(),
                        sublabel: `${query} =`,
                        icon: '=',
                        iconClass: 'icon-calc',
                        action: () => { hide(); },
                    });
                }
            } catch(e) {}
        }

        // Definitions / knowledge
        const knowledge = [
            { keywords: ['time', 'what time'], label: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }), sublabel: 'Current Time', icon: '🕐' },
            { keywords: ['date', 'today', 'what day'], label: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), sublabel: 'Today\'s Date', icon: '📅' },
        ];

        knowledge.forEach(k => {
            if (k.keywords.some(kw => query.includes(kw))) {
                results.push({ type: 'info', label: k.label, sublabel: k.sublabel, icon: k.icon, iconClass: '', action: () => {} });
            }
        });

        currentResults = results;
        selectedIndex = 0;
        renderResults();
    }

    function renderResults() {
        if (currentResults.length === 0) {
            resultsEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:14px;">No results</div>';
            return;
        }

        let html = '';
        let lastType = '';

        currentResults.forEach((r, i) => {
            if (r.type !== lastType) {
                const labels = { app: 'Applications', action: 'Actions', calc: 'Calculator', info: 'Information' };
                html += `<div class="spotlight-section-label">${labels[r.type] || 'Results'}</div>`;
                lastType = r.type;
            }
            const selected = i === selectedIndex ? 'selected' : '';
            const iconClass = r.iconClass ? `${r.iconClass}` : '';
            html += `
                <div class="spotlight-result ${selected}" data-idx="${i}">
                    <div class="spotlight-result-icon ${iconClass}">${r.icon}</div>
                    <div>
                        <div class="spotlight-result-name">${r.label}</div>
                        <div class="spotlight-result-info">${r.sublabel}</div>
                    </div>
                </div>
            `;
        });

        resultsEl.innerHTML = html;

        // Wire clicks
        resultsEl.querySelectorAll('.spotlight-result').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx);
                if (currentResults[idx] && currentResults[idx].action) {
                    currentResults[idx].action();
                }
            });
            el.addEventListener('mouseenter', () => {
                selectedIndex = parseInt(el.dataset.idx);
                updateSelection();
            });
        });
    }

    function updateSelection() {
        resultsEl.querySelectorAll('.spotlight-result').forEach((el, i) => {
            el.classList.toggle('selected', i === selectedIndex);
        });
    }

    function init() {
        input.addEventListener('input', () => search(input.value));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hide();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(currentResults.length - 1, selectedIndex + 1);
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(0, selectedIndex - 1);
                updateSelection();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentResults[selectedIndex] && currentResults[selectedIndex].action) {
                    currentResults[selectedIndex].action();
                }
            }
        });

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hide();
        });

        // Keyboard shortcut: Cmd+Space
        document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.code === 'Space') {
                e.preventDefault();
                if (overlay.classList.contains('hidden')) show();
                else hide();
            }
        });
    }

    return { init, show, hide };
})();

window.Spotlight = Spotlight;
