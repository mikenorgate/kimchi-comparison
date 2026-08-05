import { App, registerApp } from '../../js/appRegistry.js';
import { $, load } from '../../js/utils.js';

class ContactsApp extends App {
  constructor() {
    super({ id: 'contacts', name: 'Contacts', width: 760, height: 520, emoji: '👤', iconGradient: ['#fff', '#e6e6e6'], iconColor: '#007aff' });
    this.contacts = load('contacts', [
      { name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com' },
      { name: 'Bob Smith', phone: '555-0102', email: 'bob@example.com' },
      { name: 'Carol White', phone: '555-0103', email: 'carol@example.com' }
    ]);
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'contacts';
    root.innerHTML = `
      <aside class="ct-sidebar"><div class="ct-list" id="list"></div></aside>
      <main class="ct-main" id="detail"></main>
    `;
    const list = $('#list', root);
    const detail = $('#detail', root);

    const show = (c) => {
      detail.innerHTML = `
        <div class="ct-avatar">${c.name[0]}</div>
        <h2>${c.name}</h2>
        <div class="ct-field"><label>Phone</label><div>${c.phone}</div></div>
        <div class="ct-field"><label>Email</label><div>${c.email}</div></div>
      `;
    };

    const render = () => {
      list.innerHTML = '';
      this.contacts.forEach(c => {
        const el = document.createElement('div');
        el.className = 'ct-item';
        el.textContent = c.name;
        el.addEventListener('click', () => show(c));
        list.appendChild(el);
      });
    };

    render();
    show(this.contacts[0]);
    return root;
  }
}

registerApp(new ContactsApp());
