import { createContext, useContext } from 'react'
import type { AppMenu } from '@/lib/menu-types'

export type PowerOverlay = 'about' | 'sleep' | 'restart' | 'shutdown' | 'lock' | null

export interface AppManifest {
  id: string
  name: string
  /** Menus shown after the app name (File/Edit/...). Apple menu is global. */
  menus: AppMenu[]
}

export interface OsState {
  activeAppId: string
  activeAppName: string
  setActiveAppId: (id: string) => void
  powerOverlay: PowerOverlay
  setPowerOverlay: (p: PowerOverlay) => void
}

export const OsContext = createContext<OsState | null>(null)

export function useOs(): OsState {
  const ctx = useContext(OsContext)
  if (!ctx) throw new Error('useOs must be used within an OsProvider')
  return ctx
}

/* -------------------------------------------------------------------------- */
/* App registry — resolves menu bar menus for the focused app.                */
/* -------------------------------------------------------------------------- */

const registry = new Map<string, AppManifest>()

export function registerApp(manifest: AppManifest) {
  registry.set(manifest.id, manifest)
}

export function getAppManifest(id: string): AppManifest | undefined {
  return registry.get(id)
}

export function listAppIds(): string[] {
  return Array.from(registry.keys())
}
