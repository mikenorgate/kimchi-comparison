import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Mail from './Mail';

/**
 * Register the Mail app with the OS store.
 */
export function registerMail(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'mail',
    name: 'Mail',
    icon: '✉️',
    category: 'productivity',
    component: Mail as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 880,
    defaultHeight: 560,
    minWidth: 520,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Message', shortcut: '⌘N' },
          { separator: true, label: '' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Show Inbox' },
          { label: 'Show Sent' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Mail Help' }],
      },
    ],
  });
}

export default registerMail;
