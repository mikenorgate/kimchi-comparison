import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';

import { useOSStore } from '../store/osStore';
import type { DesktopIcon as DesktopIconType } from '../types/os';
import { ContextMenu } from './ui/ContextMenu';
import type { MenuBarMenuItem } from '../types/os';

interface DragState {
  iconId: string;
  /** Pointer offset from icon's top-left at drag start, in pixels. */
  offsetX: number;
  offsetY: number;
  /** Latest pointer position, used during drag for live position updates. */
  pointerX: number;
  pointerY: number;
}

interface ContextMenuState {
  /** Pixel coordinates inside the desktop area. */
  x: number;
  y: number;
  /** The icon that was right-clicked, if any. */
  iconId: string | null;
}

const ICON_WIDTH = 80;
const ICON_HEIGHT = 84;
const DESKTOP_EDGE_PADDING = 8;

function clampIconPosition(
  x: number,
  y: number,
  desktopWidth: number,
  desktopHeight: number,
): { x: number; y: number } {
  const maxX = Math.max(DESKTOP_EDGE_PADDING, desktopWidth - ICON_WIDTH - DESKTOP_EDGE_PADDING);
  const maxY = Math.max(DESKTOP_EDGE_PADDING, desktopHeight - ICON_HEIGHT - DESKTOP_EDGE_PADDING);
  return {
    x: Math.min(Math.max(x, DESKTOP_EDGE_PADDING), maxX),
    y: Math.min(Math.max(y, DESKTOP_EDGE_PADDING), maxY),
  };
}

function nextIconId(): string {
  return `desktop-icon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * The wallpaper area + draggable desktop icons. Double-clicking an icon
 * launches the associated app via the store; right-click opens a context
 * menu with New Folder / Get Info / Change Wallpaper actions.
 */
export function Desktop(): JSX.Element {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const icons = useOSStore((state) => state.desktopIcons);
  const launchApp = useOSStore((state) => state.launchApp);
  const setWallpaper = useOSStore((state) => state.setWallpaper);
  const wallpaper = useOSStore((state) => state.wallpaper);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [editingIconId, setEditingIconId] = useState<string | null>(null);
  const iconPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Update icon position in store during drag.
  useEffect(() => {
    if (!dragState) return;
    const handlePointerMove = (event: PointerEvent): void => {
      if (!desktopRef.current) return;
      const rect = desktopRef.current.getBoundingClientRect();
      const targetX = event.clientX - rect.left - dragState.offsetX;
      const targetY = event.clientY - rect.top - dragState.offsetY;
      const clamped = clampIconPosition(targetX, targetY, rect.width, rect.height);
      iconPositionsRef.current.set(dragState.iconId, clamped);
      // Trigger re-render with new positions via setState.
      setDragState((current) =>
        current
          ? { ...current, pointerX: event.clientX, pointerY: event.clientY }
          : current,
      );
      // Commit to store every move so layout reflects current drag position.
      useOSStore.setState((state) => ({
        desktopIcons: state.desktopIcons.map((icon) =>
          icon.id === dragState.iconId ? { ...icon, ...clamped } : icon,
        ),
      }));
    };
    const handlePointerUp = (): void => {
      setDragState(null);
    };
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState]);

  // Close context menu on Escape / outside clicks.
  useEffect(() => {
    if (!contextMenu) return;
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setContextMenu(null);
      }
    };
    const handleClick = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;
      if (
        desktopRef.current &&
        target &&
        !desktopRef.current.contains(target)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    // Delay so the right-click that opened the menu doesn't immediately close it.
    const timerId = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
      window.clearTimeout(timerId);
    };
  }, [contextMenu]);

  const handleIconPointerDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>, icon: DesktopIconType) => {
      // Only left mouse button starts a drag.
      if (event.button !== 0) return;
      const target = event.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      setSelectedIconId(icon.id);
      setDragState({
        iconId: icon.id,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        pointerX: event.clientX,
        pointerY: event.clientY,
      });
    },
    [],
  );

  const handleIconDoubleClick = useCallback(
    (icon: DesktopIconType) => {
      if (icon.appId) {
        launchApp(icon.appId);
        setSelectedIconId(null);
      }
    },
    [launchApp],
  );

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>, icon: DesktopIconType | null) => {
      event.preventDefault();
      event.stopPropagation();
      if (icon) {
        setSelectedIconId(icon.id);
      }
      setContextMenu({ x: event.clientX, y: event.clientY, iconId: icon?.id ?? null });
    },
    [],
  );

  const handleDesktopClick = useCallback(() => {
    setSelectedIconId(null);
  }, []);

  const handleMenuAction = useCallback(
    (item: MenuBarMenuItem) => {
      if (item.separator || item.disabled) return;
      switch (item.label) {
        case 'New Folder': {
          const desktopRect = desktopRef.current?.getBoundingClientRect();
          const fallback = icons.length;
          const targetIcon = icons.find((i) => i.id === contextMenu?.iconId);
          const baseX = targetIcon ? targetIcon.x + 24 : 24 + fallback * 8;
          const baseY = targetIcon ? targetIcon.y + 88 : 40 + fallback * 16;
          const clamped = desktopRect
            ? clampIconPosition(baseX, baseY, desktopRect.width, desktopRect.height)
            : { x: baseX, y: baseY };
          useOSStore.setState((state) => ({
            desktopIcons: [
              ...state.desktopIcons,
              {
                id: nextIconId(),
                label: 'untitled folder',
                icon: '📁',
                x: clamped.x,
                y: clamped.y,
              },
            ],
          }));
          setEditingIconId(useOSStore.getState().desktopIcons.slice(-1)[0]?.id ?? null);
          break;
        }
        case 'Get Info': {
          // No-op for mock: in a real desktop we'd open a Finder info panel.
          console.info('[Desktop] Get Info', contextMenu?.iconId);
          break;
        }
        case 'Change Wallpaper…': {
          // Cycle between known wallpaper presets.
          const presets = ['wallpaper', 'wave', 'sunset', 'forest'];
          const idx = presets.indexOf(wallpaper);
          const next = presets[(idx + 1) % presets.length] ?? 'wallpaper';
          setWallpaper(next);
          break;
        }
        default:
          break;
      }
      setContextMenu(null);
    },
    [contextMenu, icons, setWallpaper, wallpaper],
  );

  const contextMenuForRender = contextMenu
    ? {
        position: { x: contextMenu.x, y: contextMenu.y },
        menu: {
          title: 'Desktop',
          items: [
            { label: 'New Folder' },
            { separator: true, label: '' },
            { label: 'Get Info' },
            { label: 'Change Wallpaper…' },
          ],
        },
      }
    : null;

  return (
    <div
      ref={desktopRef}
      className="os-desktop"
      onClick={handleDesktopClick}
      onContextMenu={(event) => handleContextMenu(event, null)}
    >
      {icons.map((icon) => {
        const isDragging = dragState?.iconId === icon.id;
        const isSelected = selectedIconId === icon.id;
        const isEditing = editingIconId === icon.id;
        const classes = [
          'desktop-icon',
          isSelected ? 'desktop-icon--selected' : '',
          isDragging ? 'desktop-icon--dragging' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const style: CSSProperties = {
          left: `${icon.x}px`,
          top: `${icon.y}px`,
        };
        return (
          <div
            key={icon.id}
            className={classes}
            style={style}
            onPointerDown={(event) => handleIconPointerDown(event, icon)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onContextMenu={(event) => handleContextMenu(event, icon)}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedIconId(icon.id);
            }}
            data-icon-id={icon.id}
          >
            <div className="desktop-icon__glyph" aria-hidden="true">
              {icon.icon}
            </div>
            {isEditing ? (
              <input
                autoFocus
                defaultValue={icon.label}
                className="desktop-icon__label"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  color: '#000',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  textAlign: 'center',
                  width: '100%',
                  borderRadius: 3,
                  padding: '1px 4px',
                }}
                onBlur={(event) => {
                  const next = event.target.value.trim() || icon.label;
                  useOSStore.setState((state) => ({
                    desktopIcons: state.desktopIcons.map((i) =>
                      i.id === icon.id ? { ...i, label: next } : i,
                    ),
                  }));
                  setEditingIconId(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    (event.target as HTMLInputElement).blur();
                  } else if (event.key === 'Escape') {
                    setEditingIconId(null);
                  }
                }}
              />
            ) : (
              <span className="desktop-icon__label">{icon.label}</span>
            )}
          </div>
        );
      })}
      {contextMenuForRender && (
        <ContextMenu
          position={contextMenuForRender.position}
          menu={contextMenuForRender.menu}
          onClose={() => setContextMenu(null)}
          onItemActivated={handleMenuAction}
        />
      )}
    </div>
  );
}

export default Desktop;
