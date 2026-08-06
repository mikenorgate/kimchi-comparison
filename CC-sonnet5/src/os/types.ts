import type { ComponentType } from 'react';

export interface MenuItem {
  label: string;
  shortcut?: string;
  actionKey?: string;
  disabled?: boolean;
  separator?: false;
}

export interface MenuSeparator {
  separator: true;
}

export type MenuEntry = MenuItem | MenuSeparator;

export interface AppMenu {
  label: string;
  items: MenuEntry[];
}

export interface AppDef {
  id: string;
  title: string;
  icon: string;
  color: string;
  component: ComponentType<{ windowId: string }>;
  defaultSize: { width: number; height: number };
  minSize?: { width: number; height: number };
  functional: boolean;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}
