import type { ReactNode } from 'react'

/**
 * App registry contract.
 *
 * Every macOS app that can be launched into a window is described by an
 * AppDefinition. The registry maps appId → definition; the window manager
 * (step 3) looks up apps by appId when mounting window content, and the
 * Dock/Spotlight (steps 4-5) iterate listApps() to render launchers.
 *
 * Step 3 registers a single "test" stub so windows have content to mount;
 * step 5 replaces it with the 12 real apps (Finder, Safari, Notes, ...).
 */
export interface AppDefinition {
  appId: string
  title: string
  icon: ReactNode
  defaultSize?: { w: number; h: number }
  /** Render the app body (mounted inside a window's content region). */
  render: () => ReactNode
}

const registry = new Map<string, AppDefinition>()

export function registerApp(app: AppDefinition): void {
  registry.set(app.appId, app)
}

export function getApp(appId: string): AppDefinition | undefined {
  return registry.get(appId)
}

export function listApps(): AppDefinition[] {
  return Array.from(registry.values())
}
