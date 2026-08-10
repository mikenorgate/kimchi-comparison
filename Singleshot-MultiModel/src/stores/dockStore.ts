import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DockPosition } from '../types';

const DEFAULT_PINNED = ['finder', 'calculator', 'notes', 'terminal', 'safari', 'settings'];

export interface BounceState {
  appId: string;
  startedAt: number;
}

export interface DockState {
  pinned: string[];
  running: string[];
  bouncing: BounceState | null;
  /** Size in 10–100. */
  size: number;
  magnificationEnabled: boolean;
  position: DockPosition;

  pin: (appId: string) => void;
  unpin: (appId: string) => void;
  isPinned: (appId: string) => boolean;
  setRunning: (appId: string, running: boolean) => void;
  isRunning: (appId: string) => boolean;

  startBounce: (appId: string) => void;
  stopBounce: () => void;

  setDockSize: (size: number) => void;
  setDockMagnification: (enabled: boolean) => void;
  setDockPosition: (position: DockPosition) => void;

  resetDock: () => void;
}

const DEFAULTS = {
  pinned: DEFAULT_PINNED,
  running: [] as string[],
  bouncing: null as BounceState | null,
  size: 48,
  magnificationEnabled: true,
  position: 'bottom' as DockPosition,
};

export const useDockStore = create<DockState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      pin: (appId) => {
        if (get().pinned.includes(appId)) return;
        set({ pinned: [...get().pinned, appId] });
      },
      unpin: (appId) => {
        set({ pinned: get().pinned.filter((id) => id !== appId) });
      },
      isPinned: (appId) => get().pinned.includes(appId),

      setRunning: (appId, running) => {
        const list = get().running;
        if (running) {
          if (list.includes(appId)) return;
          set({ running: [...list, appId] });
        } else {
          set({ running: list.filter((id) => id !== appId) });
        }
      },
      isRunning: (appId) => get().running.includes(appId),

      startBounce: (appId) => set({ bouncing: { appId, startedAt: Date.now() } }),
      stopBounce: () => set({ bouncing: null }),

      setDockSize: (size) => set({ size: Math.max(10, Math.min(100, size)) }),
      setDockMagnification: (enabled) => set({ magnificationEnabled: enabled }),
      setDockPosition: (position) => set({ position }),

      resetDock: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'tahoe.dock',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        size: state.size,
        magnificationEnabled: state.magnificationEnabled,
        position: state.position,
      }),
    }
  )
);
