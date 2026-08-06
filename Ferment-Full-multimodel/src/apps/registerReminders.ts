import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Reminders from './Reminders';

/**
 * Register the Reminders app with the OS store.
 */
export function registerReminders(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'reminders',
    name: 'Reminders',
    icon: '✅',
    category: 'productivity',
    component: Reminders as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 720,
    defaultHeight: 520,
    minWidth: 480,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New List', shortcut: '⌘N' },
          { label: 'New Reminder', shortcut: '⌘R' },
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
          { label: 'Show Today' },
          { label: 'Show Scheduled' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Reminders Help' }],
      },
    ],
  });
}

export default registerReminders;
