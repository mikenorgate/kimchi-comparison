import { create } from 'zustand';
import {
  Calculator,
  FileText,
  Folder,
  Globe,
  Settings as SettingsIcon,
  TerminalSquare,
} from 'lucide-react';
import type { AppDefinition, MenuItem } from '../types';
import Finder from '../apps/Finder';
import CalculatorApp from '../apps/Calculator';
import NotesApp from '../apps/Notes';
import TerminalApp from '../apps/Terminal';
import SafariApp from '../apps/Safari';
import SettingsApp from '../apps/Settings';

/**
 * Menu items contributed by the Finder. The actions are no-ops in the static
 * menu bar context because the Finder's interactive chrome already exposes
 * the same functionality (toolbar buttons, context menu, sidebar). The Go
 * back/forward items are wired to whatever last navigation actually happened
 * — they remain disabled when there is no history to move through.
 */
const FINDER_MENUS: MenuItem[] = [
  {
    id: 'file',
    label: 'File',
    submenu: [
      { id: 'new-folder', label: 'New Folder', shortcut: 'Cmd+Shift+N' },
      { id: 'new-file', label: 'New File', shortcut: 'Cmd+N' },
      { id: 'sep-file-1', separator: true },
      { id: 'close', label: 'Close Window', shortcut: 'Cmd+W' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    submenu: [
      { id: 'rename', label: 'Rename', shortcut: 'Enter' },
      { id: 'delete', label: 'Delete', shortcut: 'Cmd+Backspace' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    submenu: [
      { id: 'view-icons', label: 'as Icons', shortcut: 'Cmd+1' },
      { id: 'view-list', label: 'as List', shortcut: 'Cmd+2' },
    ],
  },
  {
    id: 'go',
    label: 'Go',
    submenu: [
      { id: 'back', label: 'Back', shortcut: 'Cmd+[' },
      { id: 'forward', label: 'Forward', shortcut: 'Cmd+]' },
    ],
  },
];

const SAFARI_MENUS: MenuItem[] = [
  {
    id: 'file',
    label: 'File',
    submenu: [
      { id: 'new-window', label: 'New Window', shortcut: 'Cmd+N' },
      { id: 'new-tab', label: 'New Tab', shortcut: 'Cmd+T', disabled: true },
      { id: 'sep-file-1', separator: true },
      { id: 'close', label: 'Close Window', shortcut: 'Cmd+W' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    submenu: [
      { id: 'copy', label: 'Copy', shortcut: 'Cmd+C' },
      { id: 'paste', label: 'Paste', shortcut: 'Cmd+V' },
      { id: 'select-all', label: 'Select All', shortcut: 'Cmd+A' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    submenu: [
      { id: 'reload', label: 'Reload Page', shortcut: 'Cmd+R' },
      { id: 'home', label: 'Home', shortcut: 'Cmd+Shift+H' },
    ],
  },
  {
    id: 'history',
    label: 'History',
    submenu: [
      { id: 'back', label: 'Back', shortcut: 'Cmd+[' },
      { id: 'forward', label: 'Forward', shortcut: 'Cmd+]' },
    ],
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    submenu: [
      { id: 'add-bookmark', label: 'Add Bookmark…', shortcut: 'Cmd+D', disabled: true },
      { id: 'show-bookmarks', label: 'Show Bookmarks', disabled: true },
    ],
  },
  {
    id: 'window',
    label: 'Window',
    submenu: [
      { id: 'minimize', label: 'Minimize', shortcut: 'Cmd+M' },
      { id: 'zoom', label: 'Zoom' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    submenu: [{ id: 'about', label: 'About Safari' }],
  },
];

const SETTINGS_MENUS: MenuItem[] = [
  {
    id: 'edit',
    label: 'Edit',
    submenu: [
      { id: 'undo', label: 'Undo', shortcut: 'Cmd+Z' },
      { id: 'redo', label: 'Redo', shortcut: 'Cmd+Shift+Z' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    submenu: [
      { id: 'general', label: 'General' },
      { id: 'desktop', label: 'Desktop' },
      { id: 'dock', label: 'Dock' },
    ],
  },
  {
    id: 'window',
    label: 'Window',
    submenu: [
      { id: 'minimize', label: 'Minimize', shortcut: 'Cmd+M' },
      { id: 'zoom', label: 'Zoom' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    submenu: [{ id: 'about', label: 'About System Settings' }],
  },
];

export const APP_REGISTRY: Record<string, AppDefinition> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: Folder,
    defaultTitle: 'Finder',
    defaultSize: { width: 880, height: 560 },
    minSize: { width: 480, height: 320 },
    component: Finder,
    menus: FINDER_MENUS,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    defaultTitle: 'Calculator',
    defaultSize: { width: 280, height: 420 },
    minSize: { width: 240, height: 360 },
    component: CalculatorApp,
    menus: [
      {
        id: 'edit',
        label: 'Edit',
        submenu: [
          { id: 'copy', label: 'Copy Result', shortcut: 'Cmd+C' },
          { id: 'paste', label: 'Paste', shortcut: 'Cmd+V' },
        ],
      },
      {
        id: 'view',
        label: 'View',
        submenu: [
          { id: 'basic', label: 'Basic' },
          { id: 'scientific', label: 'Scientific', disabled: true },
        ],
      },
      {
        id: 'help',
        label: 'Help',
        submenu: [{ id: 'about', label: 'About Calculator' }],
      },
    ],
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: FileText,
    defaultTitle: 'Notes',
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 360, height: 280 },
    component: NotesApp,
    menus: [
      {
        id: 'file',
        label: 'File',
        submenu: [
          { id: 'new', label: 'New Note', shortcut: 'Cmd+N' },
          { id: 'delete', label: 'Delete Note', shortcut: 'Cmd+Backspace' },
          { id: 'sep-file-1', separator: true },
          { id: 'close', label: 'Close Window', shortcut: 'Cmd+W' },
        ],
      },
      {
        id: 'edit',
        label: 'Edit',
        submenu: [
          { id: 'undo', label: 'Undo', shortcut: 'Cmd+Z' },
          { id: 'redo', label: 'Redo', shortcut: 'Cmd+Shift+Z' },
          { id: 'sep-edit-1', separator: true },
          { id: 'cut', label: 'Cut', shortcut: 'Cmd+X' },
          { id: 'copy', label: 'Copy', shortcut: 'Cmd+C' },
          { id: 'paste', label: 'Paste', shortcut: 'Cmd+V' },
        ],
      },
      {
        id: 'view',
        label: 'View',
        submenu: [
          { id: 'show-folders', label: 'Show Folders' },
          { id: 'show-preview', label: 'Show Preview' },
        ],
      },
    ],
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: TerminalSquare,
    defaultTitle: 'Terminal',
    defaultSize: { width: 720, height: 460 },
    minSize: { width: 320, height: 240 },
    component: TerminalApp,
    menus: [
      {
        id: 'shell',
        label: 'Shell',
        submenu: [
          { id: 'new-window', label: 'New Window', shortcut: 'Cmd+N' },
          { id: 'clear', label: 'Clear', shortcut: 'Cmd+K' },
        ],
      },
      { id: 'edit', label: 'Edit' },
      { id: 'view', label: 'View' },
    ],
  },
  safari: {
    id: 'safari',
    name: 'Safari',
    icon: Globe,
    defaultTitle: 'Safari',
    defaultSize: { width: 960, height: 600 },
    minSize: { width: 480, height: 320 },
    component: SafariApp,
    menus: SAFARI_MENUS,
  },
  settings: {
    id: 'settings',
    name: 'System Settings',
    icon: SettingsIcon,
    defaultTitle: 'System Settings',
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 560, height: 380 },
    component: SettingsApp,
    menus: SETTINGS_MENUS,
  },
};

/**
 * The window store needs to look up app definitions at runtime, so we expose
 * the registry through a tiny Zustand-style store. This keeps the lookup
 * symmetric with the other stores and easy to mock in tests.
 */
interface AppRegistryState {
  apps: Record<string, AppDefinition>;
}

export const useAppRegistry = create<AppRegistryState>(() => ({
  apps: APP_REGISTRY,
}));

export function getAppDefinition(appId: string): AppDefinition | undefined {
  return useAppRegistry.getState().apps[appId];
}

export function listAppIds(): string[] {
  return Object.keys(useAppRegistry.getState().apps);
}
