// ===================================================================
// Calendar
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const calendar = {
  id: "calendar",
  name: "Calendar",
  icon: icons.calendar,
  launch() {
    const existing = windowsForApp("calendar").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "calendar", app: "Calendar", title: "Calendar", width: 760, height: 540, contentClass: "light-content" });
    win._viewDate = new Date();
    win._events = { [new Date().toDateString()]: [{ title: "Team Standup", time: "9:00 AM" }, { title: "Lunch with Sam", time: "12:30 PM" }] };
    renderCalendar(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "New Event", shortcut: "⌘N", action: () => addEvent(win) }] }, { label: "View", rows: [{ label: "Today", shortcut: "⌘T", action: () => { win._viewDate = new Date(); renderCalendar(win); } }] }],
};

function renderCalendar(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const date = win._viewDate;
  const today = new Date();

  const toolbar = el("div", { class: "toolbar-bar", html: `
    <button class="btn" data-act="today">Today</button>
    <button class="btn icon" data-act="prev">${ui.chevronLeft}</button>
    <button class="btn icon" data-act="next">${ui.chevronRight}</button>
    <div style="flex:1;text-align:center;font-size:18px;font-weight:600">${months[date.getMonth()]} ${date.getFullYear()}</div>
    <button class="btn icon" data-act="add">${ui.plus}</button>` });
  toolbar.querySelector('[data-act="today"]').addEventListener("click", () => { win._viewDate = new Date(); renderCalendar(win); });
  toolbar.querySelector('[data-act="prev"]').addEventListener("click", () => { win._viewDate = new Date(date.getFullYear(), date.getMonth() - 1, 1); renderCalendar(win); });
  toolbar.querySelector('[data-act="next"]').addEventListener("click", () => { win._viewDate = new Date(date.getFullYear(), date.getMonth() + 1, 1); renderCalendar(win); });
  toolbar.querySelector('[data-act="add"]').addEventListener("click", () => addEvent(win));
  root.append(toolbar);

  const grid = el("div", { style: { flex: "1", display: "flex", flexDirection: "column", padding: "12px" } });
  const header = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px" } });
  days.forEach((d) => header.append(el("div", { style: { textAlign: "center", fontSize: "11px", fontWeight: "700", opacity: "0.5", padding: "6px" }, text: d.toUpperCase() })));
  grid.append(header);

  const cells = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "1fr", flex: "1", gap: "4px" } });
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const prevDays = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.append(makeCell(prevDays - i, true, win));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const cellDate = new Date(date.getFullYear(), date.getMonth(), d);
    const events = win._events[cellDate.toDateString()] || [];
    cells.append(makeCell(d, false, win, cellDate, events, isToday));
  }
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) cells.append(makeCell(i, true, win));
  grid.append(cells);
  root.append(grid);
  win.content.append(root);
}

function makeCell(day, dim, win, date, events, isToday) {
  const cell = el("div", { style: { borderRadius: "8px", padding: "6px 8px", cursor: "default", position: "relative", background: isToday ? "var(--accent)" : "rgba(0,0,0,0.03)", color: dim ? "rgba(0,0,0,0.3)" : isToday ? "#fff" : "#1d1d1f", overflow: "hidden" } });
  cell.append(el("div", { style: { fontSize: "13px", fontWeight: isToday ? "700" : "400" }, text: day }));
  if (events) {
    events.slice(0, 2).forEach((e) => {
      cell.append(el("div", { style: { fontSize: "10px", marginTop: "3px", padding: "1px 4px", borderRadius: "3px", background: isToday ? "rgba(255,255,255,0.25)" : "rgba(10,132,255,0.15)", color: isToday ? "#fff" : "var(--accent)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, text: `${e.time} ${e.title}` }));
    });
    if (events.length > 2) cell.append(el("div", { style: { fontSize: "10px", opacity: "0.6" }, text: `+${events.length - 2} more` }));
  }
  if (date) cell.addEventListener("click", () => { win._selectedDate = date; addEvent(win); });
  return cell;
}

function addEvent(win) {
  const title = prompt("Event title:", "New Event");
  if (!title) return;
  const dateStr = (win._selectedDate || new Date()).toDateString();
  win._events[dateStr] = win._events[dateStr] || [];
  win._events[dateStr].push({ title, time: prompt("Time:", "1:00 PM") || "All Day" });
  win._selectedDate = null;
  renderCalendar(win);
}

registerApp(calendar);
export default calendar;
