import type { ComponentType } from 'react';

export type AppCategory = 'system' | 'productivity' | 'media' | 'utilities';

export type Appearance = 'light' | 'dark';

export interface AppDefinition {
  id: string;
  name: string;
  /** Emoji or SVG path used to render the app icon. */
  icon: string;
  category: AppCategory;
  component: ComponentType<{ windowId: string }>;
  canOpenMultiple: boolean;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  /** Optional menus contributed to the menu bar while this app is focused. */
  menus?: MenuBarMenu[];
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  payload?: unknown;
}

export interface DesktopIcon {
  id: string;
  /** App id this icon launches, if any. */
  appId?: string;
  label: string;
  icon: string;
  x: number;
  y: number;
}

export interface MenuBarMenu {
  /** Menu title shown in the menu bar (e.g. "File", "Edit"). */
  title: string;
  items: MenuBarMenuItem[];
}

export interface MenuBarMenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
}

/** A small glyph shown on the right side of the menu bar (Wi-Fi, clock, etc.). */
export interface StatusIcon {
  id: string;
  /** lucide-react icon name used by the MenuBar component. */
  icon: string;
  tooltip?: string;
}

export interface MenuBarState {
  /** Static Apple menu (left of the menu bar). */
  appleMenu: MenuBarMenu;
  /** Menus contributed by the currently focused app. Empty when no app is focused. */
  appMenus: MenuBarMenu[];
  /** Static status icons shown on the right of the menu bar. */
  statusIcons: StatusIcon[];
  /** Display name of the currently focused app; falls back to "Finder". */
  activeAppName: string;
}

export interface OSState {
  activeAppId: string | null;
  apps: Record<string, AppDefinition>;
  windows: WindowInstance[];
  dockAppIds: string[];
  desktopIcons: DesktopIcon[];
  menuBar: MenuBarState;
  spotlightOpen: boolean;
  launchpadOpen: boolean;
  controlCenterOpen: boolean;
  wallpaper: string;
  appearance: Appearance;
  /** Monotonically increasing counter used to assign top z-index to focused windows. */
  maxZ: number;
  /** App ids whose Dock icon should currently animate a launch bounce. */
  bouncingAppIds: string[];
}
