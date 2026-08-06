import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const WALLPAPERS = [
  { id: 'tahoe-light', name: 'Tahoe Light', gradient: 'linear-gradient(160deg, #aee1f9 0%, #7fb9e8 35%, #4f7fc9 70%, #2f4f8f 100%)' },
  { id: 'tahoe-dark', name: 'Tahoe Dark', gradient: 'linear-gradient(160deg, #1b1f3b 0%, #232a5c 40%, #3a2f6e 75%, #171326 100%)' },
  { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(160deg, #ffb88c 0%, #ff7a7a 35%, #d1428a 70%, #5a2a83 100%)' },
  { id: 'forest', name: 'Forest', gradient: 'linear-gradient(160deg, #cdeccb 0%, #6fbf73 35%, #2f8f5b 70%, #124a3a 100%)' },
  { id: 'mono', name: 'Graphite', gradient: 'linear-gradient(160deg, #6e6e73 0%, #4b4b50 40%, #2c2c30 75%, #101012 100%)' },
];

interface SystemStore {
  theme: 'light' | 'dark';
  wallpaperId: string;
  dockSize: number;
  dockPosition: 'bottom' | 'left' | 'right';
  volume: number;
  brightness: number;
  wifiOn: boolean;
  bluetoothOn: boolean;
  locked: boolean;
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setWallpaper: (id: string) => void;
  setDockSize: (n: number) => void;
  setDockPosition: (p: 'bottom' | 'left' | 'right') => void;
  setVolume: (n: number) => void;
  setBrightness: (n: number) => void;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  lock: () => void;
  unlock: () => void;
}

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      theme: 'light',
      wallpaperId: 'tahoe-light',
      dockSize: 56,
      dockPosition: 'bottom',
      volume: 60,
      brightness: 80,
      wifiOn: true,
      bluetoothOn: true,
      locked: true,
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setWallpaper: (id) => set({ wallpaperId: id }),
      setDockSize: (n) => set({ dockSize: n }),
      setDockPosition: (p) => set({ dockPosition: p }),
      setVolume: (n) => set({ volume: n }),
      setBrightness: (n) => set({ brightness: n }),
      toggleWifi: () => set((s) => ({ wifiOn: !s.wifiOn })),
      toggleBluetooth: () => set((s) => ({ bluetoothOn: !s.bluetoothOn })),
      lock: () => set({ locked: true }),
      unlock: () => set({ locked: false }),
    }),
    { name: 'tahoe-system', partialize: (s) => ({ ...s, locked: undefined }) },
  ),
);
