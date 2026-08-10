/**
 * Appearance & System Settings Store
 *
 * Manages macOS Tahoe appearance modes (Light / Dark / Tinted),
 * the Reduce Transparency accessibility toggle, and wallpaper selection.
 * State is persisted to localStorage via Zustand's persist middleware.
 *
 * A React hook (`useApplyAppearance`) applies the active mode classes
 * to the document root (`<html>`) so that CSS `backdrop-filter` intensity
 * and `dark:` Tailwind variants respond to the current setting.
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppearanceMode } from '@/design-system/tokens';

// ── Types ─────────────────────────────────────────────────────────

export interface SettingsState {
  /** Active appearance mode — drives glass surface colors and dark: variants */
  appearance: AppearanceMode;
  /** Accessibility: reduce transparency (weakens backdrop blur/saturate) */
  reduceTransparency: boolean;
  /** Active wallpaper identifier (original gradient wallpapers) */
  wallpaper: string;

  /** Set the appearance mode */
  setAppearance: (mode: AppearanceMode) => void;
  /** Toggle reduce-transparency on or off */
  setReduceTransparency: (value: boolean) => void;
  /** Set the active wallpaper */
  setWallpaper: (id: string) => void;
}

// ── Appearance → CSS class mapping ────────────────────────────────

const APPEARANCE_CLASSES: Record<AppearanceMode, string> = {
  light: 'appearance-light',
  dark: 'appearance-dark',
  tinted: 'appearance-tinted',
};

/**
 * Apply appearance classes to the document root element.
 * Removes any stale `appearance-*` and `reduce-transparency` classes,
 * then adds the ones matching the current settings.
 *
 * Exported so it can be called from non-React contexts (tests, init scripts).
 */
export function applyAppearanceClasses(
  appearance: AppearanceMode,
  reduceTransparency: boolean,
): void {
  const root = document.documentElement;

  // Remove all appearance mode classes
  root.classList.remove('appearance-light', 'appearance-dark', 'appearance-tinted');
  // Add the active one
  root.classList.add(APPEARANCE_CLASSES[appearance]);

  // Toggle reduce-transparency
  if (reduceTransparency) {
    root.classList.add('reduce-transparency');
  } else {
    root.classList.remove('reduce-transparency');
  }
}

// ── Store ─────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'light',
      reduceTransparency: false,
      wallpaper: 'tahoe-gradient-1',

      setAppearance: (mode) => set({ appearance: mode }),
      setReduceTransparency: (value) => set({ reduceTransparency: value }),
      setWallpaper: (id) => set({ wallpaper: id }),
    }),
    {
      name: 'tahoe-settings',
      // Only persist data, not actions
      partialize: (state) => ({
        appearance: state.appearance,
        reduceTransparency: state.reduceTransparency,
        wallpaper: state.wallpaper,
      }),
    },
  ),
);

// ── React hook: apply appearance classes on state change ──────────

/**
 * React hook that subscribes to appearance + reduceTransparency changes
 * and applies the corresponding CSS classes to `<html>`.
 *
 * Call this once near the root of the app tree (e.g. in the Desktop component).
 */
export function useApplyAppearance(): void {
  const appearance = useSettingsStore((s) => s.appearance);
  const reduceTransparency = useSettingsStore((s) => s.reduceTransparency);

  useEffect(() => {
    applyAppearanceClasses(appearance, reduceTransparency);
  }, [appearance, reduceTransparency]);
}

// ── Selector helpers ──────────────────────────────────────────────

export const selectAppearance = (s: SettingsState): AppearanceMode => s.appearance;
export const selectReduceTransparency = (s: SettingsState): boolean => s.reduceTransparency;
export const selectWallpaper = (s: SettingsState): string => s.wallpaper;
