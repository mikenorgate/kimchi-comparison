// Messages — conversation list + bubbles. Purely local (no real sending).
import { glyph } from '../icons.js';
import { toast } from '../store.js';

export const windowConfig = { width: 760, height: 500 };

const CONVOS = [
  { id:1, name:'Tim Apple', avatar:'#0a84ff', last:'Welcome to Tahoe!', msgs:[
    { me:false, text:'Hey! Did you see the new Tahoe update?', time:'9:02 AM' },
    { me:false, text:'Liquid Glass looks amazing', time:'9:02 AM' },
    { me:true, text:'Yeah just installed it', time:'9:05 AM' },
    { me:false, text:'Welcome to Tahoe!', time:'9:14 AM' },
  ]},
  { id:2, name:'Mom', avatar:'#ff375f', last:'Call me when you can ❤️', msgs:[
    { me:false, text:'Hi sweetie, how are you?', time:'Yesterday' },
    { me:true, text:'Doing great! The new Mac update is wild', time:'Yesterday' },
    { me:false, text:'Call me when you can ❤️', time:'Yesterday' },
  ]},
  { id:3, name:'Dev Team', avatar:'#28c840', last:'Pushed the fix', msgs:[
    { me:false, text:'Anyone seen the latest build?', time:'Aug 6' },
    { me:true, text:'Pushed the fix', time:'Aug 6' },
  ]},
  { id:4, name:'Jake', avatar:'#ff9f0a', last:'Want to grab lunch?', msgs:[
    { me:false, text:'Want to grab lunch?', time:'Aug 5' },
  ]},
];

let activeId = 1;

export function mount(el) {
  el.innerHTML = `
    <div style="display:flex;height:100%">
      <div style="width:240px;flex:none;border-right:0.5px solid rgba(0,0,0,.1);overflow:auto" data-list></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div data-header style="padding:10px 14px;border-bottom:0.5px solid rgba(0,0,0,.08);font-weight:600;display:flex;align-items:center;gap:10px"></div>
        <div data-bubbles style="flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:6px"></div>
        <div style="padding:8px 12px;border-top:0.5px solid rgba(0,0,0,.08);display:flex;gap:8px">
          <input class="field" placeholder="iMessage" data-input style="flex:1" />
          <button class="btn primary" data-send>Send</button>
        </div>
      </div>
    </div>
  `;
  const list = el.querySelector('[data-list]');
  const header = el.querySelector('[data-header]');
  const bubbles = el.querySelector('[data-bubbles]');
  const input = el.querySelector('[data-input]');

  function renderList() {
    list.innerHTML = CONVOS.map(c => `
      <div class="msg-convo ${c.id===activeId?'sel':''}" data-id="${c.id}" style="padding:10px 12px;cursor:default;display:flex;gap:10px;align-items:center;${c.id===activeId?'background:var(--accent);color:#fff':''}">
        <div style="width:36px;height:36px;border-radius:50%;background:${c.avatar};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;flex:none">${c.name[0]}</div>
        <div style="min-width:0">
          <div style="font-size:13px;font-weight:600">${escapeHtml(c.name)}</div>
          <div style="font-size:12px;opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(c.last)}</div>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.msg-convo').forEach(r => r.addEventListener('click', () => { activeId = +r.dataset.id; renderList(); renderChat(); }));
  }

  function renderChat() {
    const c = CONVOS.find(x => x.id === activeId);
    if (!c) return;
    header.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:${c.avatar};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:13px">${c.name[0]}</div>${escapeHtml(c.name)}`;
    bubbles.innerHTML = c.msgs.map(m => `
      <div style="display:flex;${m.me?'justify-content:flex-end':''}">
        <div style="max-width:70%;padding:8px 14px;border-radius:16px;${m.me?'background:var(--accent);color:#fff':'background:rgba(0,0,0,.08)'};font-size:14px;line-height:1.4">${escapeHtml(m.text)}</div>
      </div>
    `).join('');
    bubbles.scrollTop = bubbles.scrollHeight;
  }

  function send() {
    const text = input.value.trim();
    if (!text) return;
    const c = CONVOS.find(x => x.id === activeId);
    c.msgs.push({ me:true, text, time: 'Now' });
    c.last = text;
    input.value = '';
    renderList(); renderChat();
    // auto-reply
    setTimeout(() => {
      const replies = ['Nice!','👍','Cool','Got it','Sounds good','Haha','Thanks!','Okay'];
      c.msgs.push({ me:false, text: replies[Math.floor(Math.random()*replies.length)], time:'Now' });
      c.last = c.msgs[c.msgs.length-1].text;
      renderList(); renderChat();
    }, 1200 + Math.random()*1500);
  }

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  el.querySelector('[data-send]').addEventListener('click', send);

  renderList(); renderChat();
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
