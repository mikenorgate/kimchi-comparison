// ===================================================================
// Mail
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const mails = [
  { id: 1, from: "Apple", subject: "Welcome to macOS Tahoe", preview: "Discover the all-new Liquid Glass design and incredible features…", time: "9:42 AM", unread: true, body: "Welcome to macOS Tahoe!\n\nExperience the all-new Liquid Glass design language that makes everything more beautiful and fluid. We've reimagined the interface with translucent materials, smooth animations, and a more intuitive way to work.\n\nExplore the new Control Center, improved Spotlight, and redesigned apps across the system.\n\nEnjoy,\nThe Apple Team" },
  { id: 2, from: "GitHub", subject: "[repo] New pull request #42", preview: "A new pull request was opened in your repository…", time: "8:15 AM", unread: true, body: "A new pull request has been opened.\n\nTitle: Add dark mode toggle\nAuthor: contributor-dev\n\nView the pull request to review the changes and leave feedback." },
  { id: 3, from: "Netflix", subject: "New shows just dropped 🔥", preview: "Check out what's new on Netflix this week…", time: "Yesterday", unread: false, body: "Hi Mike,\n\nThere's something new waiting for you on Netflix. From gripping dramas to laugh-out-loud comedies, we've got you covered.\n\nHappy streaming!" },
  { id: 4, from: "LinkedIn", subject: "You appeared in 7 searches", preview: "See who's been looking at your profile…", time: "Yesterday", unread: false, body: "You appeared in 7 searches this week. People are finding your profile. Keep it up to date to attract more opportunities." },
  { id: 5, from: "Mom", subject: "Dinner this Sunday?", preview: "Hi sweetie, wondering if you're free for dinner…", time: "Mon", unread: false, body: "Hi sweetie,\n\nWondering if you're free for dinner this Sunday? I'm making your favorite lasagna.\n\nLove,\nMom" },
  { id: 6, from: "Bank", subject: "Your statement is ready", preview: "Your monthly statement is now available…", time: "Sun", unread: false, body: "Your monthly statement is now available to view in your account portal." },
];

const mail = {
  id: "mail",
  name: "Mail",
  icon: icons.mail,
  launch() {
    const existing = windowsForApp("mail").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "mail", app: "Mail", title: "Inbox", width: 900, height: 560, contentClass: "light-content" });
    win._selected = mails[0].id;
    renderMail(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "New Message", shortcut: "⌘N", action: () => newMessage(win) }, { label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }, { label: "Mailbox", rows: [{ label: "Mark as Read", action: () => markRead(win) }] }],
};

function renderMail(win) {
  win.content.innerHTML = "";
  const sidebar = el("div", { class: "sidebar", style: { width: "180px" }, html: `
    <div class="sidebar-section">Mailboxes</div>
    <div class="sidebar-item active">📥 Inbox <span style="opacity:0.5">${mails.filter(m=>m.unread).length}</span></div>
    <div class="sidebar-item">⭐ VIP</div>
    <div class="sidebar-item">📤 Sent</div>
    <div class="sidebar-item">📝 Drafts</div>
    <div class="sidebar-item">🗑 Junk</div>
    <div class="sidebar-item">🗑 Trash</div>
    <div class="sidebar-item">📁 Archive</div>` });

  const main = el("div", { style: { flex: "1", display: "flex", minWidth: "0" } });
  const list = el("div", { style: { width: "280px", borderRight: "0.5px solid rgba(0,0,0,0.1)", overflow: "auto" } });
  mails.forEach((m) => {
    const item = el("div", { class: "list-item" + (m.id === win._selected ? " active" : ""), style: { borderBottom: "0.5px solid rgba(0,0,0,0.06)", borderRadius: "0", display: "block" } });
    item.innerHTML = `
      <div style="display:flex;justify-content:space-between"><span style="font-weight:${m.unread?700:400};font-size:13px">${m.from}</span><span style="font-size:11px;opacity:0.5">${m.time}</span></div>
      <div style="font-weight:${m.unread?600:400};font-size:13px;margin-top:2px">${m.subject}</div>
      <div style="font-size:12px;opacity:0.6;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.preview}</div>`;
    item.addEventListener("click", () => { win._selected = m.id; m.unread = false; renderMail(win); });
    list.append(item);
  });
  main.append(list);

  const reader = el("div", { style: { flex: "1", overflow: "auto", padding: "24px 30px" } });
  const msg = mails.find((m) => m.id === win._selected);
  if (msg) {
    reader.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0a84ff,#5e5ce6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600">${msg.from[0]}</div>
        <div><div style="font-weight:600">${msg.from}</div><div style="font-size:12px;opacity:0.6">to mike@icloud.com</div></div>
        <div style="margin-left:auto;font-size:12px;opacity:0.6">${msg.time}</div>
      </div>
      <h1 style="font-size:20px;margin-bottom:16px">${msg.subject}</h1>
      <div style="line-height:1.7;white-space:pre-wrap;font-size:14px">${msg.body}</div>
      <div style="margin-top:30px;display:flex;gap:8px">
        <button class="btn primary">Reply</button>
        <button class="btn">Reply All</button>
        <button class="btn">Forward</button>
        <button class="btn icon">${ui.trash||"🗑"}</button>
      </div>`;
  }
  main.append(reader);

  win.content.append(sidebar, main);
}

function newMessage(win) {
  const overlay = el("div", { class: "sheet-overlay" });
  const sheet = el("div", { class: "sheet", style: { width: "500px" } });
  sheet.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:12px"><b style="font-size:16px">New Message</b><button class="btn icon" id="close">${ui.close}</button></div>
    <input class="field" placeholder="To:" style="width:100%;margin-bottom:8px" />
    <input class="field" placeholder="Subject:" style="width:100%;margin-bottom:8px" />
    <textarea class="field" placeholder="Compose your message…" style="width:100%;height:200px;resize:none;margin-bottom:12px"></textarea>
    <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="send">Send</button></div>`;
  sheet.querySelector("#close").addEventListener("click", () => overlay.remove());
  sheet.querySelector("#cancel").addEventListener("click", () => overlay.remove());
  sheet.querySelector("#send").addEventListener("click", () => { overlay.remove(); import("../core/notifications.js").then(m=>m.toast("Mail","Message sent","mail")); });
  overlay.append(sheet);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  win.content.append(overlay);
}
function markRead(win) { mails.forEach(m => { if (m.id === win._selected) m.unread = false; }); renderMail(win); }

registerApp(mail);
export default mail;
