import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import { Safari } from './Safari';

/**
 * Register Safari with the OS app registry.
 *
 * The Safari app can open multiple instances (each is its own tab set).
 * Menu bar entries expose common browser actions as a hint for menu
 * integration in future chunks; the menus are no-ops for now.
 */
export function registerSafari(register: (app: AppDefinition) => void): void {
  const definition: AppDefinition = {
    id: 'safari',
    name: 'Safari',
    icon: '🧭',
    category: 'productivity',
    component: Safari as ComponentType<{ windowId: string }>,
    canOpenMultiple: true,
    defaultWidth: 960,
    defaultHeight: 620,
    minWidth: 480,
    minHeight: 320,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'New Tab', shortcut: '⌘T' },
          { separator: true, label: '' },
          { label: 'Open Location…', shortcut: '⌘L' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Find…', shortcut: '⌘F' },
          { separator: true, label: '' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Reload Page', shortcut: '⌘R' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        ],
      },
      {
        title: 'History',
        items: [
          { label: 'Show All History' },
          { label: 'Clear History' },
        ],
      },
      {
        title: 'Bookmarks',
        items: [{ label: 'Show Bookmarks' }, { label: 'Add Bookmark…', shortcut: '⌘D' }],
      },
      {
        title: 'Window',
        items: [
          { label: 'Minimize', shortcut: '⌘M' },
          { label: 'Zoom' },
        ],
      },
      {
        title: 'Help',
        items: [{ label: 'Safari Help' }],
      },
    ],
  };

  register(definition);
}
