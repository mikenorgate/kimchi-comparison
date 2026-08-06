import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;
const emojis = ['🏔️', '🌊', '🌅', '🌲', '🐶', '🐱', '🌸', '🍕', '🚗', '🎸', '🎨', '📷'];

export function openPhotos() {
  openCount++;
  openWindow('photos', 'Photos', `
    <div class="photos">
      <div class="photos-toolbar">
        <button class="safari-btn">◀</button>
        <span>Library</span>
        <button class="safari-btn">+</button>
      </div>
      <div class="photos-grid">
        ${emojis.map(e => `<div class="photo-thumb">${e}</div>`).join('')}
      </div>
    </div>
  `, {
    width: 680, height: 480,
    onMount: (el) => {
      markAppRunning('photos', true);
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="photos"]')) markAppRunning('photos', false);
      });
    }
  });
}
