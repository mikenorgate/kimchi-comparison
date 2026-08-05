import { App, registerApp } from '../../js/appRegistry.js';
import { $, $$, load, save } from '../../js/utils.js';

class RemindersApp extends App {
  constructor() {
    super({ id: 'reminders', name: 'Reminders', width: 700, height: 500, emoji: '✅', iconGradient: ['#fff', '#e0e0e0'], iconColor: '#ff9500' });
    this.lists = load('reminders', {
      Today: [{ text: 'Buy groceries', done: false }, { text: 'Call mom', done: true }],
      Work: [{ text: 'Finish report', done: false }]
    });
    this.active = 'Today';
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'reminders';
    root.innerHTML = `
      <aside class="rem-sidebar"><div class="rem-list" id="lists"></div></aside>
      <main class="rem-main">
        <h3 id="title"></h3>
        <div class="rem-items" id="items"></div>
        <div class="rem-add"><input type="text" id="new" placeholder="New Reminder" /></div>
      </main>
    `;
    const listsEl = $('#lists', root);
    const itemsEl = $('#items', root);
    const title = $('#title', root);

    const renderLists = () => {
      listsEl.innerHTML = '';
      Object.keys(this.lists).forEach(l => {
        const el = document.createElement('div');
        el.className = 'rem-list-item' + (l === this.active ? ' active' : '');
        el.textContent = l;
        el.addEventListener('click', () => { this.active = l; renderLists(); renderItems(); });
        listsEl.appendChild(el);
      });
    };

    const renderItems = () => {
      title.textContent = this.active;
      itemsEl.innerHTML = '';
      this.lists[this.active].forEach((item, i) => {
        const row = document.createElement('label');
        row.className = 'rem-item';
        row.innerHTML = `<input type="checkbox" ${item.done ? 'checked' : ''} data-i="${i}"><span>${item.text}</span>`;
        itemsEl.appendChild(row);
      });
      $$('input', itemsEl).forEach(cb => cb.addEventListener('change', () => {
        this.lists[this.active][cb.dataset.i].done = cb.checked;
        save('reminders', this.lists);
      }));
    };

    $('#new', root).addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const text = e.target.value.trim();
      if (!text) return;
      this.lists[this.active].push({ text, done: false });
      save('reminders', this.lists);
      e.target.value = '';
      renderItems();
      renderLists();
    });

    renderLists();
    renderItems();
    return root;
  }
}

registerApp(new RemindersApp());
