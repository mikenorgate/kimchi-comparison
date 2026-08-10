// Mail — mailbox viewer with compose.
import { glyph } from '../icons.js';

export const windowConfig = { width: 860, height: 540 };

const MAILBOXES = [
  { id:'inbox',   name:'Inbox',     icon:glyph('doc',15), count:4 },
  { id:'vip',     name:'VIP',       icon:glyph('star',15), count:1 },
  { id:'flagged', name:'Flagged',   icon:glyph('tag',15), count:0 },
  { id:'drafts',  name:'Drafts',    icon:glyph('doc',15), count:1 },
  { id:'sent',    name:'Sent',      icon:glyph('doc',15), count:0 },
  { id:'trash',   name:'Trash',     icon:glyph('tag',15), count:0 },
];

const MAILS = [
  { id:1, mbox:'inbox', from:'Tim Apple', email:'tim@apple.com', subject:'Welcome to macOS Tahoe', preview:'The new Liquid Glass design is here. We think you\'re going to love it…', body:'Hi Mike,\n\nWelcome to macOS Tahoe! This is our biggest design update yet, featuring the all-new Liquid Glass material across every app and system experience.\n\nWe think you are going to love it.\n\nBest,\nTim', date:'9:14 AM', unread:true },
  { id:2, mbox:'inbox', from:'Apple Developer', email:'developer@apple.com', subject:'WWDC25 Session Recordings', preview:'Watch the Meet Liquid Glass session and over 100 others…', body:'The WWDC25 session recordings are now available.\n\nStart with "Meet Liquid Glass" to learn about the new design language.\n\nHappy coding!', date:'Yesterday', unread:true },
  { id:3, mbox:'inbox', from:'iCloud', email:'no-reply@icloud.com', subject:'Your storage is almost full', preview:'Your iCloud storage is 95% full. Upgrade to get more space…', body:'Your iCloud storage is almost full.\n\nUpgrade to iCloud+ to get more space and premium features.', date:'Aug 6', unread:true },
  { id:4, mbox:'inbox', from:'Maps', email:'maps@apple.com', subject:'Your weekly summary', preview:'You visited 3 new places this week…', body:'Here is your weekly summary from Apple Maps.\n\nYou visited 3 new places this week. Tap to see your route history.', date:'Aug 5', unread:false },
  { id:5, mbox:'drafts', from:'(Draft)', email:'', subject:'Reply to Tim', preview:'', body:'Hi Tim,\n\nThanks for the warm welcome to Tahoe. The Liquid Glass design is…', date:'Today', unread:false },
  { id:6, mbox:'sent', from:'To: support@apple.com', email:'support@apple.com', subject:'Feedback', preview:'', body:'Loving the new design!', date:'Aug 3', unread:false },
];

let activeMbox = 'inbox';
let activeMail = null;

export function mount(el) {
  el.innerHTML = `
    <div style="display:flex;height:100%">
      <div class="sidebar scroll" style="width:180px">
        <div class="sb-h">Mailboxes</div>
        ${MAILBOXES.map(m=>`<div class="sb-item ${m.id==='inbox'?'sel':''}" data-mbox="${m.id}">${m.icon}<span>${m.name}</span>${m.count?`<span style="margin-left:auto;opacity:.6;font-size:11px">${m.count}</span>`:''}</div>`).join('')}
        <div class="sb-h">Accounts</div>
        <div class="sb-item">${glyph('star',15)}<span>iCloud</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Gmail</span></div>
      </div>
      <div style="width:300px;flex:none;border-right:0.5px solid rgba(0,0,0,.1);display:flex;flex-direction:column">
        <div style="padding:8px 10px;border-bottom:0.5px solid rgba(0,0,0,.08);display:flex;gap:8px">
          <button class="btn primary" data-compose style="font-size:12px;padding:4px 10px">Compose</button>
          <input class="field" placeholder="Search" style="font-size:12px;padding:3px 8px" />
        </div>
        <div class="mail-list scroll" data-list style="flex:1"></div>
      </div>
      <div data-reader style="flex:1;overflow:auto;padding:18px 22px"></div>
    </div>
  `;
  const list = el.querySelector('[data-list]');
  const reader = el.querySelector('[data-reader]');

  function refresh() {
    const mails = MAILS.filter(m => m.mbox === activeMbox);
    list.innerHTML = mails.map(m => `
      <div class="mail-row" data-id="${m.id}" style="padding:10px 12px;cursor:default;border-bottom:0.5px solid rgba(0,0,0,.06);${m.unread?'font-weight:600':''}">
        <div style="display:flex;justify-content:space-between;font-size:12px"><span>${escapeHtml(m.from)}</span><span style="opacity:.5">${m.date}</span></div>
        <div style="font-size:13px;margin-top:2px">${escapeHtml(m.subject)}</div>
        <div style="font-size:11px;opacity:.55;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(m.preview)}</div>
      </div>
    `).join('') || '<div style="padding:16px;opacity:.5;font-size:13px">No messages</div>';
    list.querySelectorAll('.mail-row').forEach(r => r.addEventListener('click', () => {
      activeMail = +r.dataset.id;
      MAILS.forEach(m => m.unread = m.unread && m.id !== activeMail);
      showMail();
      refresh();
    }));
  }
  function showMail() {
    const m = MAILS.find(x => x.id === activeMail);
    if (!m) { reader.innerHTML = '<div style="opacity:.5">Select a message</div>'; return; }
    reader.innerHTML = `
      <div style="font-size:18px;font-weight:700;margin-bottom:6px">${escapeHtml(m.subject)}</div>
      <div style="font-size:13px;margin-bottom:2px"><b>${escapeHtml(m.from)}</b> <span style="opacity:.5">&lt;${escapeHtml(m.email)}&gt;</span></div>
      <div style="font-size:12px;opacity:.5;margin-bottom:14px">${m.date}</div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(m.body)}</div>
      <div style="margin-top:20px;display:flex;gap:8px"><button class="btn" data-reply>Reply</button><button class="btn" data-forward>Forward</button><button class="btn" data-del>Delete</button></div>
    `;
    reader.querySelector('[data-reply]')?.addEventListener('click', () => compose('Re: ' + m.subject, m.from));
    reader.querySelector('[data-forward]')?.addEventListener('click', () => compose('Fwd: ' + m.subject, ''));
    reader.querySelector('[data-del]')?.addEventListener('click', () => { m.mbox='trash'; activeMail=null; refresh(); showMail(); });
  }
  function compose(subject, to) {
    reader.innerHTML = `
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">New Message</div>
      <div style="margin-bottom:8px"><input class="field" placeholder="To:" value="${escapeHtml(to)}" data-to /></div>
      <div style="margin-bottom:8px"><input class="field" placeholder="Subject:" value="${escapeHtml(subject)}" data-subj /></div>
      <textarea class="te-area" style="width:100%;height:200px;border:0.5px solid rgba(0,0,0,.18);border-radius:8px;resize:none;padding:10px" placeholder="Compose your message…" data-body></textarea>
      <div style="margin-top:10px;display:flex;gap:8px"><button class="btn primary" data-send>Send</button><button class="btn" data-cancel>Cancel</button></div>
    `;
    reader.querySelector('[data-send]')?.addEventListener('click', () => {
      import('../store.js').then(m=>m.toast('Message sent'));
      showMail();
    });
    reader.querySelector('[data-cancel]')?.addEventListener('click', showMail);
  }

  el.querySelectorAll('[data-mbox]').forEach(s => s.addEventListener('click', () => {
    activeMbox = s.dataset.mbox; activeMail = null;
    el.querySelectorAll('[data-mbox]').forEach(x => x.classList.toggle('sel', x===s));
    refresh(); showMail();
  }));
  el.querySelector('[data-compose]').addEventListener('click', () => compose('', ''));

  refresh(); showMail();
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
