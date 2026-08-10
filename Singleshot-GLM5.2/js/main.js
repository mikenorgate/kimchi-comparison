/* ============================================
   macOS Tahoe - Main Entry Point
   ============================================ */

// Initialize the system when the page loads
window.addEventListener('DOMContentLoaded', () => {
  Tahoe.init();
});

// Prevent default context menu on the desktop
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Spotlight input handler
document.addEventListener('DOMContentLoaded', () => {
  const spInput = document.getElementById('spotlight-input');
  if (spInput) {
    spInput.addEventListener('input', (e) => {
      Tahoe.renderSpotlightResults(e.target.value);
    });

    spInput.addEventListener('keydown', (e) => {
      const results = document.querySelectorAll('.spotlight-result-item');
      const selected = document.querySelector('.spotlight-result-item.selected');
      let idx = selected ? parseInt(selected.dataset.idx) : 0;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = Math.min(results.length - 1, idx + 1);
        results.forEach(r => r.classList.remove('selected'));
        if (results[idx]) results[idx].classList.add('selected');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = Math.max(0, idx - 1);
        results.forEach(r => r.classList.remove('selected'));
        if (results[idx]) results[idx].classList.add('selected');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selected) selected.click();
      } else if (e.key === 'Escape') {
        Tahoe.closeSpotlight();
      }
    });
  }

  // Spotlight overlay click to close
  const spOverlay = document.getElementById('spotlight');
  if (spOverlay) {
    spOverlay.addEventListener('click', (e) => {
      if (e.target === spOverlay) Tahoe.closeSpotlight();
    });
  }

  // Control center click outside to close
  document.addEventListener('mousedown', (e) => {
    if (Tahoe.state.controlCenterOpen) {
      const cc = document.getElementById('control-center');
      const ccTrigger = document.querySelector('.menu-bar-control-center');
      if (cc && !cc.contains(e.target) && ccTrigger && !ccTrigger.contains(e.target)) {
        cc.style.display = 'none';
        Tahoe.state.controlCenterOpen = false;
      }
    }
    if (Tahoe.state.notificationsOpen) {
      const nc = document.getElementById('notification-center');
      const ncTrigger = document.getElementById('menu-bar-clock');
      if (nc && !nc.contains(e.target) && ncTrigger && !ncTrigger.contains(e.target)) {
        nc.style.display = 'none';
        Tahoe.state.notificationsOpen = false;
      }
    }
  });
});

// Desktop icons
document.addEventListener('DOMContentLoaded', () => {
  const iconsEl = document.getElementById('desktop-icons');
  if (iconsEl) {
    const desktopItems = [
      { name: 'Macintosh HD', icon: Icons.folder, action: () => Tahoe.launchApp('finder') },
      { name: 'Documents', icon: Icons.folder, action: () => { Finder.goTo('Documents'); Tahoe.launchApp('finder'); } },
      { name: 'Screenshots', icon: Icons.folder, action: () => { Finder.goTo('Pictures'); Tahoe.launchApp('finder'); } },
    ];

    iconsEl.innerHTML = desktopItems.map(item => `
      <div class="desktop-icon" data-name="${item.name}">
        <div class="icon-img">${item.icon}</div>
        <div class="icon-label">${item.name}</div>
      </div>
    `).join('');

    iconsEl.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('dblclick', () => {
        const name = icon.dataset.name;
        const item = desktopItems.find(i => i.name === name);
        if (item) item.action();
      });

      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        iconsEl.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
      });

      icon.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const name = icon.dataset.name;
        Tahoe.showContextMenu(e.clientX, e.clientY, [
          { label: 'Open', action: () => {
            const item = desktopItems.find(i => i.name === name);
            if (item) item.action();
          }},
          { label: 'Get Info', action: () => Tahoe.showNotification(name, 'Type: Folder\nSize: --\nCreated: Aug 2026') },
          { separator: true },
          { label: 'Rename', action: () => Tahoe.showNotification('Finder', 'Rename not available in demo') },
          { label: 'Move to Trash', action: () => Tahoe.showNotification('Finder', 'Cannot delete system files') },
        ]);
      });
    });
  }
});

// Right-click on desktop for context menu
document.addEventListener('DOMContentLoaded', () => {
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.addEventListener('contextmenu', (e) => {
      if (e.target.id === 'desktop' || e.target.classList.contains('wallpaper') || e.target.classList.contains('desktop-icons')) {
        e.preventDefault();
        Tahoe.showContextMenu(e.clientX, e.clientY, [
          { label: 'New Folder', action: () => Tahoe.showNotification('Finder', 'Create new folder on Desktop') },
          { separator: true },
          { label: 'Get Info', action: () => Tahoe.showNotification('Desktop', 'Items: 3\nAvailable: 248 GB') },
          { label: 'Change Desktop Background...', action: () => { Tahoe.launchApp('settings'); Settings.activeSection = 'wallpaper'; } },
          { separator: true },
          { label: 'Use Stacks', action: () => {} },
          { label: 'Sort By', submenu: true },
          { label: 'Clean Up', action: () => {} },
          { separator: true },
          { label: 'Show View Options', action: () => {} },
        ]);
      }
    });
  }
});
