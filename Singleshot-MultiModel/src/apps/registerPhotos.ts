import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import Photos from './Photos';

/**
 * Register the Photos app with the OS store.
 */
export function registerPhotos(
  register: (app: AppDefinition) => void,
): void {
  register({
    id: 'photos',
    name: 'Photos',
    icon: '🖼️',
    category: 'media',
    component: Photos as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 760,
    defaultHeight: 540,
    minWidth: 480,
    minHeight: 360,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Album', shortcut: '⌘N' },
          { label: 'Import…', shortcut: '⇧⌘I' },
          { separator: true, label: '' },
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
          { label: 'Zoom In', shortcut: '⌘+' },
          { label: 'Zoom Out', shortcut: '⌘-' },
        ],
      },
      {
        title: 'Window',
        items: [{ label: 'Minimize', shortcut: '⌘M' }],
      },
      {
        title: 'Help',
        items: [{ label: 'Photos Help' }],
      },
    ],
  });
}

export default registerPhotos;
