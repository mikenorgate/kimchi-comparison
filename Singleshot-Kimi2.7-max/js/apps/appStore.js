import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;
const apps = [
  { name: 'Xcode', category: 'Developer Tools', icon: '🔨' },
  { name: 'Pages', category: 'Productivity', icon: '📄' },
  { name: 'Numbers', category: 'Productivity', icon: '📊' },
  { name: 'Keynote', category: 'Productivity', icon: '🎬' },
  { name: 'GarageBand', category: 'Music', icon: '🎸' },
  { name: 'iMovie', category: 'Video', icon: '🎥' },
  { name: 'Final Cut Pro', category: 'Video', icon: '🎞️' },
  { name: 'Logic Pro', category: 'Music', icon: '🎹' }
];

export function openAppStore() {
  openCount++;
  openWindow('appStore', 'App Store', `
    <div class="appstore">
      <h2>Discover</h2>
      <div class="appstore-grid">
        ${apps.map(app => `
          <div class="appstore-app">
            <div class="icon">${app.icon}</div>
            <h4>${app.name}</h4>
            <p>${app.category}</p>
            <button>Get</button>
          </div>
        `).join('')}
      </div>
    </div>
  `, {
    width: 760, height: 520,
    onMount: (el) => {
      markAppRunning('appStore', true);
      el.querySelectorAll('.appstore-app button').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.textContent = btn.textContent === 'Get' ? 'Open' : 'Get';
        });
      });
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="appStore"]')) markAppRunning('appStore', false);
      });
    }
  });
}
