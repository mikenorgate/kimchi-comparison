import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class TVApp extends App {
  constructor() {
    super({ id: 'tv', name: 'TV', width: 900, height: 560, emoji: '📺', iconGradient: ['#000', '#333'], iconColor: '#fff' });
    this.shows = ['Silo', 'Severance', 'Ted Lasso', 'For All Mankind', 'The Morning Show'];
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'tv';
    root.innerHTML = `<h2>Watch Now</h2><div class="tv-grid" id="grid"></div>`;
    const grid = $('#grid', root);
    this.shows.forEach(s => {
      const el = document.createElement('div');
      el.className = 'tv-card';
      el.innerHTML = `<div class="tv-poster">${s[0]}</div><div>${s}</div>`;
      grid.appendChild(el);
    });
    return root;
  }
}

registerApp(new TVApp());
