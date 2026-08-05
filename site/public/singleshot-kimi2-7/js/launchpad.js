import { $ } from './utils.js';
import { allApps } from './appRegistry.js';
import { openApp } from './windowManager.js';
import { toggleLaunchpad } from './desktop.js';

export function initLaunchpad() {
  const grid = $('#launchpad-grid');
  const search = $('#launchpad-search');

  const render = (filter = '') => {
    grid.innerHTML = '';
    allApps().filter(a => a.showInLaunchpad !== false && a.name.toLowerCase().includes(filter.toLowerCase())).forEach(app => {
      const el = document.createElement('div');
      el.className = 'launchpad-app';
      el.innerHTML = `<img src="${app.icon || ''}" alt="${app.name}" onerror="this.src=''" /><span>${app.name}</span>`;
      if (!app.icon) {
        const div = document.createElement('div');
        div.style.cssText = 'width:68px;height:68px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:32px;background:linear-gradient(135deg,#e0e0e0,#a0a0a0);color:#333;';
        div.textContent = app.name.slice(0, 1);
        el.replaceChild(div, el.querySelector('img'));
      }
      el.addEventListener('click', () => { openApp(app.id); toggleLaunchpad(); });
      grid.appendChild(el);
    });
  };

  search.addEventListener('input', () => render(search.value));
  render();

  $('#launchpad').addEventListener('click', (e) => {
    if (e.target.id === 'launchpad') toggleLaunchpad();
  });
}
