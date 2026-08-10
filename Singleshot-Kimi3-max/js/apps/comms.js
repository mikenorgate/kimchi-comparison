/* comms.js — Mail, Messages, FaceTime, Contacts, Maps */
(function () {
  const Mac = window.Mac, h = Mac.h;
  const S = () => Mac.Settings;

  /* ============================ MAIL ============================ */
  const MAIL_DEFAULT = [
    { id: 'm1', box: 'inbox', from: 'Priya Nair', addr: 'priya@apple.design', to: 'me', subj: 'Liquid Glass pass — V2 mockups', time: Date.now() - 1000 * 60 * 38, unread: true, vip: true, body: 'Hi Mike,\n\nAttached (mentally) are the V2 mockups for the translucency pass. The Dock is looking great — everyone loves the bounce.\n\nTwo notes:\n  1. Can we push the blur saturation a touch higher?\n  2. The Finder icon smile needs to be 4% friendlier.\n\nThanks!\n— Priya' },
    { id: 'm2', box: 'inbox', from: 'Craig F.', addr: 'craig@apple.com', to: 'me', subj: 'Your web build of Tahoe', time: Date.now() - 1000 * 60 * 60 * 5, unread: true, body: 'Mike,\n\nSomeone showed me your in-browser recreation of macOS Tahoe. Impressive work. The Spotlight search evaluating arithmetic is a nice touch — we stole that idea decades ago, and it still holds up.\n\nKeep it up,\nC.' },
    { id: 'm3', box: 'inbox', from: 'App Store', addr: 'no-reply@appstore.com', to: 'me', subj: 'Your receipt: Procreate', time: Date.now() - 1000 * 60 * 60 * 26, unread: false, body: 'Dear Mike,\n\nThank you for your purchase.\n\nProcreate for Mac — $12.99\nOrder ID: MQ7XK2W9NL\n\n(This is a simulated receipt. No simulated money was harmed.)' },
    { id: 'm4', box: 'sent', from: 'me', addr: 'mike@icloud.com', to: 'priya@apple.design', subj: 'Re: Liquid Glass pass — V2 mockups', time: Date.now() - 1000 * 60 * 90, unread: false, body: 'Priya,\n\nBlur saturation bumped from 180% to 190%. Smile friendliness increased by 5% to be safe.\n\n— Mike' },
    { id: 'm5', box: 'inbox', from: 'Tim Cook', addr: 'tim@apple.com', to: 'me', subj: 'One more thing…', time: Date.now() - 1000 * 60 * 60 * 49, unread: false, vip: true, body: 'Mike — great work on the simulation. Do me a favor: scroll to the Dock, click the green bubble icon, and send me a message.\n\nOne more thing… try Dark Mode in Control Center.\n\n— Tim' },
  ];
  let mails = Mac.loadJSON('mac.mail', MAIL_DEFAULT);
  const saveMails = () => Mac.saveJSON('mac.mail', mails);

  const mailBoxNames = { inbox: 'Inbox', vip: 'VIP', sent: 'Sent', drafts: 'Drafts', trash: 'Trash' };
  const mailBoxIco = { inbox: 'mail', vip: 'flag', sent: 'share', drafts: 'doc', trash: 'trash' };

  function openMail(args) {
    const state = { box: 'inbox', sel: null, query: '' };
    const win = Mac.wm.createWindow({
      app: 'mail', title: 'Mail', width: 940, height: 560, minW: 620, minH: 380,
      build(body, w) { buildMail(body, w, state); },
      onClose() { },
    });
    win._mailState = state;
    return win;
  }

  function buildMail(body, win, st) {
    const compose = h('button', { class: 'tb-btn', html: Mac.GLYPH.compose, title: 'New Message' });
    compose.addEventListener('click', () => mailCompose());
    const trashBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.trash, title: 'Delete' });
    trashBtn.addEventListener('click', () => {
      if (st.sel == null) return;
      const m = mails.find(x => x.id === st.sel);
      if (!m) return;
      if (m.box === 'trash') mails = mails.filter(x => x !== m); else m.box = 'trash';
      st.sel = null; saveMails(); renderMail(win);
    });
    const search = h('input', { class: 'inp', placeholder: 'Search All Mailboxes' });
    search.addEventListener('input', Mac.debounce(() => { st.query = search.value.trim().toLowerCase(); renderMail(win); }, 200));
    const toolbar = h('div', { class: 'toolbar' }, compose, trashBtn, h('div', { class: 'tb-search' }, h('span', { class: 'glyph', html: Mac.GLYPH.search }), search));

    const side = h('div', { class: 'sidebar' });
    side.append(h('div', { class: 'side-h' }, 'Mailboxes'));
    Object.keys(mailBoxNames).forEach(k => {
      const count = k === 'inbox' ? mails.filter(m => m.box === 'inbox' && m.unread).length : 0;
      const el = h('div', { class: 'side-item' + (st.box === k ? ' sel' : ''), 'data-box': k },
        h('span', { class: 'glyph', html: Mac.GLYPH[mailBoxIco[k]] }), mailBoxNames[k],
        count ? h('span', { class: 'si-count' }, count) : null);
      el.addEventListener('click', () => { st.box = k; st.sel = null; renderMail(win); });
      side.append(el);
    });
    side.append(h('div', { class: 'side-h' }, 'Accounts'), h('div', { class: 'side-item' }, h('span', { class: 'glyph', html: Mac.GLYPH.globe }), 'iCloud'));

    const list = h('div', { class: 'mail-list' });
    const read = h('div', { class: 'mail-read' });
    const split = h('div', { class: 'split' }, side, list, read);
    Object.assign(win, { _mailList: list, _mailRead: read, _mailSide: side });
    body.append(toolbar, split);
    renderMail(win);
  }

  function renderMail(win) {
    const st = win._mailState;
    win._mailSide.querySelectorAll('.side-item[data-box]').forEach(el => el.classList.toggle('sel', el.dataset.box === st.box));
    const list = win._mailList; list.innerHTML = '';
    let items = st.box === 'vip' ? mails.filter(m => m.vip && m.box !== 'trash') : mails.filter(m => m.box === st.box);
    if (st.query) items = items.filter(m => (m.from + m.subj + m.body).toLowerCase().includes(st.query));
    items.sort((a, b) => b.time - a.time);
    items.forEach(m => {
      const el = h('div', { class: 'mail-item' + (st.sel === m.id ? ' sel' : '') },
        h('div', { class: 'mi-top' }, h('span', { class: 'mi-from' }, m.unread ? h('span', { class: 'unread-dot' }) : null, m.from === 'me' ? 'To: ' + m.to : m.from), h('span', { class: 'mi-date' }, fmtMailDate(m.time))),
        h('div', { class: 'mi-subj' }, m.subj),
        h('div', { class: 'mi-prev' }, m.body.split('\n')[0]));
      el.addEventListener('click', () => { st.sel = m.id; if (m.unread) { m.unread = false; saveMails(); updateUnreadBadge(); } renderMail(win); });
      list.append(el);
    });
    if (!items.length) list.append(h('div', { class: 'empty-pane', style: { height: '160px' } }, 'No Mail'));
    const read = win._mailRead;
    const sel = mails.find(x => x.id === st.sel);
    read.innerHTML = '';
    if (!sel) { read.append(h('div', { class: 'empty-pane', style: { height: '100%' } }, 'No Message Selected')); return; }
    read.append(
      h('div', { class: 'mr-subj' }, sel.subj),
      h('div', { class: 'mr-meta' },
        h('div', { html: Mac.avatar(sel.from === 'me' ? 'Me' : sel.from, 36) }),
        h('div', {}, h('div', { class: 'mr-from' }, sel.from === 'me' ? 'Me' : sel.from + ' <' + sel.addr + '>'), h('div', { class: 'mr-to' }, 'To: ' + (sel.to === 'me' ? S().get('username') + ' <mike@icloud.com>' : sel.to))),
        h('div', { class: 'mr-date' }, Mac.fmtDateTime(sel.time))),
      h('div', { class: 'mr-body' }, ...sel.body.split('\n').map(l => l ? h('p', { style: { marginBottom: '8px' } }, l) : h('div', { style: { height: '8px' } })))
    );
  }
  function fmtMailDate(t) {
    const d = new Date(t), now = new Date();
    if (d.toDateString() === now.toDateString()) return Mac.fmtTime(t);
    return Mac.fmtDate(t);
  }
  function updateUnreadBadge() { /* could add dock badge; keep simple */ }

  function mailCompose(replyTo) {
    const win = Mac.wm.createWindow({
      app: 'mail', title: 'New Message', width: 620, height: 460, minW: 440, minH: 300, simpleBar: true,
      build(body, w) {
        const to = h('input', { value: replyTo ? replyTo.addr : '', placeholder: '' });
        const subj = h('input', { value: replyTo ? 'Re: ' + replyTo.subj : '' });
        const bodyEl = h('div', { class: 'compose-body', contenteditable: 'true' }, replyTo ? h('div', {}, h('br'), h('span', { style: { color: 'var(--text2)' } }, 'On ' + Mac.fmtDate(replyTo.time) + ', ' + replyTo.from + ' wrote:'), h('blockquote', { style: { borderLeft: '2px solid var(--hairline)', paddingLeft: '10px', color: 'var(--text2)' } }, replyTo.body)) : null);
        const sendBtn = h('button', { class: 'btn primary', style: { borderRadius: '14px', padding: '2px 14px' } }, 'Send');
        sendBtn.addEventListener('click', () => {
          const txt = bodyEl.innerText.trim();
          if (!to.value.trim()) return Mac.System.alert({ title: 'Mail', message: 'Please enter a recipient.', icon: 'mail' });
          mails.push({ id: Mac.uid(), box: 'sent', from: 'me', addr: 'mike@icloud.com', to: to.value.trim(), subj: subj.value || '(no subject)', time: Date.now(), unread: false, body: txt });
          saveMails(); w.close();
          Mac.System.notify({ title: 'Mail', body: 'Message sent to ' + to.value.trim(), icon: 'mail', appId: 'mail' });
          if (Math.random() < 0.85) scheduleReply(to.value.trim(), subj.value);
          Mac.wm.windowsFor('mail').forEach(x => x._mailState && renderMail(x));
        });
        const toolbar = h('div', { class: 'toolbar' }, sendBtn);
        body.append(toolbar,
          h('div', { class: 'compose-field' }, h('span', { class: 'cf-label' }, 'To:'), to),
          h('div', { class: 'compose-field' }, h('span', { class: 'cf-label' }, 'From:'), h('span', { style: { color: 'var(--text2)' } }, 'Mike <mike@icloud.com>')),
          h('div', { class: 'compose-field' }, h('span', { class: 'cf-label' }, 'Subject:'), subj),
          bodyEl);
        setTimeout(() => (replyTo ? bodyEl : to).focus(), 50);
      }
    });
  }
  const REPLIES = [
    'Sounds good — let’s sync tomorrow.',
    'Love it. Ship it.',
    'Can you bump the blur by another 3%? Asking for a friend.',
    'Got it, thanks Mike!',
    'This. Is. Gorgeous.',
    'Wait, is this running in a browser?!',
  ];
  function scheduleReply(addr, subj) {
    setTimeout(() => {
      const name = addr.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const body = REPLIES[(Math.random() * REPLIES.length) | 0];
      mails.push({ id: Mac.uid(), box: 'inbox', from: name || 'A Friend', addr, to: 'me', subj: 'Re: ' + (subj || '(no subject)'), time: Date.now(), unread: true, body: body + '\n\n— ' + (name || 'Friend') });
      saveMails();
      Mac.System.notify({ title: name || 'New Mail', body: 'Re: ' + (subj || ''), icon: 'mail', appId: 'mail' });
      Mac.wm.windowsFor('mail').forEach(x => x._mailState && renderMail(x));
    }, 12000 + Math.random() * 18000);
  }

  /* ============================ MESSAGES ============================ */
  const MSG_DEFAULT = [
    { id: 't1', name: 'Priya Nair', msgs: [{ me: false, text: 'Dock bounce is at 3 reps now, feels right', t: Date.now() - 86400000 }, { me: true, text: 'agreed. 2 felt shy, 4 felt needy', t: Date.now() - 86300000 }, { me: false, text: 'exactly 😄', t: Date.now() - 86200000 }] },
    { id: 't2', name: 'Tim Cook', msgs: [{ me: false, text: 'Have you tried Dark Mode yet?', t: Date.now() - 3600000 }] },
    { id: 't3', name: 'Mom', msgs: [{ me: false, text: 'Call me when you can ❤️', t: Date.now() - 7200000 }, { me: true, text: 'Will do tonight!', t: Date.now() - 7000000 }] },
    { id: 't4', name: 'Design Team', msgs: [{ me: false, text: 'Sam: the traffic lights need to glow on hover', t: Date.now() - 4000000 }, { me: true, text: 'on it', t: Date.now() - 3900000 }] },
  ];
  let threads = Mac.loadJSON('mac.messages', MSG_DEFAULT);
  const saveThreads = () => Mac.saveJSON('mac.messages', threads);
  const autoReplies = ['lol', 'nice one', 'on my way', 'give me 5 min', 'true 😂', 'screenshot or it didn’t happen', 'k — sending mocks now', '☕️?'];

  function openMessages() {
    const st = { sel: threads[0] && threads[0].id };
    const win = Mac.wm.createWindow({
      app: 'messages', title: 'Messages', width: 820, height: 540, minW: 560, minH: 340,
      build(body, w) { buildMessages(body, w, st); },
    });
    win._msgState = st;
    return win;
  }

  function buildMessages(body, win, st) {
    const compose = h('button', { class: 'tb-btn', html: Mac.GLYPH.compose, title: 'New Message' });
    compose.addEventListener('click', () => newMessageDialog(win));
    const toolbar = h('div', { class: 'toolbar' }, compose);
    const list = h('div', { class: 'msg-list' });
    const chat = h('div', { class: 'msg-chat' });
    body.append(toolbar, h('div', { class: 'split' }, list, chat));
    Object.assign(win, { _msgList: list, _msgChat: chat });
    renderThreads(win); renderChat(win);
  }

  function renderThreads(win) {
    const st = win._msgState, list = win._msgList;
    list.innerHTML = '';
    threads.forEach(t => {
      const last = t.msgs[t.msgs.length - 1];
      const el = h('div', { class: 'msg-thread' + (st.sel === t.id ? ' sel' : '') },
        h('div', { html: Mac.avatar(t.name, 38) }),
        h('div', { class: 'mt-mid' }, h('div', { class: 'mt-name' }, t.name), h('div', { class: 'mt-prev' }, (last ? (last.me ? 'You: ' : '') + last.text : ''))),
        h('div', { class: 'mt-time' }, last ? fmtMailDate(last.t) : ''));
      el.addEventListener('click', () => { st.sel = t.id; renderThreads(win); renderChat(win); });
      list.append(el);
    });
  }

  function renderChat(win) {
    const st = win._msgState, chat = win._msgChat;
    chat.innerHTML = '';
    const t = threads.find(x => x.id === st.sel);
    const scroll = h('div', { class: 'msg-scroll' });
    if (t) t.msgs.forEach((m, i) => {
      const same = i > 0 && t.msgs[i - 1].me === m.me;
      scroll.append(h('div', { class: 'bubble ' + (m.me ? 'me' : 'them') + (same ? ' same' : '') }, m.text));
    });
    const inp = h('input', { class: 'inp', placeholder: 'iMessage' });
    const send = h('button', { class: 'msg-send', html: '↑' });
    const doSend = () => {
      const v = inp.value.trim(); if (!v || !t) return;
      t.msgs.push({ me: true, text: v, t: Date.now() });
      saveThreads(); inp.value = ''; renderThreads(win); renderChat(win);
      // typing indicator then reply
      setTimeout(() => {
        const cur = threads.find(x => x.id === t.id);
        if (!cur) return;
        const typing = h('div', { class: 'bubble them msg-typing' }, h('span'), h('span'), h('span'));
        const sc = win._msgChat.querySelector('.msg-scroll');
        if (sc && win._msgState.sel === cur.id) { sc.append(typing); sc.scrollTop = sc.scrollHeight; }
        setTimeout(() => {
          cur.msgs.push({ me: false, text: autoReplies[(Math.random() * autoReplies.length) | 0], t: Date.now() });
          saveThreads();
          if (win._msgState.sel === cur.id && !win.closed) { renderThreads(win); renderChat(win); }
          if (!document.hasFocus() || Mac.wm.activeApp !== 'messages') Mac.System.notify({ title: cur.name, body: 'Replied: “' + cur.msgs[cur.msgs.length - 1].text + '”', icon: 'messages', appId: 'messages' });
        }, 1400 + Math.random() * 1800);
      }, 700);
    };
    send.addEventListener('click', doSend);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); e.stopPropagation(); });
    chat.append(scroll, h('div', { class: 'msg-inputbar' }, inp, send));
    scroll.scrollTop = scroll.scrollHeight;
  }

  function newMessageDialog(win) {
    const known = ['Priya Nair', 'Tim Cook', 'Mom', 'Design Team', 'Sam Cho', 'Alex Reyes'];
    Mac.System.alert({
      title: 'New Message', message: 'Choose a recipient:', icon: 'messages',
      extra: h('div', {}, known.map(n => h('div', {
        class: 'te-openrow', style: { cursor: 'default' }, onclick: () => {
          document.getElementById('alert-layer').classList.add('hidden');
          let t = threads.find(x => x.name === n);
          if (!t) { t = { id: Mac.uid(), name: n, msgs: [] }; threads.unshift(t); saveThreads(); }
          win._msgState.sel = t.id; renderThreads(win); renderChat(win);
        }
      }, h('div', { html: Mac.avatar(n, 26) }), n))),
      buttons: [{ label: 'Cancel' }]
    });
  }

  /* ============================ FACETIME ============================ */
  const FT_RECIENTS = ['Priya Nair', 'Tim Cook', 'Mom', 'Sam Cho', 'Alex Reyes'];
  function openFaceTime() {
    let curCall = null, stream = null, micOn = true, camOn = true;
    const win = Mac.wm.createWindow({
      app: 'facetime', title: 'FaceTime', width: 900, height: 560, minW: 640, minH: 400, simpleBar: true,
      build(body) {
        const side = h('div', { class: 'ft-side' });
        side.append(h('div', { class: 'side-h', style: { color: 'rgba(255,255,255,.6)' } }, 'Recent'));
        FT_RECIENTS.forEach((n, i) => {
          const missed = i % 3 === 2;
          const row = h('div', { class: 'ft-call-row' },
            h('div', { html: Mac.avatar(n, 32) }),
            h('div', {}, h('div', { class: missed ? 'missed' : '' }, n), h('div', { class: 'ft-sub' }, (missed ? 'Missed' : 'Outgoing') + ' — ' + Mac.fmtDate(Date.now() - (i + 1) * 40000000))),
            h('button', { class: 'tb-btn', style: { marginLeft: 'auto', color: '#fff' }, html: Mac.GLYPH.video, title: 'Call back' }));
          row.addEventListener('click', () => startCall(n));
          side.append(row);
        });

        const main = h('div', { class: 'ft-main' });
        const video = h('video', { autoplay: true, playsinline: true, muted: true });
        const fallback = h('div', { class: 'ft-fallback' }, h('div', { class: 'big-av', html: Mac.avatar(S().get('username'), 120) }));
        const nameTag = h('div', { class: 'ft-name-tag' }, S().get('username'));
        const ctrl = h('div', { class: 'ft-ctrl' },
          ctrlBtn('🎙', 'Mute', () => { micOn = !micOn; return !micOn; }),
          ctrlBtn('📹', 'Stop video', () => { camOn = !camOn; if (stream) stream.getVideoTracks().forEach(t => t.enabled = camOn); video.style.display = camOn ? '' : 'none'; return !camOn; }),
          (() => { const b = h('button', { class: 'ft-btn end', title: 'End' }, '📞'); b.addEventListener('click', endCall); return b; })());
        function ctrlBtn(txt, title, fn) {
          const b = h('button', { class: 'ft-btn', title }, txt);
          b.addEventListener('click', () => b.classList.toggle('off', !!fn()));
          return b;
        }
        main.append(video, fallback, nameTag, ctrl);
        body.append(h('div', { class: 'ft-root' }, side, main));

        function endCall() {
          if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
          video.style.display = 'none'; fallback.style.display = 'flex';
          nameTag.textContent = curCall ? 'Call ended' : S().get('username');
          curCall = null;
        }
        function startCall(name) {
          endCall();
          curCall = name;
          nameTag.textContent = 'Calling ' + name + '…';
          fallback.style.display = 'flex';
          fallback.innerHTML = '';
          fallback.append(h('div', { class: 'big-av', html: Mac.avatar(name, 120) }),
            h('div', { style: { position: 'absolute', bottom: '100px', color: '#fff', fontSize: '14px' } }, 'FaceTime — ringing…'));
          setTimeout(() => {
            if (curCall !== name) return;
            nameTag.textContent = name + ' — ' + (micOn ? '00:0' : '');
            fallback.querySelector('div:last-child') && fallback.querySelector('div:last-child').remove();
            Mac.System.notify({ title: 'FaceTime', body: name + ' declined your call (they’re simulated). Try again!', icon: 'facetime', appId: 'facetime' });
            pend = null;
          }, 4200);
        }
        Mac.FT_startCall = startCall;

        // camera preview (best-effort)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stm => {
            stream = stm; video.srcObject = stm; video.style.display = ''; fallback.style.display = 'none';
          }).catch(() => { /* fallback avatar stays */ });
        }
        win.addEventListener?.('close', endCall);
      },
      onClose() { if (stream) stream.getTracks().forEach(t => t.stop()); }
    });
    return win;
  }

  /* ============================ CONTACTS ============================ */
  const CON_DEFAULT = [
    { id: 'c1', name: 'Priya Nair', company: 'Apple — Design', phone: '(408) 555-0134', email: 'priya@apple.design', note: 'Liquid Glass lead. Likes strong coffee.' },
    { id: 'c2', name: 'Tim Cook', company: 'Apple — CEO', phone: '(408) 555-0001', email: 'tim@apple.com', note: 'Says good morning a lot.' },
    { id: 'c3', name: 'Sam Cho', company: 'Apple — HI', phone: '(408) 555-0127', email: 'sam@apple.com', note: 'Traffic-light pixel perfectionist.' },
    { id: 'c4', name: 'Alex Reyes', company: 'Friend', phone: '(650) 555-0199', email: 'alex@mail.com', note: '' },
    { id: 'c5', name: 'Mom', company: '', phone: '(212) 555-0182', email: '', note: 'Call more often.' },
  ];
  let contacts = Mac.loadJSON('mac.contacts', CON_DEFAULT);
  const saveContacts = () => Mac.saveJSON('mac.contacts', contacts);

  function openContacts() {
    const st = { sel: contacts[0] && contacts[0].id };
    const win = Mac.wm.createWindow({
      app: 'contacts', title: 'Contacts', width: 760, height: 500, minW: 560, minH: 340,
      build(body, w) { buildContacts(body, w, st); },
    });
    win._conState = st;
    return win;
  }
  function buildContacts(body, win, st) {
    const add = h('button', { class: 'tb-btn', html: Mac.GLYPH.plus, title: 'New Contact' });
    add.addEventListener('click', () => {
      const c = { id: Mac.uid(), name: 'New Contact', company: '', phone: '', email: '', note: '' };
      contacts.push(c); saveContacts(); st.sel = c.id; renderCons(win); renderConDetail(win, true);
    });
    const toolbar = h('div', { class: 'toolbar' }, add);
    const list = h('div', { class: 'con-list' });
    const detail = h('div', { class: 'con-detail' });
    body.append(toolbar, h('div', { class: 'split' }, list, detail));
    Object.assign(win, { _conList: list, _conDetail: detail });
    renderCons(win); renderConDetail(win);
  }
  function renderCons(win) {
    const st = win._conState, list = win._conList;
    list.innerHTML = '';
    contacts.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
      const el = h('div', { class: 'con-row' + (st.sel === c.id ? ' sel' : '') }, c.name);
      el.addEventListener('click', () => { st.sel = c.id; renderCons(win); renderConDetail(win); });
      list.append(el);
    });
  }
  function renderConDetail(win, editing) {
    const st = win._conState, d = win._conDetail;
    d.innerHTML = '';
    const c = contacts.find(x => x.id === st.sel);
    if (!c) { d.append(h('div', { class: 'empty-pane', style: { height: '100%' } }, 'No Card Selected')); return; }
    const nameEl = editing ? h('input', { class: 'inp', value: c.name, style: { fontSize: '18px' } }) : h('div', { class: 'con-name' }, c.name);
    if (editing) nameEl.addEventListener('change', () => { c.name = nameEl.value; saveContacts(); renderCons(win); });
    const delBtn = h('button', { class: 'btn destructive' }, 'Delete Card');
    delBtn.addEventListener('click', () => Mac.System.confirm('Delete this card? This cannot be undone.', 'Delete').then(ok => {
      if (!ok) return;
      contacts = contacts.filter(x => x.id !== c.id); saveContacts();
      st.sel = contacts[0] && contacts[0].id; renderCons(win); renderConDetail(win);
    }));
    const callBtn = h('button', { class: 'btn' }, '📹 FaceTime');
    callBtn.addEventListener('click', () => { const w = Mac.launch('facetime'); });
    d.append(
      h('div', { class: 'con-card-h' }, h('div', { html: Mac.avatar(c.name, 64) }), h('div', {}, nameEl, h('div', { class: 'con-company' }, c.company || ''))),
      ...[['phone', c.phone], ['email', c.email], ['note', c.note]].map(([k, v]) => h('div', { class: 'con-field' }, h('span', { class: 'k' }, k),
        h('span', { contenteditable: 'true', style: { flex: '1', outline: 'none' }, onblur: e => { c[k] = e.target.textContent.trim(); saveContacts(); } }, v))),
      h('div', { style: { marginTop: '16px', display: 'flex', gap: '8px' } }, callBtn, delBtn));
  }

  /* ============================ MAPS ============================ */
  const MAP_PLACES = {
    'cupertino': [37.3230, -122.0322], 'san francisco': [37.7749, -122.4194], 'new york': [40.7128, -74.0060],
    'tokyo': [35.6762, 139.6503], 'london': [51.5074, -0.1278], 'paris': [48.8566, 2.3522], 'sydney': [-33.8688, 151.2093],
    'yosemite': [37.8651, -119.5383], 'lake tahoe': [39.0968, -120.0324],
  };
  function openMaps() {
    let place = 'Cupertino';
    const win = Mac.wm.createWindow({
      app: 'maps', title: 'Maps', width: 900, height: 600, minW: 560, minH: 360,
      onClose: null,
      build(body, w) {
        const search = h('input', { class: 'inp', placeholder: 'Search for a place or address', style: { width: '220px' } });
        const toolbar = h('div', { class: 'toolbar' }, h('span', { class: 'glyph', html: Mac.GLYPH['map-pin'] }), search);
        const frame = h('iframe', { style: { flex: '1', border: '0', width: '100%' }, loading: 'lazy' });
        const note = h('div', { class: 'statusbar' }, 'Map data © OpenStreetMap contributors — live tile view (needs internet)');
        const setPlace = (label, lat, lon) => {
          w.setTitle('Maps — ' + label);
          const d = 0.06;
          frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d * 0.62}%2C${lon + d}%2C${lat + d * 0.62}&layer=mapnik&marker=${lat}%2C${lon}`;
        };
        search.addEventListener('keydown', e => {
          if (e.key !== 'Enter') return;
          const q = search.value.trim().toLowerCase();
          const found = Object.keys(MAP_PLACES).find(k => k.includes(q) || q.includes(k));
          if (found) { const [la, lo] = MAP_PLACES[found]; place = found; setPlace(found.replace(/\b\w/g, c => c.toUpperCase()), la, lo); }
          else Mac.System.alert({ title: 'Maps', message: `No results for “${Mac.esc(search.value)}” in the simulated search index. Try: Cupertino, San Francisco, New York, Tokyo, London, Paris, Sydney, Yosemite, Lake Tahoe.`, icon: 'maps' });
          e.stopPropagation();
        });
        const [la, lo] = MAP_PLACES['cupertino'];
        setPlace('Cupertino', la, lo);
        body.append(toolbar, frame, note);
        frame.addEventListener('error', () => { frame.replaceWith(h('div', { class: 'empty-pane' }, 'Map unavailable offline')); });
      }
    });
    return win;
  }

  /* ============================ menus ============================ */
  const mailMenus = () => [
    {
      title: 'File', items: [
        Mac.Menus.item('New Message', '⌘N', () => mailCompose()),
        Mac.Menus.SEP,
        Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'mail') t.close(); }),
      ]
    },
    Mac.Std.editMenu(),
    {
      title: 'Message', items: [
        Mac.Menus.item('Reply', '⌘R', () => { const t = Mac.wm.topWin(); const st = t && t._mailState; const m = st && mails.find(x => x.id === st.sel); if (m) mailCompose(m); }),
        Mac.Menus.item('Move to Trash', '⌘⌫', () => { const t = Mac.wm.topWin(); const st = t && t._mailState; if (st && st.sel) { const m = mails.find(x => x.id === st.sel); if (m) { m.box = 'trash'; st.sel = null; saveMails(); renderMail(t); } } }),
        Mac.Menus.SEP,
        Mac.Menus.item('Mark as Unread', null, () => { const t = Mac.wm.topWin(); const st = t && t._mailState; const m = st && mails.find(x => x.id === st.sel); if (m) { m.unread = true; saveMails(); renderMail(t); } }, ),
      ]
    },
    {
      title: 'Mailbox', items: Object.keys(mailBoxNames).map(k => Mac.Menus.item('Go to ' + mailBoxNames[k], null, () => { const t = Mac.wm.topWin(); if (t && t._mailState) { t._mailState.box = k; renderMail(t); } }))
    },
  ];
  const msgMenus = () => [
    {
      title: 'File', items: [
        Mac.Menus.item('New Message', '⌘N', () => { const t = Mac.wm.topWin(); if (t && t._msgState) newMessageDialog(t); }),
        Mac.Menus.item('Close Conversation', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'messages') t.close(); }),
      ]
    },
    Mac.Std.editMenu(),
    {
      title: 'Conversation', items: [
        Mac.Menus.item('Delete Conversation…', null, () => {
          const t = Mac.wm.topWin(); const st = t && t._msgState; if (!st) return;
          Mac.System.confirm('Delete this conversation? This cannot be undone.', 'Delete').then(ok => {
            if (!ok) return;
            threads = threads.filter(x => x.id !== st.sel); saveThreads();
            st.sel = threads[0] && threads[0].id; renderThreads(t); renderChat(t);
          });
        }),
        Mac.Menus.item('Send Read Receipt', null, () => Mac.System.notify({ title: 'Messages', body: 'Read receipts are always on in the simulation.', icon: 'messages' }), ),
      ]
    },
  ];
  const conMenus = () => [
    {
      title: 'File', items: [
        Mac.Menus.item('New Card', '⌘N', () => { const t = Mac.wm.topWin(); if (t && t._conState) { const c = { id: Mac.uid(), name: 'New Contact', company: '', phone: '', email: '', note: '' }; contacts.push(c); saveContacts(); t._conState.sel = c.id; renderCons(t); renderConDetail(t, true); } }),
        Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'contacts') t.close(); }),
      ]
    },
    Mac.Std.editMenu(),
  ];
  const simpleFileMenu = (appId, extra) => () => [{
    title: 'File', items: [
      ...(extra || []),
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === appId) t.close(); }),
    ]
  }, Mac.Std.editMenu()];

  /* ============================ registration ============================ */
  Mac.wm.register({ id: 'mail', name: 'Mail', icon: 'mail', menus: mailMenus, help: 'Read simulated email from real-ish people. Compose a message (⌘N) and watch a reply arrive in ~15 seconds.', open: openMail });
  Mac.wm.register({ id: 'messages', name: 'Messages', icon: 'messages', menus: msgMenus, help: 'Chat with simulated friends. They always text back — usually within two seconds.', open: openMessages });
  Mac.wm.register({ id: 'facetime', name: 'FaceTime', icon: 'facetime', menus: simpleFileMenu('facetime'), help: 'Video calls with simulated contacts. Your camera preview is live if you grant permission.', open: openFaceTime, simpleBar: true });
  Mac.wm.register({ id: 'contacts', name: 'Contacts', icon: 'contacts', menus: conMenus, help: 'Your simulated address book. Cards are editable and persist across sessions.', open: openContacts });
  Mac.wm.register({ id: 'maps', name: 'Maps', icon: 'maps', menus: simpleFileMenu('maps'), help: 'Live OpenStreetMap tiles around famous places. Try “Yosemite” or “Tokyo”.', open: openMaps });
})();
