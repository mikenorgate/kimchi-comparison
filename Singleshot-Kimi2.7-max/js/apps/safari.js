import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;

export function openSafari() {
  openCount++;
  openWindow('safari', 'Safari', `
    <div class="safari">
      <div class="safari-toolbar">
        <button class="safari-btn">◀</button>
        <button class="safari-btn">▶</button>
        <input type="text" class="safari-address" value="apple.com" />
        <button class="safari-btn">↻</button>
      </div>
      <div class="safari-content">
        <h1>🍎</h1>
        <h2>Welcome to Safari</h2>
        <p>This is a mock browser. Enter any URL above to "browse".</p>
      </div>
    </div>
  `, {
    width: 820, height: 540,
    onMount: (el) => {
      markAppRunning('safari', true);
      const address = el.querySelector('.safari-address');
      const content = el.querySelector('.safari-content');
      address.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const url = address.value.trim();
          content.innerHTML = `
            <h1>🌐</h1>
            <h2>${escapeHtml(url)}</h2>
            <p>This is a simulated page. External browsing is not available in this demo.</p>
          `;
        }
      });
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="safari"]')) markAppRunning('safari', false);
      });
    }
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
