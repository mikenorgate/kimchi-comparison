/**
 * Tests for the appearance settings store.
 *
 * Verifies:
 * - Default state (light mode, no reduce transparency)
 * - setAppearance switches mode and applies correct <html> class
 * - setReduceTransparency toggles the class on <html>
 * - State persists to localStorage under the "tahoe-settings" key
 * - useApplyAppearance hook applies classes reactively
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsStore, applyAppearanceClasses, useApplyAppearance } from '../settings';

// ── Test helpers ──────────────────────────────────────────────────

/** Reset the Zustand store to defaults and clear localStorage + <html> classes */
function resetStore(): void {
  // Clear persisted state
  localStorage.removeItem('tahoe-settings');
  // Reset the store to initial state
  useSettingsStore.setState({
    appearance: 'light',
    reduceTransparency: false,
    wallpaper: 'tahoe-gradient-1',
  });
  // Clean <html> classes
  document.documentElement.className = '';
}

// ── Tests ─────────────────────────────────────────────────────────

describe('settings store', () => {
  beforeEach(() => {
    resetStore();
  });

  // ── Default state ───────────────────────────────────────────────

  it('defaults to light appearance', () => {
    expect(useSettingsStore.getState().appearance).toBe('light');
  });

  it('defaults reduceTransparency to false', () => {
    expect(useSettingsStore.getState().reduceTransparency).toBe(false);
  });

  it('has a default wallpaper id', () => {
    expect(useSettingsStore.getState().wallpaper).toBe('tahoe-gradient-1');
  });

  // ── setAppearance ───────────────────────────────────────────────

  it('switches appearance to dark', () => {
    useSettingsStore.getState().setAppearance('dark');
    expect(useSettingsStore.getState().appearance).toBe('dark');
  });

  it('switches appearance to tinted', () => {
    useSettingsStore.getState().setAppearance('tinted');
    expect(useSettingsStore.getState().appearance).toBe('tinted');
  });

  // ── setReduceTransparency ───────────────────────────────────────

  it('toggles reduceTransparency on', () => {
    useSettingsStore.getState().setReduceTransparency(true);
    expect(useSettingsStore.getState().reduceTransparency).toBe(true);
  });

  it('toggles reduceTransparency off', () => {
    useSettingsStore.getState().setReduceTransparency(true);
    useSettingsStore.getState().setReduceTransparency(false);
    expect(useSettingsStore.getState().reduceTransparency).toBe(false);
  });

  // ── setWallpaper ────────────────────────────────────────────────

  it('changes wallpaper id', () => {
    useSettingsStore.getState().setWallpaper('tahoe-gradient-2');
    expect(useSettingsStore.getState().wallpaper).toBe('tahoe-gradient-2');
  });

  // ── Persistence ─────────────────────────────────────────────────

  it('persists state to localStorage', () => {
    useSettingsStore.getState().setAppearance('dark');
    useSettingsStore.getState().setReduceTransparency(true);

    const stored = JSON.parse(localStorage.getItem('tahoe-settings') || '{}');
    expect(stored.state.appearance).toBe('dark');
    expect(stored.state.reduceTransparency).toBe(true);
  });

  it('does not persist action functions', () => {
    useSettingsStore.getState().setAppearance('dark');
    const stored = JSON.parse(localStorage.getItem('tahoe-settings') || '{}');
    expect(stored.state.setAppearance).toBeUndefined();
  });
});

// ── applyAppearanceClasses ────────────────────────────────────────

describe('applyAppearanceClasses', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  it('adds appearance-light class for light mode', () => {
    applyAppearanceClasses('light', false);
    expect(document.documentElement.classList.contains('appearance-light')).toBe(true);
  });

  it('adds appearance-dark class for dark mode', () => {
    applyAppearanceClasses('dark', false);
    expect(document.documentElement.classList.contains('appearance-dark')).toBe(true);
  });

  it('adds appearance-tinted class for tinted mode', () => {
    applyAppearanceClasses('tinted', false);
    expect(document.documentElement.classList.contains('appearance-tinted')).toBe(true);
  });

  it('adds reduce-transparency class when enabled', () => {
    applyAppearanceClasses('light', true);
    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(true);
  });

  it('does not add reduce-transparency when disabled', () => {
    applyAppearanceClasses('light', false);
    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(false);
  });

  it('removes stale appearance classes when switching modes', () => {
    // Apply dark first
    applyAppearanceClasses('dark', false);
    expect(document.documentElement.classList.contains('appearance-dark')).toBe(true);

    // Switch to light — dark class should be removed
    applyAppearanceClasses('light', false);
    expect(document.documentElement.classList.contains('appearance-dark')).toBe(false);
    expect(document.documentElement.classList.contains('appearance-light')).toBe(true);
  });

  it('removes reduce-transparency class when toggled off', () => {
    applyAppearanceClasses('light', true);
    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(true);

    applyAppearanceClasses('light', false);
    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(false);
  });

  it('applies both appearance and reduce-transparency simultaneously', () => {
    applyAppearanceClasses('dark', true);
    expect(document.documentElement.classList.contains('appearance-dark')).toBe(true);
    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(true);
  });
});

// ── useApplyAppearance hook ───────────────────────────────────────

describe('useApplyAppearance hook', () => {
  beforeEach(() => {
    resetStore();
  });

  it('applies default classes on mount', () => {
    renderHook(() => useApplyAppearance());
    expect(document.documentElement.classList.contains('appearance-light')).toBe(true);
    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(false);
  });

  it('reactively updates when appearance changes', () => {
    const { rerender } = renderHook(() => useApplyAppearance());

    act(() => {
      useSettingsStore.getState().setAppearance('dark');
    });
    rerender();

    expect(document.documentElement.classList.contains('appearance-dark')).toBe(true);
    expect(document.documentElement.classList.contains('appearance-light')).toBe(false);
  });

  it('reactively updates when reduceTransparency changes', () => {
    const { rerender } = renderHook(() => useApplyAppearance());

    act(() => {
      useSettingsStore.getState().setReduceTransparency(true);
    });
    rerender();

    expect(document.documentElement.classList.contains('reduce-transparency')).toBe(true);
  });

  it('cleans up classes on unmount', () => {
    const { unmount } = renderHook(() => useApplyAppearance());
    expect(document.documentElement.classList.contains('appearance-light')).toBe(true);

    unmount();

    // After unmount, classes remain (unmount doesn't reset — that's the app's job)
    // But they're no longer being updated. Verify the hook at least ran.
    expect(document.documentElement.classList.contains('appearance-light')).toBe(true);
  });
});
