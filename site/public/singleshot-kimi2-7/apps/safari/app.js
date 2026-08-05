import { App, registerApp } from '../../js/appRegistry.js';
import { $, $$ } from '../../js/utils.js';

class SafariApp extends App {
  constructor() {
    super({ id: 'safari', name: 'Safari', width: 960, height: 620, emoji: '🧭', iconGradient: ['#00d2ff', '#3a7bd5'], iconColor: '#fff',
      menus: [
        { label: 'Safari', items: [
          { label: 'About Safari', action: () => alert('Safari\nVersion 1.0 (Tahoe Web)') },
          '-',
          { label: 'Preferences…', shortcut: '⌘,' },
          '-',
          { label: 'Hide Safari', shortcut: '⌘H' }
        ]},
        { label: 'File', items: [
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'New Private Window', shortcut: '⇧⌘N' },
          { label: 'Open Location…', shortcut: '⌘L' },
          '-',
          { label: 'Close Window', shortcut: '⌘W' }
        ]},
        { label: 'Edit', items: [
          { label: 'Undo', shortcut: '⌘Z', disabled: true },
          { label: 'Cut', shortcut: '⌘X', disabled: true },
          { label: 'Copy', shortcut: '⌘C', disabled: true },
          { label: 'Paste', shortcut: '⌘V', disabled: true }
        ]},
        { label: 'View', items: [
          { label: 'Reload Page', shortcut: '⌘R' },
          { label: 'Actual Size', shortcut: '⌘0' },
          { label: 'Zoom In', shortcut: '⌘+' },
          { label: 'Zoom Out', shortcut: '⌘-' }
        ]},
        { label: 'History', items: [
          { label: 'Back', shortcut: '⌘[' },
          { label: 'Forward', shortcut: '⌘]' },
          { label: 'Home' }
        ]},
        { label: 'Window', items: [
          { label: 'Minimize', shortcut: '⌘M' },
          { label: 'Zoom' }
        ]},
        { label: 'Help', items: [
          { label: 'Safari Help' }
        ]}
      ]
    });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'safari';
    root.innerHTML = `
      <div class="safari-toolbar">
        <div class="safari-nav">
          <button id="back">‹</button>
          <button id="forward">›</button>
        </div>
        <input type="text" class="safari-url" id="url" value="https://www.apple.com" />
        <button id="reload">↻</button>
      </div>
      <iframe class="safari-frame" id="frame" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
      <div class="safari-start" id="start">
        <h2>Safari</h2>
        <p>Enter a URL to start browsing.</p>
        <div class="safari-favorites">
          <div class="sfav" data-url="https://www.apple.com">🍎 Apple</div>
          <div class="sfav" data-url="https://www.wikipedia.org">📚 Wikipedia</div>
          <div class="sfav" data-url="https://www.github.com">🐙 GitHub</div>
          <div class="sfav" data-url="https://www.reddit.com">🔴 Reddit</div>
        </div>
      </div>
    `;

    const urlInput = $('#url', root);
    const frame = $('#frame', root);
    const start = $('#start', root);
    const history = [];
    let pos = -1;

    const go = (url) => {
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      start.style.display = 'none';
      frame.style.display = 'block';
      urlInput.value = url;
      frame.src = url;
      history.push(url);
      pos = history.length - 1;
    };

    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(urlInput.value); });
    $('#reload', root).addEventListener('click', () => { frame.src = frame.src; });
    $('#back', root).addEventListener('click', () => { if (pos > 0) { pos--; frame.src = history[pos]; urlInput.value = history[pos]; } });
    $('#forward', root).addEventListener('click', () => { if (pos < history.length - 1) { pos++; frame.src = history[pos]; urlInput.value = history[pos]; } });
    $$('.sfav', root).forEach(el => el.addEventListener('click', () => go(el.dataset.url)));

    return root;
  }
}

registerApp(new SafariApp());
