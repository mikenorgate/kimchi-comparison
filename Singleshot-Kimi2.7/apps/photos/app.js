import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class PhotosApp extends App {
  constructor() {
    super({ id: 'photos', name: 'Photos', width: 900, height: 600, emoji: '🖼️', iconGradient: ['#fff', '#e0e0e0'], iconColor: '#333' });
    this.photos = [
      { id: 1, src: 'https://picsum.photos/seed/macos1/400/300', title: 'Photo 1' },
      { id: 2, src: 'https://picsum.photos/seed/macos2/400/300', title: 'Photo 2' },
      { id: 3, src: 'https://picsum.photos/seed/macos3/400/300', title: 'Photo 3' },
      { id: 4, src: 'https://picsum.photos/seed/macos4/400/300', title: 'Photo 4' },
      { id: 5, src: 'https://picsum.photos/seed/macos5/400/300', title: 'Photo 5' },
      { id: 6, src: 'https://picsum.photos/seed/macos6/400/300', title: 'Photo 6' }
    ];
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'photos';
    root.innerHTML = `
      <aside class="photos-sidebar">
        <div class="photos-item active">Library</div>
        <div class="photos-item">Favorites</div>
        <div class="photos-item">Recently Added</div>
      </aside>
      <main class="photos-grid" id="grid"></main>
    `;

    const grid = $('#grid', root);
    const renderGrid = () => {
      grid.innerHTML = '';
      this.photos.forEach(p => {
        const el = document.createElement('div');
        el.className = 'photo-thumb';
        el.innerHTML = `<img src="${p.src}" loading="lazy" /><div>${p.title}</div>`;
        el.addEventListener('click', () => {
          grid.innerHTML = `<div class="photo-view"><img src="${p.src}" /><h3>${p.title}</h3><button id="back">Back</button></div>`;
          $('#back', grid).addEventListener('click', renderGrid);
        });
        grid.appendChild(el);
      });
    };
    renderGrid();

    return root;
  }
}

registerApp(new PhotosApp());
