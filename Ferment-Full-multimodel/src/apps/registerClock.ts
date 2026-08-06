import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Clock from './Clock';

/**
 * Register the Clock app with the OS store.
 */
export function registerClock(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'clock',
    name: 'Clock',
    icon: '⏰',
    category: 'utilities',
    component: Clock as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 520,
    defaultHeight: 480,
    minWidth: 420,
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
          { label: 'World Clock' },
          { label: 'Alarm' },
          { label: 'Stopwatch' },
          { label: 'Timer' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Clock Help' }],
      },
    ],
  });
}

export default registerClock;
