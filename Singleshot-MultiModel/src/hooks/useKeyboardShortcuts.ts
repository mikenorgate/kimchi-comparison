import { useEffect } from 'react';
import { isMeta, normalizeShortcut } from '../lib/keyboard';
import { useWindowStore } from '../stores/windowStore';

export interface KeyboardShortcutsOptions {
  /** Called when the user invokes the Force Quit dialog shortcut. */
  onForceQuit?: () => void;
}

/**
 * Returns true when the event originated inside an editable element (input,
 * textarea, or contentEditable). When that happens we leave the event alone
 * so the field handles its own key handling.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Global keyboard shortcut handler. Registers a single `keydown` listener on
 * `window` and dispatches the following shortcuts:
 *
 *   Cmd+W / Ctrl+W      close the active window
 *   Cmd+M / Ctrl+M      minimize the active window
 *   Cmd+N / Ctrl+N      open a new window of the active app
 *   Cmd+Option+Esc      open the Force Quit dialog
 *   Escape              dispatch `app:close-menus` so any open menu surface
 *                       (menu bar dropdowns, context menus, modals) closes
 *
 * The hook deliberately avoids touching inputs/textareas so typing into a
 * note or a search field behaves normally.
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}): void {
  const { onForceQuit } = options;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Escape is the only shortcut that does not require the primary
      // modifier and should still work even when no window is focused.
      if (event.key === 'Escape' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('app:close-menus'));
        return;
      }

      if (isEditableTarget(event.target)) return;
      if (!isMeta(event)) return;

      const shortcut = normalizeShortcut(event);

      if (shortcut === 'Cmd+W' || shortcut === 'Ctrl+W') {
        event.preventDefault();
        const activeId = useWindowStore.getState().activeWindowId;
        if (activeId) useWindowStore.getState().closeWindow(activeId);
        return;
      }

      if (shortcut === 'Cmd+M' || shortcut === 'Ctrl+M') {
        event.preventDefault();
        const activeId = useWindowStore.getState().activeWindowId;
        if (activeId) useWindowStore.getState().minimizeWindow(activeId);
        return;
      }

      if (shortcut === 'Cmd+N' || shortcut === 'Ctrl+N') {
        event.preventDefault();
        const state = useWindowStore.getState();
        const active = state.activeWindowId ? state.windows[state.activeWindowId] : null;
        const appId = active?.appId ?? 'finder';
        state.openWindow(appId);
        return;
      }

      if (shortcut === 'Cmd+Option+Escape' || shortcut === 'Ctrl+Alt+Escape') {
        event.preventDefault();
        onForceQuit?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [onForceQuit]);
}
