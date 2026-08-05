import { App, registerApp } from '../../js/appRegistry.js';
import { $, load, save } from '../../js/utils.js';

class MailApp extends App {
  constructor() {
    super({ id: 'mail', name: 'Mail', width: 920, height: 600, emoji: '✉️', iconGradient: ['#007aff', '#5856d6'], iconColor: '#fff' });
    this.emails = load('emails', [
      { id: 1, from: 'Apple', subject: 'Welcome to iCloud', body: 'Your Apple ID is ready.', read: false },
      { id: 2, from: 'GitHub', subject: 'Security alert', body: 'New sign-in detected.', read: true },
      { id: 3, from: 'Newsletter', subject: 'Weekly digest', body: 'Top stories this week.', read: true }
    ]);
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'mail';
    root.innerHTML = `
      <aside class="mail-sidebar">
        <button id="compose">✉️ New Message</button>
        <div class="mail-folder active">Inbox</div>
        <div class="mail-folder">Sent</div>
        <div class="mail-folder">Drafts</div>
        <div class="mail-folder">Trash</div>
      </aside>
      <div class="mail-list" id="list"></div>
      <main class="mail-reader" id="reader"></main>
    `;

    const list = $('#list', root);
    const reader = $('#reader', root);

    const renderList = () => {
      list.innerHTML = '';
      this.emails.forEach(e => {
        const row = document.createElement('div');
        row.className = 'mail-row' + (e.read ? '' : ' unread');
        row.innerHTML = `<div class="mail-from">${e.from}</div><div class="mail-subj">${e.subject}</div>`;
        row.addEventListener('click', () => { e.read = true; renderList(); renderEmail(e); });
        list.appendChild(row);
      });
    };

    const renderEmail = (e) => {
      reader.innerHTML = `
        <div class="mail-meta"><strong>From:</strong> ${e.from}</div>
        <div class="mail-meta"><strong>Subject:</strong> ${e.subject}</div>
        <hr>
        <div class="mail-body">${e.body}</div>
      `;
    };

    $('#compose', root).addEventListener('click', () => {
      reader.innerHTML = `
        <div class="mail-compose">
          <input type="text" id="to" placeholder="To" />
          <input type="text" id="subj" placeholder="Subject" />
          <textarea id="body" placeholder="Message"></textarea>
          <button id="send">Send</button>
        </div>
      `;
      $('#send', reader).addEventListener('click', () => {
        const email = { id: Date.now(), from: 'me', subject: $('#subj', reader).value, body: $('#body', reader).value, read: true };
        this.emails.unshift(email);
        save('emails', this.emails);
        renderList();
      });
    });

    renderList();
    return root;
  }
}

registerApp(new MailApp());
