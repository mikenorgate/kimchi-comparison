/* fs.js — persistent virtual file system shared by Finder, Terminal, TextEdit, Preview, Desktop */
'use strict';

// Apps that appear in /Applications (id must match registry in apps.*.js)
const CHILD_APPS = [
  { id: 'safari', name: 'Safari' }, { id: 'mail', name: 'Mail' }, { id: 'messages', name: 'Messages' },
  { id: 'maps', name: 'Maps' }, { id: 'photos', name: 'Photos' },
  { id: 'calendar', name: 'Calendar' }, { id: 'notes', name: 'Notes' }, { id: 'reminders', name: 'Reminders' },
  { id: 'music', name: 'Music' }, { id: 'appstore', name: 'App Store' },
  { id: 'terminal', name: 'Terminal' }, { id: 'calculator', name: 'Calculator' }, { id: 'weather', name: 'Weather' },
  { id: 'clock', name: 'Clock' }, { id: 'textedit', name: 'TextEdit' }, { id: 'preview', name: 'Preview' },
  { id: 'activity', name: 'Activity Monitor' }, { id: 'photobooth', name: 'Photo Booth' },
  { id: 'stickies', name: 'Stickies' }, { id: 'settings', name: 'System Settings' },
];

const FS = {
  KEY: 'tahoe-fs',
  TRASHKEY: 'tahoe-trash',
  root: null,
  trash: [],
  HOME: '/Users/mike',

  file(name, content = '', kind = 'text', extra = {}) {
    return Object.assign({ name, type: 'file', kind, content, modified: Date.now() }, extra);
  },
  dir(name, children = [], extra = {}) {
    const o = Object.assign({ name, type: 'dir', children: {}, modified: Date.now() }, extra);
    children.forEach(c => o.children[c.name] = c);
    return o;
  },

  seed() {
    const pics = [];
    const hues = [205, 340, 25, 265, 150, 0, 45, 190, 300, 120, 220, 15];
    const names = ['Big Sur', 'Yosemite', 'Half Dome', 'Tahoe Shore', 'Golden Gate', 'Sequoia Trail', 'Mono Lake', 'Point Reyes', 'Joshua Tree', 'Pfeiffer Beach', 'Emerald Bay', 'Muir Woods'];
    for (let i = 0; i < 12; i++) {
      const h = hues[i];
      pics.push(this.file(names[i] + '.jpg', '', 'image', {
        sizeKB: 1800 + i * 640,
        img: `radial-gradient(90% 80% at ${20 + (i * 13) % 60}% ${15 + (i * 23) % 50}%, hsl(${h},85%,72%) 0%, transparent 60%), radial-gradient(90% 90% at ${70 - (i * 7) % 40}% ${85 - (i * 11) % 40}%, hsl(${(h + 60) % 360},80%,60%) 0%, transparent 65%), linear-gradient(${120 + i * 25}deg, hsl(${(h + 180) % 360},60%,38%), hsl(${(h + 200) % 360},55%,22%))`,
      }));
    }
    const appFiles = CHILD_APPS.map(a => ({ name: a.name + '.app', type: 'app', appId: a.id, modified: Date.now() }));
    const r = this.dir('Macintosh HD', [
      this.dir('Applications', [], { sys: true }),
      this.dir('System', [this.dir('Library', [this.dir('Core Services', [], { sys: true })], { sys: true })], { sys: true }),
      this.dir('Library', [this.dir('Fonts'), this.dir('Preferences')], { sys: true }),
      this.dir('Users', [
        this.dir('mike', [
          this.dir('Desktop', [
            this.file('Welcome.txt', 'Welcome to macOS Tahoe (Web Edition)!\n\nEverything here works: drag windows, open apps from the Dock or Launchpad,\nsearch with Spotlight (Cmd+Space), change wallpaper in System Settings,\nand try the Terminal — it shares this same virtual file system.\n\nEnjoy the Liquid Glass.', 'text'),
            this.dir('Projects', [
              this.file('Roadmap.md', '# Q3 Roadmap\n\n- Ship Tahoe web demo\n- Polish Liquid Glass\n- Add more apps\n', 'text'),
              this.file('Ideas.txt', 'Ideas:\n1. Widget on the desktop\n2. Folder colors\n', 'text'),
            ]),
          ]),
          this.dir('Documents', [
            this.file('Meeting Notes.txt', 'Sync with design team — Tuesday 10 AM\n\nAgenda:\n- Liquid Glass specular highlights\n- Control Center layout\n- Dock magnification curve\n', 'text'),
            this.file('Reading List.md', 'Books:\n* The Design of Everyday Things\n* Creative Selection\n', 'text'),
            this.dir('Receipts', [this.file('App Store.pdf', '', 'pdf', { sizeKB: 96 })]),
          ]),
          this.dir('Downloads', [
            this.file('macOS-Tahoe-Wallpaper.heic', '', 'image', { sizeKB: 4200, img: WALLPAPERS[0].css }),
            this.file('Keynote.dmg', '', 'generic', { sizeKB: 812000 }),
          ]),
          this.dir('Pictures', pics),
          this.dir('Music', []),
          this.file('.zshrc', 'export PS1="%n@%m %1~ %# "\nalias ll="ls -la"\n', 'text', { hidden: true }),
        ]),
      ]),
    ], { sys: true });
    const apps = r.children.Applications;
    appFiles.forEach(a => apps.children[a.name] = a);
    return r;
  },

  load() {
    try { this.root = JSON.parse(localStorage.getItem(this.KEY)); } catch { this.root = null; }
    if (!this.root) { this.root = this.seed(); this.save(); }
    try { this.trash = JSON.parse(localStorage.getItem(this.TRASHKEY)) || []; } catch { this.trash = []; }
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.root)); Bus.emit('fs'); },
  saveTrash() { localStorage.setItem(this.TRASHKEY, JSON.stringify(this.trash)); Bus.emit('trash'); },

  norm(path, cwd = this.HOME) {
    if (!path) return cwd;
    if (path.startsWith('~')) path = this.HOME + path.slice(1);
    if (!path.startsWith('/')) path = cwd + '/' + path;
    const parts = [];
    for (const p of path.split('/')) {
      if (p === '' || p === '.') continue;
      if (p === '..') parts.pop(); else parts.push(p);
    }
    return '/' + parts.join('/');
  },
  get(path) {
    if (path === '/' ) return this.root;
    let n = this.root;
    for (const p of path.split('/').filter(Boolean)) {
      if (!n || n.type !== 'dir') return null;
      n = n.children[p];
    }
    return n || null;
  },
  parent(path) {
    const i = path.lastIndexOf('/');
    return { dir: this.get(i <= 0 ? '/' : path.slice(0, i)), path: i <= 0 ? '/' : path.slice(0, i), name: path.slice(i + 1) };
  },
  list(path) {
    const d = this.get(path);
    if (!d || d.type !== 'dir') return null;
    return Object.values(d.children).sort((a, b) =>
      (a.type === 'dir' || a.type === 'app' ? 0 : 1) - (b.type === 'dir' || b.type === 'app' ? 0 : 1) ||
      a.name.localeCompare(b.name, undefined, { numeric: true }));
  },
  mkdir(path, name) {
    const d = this.get(path);
    if (!d || d.type !== 'dir' || d.children[name]) return null;
    d.children[name] = this.dir(name); d.modified = Date.now(); this.save();
    return d.children[name];
  },
  write(path, name, content, kind = 'text', extra = {}) {
    const d = this.get(path);
    if (!d || d.type !== 'dir') return null;
    if (d.children[name] && d.children[name].type === 'file') {
      Object.assign(d.children[name], { content, kind, modified: Date.now() }, extra);
    } else {
      d.children[name] = this.file(name, content, kind, extra);
    }
    this.save(); return d.children[name];
  },
  rename(path, oldName, newName) {
    const d = this.get(path);
    if (!d || !d.children[oldName] || d.children[newName] || !newName.trim()) return false;
    const n = d.children[oldName]; n.name = newName; n.modified = Date.now();
    delete d.children[oldName]; d.children[newName] = n; this.save(); return true;
  },
  toTrash(path) {
    const p = this.parent(path);
    const node = p.dir && p.dir.children[p.name];
    if (!node) return false;
    delete p.dir.children[p.name];
    this.trash.push({ node, from: path });
    this.save(); this.saveTrash(); return true;
  },
  restoreTrash(i) {
    const t = this.trash[i]; if (!t) return;
    const p = this.parent(t.from); let dir = p.dir;
    if (!dir || dir.type !== 'dir') dir = this.get(this.HOME + '/Desktop');
    let name = t.node.name, k = 1;
    while (dir.children[name]) name = t.node.name.replace(/(\.[^.]+)?$/, ` ${++k}$1`);
    t.node.name = name; dir.children[name] = t.node;
    this.trash.splice(i, 1); this.save(); this.saveTrash();
  },
  emptyTrash() { this.trash = []; this.saveTrash(); Notif.push('Finder', 'Trash emptied', 'All items in the Trash were deleted.', 'trash'); },
  sizeOf(n) { // KB, recursive
    if (!n) return 0;
    if (n.type === 'file') return n.sizeKB || Math.max(1, Math.ceil((n.content || '').length / 1024));
    if (n.type === 'app') return 38000;
    return Object.values(n.children || {}).reduce((s, c) => s + this.sizeOf(c), 4);
  },
  walk(cb, path = '/') {
    const n = this.get(path);
    if (!n) return;
    cb(n, path);
    if (n.type === 'dir') for (const c of Object.values(n.children)) {
      if (path === '/System') continue;
      this.walk(cb, path === '/' ? '/' + c.name : path + '/' + c.name);
    }
  },
};
FS.load();

// Route a file to the right app
function openFile(path) {
  const node = FS.get(path);
  if (!node) return;
  if (node.type === 'dir') return WM.open('finder', { path });
  if (node.type === 'app') return WM.open(node.appId);
  const ext = path.split('.').pop().toLowerCase();
  if (node.kind === 'image' || ['jpg','jpeg','png','gif','heic','webp'].includes(ext)) return WM.open('preview', { path });
  if (node.kind === 'pdf' || ext === 'pdf') return WM.open('preview', { path });
  return WM.open('textedit', { path });
}
