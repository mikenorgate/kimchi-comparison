import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

import { Calculator } from './Calculator';

/** Register Calculator with the OS app registry. */
export function registerCalculator(register: (app: AppDefinition) => void): void {
  const definition: AppDefinition = {
    id: 'calculator',
    name: 'Calculator',
    icon: '🧮',
    category: 'utilities',
    component: Calculator as ComponentType<{ windowId: string }>,
    canOpenMultiple: false,
    defaultWidth: 320,
    defaultHeight: 460,
    minWidth: 280,
    minHeight: 400,
    menus: [
      {
        title: 'Calculator',
        items: [
          { label: 'About Calculator' },
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
        ],
      },
      {
        title: 'View',
        items: [
          { label: 'Basic' },
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
        items: [{ label: 'Calculator Help' }],
      },
    ],
  };

  register(definition);
}
