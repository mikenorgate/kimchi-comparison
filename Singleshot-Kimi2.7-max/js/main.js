import { initMenuBar } from './menuBar.js';
import { initDock } from './dock.js';
import { initDesktop } from './desktop.js';
import { openFinder } from './apps/finder.js';
import { openCalculator } from './apps/calculator.js';
import { openNotes } from './apps/notes.js';
import { openSafari } from './apps/safari.js';
import { openTerminal } from './apps/terminal.js';
import { openCalendar } from './apps/calendar.js';
import { openPhotos } from './apps/photos.js';
import { openAppStore } from './apps/appStore.js';
import { openSettings } from './apps/settings.js';

const apps = {
  finder: { open: () => openFinder(apps) },
  calculator: { open: openCalculator },
  notes: { open: openNotes },
  safari: { open: openSafari },
  terminal: { open: openTerminal },
  calendar: { open: openCalendar },
  photos: { open: openPhotos },
  appStore: { open: openAppStore },
  settings: { open: openSettings }
};

initMenuBar(apps);
initDock(apps);
initDesktop(apps);

// Open Finder on launch
apps.finder.open();

// Global keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey) {
    if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      apps.finder.open();
    }
    if (e.key.toLowerCase() === 'w') {
      e.preventDefault();
      const active = document.querySelector('.window.active');
      if (active) {
        const closeBtn = active.querySelector('.btn.close');
        if (closeBtn) closeBtn.click();
      }
    }
  }
});
