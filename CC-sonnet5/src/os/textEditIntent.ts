import { create } from 'zustand';

interface TextEditIntentStore {
  pending: Record<string, string>;
  setPending: (windowId: string, fileId: string) => void;
  consume: (windowId: string) => string | undefined;
}

export const useTextEditIntent = create<TextEditIntentStore>((set, get) => ({
  pending: {},
  setPending: (windowId, fileId) => set((s) => ({ pending: { ...s.pending, [windowId]: fileId } })),
  consume: (windowId) => {
    const fileId = get().pending[windowId];
    if (fileId) {
      set((s) => {
        const next = { ...s.pending };
        delete next[windowId];
        return { pending: next };
      });
    }
    return fileId;
  },
}));
