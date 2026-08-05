import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class PodcastsApp extends App {
  constructor() {
    super({ id: 'podcasts', name: 'Podcasts', width: 820, height: 560, emoji: '🎙️', iconGradient: ['#8e44ad', '#9b59b6'], iconColor: '#fff' });
    this.podcasts = ['The Daily', 'Serial', 'Radiolab', 'Lex Fridman Podcast', 'Huberman Lab'];
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'podcasts';
    root.innerHTML = `<h2>Listen Now</h2><div class="pod-grid" id="grid"></div>`;
    const grid = $('#grid', root);
    this.podcasts.forEach(p => {
      const el = document.createElement('div');
      el.className = 'pod-card';
      el.innerHTML = `<div class="pod-art">${p[0]}</div><div>${p}</div>`;
      grid.appendChild(el);
    });
    return root;
  }
}

registerApp(new PodcastsApp());
