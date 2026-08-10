import type { ResizeAnchor } from '../hooks/useResize';

export interface ResizeHandleProps {
  position: ResizeAnchor;
  windowId?: string;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const HANDLE_SIZE = 8;

const POSITION_STYLES: Record<ResizeAnchor, React.CSSProperties> = {
  n: { top: 0, left: 0, right: 0, height: HANDLE_SIZE, cursor: 'ns-resize' },
  s: { bottom: 0, left: 0, right: 0, height: HANDLE_SIZE, cursor: 'ns-resize' },
  e: { top: 0, right: 0, bottom: 0, width: HANDLE_SIZE, cursor: 'ew-resize' },
  w: { top: 0, left: 0, bottom: 0, width: HANDLE_SIZE, cursor: 'ew-resize' },
  ne: { top: 0, right: 0, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'nesw-resize' },
  nw: { top: 0, left: 0, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'nwse-resize' },
  se: { bottom: 0, right: 0, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'nwse-resize' },
  sw: { bottom: 0, left: 0, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'nesw-resize' },
};

/**
 * Single directional resize handle. Visual rendering only — the parent
 * wires the pointer-down to a resize hook.
 */
export default function ResizeHandle({
  position,
  windowId,
  onPointerDown,
}: ResizeHandleProps) {
  const testId = windowId ? `resize-${position}-${windowId}` : `resize-${position}`;
  return (
    <div
      data-testid={testId}
      data-resize-anchor={position}
      onPointerDown={onPointerDown}
      style={{ position: 'absolute', ...POSITION_STYLES[position] }}
    />
  );
}
