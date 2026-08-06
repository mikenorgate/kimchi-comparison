import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import { SystemSettings } from './SystemSettings';

/** Register System Settings with the OS app registry. */
export function registerSystemSettings(
  register: (app: AppDefinition) => void,
): void {
  const definition: AppDefinition = {
    id: 'system-settings',
    name: 'System Settings',
    icon: '⚙️',
    category: 'system',
    component: SystemSettings as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 820,
    defaultHeight: 560,
    minWidth: 520,
    minHeight: 360,
    menus: [
      {
        title: 'System Settings',
        items: [
          { label: 'About' },
          { label: 'Software Update…' },
          { separator: true, label: '' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
          { label: 'Customize Toolbar…' },
        ],
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
        items: [{ label: 'System Settings Help' }],
      },
    ],
  };

  register(definition);
}
