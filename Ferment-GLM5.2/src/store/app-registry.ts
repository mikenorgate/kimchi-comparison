import { type ComponentType } from 'react'

export interface AppDefinition {
  id: string
  name: string
  icon: string
  /** Component rendered inside the window body */
  component: ComponentType<{ windowId: string }>
  /** Default window size */
  defaultWidth?: number
  defaultHeight?: number
  /** Whether the app can have multiple windows open */
  singleWindow?: boolean
  /** Menus shown in the menu bar when this app is focused */
  menus?: AppMenu[]
}

export interface AppMenu {
  label: string
  items: AppMenuItem[]
}

export interface AppMenuItem {
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
}

type AppRegistry = Map<string, AppDefinition>

const registry: AppRegistry = new Map()

/**
 * Register an app so it appears in the Dock and Spotlight,
 * and can be launched into a window.
 */
export function registerApp(app: AppDefinition): void {
  registry.set(app.id, app)
}

/**
 * Get an app definition by id.
 */
export function getApp(id: string): AppDefinition | undefined {
  return registry.get(id)
}

/**
 * Get all registered apps (for Dock, Spotlight).
 */
export function getRegisteredApps(): AppDefinition[] {
  return Array.from(registry.values())
}

/**
 * Clear the registry (for testing).
 */
export function clearRegistry(): void {
  registry.clear()
}
