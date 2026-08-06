import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Maps from './Maps';

/**
 * Register the Maps app with the OS store.
 */
export function registerMaps(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'maps',
    name: 'Maps',
    icon: '🗺️',
    category: 'utilities',
    component: Maps as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 720,
    defaultHeight: 520,
    minWidth: 480,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [{ label: 'Find…', shortcut: '⌘F' }],
      },
      {
        title: 'View',
        items: [
          { label: 'Zoom In', shortcut: '⌘+' },
          { label: 'Zoom Out', shortcut: '⌘-' },
          { label: 'Reset View', shortcut: '⌘0' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Maps Help' }],
      },
    ],
  });
}

export default registerMaps;
