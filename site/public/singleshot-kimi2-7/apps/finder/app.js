import { App, registerApp } from '../../js/appRegistry.js';
import { $, $$, load, save } from '../../js/utils.js';

const defaultTree = {
  name: 'Macintosh HD',
  type: 'root',
  children: [
    { name: 'Applications', type: 'folder', children: [
      { name: 'Safari.app', type: 'app' },
      { name: 'Mail.app', type: 'app' },
      { name: 'Messages.app', type: 'app' },
      { name: 'Photos.app', type: 'app' },
      { name: 'Notes.app', type: 'app' },
      { name: 'Calendar.app', type: 'app' },
      { name: 'Music.app', type: 'app' },
      { name: 'Terminal.app', type: 'app' },
      { name: 'Calculator.app', type: 'app' }
    ]},
    { name: 'Users', type: 'folder', children: [
      { name: 'mike', type: 'folder', children: [
        { name: 'Documents', type: 'folder', children: [
          { name: 'Welcome.txt', type: 'txt', content: 'Welcome to macOS Tahoe Web!' }
        ]},
        { name: 'Pictures', type: 'folder', children: [
          { name: 'Screenshot.png', type: 'img' }
        ]},
        { name: 'Downloads', type: 'folder', children: [] }
      ]}
    ]},
    { name: 'System', type: 'folder', children: [
      { name: 'Library', type: 'folder', children: [] }
    ]}
  ]
};

class FinderApp extends App {
  constructor() {
    super({ id: 'finder', name: 'Finder', width: 900, height: 560, singleton: true, emoji: '📁', iconGradient: ['#5eb6ff', '#007aff'], iconColor: '#fff',
      menus: [
        { label: 'Finder', items: [
          { label: 'About Finder', action: () => alert('Finder\nVersion 1.0 (Tahoe Web)') },
          '-',
          { label: 'Preferences…', shortcut: '⌘,' },
          '-',
          { label: 'Empty Trash…' },
          '-',
          { label: 'Hide Finder', shortcut: '⌘H' },
          { label: 'Quit Finder', shortcut: '⌘Q' }
        ]},
        { label: 'File', items: [
          { label: 'New Finder Window', shortcut: '⌘N', action: () => window.dispatchEvent(new CustomEvent('open-app', { detail: 'finder' })) },
          { label: 'New Folder', shortcut: '⇧⌘N' },
          { label: 'New Smart Folder' },
          '-',
          { label: 'Open', shortcut: '⌘O' },
          { label: 'Close Window', shortcut: '⌘W' }
        ]},
        { label: 'Edit', items: [
          { label: 'Undo', shortcut: '⌘Z', disabled: true },
          { label: 'Cut', shortcut: '⌘X', disabled: true },
          { label: 'Copy', shortcut: '⌘C', disabled: true },
          { label: 'Paste', shortcut: '⌘V', disabled: true }
        ]},
        { label: 'View', items: [
          { label: 'as Icons', shortcut: '⌘1' },
          { label: 'as List', shortcut: '⌘2' },
          { label: 'as Columns', shortcut: '⌘3' },
          { label: 'as Gallery', shortcut: '⌘4' }
        ]},
        { label: 'Go', items: [
          { label: 'Back', shortcut: '⌘[' },
          { label: 'Forward', shortcut: '⌘]' },
          { label: 'Enclosing Folder', shortcut: '⌘↑' },
          '-',
          { label: 'Applications', shortcut: '⇧⌘A' },
          { label: 'Desktop', shortcut: '⇧⌘D' },
          { label: 'Documents', shortcut: '⇧⌘O' },
          { label: 'Downloads', shortcut: '⌥⌘L' },
          { label: 'Home', shortcut: '⇧⌘H' }
        ]},
        { label: 'Window', items: [
          { label: 'Minimize', shortcut: '⌘M' },
          { label: 'Zoom' },
          { label: 'Show Previous Tab' },
          { label: 'Show Next Tab' },
          '-',
          { label: 'Bring All to Front', shortcut: '⌥⌘F' }
        ]},
        { label: 'Help', items: [
          { label: 'macOS Help', action: () => alert('Help is not available yet.') }
        ]}
      ]
    });
    this.tree = load('finder-tree', defaultTree);
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'finder';
    root.innerHTML = `
      <aside class="finder-sidebar">
        <div class="finder-section-title">Favorites</div>
        <div class="finder-sidebar-item active" data-path="/">Macintosh HD</div>
        <div class="finder-sidebar-item" data-path="/Applications">Applications</div>
        <div class="finder-sidebar-item" data-path="/Users/mike/Documents">Documents</div>
        <div class="finder-sidebar-item" data-path="/Users/mike/Downloads">Downloads</div>
        <div class="finder-section-title">Locations</div>
        <div class="finder-sidebar-item">iCloud Drive</div>
        <div class="finder-sidebar-item">AirDrop</div>
      </aside>
      <main class="finder-main">
        <div class="finder-toolbar">
          <button class="finder-btn" id="back">‹</button>
          <button class="finder-btn" id="forward">›</button>
          <div class="finder-path" id="path">Macintosh HD</div>
          <button class="finder-btn" id="new-folder">+ New Folder</button>
        </div>
        <div class="finder-files" id="files"></div>
      </main>
    `;

    let currentPath = '/';
    const filesEl = $('#files', root);
    const pathEl = $('#path', root);

    const find = (path) => {
      const parts = path.split('/').filter(Boolean);
      let node = this.tree;
      for (const p of parts) {
        node = node.children?.find(c => c.name === p);
        if (!node) return null;
      }
      return node;
    };

    const iconFor = (item) => {
      if (item.type === 'folder' || item.type === 'root') return '📁';
      if (item.type === 'app') return '🚀';
      if (item.type === 'img') return '🖼️';
      return '📄';
    };

    const renderFiles = () => {
      const node = find(currentPath);
      filesEl.innerHTML = '';
      if (!node?.children) return;
      node.children.forEach(item => {
        const el = document.createElement('div');
        el.className = 'finder-file';
        el.innerHTML = `<div class="finder-file-icon">${iconFor(item)}</div><div class="finder-file-name">${item.name}</div>`;
        el.addEventListener('dblclick', () => {
          if (item.type === 'folder' || item.type === 'root') {
            currentPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
            pathEl.textContent = currentPath === '/' ? 'Macintosh HD' : currentPath;
            renderFiles();
          } else if (item.type === 'txt') {
            // Could open text in Notes later
            alert(item.content || 'Empty file');
          }
        });
        filesEl.appendChild(el);
      });
    };

    $('#back', root).addEventListener('click', () => {
      if (currentPath === '/') return;
      currentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      pathEl.textContent = currentPath === '/' ? 'Macintosh HD' : currentPath;
      renderFiles();
    });

    $('#new-folder', root).addEventListener('click', () => {
      const name = prompt('Folder name:');
      if (!name) return;
      const node = find(currentPath);
      node.children = node.children || [];
      node.children.push({ name, type: 'folder', children: [] });
      save('finder-tree', this.tree);
      renderFiles();
    });

    $$('.finder-sidebar-item', root).forEach(item => {
      item.addEventListener('click', () => {
        const p = item.dataset.path || '/';
        currentPath = p;
        pathEl.textContent = currentPath === '/' ? 'Macintosh HD' : currentPath;
        renderFiles();
      });
    });

    renderFiles();
    return root;
  }
}

registerApp(new FinderApp());
