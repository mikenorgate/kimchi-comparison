import { useEffect, useMemo, useRef, useState } from 'react';
import { useDockStore } from '../stores/dockStore';
import { useWindowStore } from '../stores/windowStore';
import { useAppRegistry } from '../lib/apps';
import DockItem from './DockItem';

const FALLOFF_PX = 110;

/**
 * The dock is a horizontally laid-out set of icons (Chunk 2 only deals with
 * `bottom` positioning; left/right are settings stored for later chunks). It
 * tracks pointer X to compute a per-item magnification factor and triggers
 * the bounce animation when a pinned app launches for the first time.
 */
export default function Dock() {
  const pinned = useDockStore((s) => s.pinned);
  const bouncing = useDockStore((s) => s.bouncing);
  const size = useDockStore((s) => s.size);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);
  const startBounce = useDockStore((s) => s.startBounce);
  const stopBounce = useDockStore((s) => s.stopBounce);

  const apps = useAppRegistry((s) => s.apps);
  const openWindow = useWindowStore((s) => s.openWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const windows = useWindowStore((s) => s.windows);
  const windowOrder = useWindowStore((s) => s.windowOrder);

  // Derive running indicators from the actual window state instead of the
  // separate `dockStore.running` field, so opening or closing a window
  // always updates the dot under the dock icon.
  const runningAppIds = useMemo(() => {
    const ids = new Set<string>();
    for (const wid of windowOrder) {
      const win = windows[wid];
      if (!win) continue;
      if (win.minimized) continue;
      ids.add(win.appId);
    }
    return Array.from(ids);
  }, [windows, windowOrder]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [magnification, setMagnification] = useState<Record<string, number>>({});

  const visibleApps = useMemo(
    () => pinned.map((id) => apps[id]).filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [pinned, apps]
  );

  // Auto-stop the bounce after a short delay so the animation is bounded.
  useEffect(() => {
    if (!bouncing) return;
    const t = window.setTimeout(() => stopBounce(), 1200);
    return () => window.clearTimeout(t);
  }, [bouncing, stopBounce]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!magnificationEnabled) {
      setMagnification({});
      return;
    }
    const next: Record<string, number> = {};
    for (const [appId, node] of Object.entries(itemRefs.current)) {
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(event.clientX - center);
      const normalized = Math.max(0, 1 - distance / FALLOFF_PX);
      // Quadratic falloff for a more pronounced center.
      next[appId] = normalized * normalized;
    }
    setMagnification(next);
  };

  const handlePointerLeave = () => {
    setMagnification({});
  };

  const launch = (appId: string) => {
    // If there's already a window for this app, focus it. Otherwise create a
    // fresh window and play the bounce animation.
    const existingId = windowOrder.find((wid) => windows[wid]?.appId === appId);
    if (existingId) {
      focusWindow(existingId);
      return;
    }
    openWindow(appId);
    startBounce(appId);
  };

  return (
    <div
      data-testid="dock"
      className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center"
    >
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="pointer-events-auto flex items-end gap-2 rounded-2xl bg-white/20 px-3 py-2 backdrop-blur-xl shadow-2xl ring-1 ring-white/30"
      >
        {visibleApps.map((app, idx) => (
          <div
            key={app.id}
            ref={(node) => {
              itemRefs.current[app.id] = node;
            }}
          >
            <DockItem
              appId={app.id}
              icon={app.icon}
              label={app.name}
              size={size}
              magnificationEnabled={magnificationEnabled}
              magnificationFactor={magnification[app.id] ?? 0}
              isRunning={runningAppIds.includes(app.id)}
              isBouncing={bouncing?.appId === app.id}
              index={idx}
              total={visibleApps.length}
              onActivate={() => launch(app.id)}
              onContextMenu={() => {
                // Future chunks may show a per-item context menu. For now we
                // swallow it so the OS-level menu doesn't appear.
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
