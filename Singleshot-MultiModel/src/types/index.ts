import type { ComponentType } from 'react';

export type FsNode =
  | {
      id: string;
      type: 'folder';
      name: string;
      parentId: string | null;
      createdAt: number;
      updatedAt: number;
    }
  | {
      id: string;
      type: 'file';
      name: string;
      parentId: string | null;
      content: string;
      createdAt: number;
      updatedAt: number;
    };

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}

export interface MenuItem {
  id: string;
  label?: string;
  separator?: boolean;
  shortcut?: string;
  disabled?: boolean;
  action?: () => void;
  submenu?: MenuItem[];
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  component: ComponentType<{ windowId: string }>;
  menus: MenuItem[];
}

export type Appearance = 'light' | 'dark' | 'auto';
export type AccentColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'graphite';
export type DockPosition = 'bottom' | 'left' | 'right';

export interface NoteData {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalculatorHistoryEntry {
  id: string;
  expression: string;
  result: string;
  createdAt: number;
}

export interface TerminalHistoryLine {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
  createdAt: number;
}

export interface SafariRecentUrl {
  id: string;
  url: string;
  title?: string;
  visitedAt: number;
}
