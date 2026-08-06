import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;
const settings = {
  'Wi-Fi': [
    { label: 'Wi-Fi', type: 'toggle', on: true },
    { label: 'Home Network', type: 'info', value: 'Connected' }
  ],
  'Bluetooth': [
    { label: 'Bluetooth', type: 'toggle', on: false }
  ],
  'Appearance': [
    { label: 'Dark mode', type: 'toggle', on: false },
    { label: 'Automatic', type: 'toggle', on: true }
  ],
  'Sound': [
    { label: 'Output volume', type: 'slider' },
    { label: 'Mute', type: 'toggle', on: false }
  ]
};

export function openSettings() {
  openCount++;
  openWindow('settings', 'System Settings', renderSettings('Wi-Fi'), {
    width: 620, height: 440,
    onMount: (el) => {
      markAppRunning('settings', true);
      initSettings(el);
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="settings"]')) markAppRunning('settings', false);
      });
    }
  });
}

function renderSettings(activeKey) {
  return `
    <div class="settings">
      <div class="settings-sidebar">
        ${Object.keys(settings).map(k => `
          <div class="settings-item ${k === activeKey ? 'active' : ''}" data-key="${k}">${k}</div>
        `).join('')}
      </div>
      <div class="settings-panel">
        <h3>${activeKey}</h3>
        ${settings[activeKey].map(item => renderSettingRow(item)).join('')}
      </div>
    </div>
  `;
}

function renderSettingRow(item) {
  if (item.type === 'toggle') {
    return `
      <div class="setting-row">
        <label>${item.label}</label>
        <div class="toggle ${item.on ? 'on' : ''}"></div>
      </div>
    `;
  }
  if (item.type === 'info') {
    return `<div class="setting-row"><label>${item.label}</label><span>${item.value}</span></div>`;
  }
  if (item.type === 'slider') {
    return `<div class="setting-row"><label>${item.label}</label><input type="range" min="0" max="100" value="75"></div>`;
  }
  return '';
}

function initSettings(el) {
  const content = el.querySelector('.window-content');
  content.querySelectorAll('.settings-item').forEach(item => {
    item.addEventListener('click', () => {
      content.innerHTML = renderSettings(item.dataset.key);
      initSettings(el);
    });
  });
  content.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });
}
