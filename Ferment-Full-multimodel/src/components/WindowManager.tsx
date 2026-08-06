import { useMemo } from 'react';

import { useOSStore } from '../store/osStore';
import type { WindowInstance } from '../types/os';
import { Window } from './Window';

/**
 * WindowManager — renders every window (including minimized ones) in
 * z-index order. Minimized windows stay in the DOM so the CSS
 * `window--minimized` scale/opacity transition can play; the class also
 * sets `pointer-events: none` so they remain non-interactive.
 *
 * This component is purely presentational: all window state lives in
 * the Zustand store and all interactions flow through it via `Window`.
 */
export function WindowManager(): JSX.Element {
  const windows = useOSStore((state) => state.windows);

  // Sort by z-index so DOM order = paint order (lower first).
  const visibleWindows = useMemo<WindowInstance[]>(() => {
    return windows.slice().sort((a, b) => a.zIndex - b.zIndex);
  }, [windows]);

  return (
    <div className="window-manager" aria-label="Window manager">
      {visibleWindows.map((w) => (
        <Window key={w.id} windowId={w.id} />
      ))}
    </div>
  );
}

export default WindowManager;
