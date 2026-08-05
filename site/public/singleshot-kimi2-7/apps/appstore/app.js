import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class AppStoreApp extends App {
  constructor() {
    super({ id: 'appstore', name: 'App Store', width: 900, height: 600, emoji: '🅰️', iconGradient: ['#007aff', '#5856d6'], iconColor: '#fff' });
    this.apps = [
      { name: 'Procreate', category: 'Graphics & Design', price: '$12.99' },
      { name: 'Logic Pro', category: 'Music', price: '$199.99' },
      { name: 'Final Cut Pro', category: 'Video', price: '$299.99' },
      { name: 'Pixelmator Pro', category: 'Photo & Video', price: '$49.99' },
      { name: 'Things 3', category: 'Productivity', price: '$49.99' },
      { name: '1Password', category: 'Utilities', price: 'Free' }
    ];
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'appstore';
    root.innerHTML = `<h2>Discover</h2><div class="as-grid" id="grid"></div>`;
    const grid = $('#grid', root);
    this.apps.forEach(a => {
      const el = document.createElement('div');
      el.className = 'as-card';
      el.innerHTML = `<div class="as-icon">${a.name[0]}</div><div><strong>${a.name}</strong><div>${a.category}</div></div><span>${a.price}</span>`;
      grid.appendChild(el);
    });
    return root;
  }
}

registerApp(new AppStoreApp());
