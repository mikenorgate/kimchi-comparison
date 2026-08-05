/* ============ macOS Tahoe web — boot ============ */
'use strict';

loadSettings();
buildDock();
buildDesktopIcons();
initGlobalEvents();
setMenusForApp(OS.apps.finder);

// open a few windows when loaded with ?demo (used for screenshots/testing)
if (location.search.includes('demo')) {
  launchApp('finder');
  launchApp('calculator');
  launchApp('terminal');
}

// welcome
setTimeout(() => {
  notify('Welcome to macOS Tahoe', 'Try Spotlight (⌘/Ctrl+Space), open apps from the Dock, and explore the  menu.', 'ic-finder', '🏔️');
}, 900);
