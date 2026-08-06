import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import { Terminal } from './Terminal';

/** Register the Terminal app with the OS app registry. */
export function registerTerminal(register: (app: AppDefinition) => void): void {
  const definition: AppDefinition = {
    id: 'terminal',
    name: 'Terminal',
    icon: '⌨️',
    category: 'utilities',
    component: Terminal as ComponentType<{ windowId: string }>,
    canOpenMultiple: true,
    defaultWidth: 720,
    defaultHeight: 460,
    minWidth: 360,
    minHeight: 240,
    menus: [
      {
        title: 'Shell',
        items: [
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'New Tab', shortcut: '⌘T' },
          { separator: true, label: '' },
          { label: 'Clear', shortcut: '⌘K' },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Larger Text', shortcut: '⌘+' },
          { label: 'Smaller Text', shortcut: '⌘-' },
          { separator: true, label: '' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
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
        items: [{ label: 'Terminal Help' }],
      },
    ],
  };

  register(definition);
}
