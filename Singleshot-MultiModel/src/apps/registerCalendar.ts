import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Calendar from './Calendar';

/**
 * Register the Calendar app with the OS store.
 *
 * Idempotent — calling more than once overwrites the previous
 * definition in the store.
 */
export function registerCalendar(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'calendar',
    name: 'Calendar',
    icon: '📅',
    category: 'productivity',
    component: Calendar as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 820,
    defaultHeight: 600,
    minWidth: 480,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Event', shortcut: '⌘N' },
          { separator: true, label: '' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Day' },
          { label: 'Week', shortcut: '⌘2' },
          { label: 'Month', shortcut: '⌘3' },
          { label: 'Year', shortcut: '⌘4' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Calendar Help' }],
      },
    ],
  });
}

export default registerCalendar;
