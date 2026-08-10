/**
 * App Content Registry — maps appId to the React component rendered inside
 * a window when that app is open.
 *
 * Phase 3+ apps register their root component here. Apps not yet implemented
 * fall back to AppPlaceholder which shows the app name and a "coming soon" message.
 *
 * The registry is consumed by WindowManager which looks up the component
 * by the window's `appId` field.
 */

import type { ComponentType } from 'react';
import { Finder } from './finder/Finder';
import { SystemSettings } from './system-settings/SystemSettings';
import { Notes } from './notes/Notes';
import { Calculator } from './calculator/Calculator';
import { Safari } from './safari/Safari';

// ── Placeholder for apps not yet implemented ──────────────────────

function AppPlaceholder({ appId }: { appId: string }) {
  const name = appId.charAt(0).toUpperCase() + appId.slice(1);
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-black/40 dark:text-white/40 text-sm">
        <p className="font-medium mb-2">{name}</p>
        <p className="text-xs">Coming soon</p>
      </div>
    </div>
  );
}

// ── App Content Registry ─────────────────────────────────────────
// Maps appId → component. Apps built in later steps import their real
// component and replace the placeholder entry here.

export const appContentRegistry: Record<string, ComponentType<{ appId: string }>> = {
  finder: Finder,
  safari: Safari,
  mail: AppPlaceholder,
  notes: Notes,
  calculator: Calculator,
  settings: SystemSettings,
  music: AppPlaceholder,
  photos: AppPlaceholder,
  messages: AppPlaceholder,
  terminal: AppPlaceholder,
  calendar: AppPlaceholder,
  weather: AppPlaceholder,
  stocks: AppPlaceholder,
  clock: AppPlaceholder,
  reminders: AppPlaceholder,
};

/**
 * Get the content component for a given appId.
 * Falls back to AppPlaceholder if the app is not registered.
 */
export function getAppContent(appId: string): ComponentType<{ appId: string }> {
  return appContentRegistry[appId] ?? AppPlaceholder;
}

/**
 * Register an app's content component at runtime.
 * Used by app index files when they are first imported.
 */
export function registerAppContent(
  appId: string,
  component: ComponentType<{ appId: string }>,
): void {
  appContentRegistry[appId] = component;
}
