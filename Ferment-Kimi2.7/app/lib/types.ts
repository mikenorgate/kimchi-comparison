export type AppId =
  | 'finder'
  | 'safari'
  | 'notes'
  | 'terminal'
  | 'settings'
  | 'calculator'
  | 'calendar'
  | 'clock'
  | 'photos'
  | 'music';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
}

export interface AppDefinition {
  id: AppId;
  name: string;
  defaultTitle: string;
  defaultSize: { width: number; height: number };
  menus: string[];
}

export interface ShellState {
  windows: WindowState[];
  activeWindowId: string | null;
  activeAppId: AppId;
  dockItems: AppId[];
  locked: boolean;
  showSpaces: boolean;
}
