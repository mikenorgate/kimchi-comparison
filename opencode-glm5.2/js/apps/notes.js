// ===================================================================
// Notes — multi-note editor with localStorage
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $, state, setState, on } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

if (!state.notes || !state.notes.length) {
  state.notes = [
    { id: "n1", title: "Welcome to Notes", body: "Welcome to Notes!\n\nThis is a fully working notes app. Your notes are saved automatically.\n\n• Click + to create a new note\n• Click a note in the sidebar to open it\n• Type in the editor — it saves as you go\n• Search using the search bar", updated: Date.now() },
    { id: "n2", title: "Shopping List", body: "Shopping List\n\n- Milk\n- Eggs\n- Bread\n- Coffee\n- Apples", updated: Date.now() - 86400000 },
    { id: "n3", title: "Ideas", body: "Project Ideas\n\n1. Recreate macOS Tahoe as a web app\n2. Build a pixel art editor\n3. Make a chess game", updated: Date.now() - 172800000 },
  ];
}

const notesApp = {
  id: "notes",
  name: "Notes",
  icon: icons.notes,
  launch() {
    const existing = windowsForApp("notes").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "notes", app: "Notes", title: "Notes", width: 780, height: 540, contentClass: "light-content" });
    renderNotes(win, state.notes[0]?.id);
  },
  menus: (win) => [
    { label: "File", rows: [
      { label: "New Note", shortcut: "⌘N", action: () => newNote(win) },
      { label: "Delete Note", action: () => deleteNote(win) },
      { separator: true },
      { label: "Close Window", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) },
    ]},
    { label: "Edit", rows: [
      { label: "Undo", shortcut: "⌘Z", action: () => document.execCommand("undo") },
      { label: "Redo", shortcut: "⇧⌘Z", action: () => document.execCommand("redo") },
    ]},
    { label: "Window", rows: [{ label: "Minimize", shortcut: "⌘M", action: () => import("../core/windowManager.js").then(m=>m.minimizeWindow(win.id)) }] },
  ],
};

function renderNotes(win, activeId) {
  win.content.innerHTML = "";
  const sidebar = el("div", { class: "sidebar", style: { width: "240px", display: "flex", flexDirection: "column" } });
  const searchWrap = el("div", { style: { padding: "8px" } });
  const search = el("input", { class: "field", placeholder: "Search", style: { width: "100%" } });
  search.addEventListener("input", () => renderList());
  searchWrap.append(search);
  sidebar.append(searchWrap);

  const listWrap = el("div", { class: "content", style: { flex: "1", padding: "0 6px" } });
  sidebar.append(listWrap);

  const editor = el("div", { style: { flex: "1", display: "flex", flexDirection: "column", minWidth: "0" } });
  const toolbar = el("div", { class: "toolbar-bar", html: `<button class="btn icon" data-act="del">${ui.minus}</button><button class="btn icon" data-act="new">${ui.plus}</button><div style="flex:1"></div><button class="btn icon" data-act="share">${ui.share}</button>` });
  toolbar.querySelector('[data-act="del"]').addEventListener("click", () => deleteNote(win));
  toolbar.querySelector('[data-act="new"]').addEventListener("click", () => newNote(win));
  toolbar.querySelector('[data-act="share"]').addEventListener("click", () => { const n = current(win); if (n) { navigator.clipboard?.writeText(n.body); toast("Notes", "Copied to clipboard", "notes"); } });
  editor.append(toolbar);
  const editArea = el("div", { style: { flex: "1", overflow: "auto", padding: "20px 24px" } });
  editor.append(editArea);

  win.content.append(sidebar, editor);

  function renderList() {
    listWrap.innerHTML = "";
    const q = search.value.toLowerCase();
    const filtered = state.notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    filtered.sort((a, b) => b.updated - a.updated);
    if (!filtered.length) { listWrap.append(el("div", { class: "empty-state", text: "No notes" })); return; }
    filtered.forEach((n) => {
      const item = el("div", { class: "list-item" + (n.id === win._activeNote ? " active" : ""), html: `<div style="flex:1;overflow:hidden"><div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.title || "New Note"}</div><div style="font-size:11px;opacity:0.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(n.body || "").slice(0, 40) || "No additional text"}</div></div>` });
      item.addEventListener("click", () => renderNotes(win, n.id));
      listWrap.append(item);
    });
  }

  function renderEditor() {
    editArea.innerHTML = "";
    const note = state.notes.find((n) => n.id === win._activeNote);
    if (!note) {
      editArea.append(el("div", { class: "empty-state", html: `${iconSVG("notes", 48)}<div>Select or create a note</div>` }));
      return;
    }
    const titleInput = el("input", { class: "field", value: note.title, style: { width: "100%", fontSize: "20px", fontWeight: "700", border: "none", background: "transparent", marginBottom: "12px", padding: "0" } });
    titleInput.addEventListener("input", () => { note.title = titleInput.value; note.updated = Date.now(); setState({ notes: state.notes }); });
    const body = el("textarea", { style: { width: "100%", flex: "1", border: "none", outline: "none", resize: "none", background: "transparent", fontFamily: "inherit", fontSize: "14px", lineHeight: "1.6", minHeight: "300px" } });
    body.value = note.body;
    body.addEventListener("input", () => { note.body = body.value; note.updated = Date.now(); setState({ notes: state.notes }); });
    const dateLabel = el("div", { style: { fontSize: "11px", opacity: "0.5", marginBottom: "8px" }, text: new Date(note.updated).toLocaleString() });
    editArea.append(dateLabel, titleInput, body);
  }

  win._activeNote = activeId || state.notes[0]?.id;
  win._search = search;
  win.renderList = renderList;
  win.renderEditor = renderEditor;
  renderList();
  renderEditor();
}

function current(win) { return state.notes.find((n) => n.id === win._activeNote); }

function newNote(win) {
  const n = { id: Math.random().toString(36).slice(2), title: "", body: "", updated: Date.now() };
  state.notes.unshift(n);
  setState({ notes: state.notes });
  renderNotes(win, n.id);
}
function deleteNote(win) {
  if (!win._activeNote) return;
  const idx = state.notes.findIndex((n) => n.id === win._activeNote);
  if (idx >= 0) {
    state.notes.splice(idx, 1);
    setState({ notes: state.notes });
    renderNotes(win, state.notes[0]?.id);
  }
}

registerApp(notesApp);
export default notesApp;
