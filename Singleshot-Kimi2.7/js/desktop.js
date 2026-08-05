import { $, $$, showContextMenu, closeContextMenu, notify } from './utils.js';
import { openApp } from './windowManager.js';

export function initDesktop() {
  const icons = [
    { app: 'finder', label: 'Macintosh HD' },
    { app: 'settings', label: 'System Settings' }
  ];

  const container = $('#desktop-icons');
  icons.forEach(i => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<div style="font-size:48px">💾</div><span>${i.label}</span>`;
    el.addEventListener('dblclick', () => openApp(i.app));
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      $$('.desktop-icon').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
    });
    container.appendChild(el);
  });

  $('#desktop').addEventListener('click', (e) => {
    if (e.target.id === 'desktop' || e.target.classList.contains('wallpaper')) {
      $$('.desktop-icon').forEach(d => d.classList.remove('selected'));
      closeContextMenu();
    }
  });

  $('#desktop').addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window') || e.target.closest('#dock') || e.target.closest('#menubar')) return;
    e.preventDefault();
    showContextMenu([
      { label: 'New Folder', action: () => notify('Finder', 'New folder created on desktop') },
      { label: 'Get Info', action: () => {} },
      '-',
      { label: 'Change Desktop Background…', action: () => openApp('settings') },
      '-',
      { label: 'Use Stacks', action: () => {} },
      { label: 'Show View Options', action: () => {} }
    ], e.clientX, e.clientY);
  });

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'n') { e.preventDefault(); openApp('finder'); }
      if (e.key === 't') { e.preventDefault(); openApp('terminal'); }
      if (e.key === ',') { e.preventDefault(); openApp('settings'); }
      if (e.key === ' ') { e.preventDefault(); toggleLaunchpad(); }
    }
  });
}

export function toggleLaunchpad() {
  const lp = $('#launchpad');
  lp.style.display = lp.style.display === 'none' ? 'flex' : 'none';
}
