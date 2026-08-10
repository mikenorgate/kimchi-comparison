import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AccentColor, Appearance } from '../types';

export interface SystemState {
  appearance: Appearance;
  wallpaper: string;
  accentColor: AccentColor;
  computerName: string;
  /** Volume in 0–100. */
  volume: number;
  /** Whether the system has completed booting (used to gate boot animations). */
  booted: boolean;
  /** Last-known ISO timestamp of the clock; updated by a clock driver. */
  lastTick: number;

  setAppearance: (appearance: Appearance) => void;
  setWallpaper: (wallpaper: string) => void;
  setAccentColor: (color: AccentColor) => void;
  setComputerName: (name: string) => void;
  setVolume: (volume: number) => void;
  setBooted: (booted: boolean) => void;
  tick: (ts?: number) => void;
  resetToDefaults: () => void;
}

const DEFAULTS = {
  appearance: 'auto' as Appearance,
  wallpaper: 'wallpaper-1',
  accentColor: 'blue' as AccentColor,
  computerName: 'Tahoe',
  volume: 70,
  booted: false,
  lastTick: 0,
};

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setAppearance: (appearance) => set({ appearance }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setComputerName: (computerName) => set({ computerName }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
      setBooted: (booted) => set({ booted }),
      tick: (ts) => set({ lastTick: ts ?? Date.now() }),
      resetToDefaults: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'tahoe.system',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appearance: state.appearance,
        wallpaper: state.wallpaper,
        accentColor: state.accentColor,
        computerName: state.computerName,
      }),
    }
  )
);
