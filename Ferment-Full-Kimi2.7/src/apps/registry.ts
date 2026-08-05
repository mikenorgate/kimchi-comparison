import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { MenuItem } from '../components/primitives'

export interface AppSize {
  width: number
  height: number
}

export interface AppPosition {
  x: number
  y: number
}

export interface AppDefinition {
  id: string
  name: string
  icon: LucideIcon
  component: ComponentType
  defaultSize: AppSize
  defaultPosition?: AppPosition
  minSize?: AppSize
  category?: string
  showInDock?: boolean
  showInApplications?: boolean
  menuItems?: MenuItem[]
}

const registry = new Map<string, AppDefinition>()

export function registerApp(app: AppDefinition): AppDefinition {
  if (registry.has(app.id)) {
    console.warn(`App with id "${app.id}" is already registered. Overwriting.`)
  }
  registry.set(app.id, app)
  return app
}

export function getApp(id: string): AppDefinition | undefined {
  return registry.get(id)
}

export function getApps(): AppDefinition[] {
  return Array.from(registry.values())
}

export function getDockApps(): AppDefinition[] {
  return getApps().filter((app) => app.showInDock !== false)
}

export function getApplicationsFolderApps(): AppDefinition[] {
  return getApps().filter((app) => app.showInApplications !== false)
}

export function clearRegistry(): void {
  registry.clear()
}
