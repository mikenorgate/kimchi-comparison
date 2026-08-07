/**
 * Menu bar data model + per-app menu definitions.
 *
 * Menus are declarative (labels, shortcuts, action ids) so the MenuBarMenus
 * component can render them and resolve `actionId` → handler via an action
 * map wired to the window manager. The Apple menu is always present; the
 * remaining menus reflect the focused app (Finder when the desktop is
 * focused). Step 5 extends this as real apps grow their own menus.
 */

export interface MenuItem {
  /** Stable id, also used as the DOM testid: `menu-item-${id}`. */
  id: string
  label?: string
  shortcut?: string
  disabled?: boolean
  isSeparator?: boolean
  /** Resolved by MenuBarMenus via its action map. */
  actionId?: string
}

export interface Menu {
  /** Stable id; DOM testid `menu-${id}` (apple/app-name/file/...). */
  id: string
  /** Display title. The Apple menu renders a logo instead. */
  title: string
  items: MenuItem[]
}

export interface AppMenuConfig {
  appName: string
  menus: Menu[]
}

/** Apple () system menu — always the leftmost menu. */
export const appleMenu: Menu = {
  id: 'apple',
  title: '',
  items: [
    { id: 'about-mac', label: 'About This Mac' },
    { id: 'sep-a1', isSeparator: true },
    { id: 'system-settings', label: 'System Settings…', actionId: 'system-settings' },
    { id: 'app-store', label: 'App Store…' },
    { id: 'sep-a2', isSeparator: true },
    { id: 'recent-items', label: 'Recent Items', disabled: true },
    { id: 'sep-a3', isSeparator: true },
    { id: 'force-quit', label: 'Force Quit…', shortcut: '⌥⌘⎋' },
    { id: 'sep-a4', isSeparator: true },
    { id: 'sleep', label: 'Sleep' },
    { id: 'restart', label: 'Restart…' },
    { id: 'shut-down', label: 'Shut Down…' },
    { id: 'sep-a5', isSeparator: true },
    { id: 'lock-screen', label: 'Lock Screen', shortcut: '⌃⌘Q' },
    { id: 'log-out', label: 'Log Out User…', shortcut: '⇧⌘Q' },
  ],
}

function appNameMenu(appName: string): Menu {
  return {
    id: 'app-name',
    title: appName,
    items: [
      { id: 'about-app', label: `About ${appName}` },
      { id: 'sep-b1', isSeparator: true },
      { id: 'settings', label: 'Settings…', shortcut: '⌘,', actionId: 'system-settings' },
      { id: 'sep-b2', isSeparator: true },
      { id: 'hide-app', label: `Hide ${appName}`, shortcut: '⌘H', actionId: 'hide-app' },
      { id: 'hide-others', label: 'Hide Others', shortcut: '⌥⌘H' },
      { id: 'show-all', label: 'Show All' },
      { id: 'sep-b3', isSeparator: true },
      { id: 'quit-app', label: `Quit ${appName}`, shortcut: '⌘Q', actionId: 'quit-app' },
    ],
  }
}

const editMenu: Menu = {
  id: 'edit',
  title: 'Edit',
  items: [
    { id: 'undo', label: 'Undo', shortcut: '⌘Z', actionId: 'undo' },
    { id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', actionId: 'redo' },
    { id: 'sep-e1', isSeparator: true },
    { id: 'cut', label: 'Cut', shortcut: '⌘X', actionId: 'cut' },
    { id: 'copy', label: 'Copy', shortcut: '⌘C', actionId: 'copy' },
    { id: 'paste', label: 'Paste', shortcut: '⌘V', actionId: 'paste' },
    { id: 'select-all', label: 'Select All', shortcut: '⌘A', actionId: 'select-all' },
  ],
}

const windowMenu: Menu = {
  id: 'window',
  title: 'Window',
  items: [
    { id: 'minimize', label: 'Minimize', shortcut: '⌘M', actionId: 'minimize' },
    { id: 'zoom', label: 'Zoom', actionId: 'zoom' },
    { id: 'sep-w1', isSeparator: true },
    { id: 'bring-all-front', label: 'Bring All to Front' },
  ],
}

const helpMenu: Menu = {
  id: 'help',
  title: 'Help',
  items: [
    { id: 'mac-help', label: 'macOS Help', shortcut: '⌘?' },
  ],
}

function fileMenu(newLabel: string): Menu {
  return {
    id: 'file',
    title: 'File',
    items: [
      { id: 'new-window', label: newLabel, shortcut: '⌘N', actionId: 'new-window' },
      { id: 'open', label: 'Open…', shortcut: '⌘O', actionId: 'open', disabled: true },
      { id: 'sep-f1', isSeparator: true },
      { id: 'close-window', label: 'Close Window', shortcut: '⌘W', actionId: 'close-window' },
    ],
  }
}

const finderMenus: AppMenuConfig = {
  appName: 'Finder',
  menus: [
    appNameMenu('Finder'),
    fileMenu('New Finder Window'),
    editMenu,
    {
      id: 'view',
      title: 'View',
      items: [
        { id: 'as-icons', label: 'as Icons' },
        { id: 'as-list', label: 'as List' },
        { id: 'as-columns', label: 'as Columns' },
        { id: 'as-gallery', label: 'as Gallery' },
        { id: 'sep-v1', isSeparator: true },
        { id: 'show-sidebar', label: 'Show Sidebar' },
      ],
    },
    {
      id: 'go',
      title: 'Go',
      items: [
        { id: 'back', label: 'Back', shortcut: '⌘[' },
        { id: 'forward', label: 'Forward', shortcut: '⌘]' },
        { id: 'sep-g1', isSeparator: true },
        { id: 'documents', label: 'Documents', shortcut: '⇧⌘O' },
        { id: 'desktop', label: 'Desktop', shortcut: '⇧⌘D' },
      ],
    },
    windowMenu,
    helpMenu,
  ],
}

const calculatorMenus: AppMenuConfig = {
  appName: 'Calculator',
  menus: [
    appNameMenu('Calculator'),
    fileMenu('New Calculator Window'),
    editMenu,
    {
      id: 'view',
      title: 'View',
      items: [
        { id: 'basic', label: 'Basic' },
        { id: 'scientific', label: 'Scientific' },
        { id: 'programmer', label: 'Programmer' },
      ],
    },
    windowMenu,
    helpMenu,
  ],
}

const notesMenus: AppMenuConfig = {
  appName: 'Notes',
  menus: [
    appNameMenu('Notes'),
    fileMenu('New Note'),
    editMenu,
    {
      id: 'format',
      title: 'Format',
      items: [
        { id: 'bold', label: 'Bold', shortcut: '⌘B' },
        { id: 'italic', label: 'Italic', shortcut: '⌘I' },
        { id: 'underline', label: 'Underline', shortcut: '⌘U' },
      ],
    },
    windowMenu,
    helpMenu,
  ],
}

const testAppMenus: AppMenuConfig = {
  appName: 'Test App',
  menus: [appNameMenu('Test App'), fileMenu('New Window'), editMenu, windowMenu, helpMenu],
}

/**
 * Build a standard menu set (app-name + File + Edit + Window + Help) for an
 * app, using `newLabel` for the File > New item. Apps with richer menus
 * (Finder, Calculator, Notes) keep their dedicated configs above.
 */
function standardMenus(appName: string, newLabel: string): AppMenuConfig {
  return {
    appName,
    menus: [appNameMenu(appName), fileMenu(newLabel), editMenu, windowMenu, helpMenu],
  }
}

const appMenuConfigs: Record<string, AppMenuConfig> = {
  finder: finderMenus,
  calculator: calculatorMenus,
  notes: notesMenus,
  terminal: standardMenus('Terminal', 'New Window'),
  settings: standardMenus('System Settings', 'New Window'),
  mail: standardMenus('Mail', 'New Message'),
  messages: standardMenus('Messages', 'New Message'),
  calendar: standardMenus('Calendar', 'New Event'),
  reminders: standardMenus('Reminders', 'New List'),
  safari: standardMenus('Safari', 'New Window'),
  photos: standardMenus('Photos', 'New Album'),
  weather: standardMenus('Weather', 'New Window'),
  test: testAppMenus,
}

/** Resolve the menu config for an app, defaulting to Finder. */
export function getAppMenus(appId: string | undefined): AppMenuConfig {
  if (appId && appMenuConfigs[appId]) return appMenuConfigs[appId]
  return finderMenus
}
