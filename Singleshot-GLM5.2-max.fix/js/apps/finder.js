// Finder — browse the virtual filesystem with sidebar + icon grid.
import { list, resolve, makeDir, remove } from '../vfs.js';
import { glyph, APP_ICONS } from '../icons.js';
import { bus, toast } from '../store.js';

export const windowConfig = { width: 820, height: 520 };

const SIDEBAR = [
  { id:'recents', name:'Recents', icon:glyph('clock',15), path:'/Recents' },
  { id:'desktop', name:'Desktop', icon:glyph('desktop',15), path:'/Desktop' },
  { id:'documents', name:'Documents', icon:glyph('doc',15), path:'/Documents' },
  { id:'downloads', name:'Downloads', icon:glyph('download',15), path:'/Downloads' },
  { id:'pictures', name:'Pictures', icon:glyph('image',15), path:'/Pictures' },
  { id:'movies', name:'Movies', icon:glyph('star',15), path:'/Movies' },
  { id:'music', name:'Music', icon:glyph('star',15), path:'/Music' },
  { id:'applications', name:'Applications', icon:glyph('applications',15), path:'/Applications' },
];

let cwd = '/Desktop';
let selName = null;

export function mount(el) {
  el.innerHTML = `
    <div style="display:flex;height:100%">
      <div class="sidebar finder-side scroll">
        <div class="sb-h">Favorites</div>
        ${SIDEBAR.map(s=>`<div class="sb-item" data-path="${s.path}">${s.icon}<span>${s.name}</span></div>`).join('')}
        <div class="sb-h">Locations</div>
        <div class="sb-item" data-path="/"><span>Macintosh HD</span></div>
        <div class="sb-item" data-path="/Network"><span>Network</span></div>
        <div class="sb-h">Tags</div>
        <div class="sb-item"><span style="color:#ff3b30">●</span><span>Red</span></div>
        <div class="sb-item"><span style="color:#ff9500">●</span><span>Orange</span></div>
        <div class="sb-item"><span style="color:#28c840">●</span><span>Green</span></div>
        <div class="sb-item"><span style="color:#0a84ff">●</span><span>Blue</span></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div class="finder-toolbar">
          <div class="nav-btn" data-act="back">${glyph('chevronLeft',16)}</div>
          <div class="nav-btn" data-act="forward">${glyph('chevronRight',16)}</div>
          <div class="path">${cwd}</div>
          <div class="nav-btn" data-act="newfolder" title="New Folder">${glyph('plus',16)}</div>
          <div class="nav-btn" data-act="delete" title="Delete">${glyph('tag',16)}</div>
        </div>
        <div class="finder-grid scroll" style="flex:1"></div>
        <div style="padding:5px 12px;font-size:11px;opacity:.5;border-top:0.5px solid rgba(0,0,0,.08)">${list(cwd).length} items</div>
      </div>
    </div>
  `;
  const grid = el.querySelector('.finder-grid');
  const pathEl = el.querySelector('.path');

  function refresh() {
    pathEl.textContent = cwd;
    const items = list(cwd);
    grid.innerHTML = items.map(node => {
      const icon = nodeIcon(node);
      return `<div class="finder-file ${selName===node.name?'sel':''}" data-name="${node.name}">
        <div class="ff-icon">${icon}</div>
        <div class="ff-name">${node.name}</div>
      </div>`;
    }).join('') || '<div style="padding:30px;opacity:.5;font-size:13px">This folder is empty</div>';
    el.querySelector('.finder-grid').nextElementSibling.textContent = `${items.length} items`;
    wireFiles();
    highlightSidebar();
  }

  function highlightSidebar() {
    el.querySelectorAll('.sb-item').forEach(s => s.classList.toggle('sel', s.dataset.path === cwd));
  }

  function nodeIcon(node) {
    if (node.type === 'dir') return `<div style="width:46px;height:46px;color:#5ab4ff">${glyph('folder',46)}</div>`;
    const ext = node.name.split('.').pop().toLowerCase();
    if (['png','jpg','jpeg','gif','webp','heic'].includes(ext)) return `<div style="width:46px;height:46px;color:#28c840">${glyph('image',46)}</div>`;
    if (node.name.endsWith('.app')) return APP_ICONS.app;
    return `<div style="width:46px;height:46px;color:#8a8a90">${glyph('doc',46)}</div>`;
  }

  function wireFiles() {
    grid.querySelectorAll('.finder-file').forEach(f => {
      f.addEventListener('click', (e) => {
        e.stopPropagation();
        selName = f.dataset.name;
        grid.querySelectorAll('.finder-file').forEach(x => x.classList.toggle('sel', x === f));
      });
      f.addEventListener('dblclick', () => {
        const node = resolve(cwd + '/' + f.dataset.name);
        if (!node) return;
        if (node.type === 'dir') { cwd = cwd === '/' ? '/' + node.name : cwd + '/' + node.name; selName = null; refresh(); }
        else if (node.name.endsWith('.app')) { bus.emit('launch', f.dataset.name.replace('.app','').toLowerCase()); }
        else { // open in TextEdit
          import('../appregistry.js').then(m => m.launchApp('textedit', { path: cwd + '/' + f.dataset.name }));
        }
      });
    });
  }

  // Sidebar clicks
  el.querySelectorAll('.sb-item[data-path]').forEach(s => {
    s.addEventListener('click', () => { cwd = s.dataset.path; selName = null; refresh(); });
  });
  // Nav buttons
  el.querySelector('[data-act="newfolder"]').addEventListener('click', () => {
    const name = 'New Folder';
    let i = 1, n = name;
    while (resolve(cwd + '/' + n)) n = `${name} ${++i}`;
    makeDir(cwd + '/' + n); refresh();
  });
  el.querySelector('[data-act="delete"]').addEventListener('click', () => {
    if (!selName) return;
    remove(cwd + '/' + selName); selName = null; refresh();
  });

  refresh();
}

export function fileMenu() {
  return [
    { label: 'New Finder Window', shortcut: '⌘N', action: () => bus.emit('launch','finder'), noCheck:true },
    { label: 'New Folder', shortcut: '⇧⌘N', action: () => toast('New folder created'), noCheck:true },
    { label: 'New Tab', shortcut: '⌘T', action: () => {}, noCheck:true },
    { sep: true },
    { label: 'Open', shortcut: '⌘O', action: () => {}, noCheck:true },
    { label: 'Open With', action: () => {}, noCheck:true },
    { sep: true },
    { label: 'Move to Trash', shortcut: '⌘⌫', action: () => {}, noCheck:true },
    { label: 'Get Info', shortcut: '⌘I', action: () => toast('File info'), noCheck:true },
    { sep: true },
    { label: 'Close Window', shortcut: '⌘W', action: () => {}, noCheck:true },
  ];
}
