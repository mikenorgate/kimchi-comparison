/* fs.js — virtual filesystem (persisted to localStorage) */
(function () {
  const Mac = window.Mac;

  const HOME = '/Users/mike';
  const TRASH = HOME + '/.Trash';
  const APPS = '/Applications';

  function dir(name) { return { name, type: 'folder', children: {}, modified: Date.now() }; }
  function file(name, kind, content, extra) {
    return Object.assign({ name, type: 'file', kind: kind || 'text', content: content || '', modified: Date.now(), size: (content || '').length }, extra || {});
  }

  const WELCOME = `Welcome to macOS Tahoe (Web Edition)
=========================================

This is your virtual Macintosh. A few things to try:

  • Finder    — browse this virtual filesystem (you're reading a file in it)
  • Terminal  — run shell-ish commands: ls, cat, open safari, sw_vers
  • Spotlight — press Cmd+Space and type anything
  • Settings  — change the wallpaper, accent color, or go Dark Mode

Every document you create here is saved to your browser's localStorage.

Enjoy!
`;
  const MEETING = `Team Sync — Notes
=================

1. Ship the Liquid Glass redesign
2. Dock magnification physics review
3. Order more espresso

Action items:
- Mike: prepare demo of window server
- Priya: finalize Finder icon
`;
  const IDEAS = `# Big Ideas

- A window manager, but *swimmy*
- Translucency everywhere. Glass all the way down.
- Fake UNIX inside a browser tab
`;

  function defaultTree() {
    const root = dir(''); root.children = {
      'Applications': dir('Applications'),
      'System': dir('System'),
      'Users': dir('Users'),
    };
    const mike = dir('mike');
    root.children['Users'].children['mike'] = mike;
    mike.children = {
      'Desktop': dir('Desktop'),
      'Documents': dir('Documents'),
      'Downloads': dir('Downloads'),
      'Pictures': dir('Pictures'),
      'Music': dir('Music'),
      'Public': dir('Public'),
      '.Trash': dir('.Trash'),
    };
    mike.children['Desktop'].children['Welcome.txt'] = file('Welcome.txt', 'text', WELCOME);
    mike.children['Documents'].children['Meeting Notes.txt'] = file('Meeting Notes.txt', 'text', MEETING);
    mike.children['Documents'].children['Ideas.md'] = file('Ideas.md', 'text', IDEAS);
    mike.children['Documents'].children['Recipes'] = dir('Recipes');
    mike.children['Documents'].children['Recipes'].children['Pasta.txt'] = file('Pasta.txt', 'text', 'Pasta al pomodoro\n\n- 400g spaghetti\n- 6 ripe tomatoes\n- basil, garlic, olive oil\n');
    // photo library lives in Pictures as seed references (generated deterministically)
    const pics = ['yosemite-dawn', 'big-sur', 'half-dome', 'sf-golden-gate', 'lake-tahoe', 'mono-lake', 'joshua-tree', 'zion-canyon', 'glacier-point', 'venice-beach', 'maui-coast', 'banff-lake'];
    pics.forEach((p, i) => { mike.children['Pictures'].children[p + '.jpg'] = file(p + '.jpg', 'photo', '', { seed: p, size: 450000 + i * 9037 }); });
    mike.children['Downloads'].children['macOS-Tahoe-Info.txt'] = file('macOS-Tahoe-Info.txt', 'text', 'macOS Tahoe 26.1\nBuild 25B5046k\nWeb simulation build\n');
    return root;
  }

  let root = Mac.loadJSON('mac.fs', null) || defaultTree();
  const save = Mac.debounce(() => { Mac.saveJSON('mac.fs', root); }, 250);

  function norm(path) {
    if (!path) path = '/';
    const abs = path.startsWith('/');
    const parts = [];
    String(path).split('/').forEach(p => {
      if (!p || p === '.') return;
      if (p === '..') parts.pop(); else parts.push(p);
    });
    return (abs ? '/' : '') + parts.join('/') || '/';
  }

  function get(path) {
    path = norm(path);
    if (path === '/') return root;
    const parts = path.slice(1).split('/');
    let n = root;
    for (const p of parts) {
      if (!n || n.type !== 'folder' || !n.children[p]) return null;
      n = n.children[p];
    }
    return n;
  }

  const FS = {
    HOME, TRASH, APPS,
    norm, get,
    base: p => { p = norm(p); return p === '/' ? '/' : p.split('/').pop(); },
    parent: p => { p = norm(p); if (p === '/') return '/'; const i = p.lastIndexOf('/'); return i <= 0 ? '/' : p.slice(0, i); },
    join: function () { return norm(Array.from(arguments).join('/')); },
    exists: p => !!get(p),
    list(path) {
      const n = get(path);
      if (!n || n.type !== 'folder') return [];
      return Object.values(n.children).sort((a, b) => {
        if ((a.type === 'folder') !== (b.type === 'folder')) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
    },
    read(path) { const n = get(path); return n && n.type === 'file' ? n.content : null; },
    write(path, content, meta) {
      const par = get(FS.parent(path));
      if (!par || par.type !== 'folder') return false;
      const name = FS.base(path);
      const ex = par.children[name];
      if (ex && ex.type === 'file') { ex.content = String(content == null ? '' : content); ex.size = ex.content.length; ex.modified = Date.now(); Object.assign(ex, meta || {}); }
      else par.children[name] = file(name, (meta && meta.kind) || 'text', String(content == null ? '' : content), meta);
      par.modified = Date.now(); save(); Mac.Bus.emit('fs', path); return true;
    },
    mkdir(path, name) {
      const par = get(path ? norm(path) : '/');
      if (!par || par.type !== 'folder') return null;
      name = name || 'untitled folder';
      let final = name, i = 0;
      while (par.children[final]) { i++; final = name + (i === 1 ? ' copy' : ' copy ' + i); }
      par.children[final] = dir(final); par.modified = Date.now(); save(); Mac.Bus.emit('fs', path);
      return FS.join(path || '/', final);
    },
    remove(path) {
      path = norm(path);
      const par = get(FS.parent(path));
      if (!par || !par.children[FS.base(path)]) return false;
      delete par.children[FS.base(path)]; par.modified = Date.now(); save(); Mac.Bus.emit('fs', path); return true;
    },
    rename(path, newName) {
      path = norm(path); newName = (newName || '').trim();
      if (!newName || newName.includes('/')) return false;
      const par = get(FS.parent(path));
      const node = par && par.children[FS.base(path)];
      if (!node || (par.children[newName] && newName !== node.name)) return false;
      delete par.children[node.name];
      node.name = newName; node.modified = Date.now();
      par.children[newName] = node; save(); Mac.Bus.emit('fs', path); return true;
    },
    // deep copy src node into dstDir
    copy(src, dstDir) {
      const node = get(src), par = get(dstDir);
      if (!node || !par || par.type !== 'folder') return null;
      let name = node.name.replace(/ copy( \d+)?$/, '') + ' copy', base = name, i = 2;
      while (par.children[name]) name = base + ' ' + (i++);
      const clone = JSON.parse(JSON.stringify(node));
      clone.name = name; clone.modified = Date.now();
      (function touch(n) { n.modified = Date.now(); if (n.children) Object.values(n.children).forEach(touch); })(clone);
      par.children[name] = clone; save(); Mac.Bus.emit('fs', dstDir);
      return FS.join(dstDir, name);
    },
    move(src, dstDir, newName) {
      src = norm(src);
      const node = get(src), par = get(dstDir);
      if (!node || !par || par.type !== 'folder') return false;
      delete get(FS.parent(src)).children[FS.base(src)];
      node.name = newName || node.name; node.modified = Date.now();
      par.children[node.name] = node; save();
      Mac.Bus.emit('fs', src); Mac.Bus.emit('fs', dstDir);
      return true;
    },
    // move to trash (or restore if toTrash=false → moves to Desktop)
    trash(path) { return FS.move(path, TRASH); },
    emptyTrash() { const t = get(TRASH); if (t) { t.children = {}; t.modified = Date.now(); save(); Mac.Bus.emit('fs', TRASH); } },
    trashCount() { const t = get(TRASH); return t ? Object.keys(t.children).length : 0; },
    walk(cb, start) {
      (function rec(path, node) {
        if (cb(path, node) === false) return;
        if (node.type === 'folder') Object.values(node.children).forEach(ch => rec(FS.join(path === '/' ? '' : path, ch.name), ch));
      })(start || '/', start ? get(start) : root);
    },
    recent(limit, skip) {
      const out = [];
      FS.walk((p, n) => { if (n.type === 'file' && !(skip && skip(n, p))) out.push({ path: p, node: n }); });
      out.sort((a, b) => b.node.modified - a.node.modified);
      return out.slice(0, limit || 20);
    },
    sizeOf(node) {
      if (node.type === 'file') return node.size || 0;
      let s = 0; Object.values(node.children).forEach(c => s += FS.sizeOf(c)); return s;
    },
    reset() { root = defaultTree(); save(); Mac.Bus.emit('fs', '/'); },
  };
  Mac.FS = FS;
})();
