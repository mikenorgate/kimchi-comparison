// ===================================================================
// Messages
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const conversations = [
  { id: 1, name: "Sarah Chen", color: "#ff375f", last: "See you at the lake! 🏔️", time: "9:30 AM", msgs: [
    { from: "them", text: "Are we still on for this weekend?", time: "9:12 AM" },
    { from: "me", text: "Yes! Tahoe trip is confirmed 🎉", time: "9:15 AM" },
    { from: "them", text: "Perfect, I'll bring the snacks", time: "9:20 AM" },
    { from: "them", text: "See you at the lake! 🏔️", time: "9:30 AM" },
  ]},
  { id: 2, name: "Mom", color: "#0a84ff", last: "Don't forget Sunday dinner ❤️", time: "Yesterday", msgs: [
    { from: "them", text: "Hi sweetie! Dinner Sunday?", time: "Yesterday" },
    { from: "me", text: "I'll be there!", time: "Yesterday" },
    { from: "them", text: "Don't forget Sunday dinner ❤️", time: "Yesterday" },
  ]},
  { id: 3, name: "Dev Team", color: "#30d158", last: "Alex: deployed to staging ✅", time: "Yesterday", msgs: [
    { from: "them", text: "PR is ready for review", time: "Yesterday" },
    { from: "me", text: "Looks good, merging now", time: "Yesterday" },
    { from: "them", text: "deployed to staging ✅", time: "Yesterday" },
  ]},
  { id: 4, name: "Jordan", color: "#ff9f0a", last: "Check this out 🔥", time: "Mon", msgs: [{ from: "them", text: "Check this out 🔥", time: "Mon" }] },
];

const messages = {
  id: "messages",
  name: "Messages",
  icon: icons.messages,
  launch() {
    const existing = windowsForApp("messages").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "messages", app: "Messages", title: "Messages", width: 780, height: 540, contentClass: "light-content" });
    win._conv = 1;
    render(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const sidebar = el("div", { style: { width: "260px", borderRight: "0.5px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" } });
  sidebar.append(el("div", { style: { padding: "12px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }, html: `<span style="font-size:18px;font-weight:700;flex:1">Messages</span><button class="btn icon">${ui.plus}</button>` }));
  const list = el("div", { class: "content" });
  conversations.forEach((c) => {
    const item = el("div", { class: "list-item" + (c.id === win._conv ? " active" : ""), style: { borderRadius: "0", borderBottom: "0.5px solid rgba(0,0,0,0.04)" } });
    item.innerHTML = `<div style="width:40px;height:40px;border-radius:50%;background:${c.color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600">${c.name[0]}</div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between"><span style="font-weight:600;font-size:14px">${c.name}</span><span style="font-size:11px;opacity:0.5">${c.time}</span></div><div style="font-size:12px;opacity:0.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.last}</div></div>`;
    item.addEventListener("click", () => { win._conv = c.id; render(win); });
    list.append(item);
  });
  sidebar.append(list);

  const chat = el("div", { style: { flex: "1", display: "flex", flexDirection: "column", minWidth: "0" } });
  const conv = conversations.find((c) => c.id === win._conv);
  chat.append(el("div", { style: { padding: "12px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.1)", textAlign: "center", fontWeight: "600" }, text: conv.name }));
  const msgs = el("div", { class: "content", style: { padding: "16px", display: "flex", flexDirection: "column", gap: "8px" } });
  function renderMsgs() {
    msgs.innerHTML = "";
    conv.msgs.forEach((m) => {
      const bubble = el("div", { style: { alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "70%", background: m.from === "me" ? "var(--accent)" : "#e9e9eb", color: m.from === "me" ? "#fff" : "#1d1d1f", padding: "8px 14px", borderRadius: "18px", fontSize: "14px" }, text: m.text });
      msgs.append(bubble);
    });
    msgs.scrollTop = msgs.scrollHeight;
  }
  renderMsgs();
  chat.append(msgs);

  const inputBar = el("div", { style: { padding: "10px 16px", borderTop: "0.5px solid rgba(0,0,0,0.1)", display: "flex", gap: "8px" } });
  const input = el("input", { class: "field", placeholder: "iMessage", style: { flex: "1" } });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      conv.msgs.push({ from: "me", text: input.value.trim(), time: "now" });
      conv.last = input.value.trim();
      input.value = "";
      renderMsgs();
      // auto-reply
      setTimeout(() => {
        const replies = ["Sounds good! 👍", "Haha nice", "Let me check", "Sure thing!", "🎉", "On my way!"];
        conv.msgs.push({ from: "them", text: replies[Math.floor(Math.random() * replies.length)], time: "now" });
        conv.last = conv.msgs[conv.msgs.length - 1].text;
        renderMsgs();
      }, 1200 + Math.random() * 1500);
    }
  });
  inputBar.append(input);
  chat.append(inputBar);

  root.append(sidebar, chat);
  win.content.append(root);
  setTimeout(() => input.focus(), 50);
}

registerApp(messages);
export default messages;
