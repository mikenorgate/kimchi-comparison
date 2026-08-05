import { $ } from './utils.js';
import { initDock } from './dock.js';
import { initMenubar, updateAppMenus } from './menubar.js';
import { initDesktop } from './desktop.js';
import { initLaunchpad } from './launchpad.js';
import { openApp, state } from './windowManager.js';

// Load all app modules to register them
const appModules = [
  '../apps/finder/app.js',
  '../apps/safari/app.js',
  '../apps/terminal/app.js',
  '../apps/calculator/app.js',
  '../apps/notes/app.js',
  '../apps/settings/app.js',
  '../apps/photos/app.js',
  '../apps/calendar/app.js',
  '../apps/music/app.js',
  '../apps/messages/app.js',
  '../apps/mail/app.js',
  '../apps/clock/app.js',
  '../apps/weather/app.js',
  '../apps/maps/app.js',
  '../apps/appstore/app.js',
  '../apps/tv/app.js',
  '../apps/podcasts/app.js',
  '../apps/reminders/app.js',
  '../apps/facetime/app.js',
  '../apps/textedit/app.js',
  '../apps/preview/app.js',
  '../apps/activity/app.js',
  '../apps/contacts/app.js'
];

async function boot() {
  await Promise.all(appModules.map(m => import(m)));

  setTimeout(() => {
    $('#boot-screen').style.display = 'none';
    $('#desktop').style.display = 'block';

    initMenubar();
    updateAppMenus();
    initDock();
    initDesktop();
    initLaunchpad();

    // Update menus when active window changes
    let lastActive = null;
    setInterval(() => {
      if (state.activeWindowId !== lastActive) {
        lastActive = state.activeWindowId;
        updateAppMenus();
      }
    }, 100);

    openApp('finder');
  }, 2400);
}

boot();
