export function initDesktop(apps) {
  const container = document.getElementById('desktop-icons');
  const icons = [
    { id: 'finder', name: 'Macintosh HD', icon: '💿' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'safari', name: 'Safari', icon: '🧭' },
    { id: 'appStore', name: 'App Store', icon: '🛍️' },
    { id: 'photos', name: 'Photos', icon: '🖼️' },
    { id: 'trash', name: 'Bin', icon: '🗑️' }
  ];

  icons.forEach(item => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<div class="icon">${item.icon}</div><div class="label">${item.name}</div>`;
    el.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    });
    el.addEventListener('dblclick', () => {
      if (item.id === 'trash') return;
      if (apps[item.id] && apps[item.id].open) apps[item.id].open();
    });
    container.appendChild(el);
  });

  document.getElementById('desktop').addEventListener('click', () => {
    document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
  });
}
