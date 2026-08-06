import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import { Notes } from './Notes';

/** Register Notes with the OS app registry. */
export function registerNotes(register: (app: AppDefinition) => void): void {
  const definition: AppDefinition = {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    category: 'productivity',
    component: Notes as ComponentType<{ windowId: string }>,
    canOpenMultiple: true,
    defaultWidth: 720,
    defaultHeight: 520,
    minWidth: 360,
    minHeight: 280,
    menus: [
      {
        title: 'File',
        items: [
          { label: 'New Note', shortcut: '⌘N' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Redo', shortcut: '⇧⌘Z' },
          { separator: true, label: '' },
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Show Note List', shortcut: '⌘1' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        ],
      },
      {
        title: 'Format',
        items: [
          { label: 'Bold', shortcut: '⌘B' },
          { label: 'Italic', shortcut: '⌘I' },
          { label: 'Underline', shortcut: '⌘U' },
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
        items: [{ label: 'Notes Help' }],
      },
    ],
  };

  register(definition);
}
