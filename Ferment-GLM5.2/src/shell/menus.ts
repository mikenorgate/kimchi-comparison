/**
 * Menu bar definitions for the macOS Tahoe desktop shell.
 *
 * Menu items that would require real services (App Store, iCloud, etc.)
 * are marked `disabled: true`. Items with `action` strings are handled
 * by the MenuBar component's action handler.
 */

export interface MenuItemDef {
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  action?: string;
}

export interface MenuDef {
  id: string;
  label: string;
  items: MenuItemDef[];
}

// ── Apple Menu ──────────────────────────────────────────────────

export const appleMenuItems: MenuItemDef[] = [
  { label: 'About This Mac', action: 'about' },
  { separator: true },
  { label: 'System Settings…', action: 'settings', disabled: true },
  { label: 'App Store…', disabled: true },
  { separator: true },
  { label: 'Recent Items', disabled: true },
  { separator: true },
  { label: 'Force Quit…', shortcut: '⌥⌘⎋', disabled: true },
  { separator: true },
  { label: 'Sleep', action: 'sleep' },
  { label: 'Restart…', action: 'restart' },
  { label: 'Shut Down…', action: 'shutdown' },
  { separator: true },
  { label: 'Lock Screen', shortcut: '⌃⌘Q', action: 'lock' },
  { label: 'Log Out…', shortcut: '⇧⌘Q', action: 'logout' },
];

// ── App Menus ───────────────────────────────────────────────────

export const appMenus: MenuDef[] = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New Finder Window', shortcut: '⌘N', action: 'new-window' },
      { label: 'New Folder', shortcut: '⇧⌘N', action: 'new-folder' },
      { separator: true },
      { label: 'Open', shortcut: '⌘O', action: 'open' },
      { label: 'Open With', disabled: true },
      { separator: true },
      { label: 'Close Window', shortcut: '⌘W', action: 'close-window' },
      { separator: true },
      { label: 'Save', shortcut: '⌘S', disabled: true },
      { label: 'Save As…', shortcut: '⇧⌘S', disabled: true },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z', action: 'undo' },
      { label: 'Redo', shortcut: '⇧⌘Z', action: 'redo' },
      { separator: true },
      { label: 'Cut', shortcut: '⌘X', action: 'cut' },
      { label: 'Copy', shortcut: '⌘C', action: 'copy' },
      { label: 'Paste', shortcut: '⌘V', action: 'paste' },
      { separator: true },
      { label: 'Select All', shortcut: '⌘A', action: 'select-all' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'as Icons', shortcut: '⌘1', action: 'view-icons' },
      { label: 'as List', shortcut: '⌘2', action: 'view-list' },
      { label: 'as Columns', shortcut: '⌘3', action: 'view-columns' },
      { separator: true },
      { label: 'Use Dark Appearance', action: 'toggle-dark' },
      { label: 'Use Tinted Appearance', action: 'toggle-tinted' },
      { separator: true },
      { label: 'Show Toolbar', action: 'show-toolbar' },
      { label: 'Show Sidebar', action: 'show-sidebar' },
    ],
  },
  {
    id: 'window',
    label: 'Window',
    items: [
      { label: 'Minimize', shortcut: '⌘M', action: 'minimize' },
      { label: 'Zoom', disabled: true },
      { separator: true },
      { label: 'Bring All to Front', action: 'bring-front' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Search', disabled: true },
      { separator: true },
      { label: 'macOS Help', shortcut: '⌘?', disabled: true },
    ],
  },
];
