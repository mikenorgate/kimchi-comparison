// Virtual filesystem shared by Finder & Terminal; persisted to localStorage.

const LS_KEY = 'tahoe_vfs_v1';

// node: { type:'dir'|'file', name, children?:[], content?:string, created, modified }
function now() { return Date.now(); }

function seedFS() {
  const dir = (name, children = []) => ({ type:'dir', name, children, created:now(), modified:now() });
  const file = (name, content = '') => ({ type:'file', name, content, created:now(), modified:now() });
  return dir('/', [
    dir('Desktop', [
      file('Welcome.txt', 'Welcome to macOS Tahoe (web).\n\nThis is a fully interactive recreation of the macOS 26 desktop.\nDouble-click apps in the Dock to launch them.'),
      file('Read Me.md', '# macOS Tahoe Web\n\nBuilt with vanilla JS and the Liquid Glass design language.\n\n- Every menu works\n- Windows drag & resize\n- Spotlight (Cmd+Space)\n- Control Center\n- Notes, Calculator, Terminal, Safari, and more'),
    ]),
    dir('Documents', [
      file('Project Notes.txt', 'Roadmap:\n1. Ship Tahoe web\n2. Add more apps\n3. Profit'),
      file('todo.md', '- [x] Recreate macOS\n- [ ] Take over the world'),
      dir('Work', [
        file('budget.csv', 'item,cost\ncoffee,4\nlaptop,2000'),
      ]),
    ]),
    dir('Downloads', [
      file('installer.txt', 'pretend this is a dmg'),
    ]),
    dir('Pictures', [
      file('sunset.png','[image]'),
      file('beach.png','[image]'),
      file('mountains.png','[image]'),
      file('city.png','[image]'),
    ]),
    dir('Music', [
      file('playlist.m3u',''),
    ]),
    dir('Applications', [
      file('Safari.app',''),
      file('Notes.app',''),
      file('Calculator.app',''),
      file('Terminal.app',''),
    ]),
    dir('Movies', []),
  ]);
}

let root = seedFS();

export function loadVFS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) root = JSON.parse(raw);
  } catch {}
  return root;
}
export function saveVFS() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(root)); } catch {}
}

// Normalize a path like '/Documents/Work' -> array of segments.
export function splitPath(p) {
  return p.split('/').filter(Boolean);
}

// Resolve a node by path string; returns node or null.
export function resolve(path) {
  const segs = splitPath(path);
  let node = root;
  for (const s of segs) {
    if (node.type !== 'dir') return null;
    node = node.children.find(c => c.name === s);
    if (!node) return null;
  }
  return node;
}

export function list(path) {
  const node = resolve(path);
  if (!node || node.type !== 'dir') return [];
  return [...node.children].sort((a,b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function readFile(path) {
  const node = resolve(path);
  return node && node.type === 'file' ? node.content : null;
}

export function writeFile(path, content) {
  const segs = splitPath(path);
  const name = segs.pop();
  const parent = resolve('/' + segs.join('/'));
  if (!parent || parent.type !== 'dir') return false;
  let node = parent.children.find(c => c.name === name && c.type === 'file');
  if (node) { node.content = content; node.modified = now(); }
  else { node = { type:'file', name, content, created:now(), modified:now() }; parent.children.push(node); }
  parent.modified = now();
  saveVFS();
  return true;
}

export function makeDir(path) {
  const segs = splitPath(path);
  const name = segs.pop();
  const parent = resolve('/' + segs.join('/'));
  if (!parent || parent.type !== 'dir') return false;
  if (parent.children.some(c => c.name === name)) return false;
  parent.children.push({ type:'dir', name, children:[], created:now(), modified:now() });
  parent.modified = now();
  saveVFS();
  return true;
}

export function remove(path) {
  const segs = splitPath(path);
  const name = segs.pop();
  const parent = resolve('/' + segs.join('/'));
  if (!parent || parent.type !== 'dir') return false;
  const idx = parent.children.findIndex(c => c.name === name);
  if (idx < 0) return false;
  parent.children.splice(idx, 1);
  parent.modified = now();
  saveVFS();
  return true;
}

export function rename(path, newName) {
  const segs = splitPath(path);
  const name = segs.pop();
  const parent = resolve('/' + segs.join('/'));
  if (!parent || parent.type !== 'dir') return false;
  const node = parent.children.find(c => c.name === name);
  if (!node) return false;
  node.name = newName;
  parent.modified = now();
  saveVFS();
  return true;
}

export function stat(path) {
  const node = resolve(path);
  return node || null;
}

export function root_() { return root; }   // exposed for terminal `tree`
