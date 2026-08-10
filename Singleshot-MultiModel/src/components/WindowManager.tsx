import { useMemo } from 'react';
import { useWindowStore } from '../stores/windowStore';
import Window from './Window';

/**
 * Renders every open window sorted by `zIndex` ascending so the highest
 * z-index renders last (and therefore stacks on top). Reads directly from
 * the window store; no local state.
 */
export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const order = useWindowStore((s) => s.windowOrder);

  const sorted = useMemo(() => {
    return order
      .map((id) => windows[id])
      .filter((w): w is NonNullable<typeof w> => Boolean(w))
      .sort((a, b) => a.zIndex - b.zIndex);
  }, [windows, order]);

  return (
    <>
      {sorted.map((win) => (
        <Window key={win.id} windowId={win.id} />
      ))}
    </>
  );
}
