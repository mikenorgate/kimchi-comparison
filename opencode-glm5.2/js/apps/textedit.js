// ===================================================================
// TextEdit
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow, setTitle } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { fs } from "../core/filesystem.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

const textEdit = {
  id: "textedit",
  name: "TextEdit",
  icon: icons.textedit,
  launch() {
    const existing = windowsForApp("textedit").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    openFile(null);
  },
  openFile(node) { openFile(node); },
  menus: (win) => [
    { label: "File", rows: [
      { label: "New", shortcut: "⌘N", action: () => openFile(null) },
      { label: "Open…", shortcut: "⌘O", action: () => import("./finder.js").then(m=>m.default.launch()) },
      { separator: true },
      { label: "Save", shortcut: "⌘S", action: () => save(win) },
      { label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) },
    ]},
    { label: "Edit", rows: [{ label: "Undo", shortcut: "⌘Z", action: () => document.execCommand("undo") }, { label: "Redo", shortcut: "⇧⌘Z", action: () => document.execCommand("redo") }] },
    { label: "Format", rows: [{ label: "Plain Text", checked: true, action: () => {} }] },
  ],
};

function openFile(node) {
  const existing = windowsForApp("textedit").filter((w) => !w.minimized);
  if (existing.length && !node) { focusWindow(existing[0].id); return; }
  const win = createWindow({ appId: "textedit", app: "TextEdit", title: node ? node.name : "Untitled.txt", width: 600, height: 480, contentClass: "light-content" });
  win._file = node;
  render(win, node ? node.content || "" : "");
}

function render(win, content) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const toolbar = el("div", { class: "toolbar-bar", html: `<button class="btn icon" data-act="save">${ui.check}</button><button class="btn" data-act="bold">B</button><button class="btn" data-act="italic" style="font-style:italic">I</button><div style="flex:1"></div><span style="font-size:12px;opacity:0.5">${win._file ? win._file.name : "Untitled"}</span>` });
  toolbar.querySelector('[data-act="save"]').addEventListener("click", () => save(win));
  root.append(toolbar);

  const editor = el("textarea", { style: { flex: "1", width: "100%", border: "none", outline: "none", resize: "none", padding: "24px 32px", fontFamily: "'SF Mono', Menlo, monospace", fontSize: "14px", lineHeight: "1.6", background: "#fff", color: "#1d1d1f" }, spellcheck: "false", placeholder: "Start typing..." });
  editor.value = content;
  root.append(editor);
  win.content.append(root);
  win._editor = editor;
  setTimeout(() => editor.focus(), 50);
}

function save(win) {
  const content = win._editor.value;
  if (win._file) {
    win._file.content = content;
    import("../core/filesystem.js").then((m) => m.persistFS());
    toast("TextEdit", `Saved "${win._file.name}"`, "textedit");
  } else {
    const name = prompt("Save as:", "Untitled.txt");
    if (name) {
      const node = fs.create("Documents", name, "file", content);
      win._file = node;
      setTitle(win.id, name);
      toast("TextEdit", `Saved "${name}" to Documents`, "textedit");
    }
  }
}

registerApp(textEdit);
export default textEdit;
