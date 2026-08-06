import { create } from 'zustand';
import { useEffect } from 'react';

type ActionMap = Record<string, () => void>;

interface MenuActionStore {
  actionsByWindow: Record<string, ActionMap>;
  register: (windowId: string, actions: ActionMap) => void;
  unregister: (windowId: string) => void;
  run: (windowId: string | null, key: string) => void;
}

export const useMenuActionStore = create<MenuActionStore>((set, get) => ({
  actionsByWindow: {},
  register: (windowId, actions) =>
    set((s) => ({ actionsByWindow: { ...s.actionsByWindow, [windowId]: actions } })),
  unregister: (windowId) =>
    set((s) => {
      const next = { ...s.actionsByWindow };
      delete next[windowId];
      return { actionsByWindow: next };
    }),
  run: (windowId, key) => {
    if (!windowId) return;
    get().actionsByWindow[windowId]?.[key]?.();
  },
}));

export function useAppMenuActions(windowId: string, actions: ActionMap) {
  const register = useMenuActionStore((s) => s.register);
  const unregister = useMenuActionStore((s) => s.unregister);
  useEffect(() => {
    register(windowId, actions);
    return () => unregister(windowId);
  });
}
