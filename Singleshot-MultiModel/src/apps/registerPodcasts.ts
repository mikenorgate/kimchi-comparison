import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Podcasts from './Podcasts';

/**
 * Register the Podcasts app with the OS store.
 */
export function registerPodcasts(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'podcasts',
    name: 'Podcasts',
    icon: '🎙️',
    category: 'media',
    component: Podcasts as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 780,
    defaultHeight: 540,
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
        title: 'Controls',
        items: [
          { label: 'Play / Pause', shortcut: 'Space' },
          { label: 'Next Episode' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Show Library' },
          { label: 'Refresh', shortcut: '⌘R' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Podcasts Help' }],
      },
    ],
  });
}

export default registerPodcasts;
