// TextEdit — plain text editor. Opens files from VFS, saves back.
import { toast } from '../store.js';

export const windowConfig = { width: 660, height: 480 };

export function mount(el, _app, ctx) {
  const openPath = ctx?.path || null;
  let currentPath = openPath;
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:5px 12px;border-bottom:0.5px solid rgba(0,0,0,.08);font-size:12px;display:flex;gap:10px;align-items:center">
        <span data-path style="opacity:.6">${currentPath || 'Untitled'}</span>
        <span style="flex:1"></span>
        <button class="btn" data-save>Save</button>
        <button class="btn" data-saveas>Save As…</button>
      </div>
      <textarea class="te-area" style="flex:1;background:rgba(255,255,255,.55);border:none;outline:none;resize:none;padding:18px 24px;font-size:14px;line-height:1.6" placeholder="Start writing…" data-editor></textarea>
    </div>
  `;
  const editor = el.querySelector('[data-editor]');
  const pathLabel = el.querySelector('[data-path]');

  if (openPath) {
    const content = vfs.readFile(openPath);
    if (content != null) editor.value = content;
    else editor.value = '';
  } else {
    editor.value = '';
  }

  el.querySelector('[data-save]').addEventListener('click', () => save());
  el.querySelector('[data-saveas]').addEventListener('click', () => saveAs());

  function save() {
    if (!currentPath) return saveAs();
    vfs.writeFile(currentPath, editor.value);
    pathLabel.textContent = currentPath;
    toast('Saved to ' + currentPath);
  }

  async function saveAs() {
    const path = await modalPrompt(el, 'Save as (full path):', currentPath || '/Documents/Untitled.txt');
    if (!path) return;
    vfs.writeFile(path, editor.value);
    currentPath = path;
    pathLabel.textContent = path;
    toast('Saved to ' + path);
  }

  // keyboard shortcut
  editor.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  });
}

function modalPrompt(el, label, def='') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:200;display:flex;align-items:center;justify-content:center';
    const box = document.createElement('div');
    box.style.cssText = 'background:var(--glass-bg);backdrop-filter:blur(30px);padding:18px;border-radius:14px;width:340px;box-shadow:var(--glass-shadow);color:var(--text);border:0.5px solid var(--glass-border)';
    box.innerHTML = `<div style="font-size:13px;margin-bottom:10px">${label}</div><input class="field" value="${(def||'').replace(/"/g,'&quot;')}" style="width:100%" /><div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end"><button class="btn" data-cancel>Cancel</button><button class="btn primary" data-ok>Save</button></div>`;
    overlay.appendChild(box);
    el.appendChild(overlay);
    const inp = box.querySelector('input'); inp.focus(); inp.select();
    const done = (v) => { overlay.remove(); resolve(v); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(inp.value); if (e.key === 'Escape') done(null); });
    box.querySelector('[data-ok]').addEventListener('click', () => done(inp.value));
    box.querySelector('[data-cancel]').addEventListener('click', () => done(null));
  });
}

export function fileMenu() {
  return [
    { label: 'New', shortcut: '⌘N', action: () => {}, noCheck:true },
    { label: 'Open…', shortcut: '⌘O', action: () => {}, noCheck:true },
    { sep: true },
    { label: 'Save', shortcut: '⌘S', action: () => {}, noCheck:true },
    { label: 'Save As…', shortcut: '⇧⌘S', action: () => {}, noCheck:true },
    { sep: true },
    { label: 'Print…', shortcut: '⌘P', action: () => window.print(), noCheck:true },
    { label: 'Close', shortcut: '⌘W', action: () => {}, noCheck:true },
  ];
}
