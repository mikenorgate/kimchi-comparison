/**
 * WindowManager — renders all open windows for the current Space.
 *
 * - Filters windows by currentSpace
 * - Renders each Window component with content based on appId
 * - Placeholder content for apps not yet implemented (Phase 3+)
 * - Handles keyboard shortcuts: Cmd+W (close), Cmd+M (minimize)
 */

import { useEffect } from 'react';
import { Window } from './Window';
import { useWindowStore } from '@/store/windows';
import { getAppContent } from '@/apps/registry';

function WindowContent({ appId }: { appId: string }) {
  const Content = getAppContent(appId);
  return <Content appId={appId} />;
}

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const currentSpace = useWindowStore((s) => s.currentSpace);
  const focusedId = useWindowStore((s) => s.focusedId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const nextSpace = useWindowStore((s) => s.nextSpace);
  const prevSpace = useWindowStore((s) => s.prevSpace);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Spaces switching: Ctrl+ArrowRight / Ctrl+ArrowLeft
      // (works even when no window is focused, like real macOS)
      if (e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextSpace();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevSpace();
          return;
        }
      }

      // Window-level shortcuts require a focused window
      const focused = windows.find((w) => w.id === focusedId);
      if (!focused) return;

      if (e.metaKey && e.key === 'w') {
        e.preventDefault();
        closeWindow(focused.id);
      }
      if (e.metaKey && e.key === 'm') {
        e.preventDefault();
        minimizeWindow(focused.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [windows, focusedId, closeWindow, minimizeWindow, nextSpace, prevSpace]);

  const visibleWindows = windows.filter(
    (w) => w.space === currentSpace
  );

  if (visibleWindows.length === 0) return null;

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {visibleWindows.map((win) => (
        <div key={win.id} style={{ pointerEvents: 'auto' }}>
          <Window win={win} focused={win.id === focusedId}>
            <WindowContent appId={win.appId} />
          </Window>
        </div>
      ))}
    </div>
  );
}
