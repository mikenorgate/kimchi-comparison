import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Music from './Music';

/**
 * Register the Music app with the OS store.
 */
export function registerMusic(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'music',
    name: 'Music',
    icon: '🎵',
    category: 'media',
    component: Music as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 720,
    defaultHeight: 540,
    minWidth: 480,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Playlist', shortcut: '⌘N' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'Controls',
        items: [
          { label: 'Play / Pause', shortcut: 'Space' },
          { label: 'Next Track' },
          { label: 'Previous Track' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Music Help' }],
      },
    ],
  });
}

export default registerMusic;
