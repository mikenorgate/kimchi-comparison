import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Weather from './Weather';

/**
 * Register the Weather app with the OS store.
 */
export function registerWeather(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'weather',
    name: 'Weather',
    icon: '⛅',
    category: 'utilities',
    component: Weather as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 560,
    defaultHeight: 560,
    minWidth: 420,
    minHeight: 480,
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
          { label: 'Show Forecast' },
          { label: 'Refresh', shortcut: '⌘R' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Weather Help' }],
      },
    ],
  });
}

export default registerWeather;
