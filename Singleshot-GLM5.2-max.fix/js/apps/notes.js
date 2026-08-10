// Notes — create / edit / delete notes, persisted to localStorage.
import { bus, toast } from '../store.js';
import { glyph } from '../icons.js';

const LS_KEY = 'tahoe_notes_v1';
let notes = [];
let activeId = null;

function load() {
  try { notes = JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { notes = []; }
  if (!notes.length) {
    notes = [
      { id: id(), title: 'Welcome to Notes', body: 'Welcome to Notes!\n\nThis is a fully functional notes app. Your notes are saved automatically.\n\n• Click + to create a new note\n• Click a note in the sidebar to edit it\n• Your notes persist across reloads', updated: Date.now() },
      { id: id(), title: 'Shopping List', body: 'Shopping List\n\n- Milk\n- Eggs\n- Coffee\n- Bread\n- Cheese', updated: Date.now()-3600000 },
      { id: id(), title: 'Ideas', body: 'Ideas\n\n- Build something great\n- Learn a new skill\n- Travel more', updated: Date.now()-7200000 },
    ];
    save();
  }
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(notes)); }
function id() { return Math.random().toString(36).slice(2,10); }

export const windowConfig = { width: 700, height: 460 };

export function mount(el, app) {
  load();
  el.innerHTML = `
    <div style="display:flex;height:100%">
      <div class="notes-list scroll">
        <div style="padding:8px 10px;display:flex;align-items:center;gap:6px;border-bottom:0.5px solid rgba(0,0,0,.08)">
          <div class="nav-btn" data-act="new" style="width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:default">${glyph('plus',16)}</div>
          <div class="nav-btn" data-act="del" style="width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:default">${glyph('tag',16)}</div>
          <input class="field" placeholder="Search" style="font-size:12px;padding:3px 8px" data-search>
        </div>
        <div class="nl-items"></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div class="ne-toolbar" style="padding:6px 12px;border-bottom:0.5px solid rgba(0,0,0,.08);font-size:12px;opacity:.6" data-ne-info></div>
        <textarea class="te-area" style="flex:1;background:rgba(255,255,255,.55);resize:none;border:none;outline:none;padding:16px 22px;font-size:14px;line-height:1.6" placeholder="Start writing…" data-editor></textarea>
      </div>
    </div>
  `;
  const listEl = el.querySelector('.nl-items');
  const editor = el.querySelector('[data-editor]');
  const info = el.querySelector('[data-ne-info]');

  function refreshList(filter='') {
    const f = filter.toLowerCase();
    const shown = notes.filter(n => !f || n.title.toLowerCase().includes(f) || n.body.toLowerCase().includes(f))
      .sort((a,b) => b.updated - a.updated);
    listEl.innerHTML = shown.map(n => `
      <div class="note-item ${n.id===activeId?'sel':''}" data-id="${n.id}">
        <div class="ni-title">${escapeHtml(n.title || 'New Note')}</div>
        <div class="ni-prev">${escapeHtml((n.body||'').slice(0,40)) || 'No additional text'}</div>
        <div class="ni-prev" style="opacity:.5">${new Date(n.updated).toLocaleDateString()}</div>
      </div>
    `).join('') || '<div style="padding:16px;opacity:.5;font-size:12px">No notes</div>';
    listEl.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => { activeId = item.dataset.id; refreshList(filter); showNote(); });
    });
  }

  function showNote() {
    const n = notes.find(x => x.id === activeId);
    if (!n) { editor.value=''; info.textContent=''; return; }
    editor.value = n.body;
    info.textContent = `Modified ${new Date(n.updated).toLocaleString()}`;
  }

  function newNote() {
    const n = { id: id(), title: 'New Note', body: '', updated: Date.now() };
    notes.unshift(n); activeId = n.id; save(); refreshList(); showNote(); editor.focus();
  }

  function delNote() {
    if (!activeId) return;
    notes = notes.filter(n => n.id !== activeId);
    activeId = notes[0]?.id || null; save(); refreshList(); showNote();
    toast('Note deleted');
  }

  editor.addEventListener('input', () => {
    const n = notes.find(x => x.id === activeId);
    if (!n) return;
    n.body = editor.value;
    n.title = editor.value.split('\n')[0].slice(0,40) || 'New Note';
    n.updated = Date.now();
    save();
    info.textContent = `Modified ${new Date(n.updated).toLocaleString()}`;
    refreshList(el.querySelector('[data-search]').value);
  });

  el.querySelector('[data-act="new"]').addEventListener('click', newNote);
  el.querySelector('[data-act="del"]').addEventListener('click', delNote);
  el.querySelector('[data-search]').addEventListener('input', (e) => refreshList(e.target.value));

  if (!activeId && notes.length) activeId = notes[0].id;
  refreshList(); showNote();
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export function fileMenu() {
  return [
    { label: 'New Note', shortcut: '⌘N', action: () => bus.emit('app:file:new','notes'), noCheck:true },
    { sep: true },
    { label: 'Delete Note', shortcut: '⌫', action: () => bus.emit('app:file:delete','notes'), noCheck:true },
    { label: 'Print…', shortcut: '⌘P', action: () => window.print(), noCheck:true },
    { sep: true },
    { label: 'Close Window', shortcut: '⌘W', action: () => {}, noCheck:true },
  ];
}
