import { create } from 'zustand'

/**
 * Cross-app open-file intent.
 *
 * When Finder (or Spotlight, later) opens a file in its owning app, it sets
 * the intent here and launches/focuses the app window. The target app reads
 * (and clears) the intent on mount/focus to load the right document. This
 * decouples file dispatch from the window manager (no file-id coupling on
 * WindowState) and from the target app's internal store.
 *
 * Not persisted — it's a transient hand-off, not durable state.
 */
interface IntentState {
  /** The VFS node id of the file to open, or null if none pending. */
  openFileId: string | null
  /** Record an intent to open a file in its owning app. */
  openFile: (fileId: string) => void
  /** Read and clear the pending intent (call on app mount/focus). */
  consumeOpenFile: () => string | null
}

export const useIntentStore = create<IntentState>((set, get) => ({
  openFileId: null,
  openFile: (fileId) => set({ openFileId: fileId }),
  consumeOpenFile: () => {
    const id = get().openFileId
    set({ openFileId: null })
    return id
  },
}))
