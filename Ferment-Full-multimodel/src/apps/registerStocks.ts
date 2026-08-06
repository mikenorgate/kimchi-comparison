import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Stocks from './Stocks';

/**
 * Register the Stocks app with the OS store.
 */
export function registerStocks(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'stocks',
    name: 'Stocks',
    icon: '📈',
    category: 'productivity',
    component: Stocks as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 720,
    defaultHeight: 520,
    minWidth: 520,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Watchlist', shortcut: '⌘N' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Show Summary' },
          { label: 'Refresh', shortcut: '⌘R' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Stocks Help' }],
      },
    ],
  });
}

export default registerStocks;
