import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { useOSStore } from '../store/osStore';
import type { AppDefinition } from '../types/os';
import { ContextMenu } from './ui/ContextMenu';
import type { MenuBarMenu, MenuBarMenuItem } from '../types/os';

const DOCK_BASE_SIZE = 48;
const DOCK_MAX_SIZE = 72;
const MAGNIFICATION_RANGE = 120; // px from cursor where magnification tapers off

interface RunningState {
  appIds: Set<string>;
}

interface ContextMenuState {
  position: { x: number; y: number };
  appId: string;
}

function appIconLabel(app: AppDefinition): string {
  return app.name;
}

function isLaunchpad(app: AppDefinition): boolean {
  return app.id === 'launchpad';
}

function isTrash(app: AppDefinition): boolean {
  return app.id === 'trash';
}

/**
 * Bottom-centered Dock. Apps magnify on hover, running apps show an
 * indicator, launching an app triggers a bounce animation. Right-click
 * shows a mock Options menu.
 */
export function Dock(): JSX.Element {
  const apps = useOSStore((state) => state.apps);
  const dockAppIds = useOSStore((state) => state.dockAppIds);
  const windows = useOSStore((state) => state.windows);
  const bouncingAppIds = useOSStore((state) => state.bouncingAppIds);
  const launchApp = useOSStore((state) => state.launchApp);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const toggleLaunchpad = useOSStore((state) => state.toggleLaunchpad);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const dockItems = useMemo(() => {
    return dockAppIds
      .map((id) => ({ id, app: apps[id] }))
      .filter(
        (entry): entry is { id: string; app: AppDefinition } =>
          entry.app !== undefined,
      );
  }, [apps, dockAppIds]);

  const running = useMemo<RunningState>(() => {
    const appIds = new Set<string>();
    for (const window of windows) {
      if (!window.isMinimized) {
        appIds.add(window.appId);
      }
    }
    return { appIds };
  }, [windows]);

  const computeScale = useCallback((index: number): number => {
    if (mouseX === null) return 1;
    const btn = itemRefs.current.get(dockItems[index]?.id ?? '');
    if (!btn) return 1;
    const rect = btn.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - center);
    if (distance > MAGNIFICATION_RANGE) return 1;
    const t = 1 - distance / MAGNIFICATION_RANGE;
    return 1 + (DOCK_MAX_SIZE / DOCK_BASE_SIZE - 1) * t;
  }, [dockItems, mouseX]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>): void => {
    setMouseX(event.clientX);
  };

  const handleMouseLeave = (): void => {
    setMouseX(null);
    setHoverIndex(null);
  };

  // Close context menu on Escape / outside clicks.
  useEffect(() => {
    if (!contextMenu) return;
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') setContextMenu(null);
    };
    const handleClick = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;
      if (containerRef.current && target && containerRef.current.contains(target)) {
        return;
      }
      const menuEl = document.querySelector('.os-menu');
      if (menuEl && menuEl.contains(target)) return;
      setContextMenu(null);
    };
    document.addEventListener('keydown', handleKey);
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
      window.clearTimeout(timer);
    };
  }, [contextMenu]);

  const handleItemClick = (app: AppDefinition): void => {
    if (isLaunchpad(app)) {
      toggleLaunchpad();
      return;
    }
    if (isTrash(app)) {
      // Mock: no behaviour for the Trash yet.
      return;
    }
    const focused = windows.find(
      (w) => w.appId === app.id && w.isFocused && !w.isMinimized,
    );
    if (focused) {
      // App is focused and visible — minimize (macOS convention).
      useOSStore.getState().minimizeWindow(focused.id);
      return;
    }
    const existing = windows.find(
      (w) => w.appId === app.id && !w.isMinimized,
    );
    if (existing) {
      focusWindow(existing.id);
      return;
    }
    launchApp(app.id);
  };

  const handleContextMenu = (
    event: ReactMouseEvent<HTMLButtonElement>,
    app: AppDefinition,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ position: { x: event.clientX, y: event.clientY }, appId: app.id });
  };

  const handleMenuAction = (_item: MenuBarMenuItem): void => {
    // Mock options menu — no actions implemented.
    setContextMenu(null);
    void _item;
  };

  const optionsMenu = (app: AppDefinition): MenuBarMenu => ({
    title: app.name,
    items: [
      { label: 'Open' },
      { label: 'Show in Finder', disabled: true },
      { separator: true, label: '' },
      { label: 'Options' },
      { label: 'Remove from Dock' },
    ],
  });

  // Separate apps from Trash for the visual separator.
  let separatorIndex = -1;
  for (let i = 0; i < dockItems.length; i++) {
    const item = dockItems[i];
    if (item && isTrash(item.app)) {
      separatorIndex = i;
      break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="dock"
      role="toolbar"
      aria-label="Dock"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {dockItems.map((entry, index) => {
        const { app, id } = entry;
        const isSeparatorEntry = index === separatorIndex;
        if (isSeparatorEntry) {
          return (
            <div
              key={`sep-${id}`}
              className="dock-item dock-item--separator"
              aria-hidden="true"
            />
          );
        }

        const scale = computeScale(index);
        const isBouncing = bouncingAppIds.includes(app.id);
        const isRunning = running.appIds.has(app.id);
        const isHovered = hoverIndex === index;
        const classes = [
          'dock-item',
          isBouncing ? 'dock-item--bouncing' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const size = DOCK_BASE_SIZE * scale;
        return (
          <button
            key={id}
            ref={(el) => {
              itemRefs.current.set(id, el);
            }}
            type="button"
            className={classes}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transform: `translateY(${scale > 1.05 ? -(size - DOCK_BASE_SIZE) / 2 : 0}px)`,
            }}
            onMouseEnter={() => setHoverIndex(index)}
            onClick={() => handleItemClick(app)}
            onContextMenu={(event) => handleContextMenu(event, app)}
            aria-label={appIconLabel(app)}
            data-app-id={app.id}
          >
            <div className="dock-item__icon">
              <span className="dock-item__icon-emoji" aria-hidden="true">
                {app.icon}
              </span>
            </div>
            {isHovered && (
              <span className="dock-item__tooltip" role="tooltip">
                {appIconLabel(app)}
              </span>
            )}
            {isRunning && (
              <span className="dock-item__indicator" aria-hidden="true" />
            )}
          </button>
        );
      })}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          menu={optionsMenu(apps[contextMenu.appId] ?? {
            id: 'unknown',
            name: 'App',
            icon: '❓',
            category: 'utilities',
            component: () => null,
            canOpenMultiple: false,
            defaultWidth: 320,
            defaultHeight: 240,
          })}
          onClose={() => setContextMenu(null)}
          onItemActivated={handleMenuAction}
        />
      )}
    </div>
  );
}

export default Dock;
