import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class PreviewApp extends App {
  constructor() {
    super({ id: 'preview', name: 'Preview', width: 720, height: 520, emoji: '🔍', iconGradient: ['#fff', '#e6e6e6'], iconColor: '#333' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'preview';
    root.innerHTML = `
      <div class="prev-toolbar">
        <button id="zoom-out">−</button><span id="zoom">100%</span><button id="zoom-in">+</button>
      </div>
      <div class="prev-canvas" id="canvas">🖼️ Drop an image here</div>
    `;
    let zoom = 100;
    const zEl = $('#zoom', root);
    $('#zoom-in', root).addEventListener('click', () => { zoom = Math.min(200, zoom + 25); zEl.textContent = zoom + '%'; });
    $('#zoom-out', root).addEventListener('click', () => { zoom = Math.max(25, zoom - 25); zEl.textContent = zoom + '%'; });
    return root;
  }
}

registerApp(new PreviewApp());
