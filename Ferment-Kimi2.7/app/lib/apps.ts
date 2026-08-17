import type { AppDefinition, AppId } from './types';

const SHARED_MENUS = ['File', 'Edit', 'View', 'Window', 'Help'];

export const APPS: Record<AppId, AppDefinition> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    defaultTitle: 'Finder',
    defaultSize: { width: 840, height: 520 },
    menus: ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'],
  },
  safari: {
    id: 'safari',
    name: 'Safari',
    defaultTitle: 'Safari',
    defaultSize: { width: 980, height: 640 },
    menus: ['Safari', 'File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'],
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    defaultTitle: 'Notes',
    defaultSize: { width: 720, height: 540 },
    menus: ['Notes', 'File', 'Edit', 'View', 'Window', 'Help'],
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    defaultTitle: 'Terminal — mike@MacBook-Pro',
    defaultSize: { width: 700, height: 440 },
    menus: ['Terminal', 'Shell', 'Edit', 'View', 'Window', 'Help'],
  },
  settings: {
    id: 'settings',
    name: 'System Settings',
    defaultTitle: 'System Settings',
    defaultSize: { width: 720, height: 560 },
    menus: ['System Settings', 'View', 'Window', 'Help'],
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    defaultTitle: 'Calculator',
    defaultSize: { width: 280, height: 400 },
    menus: ['Calculator', 'View', 'Window', 'Help'],
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    defaultTitle: 'Calendar',
    defaultSize: { width: 860, height: 600 },
    menus: ['Calendar', 'File', 'Edit', 'View', 'Window', 'Help'],
  },
  clock: {
    id: 'clock',
    name: 'Clock',
    defaultTitle: 'Clock',
    defaultSize: { width: 520, height: 340 },
    menus: ['Clock', 'File', 'Edit', 'View', 'Window', 'Help'],
  },
  photos: {
    id: 'photos',
    name: 'Photos',
    defaultTitle: 'Photos',
    defaultSize: { width: 900, height: 620 },
    menus: ['Photos', 'File', 'Edit', 'View', 'Window', 'Help'],
  },
  music: {
    id: 'music',
    name: 'Music',
    defaultTitle: 'Music',
    defaultSize: { width: 900, height: 620 },
    menus: ['Music', 'File', 'Edit', 'View', 'Controls', 'Window', 'Help'],
  },
};

export const APP_IDS: AppId[] = Object.keys(APPS) as AppId[];
export const DEFAULT_APP: AppId = 'finder';
