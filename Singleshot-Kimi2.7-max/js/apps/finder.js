import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

const fileSystem = {
  name: 'Macintosh HD',
  type: 'root',
  children: [
    {
      name: 'Applications',
      type: 'folder',
      children: [
        { name: 'Safari.app', type: 'app', icon: '🧭' },
        { name: 'Notes.app', type: 'app', icon: '📝' },
        { name: 'Terminal.app', type: 'app', icon: '💻' },
        { name: 'Calculator.app', type: 'app', icon: '🧮' },
        { name: 'Calendar.app', type: 'app', icon: '📅' },
        { name: 'Photos.app', type: 'app', icon: '🖼️' },
        { name: 'App Store.app', type: 'app', icon: '🛍️' }
      ]
    },
    {
      name: 'Users',
      type: 'folder',
      children: [
        {
          name: 'mike',
          type: 'folder',
          children: [
            { name: 'Documents', type: 'folder', children: [
              { name: 'Resume.pdf', type: 'pdf', icon: '📄' },
              { name: 'Budget.xlsx', type: 'sheet', icon: '📊' }
            ]},
            { name: 'Downloads', type: 'folder', children: [
              { name: 'image.png', type: 'image', icon: '🖼️' },
              { name: 'installer.dmg', type: 'dmg', icon: '💿' }
            ]},
            { name: 'Desktop', type: 'folder', children: [] },
            { name: 'todo.txt', type: 'text', icon: '📃' }
          ]
        }
      ]
    },
    { name: 'System', type: 'folder', children: [] },
    { name: 'Library', type: 'folder', children: [] }
  ]
};

let openCount = 0;

export function openFinder(apps) {
  openCount++;
  const initialPath = [fileSystem];
  openWindow('finder', openCount === 1 ? 'Finder' : `Finder (${openCount})`, renderFinder(initialPath), {
    width: 760, height: 480,
    onMount: (el) => {
      bindFinder(el, initialPath, apps);
      markAppRunning('finder', true);
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="finder"]')) markAppRunning('finder', false);
      });
    }
  });
}

function renderFinder(path) {
  const folder = path[path.length - 1];
  const favorites = [
    { name: 'AirDrop', icon: '⬆️' },
    { name: 'Recents', icon: '🕐' },
    { name: 'Applications', icon: '📁' },
    { name: 'Desktop', icon: '🖥️' },
    { name: 'Documents', icon: '📂' },
    { name: 'Downloads', icon: '⬇️' }
  ];

  return `
    <div class="finder">
      <div class="finder-sidebar">
        <h4>Favorites</h4>
        ${favorites.map(f => `<div class="finder-item"><span>${f.icon}</span>${f.name}</div>`).join('')}
        <h4>iCloud</h4>
        <div class="finder-item"><span>☁️</span>iCloud Drive</div>
        <h4>Locations</h4>
        <div class="finder-item selected"><span>💿</span>Macintosh HD</div>
      </div>
      <div class="finder-main">
        <div class="finder-toolbar">
          <button class="safari-btn" data-nav="back">◀</button>
          <button class="safari-btn" data-nav="forward">▶</button>
          <div class="finder-path">${path.map(p => p.name).join(' ▸ ')}</div>
        </div>
        <div class="finder-grid">
          ${(folder.children || []).map(child => `
            <div class="item" data-type="${child.type}" data-name="${child.name}">
              <div class="icon">${child.icon || getIcon(child.type)}</div>
              <div class="name">${child.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function getIcon(type) {
  const map = { folder: '📁', app: '📦', pdf: '📄', text: '📃', image: '🖼️', sheet: '📊', dmg: '💿' };
  return map[type] || '📄';
}

function bindFinder(el, path, apps) {
  const content = el.querySelector('.window-content');
  const refresh = () => {
    content.innerHTML = renderFinder(path);
    bindFinder(el, path, apps);
  };

  content.querySelectorAll('.finder-grid .item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      content.querySelectorAll('.finder-grid .item.selected').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
    item.addEventListener('dblclick', () => {
      const type = item.dataset.type;
      const name = item.dataset.name;
      const current = path[path.length - 1];
      const child = current.children.find(c => c.name === name);
      if (!child) return;
      if (type === 'folder') {
        path.push(child);
        refresh();
      } else if (type === 'app') {
        const nameKey = name.replace('.app', '').toLowerCase();
        const appId = { 'app store': 'appStore' }[nameKey] || nameKey;
        if (apps[appId]) apps[appId].open();
      }
    });
  });

  const backBtn = content.querySelector('[data-nav="back"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (path.length > 1) {
        path.pop();
        refresh();
      }
    });
  }
}
