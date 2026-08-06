import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import TV from './TV';

/**
 * Register the TV app with the OS store.
 */
export function registerTV(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'tv',
    name: 'TV',
    icon: '📺',
    category: 'media',
    component: TV as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 780,
    defaultHeight: 560,
    minWidth: 520,
    minHeight: 380,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Library' },
          { label: 'Store' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'TV Help' }],
      },
    ],
  });
}

export default registerTV;
