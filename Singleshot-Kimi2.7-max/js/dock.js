export function initDock(apps) {
  const dockApps = document.getElementById('dock-apps');
  const dockTrash = document.getElementById('dock-trash');

  const items = [
    { id: 'finder', name: 'Finder', icon: '💿' },
    { id: 'safari', name: 'Safari', icon: '🧭' },
    { id: 'appStore', name: 'App Store', icon: '🛍️' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'photos', name: 'Photos', icon: '🖼️' },
    { id: 'settings', name: 'System Settings', icon: '⚙️' }
  ];

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'dock-item';
    el.dataset.app = item.id;
    el.innerHTML = `${item.icon}<div class="tooltip">${item.name}</div>`;
    el.addEventListener('click', () => {
      el.classList.add('dock-bounce');
      setTimeout(() => el.classList.remove('dock-bounce'), 400);
      if (apps[item.id] && apps[item.id].open) {
        apps[item.id].open();
      }
    });
    dockApps.appendChild(el);
  });

  dockTrash.className = 'dock-item';
  dockTrash.innerHTML = '🗑️<div class="tooltip">Bin</div>';

  updateDockState(apps);
}

export function markAppRunning(appId, running) {
  const el = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (el) el.classList.toggle('running', running);
}

export function updateDockState() {
  // Called periodically or after window changes
}
