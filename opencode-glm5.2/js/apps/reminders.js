// ===================================================================
// Reminders
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $, state, setState } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

if (!state.reminders || !state.reminders.length) {
  state.reminders = [
    { id: "r1", text: "Finish the macOS Tahoe project", done: false, list: "Today" },
    { id: "r2", text: "Call mom", done: false, list: "Today" },
    { id: "r3", text: "Buy groceries", done: false, list: "Shopping" },
    { id: "r4", text: "Submit expense report", done: true, list: "Work" },
    { id: "r5", text: "Plan weekend trip to Tahoe", done: false, list: "Personal" },
    { id: "r6", text: "Read a book", done: false, list: "Personal" },
  ];
}

const lists = ["Today", "Scheduled", "All", "Flagged", "Completed", "Shopping", "Work", "Personal"];

const remindersApp = {
  id: "reminders",
  name: "Reminders",
  icon: icons.reminders,
  launch() {
    const existing = windowsForApp("reminders").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "reminders", app: "Reminders", title: "Reminders", width: 720, height: 500, contentClass: "light-content" });
    win._list = "Today";
    renderReminders(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "New Reminder", shortcut: "⌘N", action: () => addReminder(win) }, { label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

function renderReminders(win) {
  win.content.innerHTML = "";
  const sidebar = el("div", { class: "sidebar", style: { width: "200px" } });
  lists.forEach((l) => {
    const count = l === "All" ? state.reminders.length : l === "Completed" ? state.reminders.filter(r=>r.done).length : state.reminders.filter(r=>!r.done && (r.list === l || l === "Today")).length;
    const item = el("div", { class: "sidebar-item" + (l === win._list ? " active" : ""), html: `<span class="si-icon">${iconSVG(listIcon(l), 16)}</span><span style="flex:1">${l}</span><span style="opacity:0.5;font-size:12px">${count || ""}</span>` });
    item.addEventListener("click", () => { win._list = l; renderReminders(win); });
    sidebar.append(item);
  });

  const main = el("div", { style: { flex: "1", display: "flex", flexDirection: "column" } });
  main.append(el("div", { style: { padding: "20px 24px 10px", fontSize: "22px", fontWeight: "700", color: "#ff9f0a" }, text: win._list }));

  const listWrap = el("div", { class: "content", style: { padding: "0 16px 80px" } });
  let filtered = state.reminders;
  if (win._list === "Completed") filtered = state.reminders.filter(r => r.done);
  else if (win._list === "All") filtered = state.reminders;
  else if (win._list === "Today") filtered = state.reminders.filter(r => !r.done);
  else filtered = state.reminders.filter(r => r.list === win._list);

  filtered.forEach((r) => {
    const row = el("div", { style: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px" } });
    const circle = el("div", { style: { width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #c7c7cc", flexShrink: "0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } });
    if (r.done) { circle.style.background = "#ff9f0a"; circle.style.borderColor = "#ff9f0a"; circle.innerHTML = iconSVG("check", 14); }
    circle.addEventListener("click", () => { r.done = !r.done; setState({ reminders: state.reminders }); renderReminders(win); });
    const text = el("span", { style: { flex: "1", fontSize: "14px", textDecoration: r.done ? "line-through" : "none", opacity: r.done ? 0.5 : 1 }, text: r.text });
    row.append(circle, text);
    listWrap.append(row);
  });

  // add field
  const addRow = el("div", { style: { padding: "10px 12px", display: "flex", alignItems: "center", gap: "12px" } });
  const circle = el("div", { style: { width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #c7c7cc", color: "#c7c7cc", display: "flex", alignItems: "center", justifyContent: "center" }, html: ui.plus });
  const input = el("input", { class: "field", placeholder: "New Reminder", style: { flex: "1", border: "none", background: "transparent" } });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && input.value.trim()) { state.reminders.push({ id: Math.random().toString(36).slice(2), text: input.value.trim(), done: false, list: win._list === "Today" ? "Today" : win._list }); setState({ reminders: state.reminders }); input.value = ""; renderReminders(win); } });
  addRow.append(circle, input);
  listWrap.append(addRow);

  main.append(listWrap);
  win.content.append(el("div", { class: "split" }, [sidebar, main]));
}

function addReminder(win) { /* focus handled by input */ }
function listIcon(l) { return { Today: "clock", Scheduled: "calendar", All: "list", Flagged: "reminders", Completed: "check", Shopping: "reminders", Work: "reminders", Personal: "reminders" }[l] || "reminders"; }

registerApp(remindersApp);
export default remindersApp;
