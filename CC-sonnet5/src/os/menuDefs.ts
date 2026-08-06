import type { AppMenu } from './types';

const EDIT_MENU: AppMenu = {
  label: 'Edit',
  items: [
    { label: 'Undo', shortcut: '⌘Z', actionKey: 'undo' },
    { label: 'Redo', shortcut: '⇧⌘Z', actionKey: 'redo' },
    { separator: true },
    { label: 'Cut', shortcut: '⌘X', actionKey: 'cut' },
    { label: 'Copy', shortcut: '⌘C', actionKey: 'copy' },
    { label: 'Paste', shortcut: '⌘V', actionKey: 'paste' },
  ],
};

const WINDOW_MENU: AppMenu = {
  label: 'Window',
  items: [
    { label: 'Minimize', shortcut: '⌘M', actionKey: 'minimize' },
    { label: 'Zoom', actionKey: 'zoom' },
    { separator: true },
    { label: 'Close', shortcut: '⌘W', actionKey: 'close' },
  ],
};

const HELP_MENU: AppMenu = { label: 'Help', items: [{ label: 'Search' }] };

export const MENU_DEFS: Record<string, AppMenu[]> = {
  finder: [
    {
      label: 'File',
      items: [
        { label: 'New Folder', shortcut: '⇧⌘N', actionKey: 'newFolder' },
        { separator: true },
        { label: 'Close Window', shortcut: '⌘W', actionKey: 'close' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'as Icons', actionKey: 'viewIcon' },
        { label: 'as List', actionKey: 'viewList' },
      ],
    },
    WINDOW_MENU,
    HELP_MENU,
  ],
  textedit: [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: '⌘N', actionKey: 'new' },
        { label: 'Save', shortcut: '⌘S', actionKey: 'save' },
        { separator: true },
        { label: 'Close', shortcut: '⌘W', actionKey: 'close' },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Bold', shortcut: '⌘B', actionKey: 'bold' },
        { label: 'Italic', shortcut: '⌘I', actionKey: 'italic' },
        { label: 'Underline', shortcut: '⌘U', actionKey: 'underline' },
      ],
    },
    WINDOW_MENU,
    HELP_MENU,
  ],
  notes: [
    {
      label: 'File',
      items: [
        { label: 'New Note', shortcut: '⌘N', actionKey: 'new' },
        { label: 'Delete Note', actionKey: 'delete' },
      ],
    },
    EDIT_MENU,
    WINDOW_MENU,
    HELP_MENU,
  ],
  safari: [
    {
      label: 'File',
      items: [
        { label: 'New Tab', shortcut: '⌘T', actionKey: 'newTab' },
        { label: 'Close', shortcut: '⌘W', actionKey: 'close' },
      ],
    },
    {
      label: 'History',
      items: [
        { label: 'Back', shortcut: '⌘[', actionKey: 'back' },
        { label: 'Forward', shortcut: '⌘]', actionKey: 'forward' },
        { label: 'Home', actionKey: 'home' },
      ],
    },
    WINDOW_MENU,
    HELP_MENU,
  ],
  calculator: [WINDOW_MENU, HELP_MENU],
  settings: [WINDOW_MENU, HELP_MENU],
};

export function menusForApp(appId: string): AppMenu[] {
  return MENU_DEFS[appId] ?? [WINDOW_MENU, HELP_MENU];
}
