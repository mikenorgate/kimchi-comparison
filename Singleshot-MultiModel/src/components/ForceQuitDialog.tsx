import { useEffect } from 'react';
import { useWindowStore } from '../stores/windowStore';

interface ForceQuitDialogProps {
  /** Whether the dialog is visible. The component renders nothing when false. */
  open: boolean;
  /** Invoked when the user dismisses the dialog (Escape, outside click, Cancel). */
  onClose: () => void;
}

/**
 * Modal "Force Quit Applications" dialog. Lists every open window and lets
 * the user forcibly close it. Mirrors the macOS Force Quit window:
 *
 *   - closes on Escape (via the global `app:close-menus` event)
 *   - closes on backdrop click
 *   - closes via the Cancel button
 */
export default function ForceQuitDialog({ open, onClose }: ForceQuitDialogProps) {
  const windows = useWindowStore((s) => s.windows);
  const windowOrder = useWindowStore((s) => s.windowOrder);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  // Listen for the global close-menus event so Escape (and any other menu-
  // tearing shortcut) dismisses the dialog. The listener is only attached
  // while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const handler = () => onClose();
    window.addEventListener('app:close-menus', handler);
    return () => window.removeEventListener('app:close-menus', handler);
  }, [open, onClose]);

  if (!open) return null;

  const list = windowOrder
    .map((id) => windows[id])
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  return (
    <div
      data-testid="force-quit-overlay"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        data-testid="force-quit-dialog"
        role="dialog"
        aria-label="Force Quit Applications"
        className="w-[460px] max-w-[90vw] rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">
          Force Quit Applications
        </div>
        <div className="max-h-[300px] overflow-auto p-2">
          {list.length === 0 ? (
            <div
              data-testid="force-quit-empty"
              className="px-2 py-6 text-center text-sm text-slate-500"
            >
              No applications are running.
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {list.map((win) => (
                <li
                  key={win.id}
                  data-testid={`force-quit-row-${win.id}`}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-slate-100"
                >
                  <span className="truncate text-sm text-slate-800">{win.title}</span>
                  <button
                    type="button"
                    data-testid={`force-quit-close-${win.id}`}
                    onClick={() => closeWindow(win.id)}
                    className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    Force Quit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-3 py-2">
          <button
            type="button"
            data-testid="force-quit-cancel"
            onClick={onClose}
            className="rounded px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
