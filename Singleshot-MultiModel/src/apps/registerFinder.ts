import type { AppDefinition } from '../types/os';

import Finder from './Finder';

/**
 * Register the real Finder app, replacing the stub definition.
 */
export function registerFinder(register: (app: AppDefinition) => void): void {
  register({
    id: 'finder',
    name: 'Finder',
    icon: '📁',
    category: 'system',
    component: Finder,
    canOpenMultiple: false,
    defaultWidth: 820,
    defaultHeight: 540,
    minWidth: 400,
    minHeight: 300,
    menus: [
      {
        title: 'Finder',
        items: [
          { label: 'About Finder' },
          { separator: true, label: '' },
          { label: 'Preferences…', shortcut: '⌘,' },
          { separator: true, label: '' },
          { label: 'Empty Trash…', shortcut: '⇧⌘Delete' },
          { separator: true, label: '' },
          { label: 'Hide Finder', shortcut: '⌘H' },
          { label: 'Quit Finder', shortcut: '⌘Q' },
        ],
      },
      {
        title: 'File',
        items: [
          { label: 'New Finder Window', shortcut: '⌘N' },
          { label: 'New Folder', shortcut: '⇧⌘N' },
          { label: 'New Folder with Selection' },
          { separator: true, label: '' },
          { label: 'Open', shortcut: '⌘O' },
          { label: 'Open With' },
          { separator: true, label: '' },
          { label: 'Move to Trash', shortcut: '⌘Delete' },
          { label: 'Eject' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Redo', shortcut: '⇧⌘Z' },
          { separator: true, label: '' },
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'as Icons', shortcut: '⌘1' },
          { label: 'as List', shortcut: '⌘2' },
          { separator: true, label: '' },
          { label: 'Show Path Bar' },
          { label: 'Show Status Bar' },
          { separator: true, label: '' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        ],
      },
      {
        title: 'Go',
        items: [
          { label: 'Back', shortcut: '⌘[' },
          { label: 'Forward', shortcut: '⌘]' },
          { separator: true, label: '' },
          { label: 'Enclosing Folder', shortcut: '⌘↑' },
          { label: 'Home', shortcut: '⇧⌘H' },
          { label: 'Applications', shortcut: '⇧⌘A' },
          { label: 'Downloads', shortcut: '⌥⌘L' },
        ],
      },
      {
        title: 'Window',
        items: [
          { label: 'Minimize', shortcut: '⌘M' },
          { label: 'Zoom' },
          { separator: true, label: '' },
          { label: 'Bring All to Front' },
        ],
      },
      {
        title: 'Help',
        items: [{ label: 'Finder Help' }],
      },
    ],
  });
}

export default registerFinder;
