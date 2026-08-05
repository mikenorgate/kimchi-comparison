import { App, registerApp } from '../../js/appRegistry.js';
import { $, load, save } from '../../js/utils.js';

class MessagesApp extends App {
  constructor() {
    super({ id: 'messages', name: 'Messages', width: 760, height: 520, emoji: '💬', iconGradient: ['#34c759', '#248a3d'], iconColor: '#fff' });
    this.chats = load('messages', {
      'Alice': [{ from: 'Alice', text: 'Hey! How are you?', time: Date.now() }],
      'Bob': [{ from: 'Bob', text: 'Lunch later?', time: Date.now() }]
    });
    this.active = 'Alice';
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'messages';
    root.innerHTML = `
      <aside class="msg-sidebar">
        <div class="msg-search"><input type="text" placeholder="Search" /></div>
        <div class="msg-list" id="list"></div>
      </aside>
      <main class="msg-main">
        <header class="msg-header" id="header"></header>
        <div class="msg-history" id="history"></div>
        <div class="msg-input-bar">
          <input type="text" id="msg-in" placeholder="iMessage" />
          <button id="send">➤</button>
        </div>
      </main>
    `;

    const list = $('#list', root);
    const history = $('#history', root);
    const header = $('#header', root);
    const input = $('#msg-in', root);

    const renderList = () => {
      list.innerHTML = '';
      Object.keys(this.chats).forEach(name => {
        const el = document.createElement('div');
        el.className = 'msg-chat' + (name === this.active ? ' active' : '');
        const last = this.chats[name].slice(-1)[0];
        el.innerHTML = `<div class="msg-name">${name}</div><div class="msg-preview">${last?.text || ''}</div>`;
        el.addEventListener('click', () => { this.active = name; renderList(); renderChat(); });
        list.appendChild(el);
      });
    };

    const renderChat = () => {
      header.textContent = this.active;
      history.innerHTML = '';
      this.chats[this.active].forEach(m => {
        const b = document.createElement('div');
        b.className = 'msg-bubble ' + (m.from === 'me' ? 'me' : 'them');
        b.textContent = m.text;
        history.appendChild(b);
      });
      history.scrollTop = history.scrollHeight;
    };

    const send = () => {
      const text = input.value.trim();
      if (!text) return;
      this.chats[this.active].push({ from: 'me', text, time: Date.now() });
      save('messages', this.chats);
      input.value = '';
      renderChat();
      renderList();
    };

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    $('#send', root).addEventListener('click', send);

    renderList();
    renderChat();
    return root;
  }
}

registerApp(new MessagesApp());
