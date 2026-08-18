"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

/**
 * Position of the window's top-left corner, expressed in viewport
 * (i.e. `position: absolute` parent) pixels.
 */
export interface WindowPosition {
  readonly x: number;
  readonly y: number;
}

/** Window dimensions in CSS pixels. */
export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

/** Cardinal or diagonal edge a resize handle controls. */
export type ResizeDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

/** Minimum sensible width for a desktop window. */
const DEFAULT_MIN_WIDTH = 240;
/** Minimum sensible height for a desktop window. */
const DEFAULT_MIN_HEIGHT = 160;
/** Approximate title bar height used when calculating top-edge bounds. */
const DEFAULT_TITLE_BAR_HEIGHT = 28;
/** Minimum px of the title bar that must remain visible when pulled above 0. */
const MIN_TITLE_BAR_VISIBLE = 24;
/** Minimum px of the window kept on-screen when dragged past a side edge. */
const MIN_WINDOW_VISIBLE = 60;
/** Minimum px of the window kept above the bottom edge. */
const MIN_BOTTOM_VISIBLE = 24;

const ALL_DIRECTIONS: readonly ResizeDirection[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
];

export interface UseWindowGeometryOptions {
  /** Initial top-left position. Defaults to a centred-ish start. */
  readonly initialPosition?: WindowPosition;
  /** Initial size. Defaults to an 800x500 desktop window. */
  readonly initialSize?: WindowSize;
  /** Minimum width enforced on resize and on `setSize`. */
  readonly minWidth?: number;
  /** Minimum height enforced on resize and on `setSize`. */
  readonly minHeight?: number;
  /**
   * Title bar height used to clamp the window when it is dragged above
   * the top of the viewport — at least `MIN_TITLE_BAR_VISIBLE` px of
   * the title bar will stay grabbable.
   */
  readonly titleBarHeight?: number;
  /**
   * Optional ref to the element that defines the available viewport
   * for bounds checking. When omitted, `window.innerWidth` /
   * `window.innerHeight` are used, which matches the desktop root.
   */
  readonly viewportRef?: RefObject<HTMLElement>;
  /** Fired after each position update (drag or programmatic). */
  readonly onPositionChange?: (position: WindowPosition) => void;
  /** Fired after each size update (resize or programmatic). */
  readonly onSizeChange?: (size: WindowSize) => void;
}

export interface ResizeHandleProps {
  readonly onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  readonly style: CSSProperties;
  readonly "data-resize-handle": ResizeDirection;
  readonly "aria-label": string;
  readonly role: string;
}

export interface TitleBarProps {
  readonly onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  readonly style: CSSProperties;
}

export interface UseWindowGeometryResult {
  /** Current top-left position. */
  readonly position: WindowPosition;
  /** Current size. */
  readonly size: WindowSize;
  /** True while a drag-to-move gesture is in progress. */
  readonly isDragging: boolean;
  /** True while a resize gesture is in progress. */
  readonly isResizing: boolean;
  /** Imperative, bounds-clamped position setter. */
  readonly setPosition: (next: WindowPosition) => void;
  /** Imperative, bounds-clamped size setter. */
  readonly setSize: (next: WindowSize) => void;
  /**
   * Ref the Window frame should attach to the draggable title bar
   * element. Optional — the handlers also work when applied via
   * `titleBarProps`.
   */
  readonly titleBarRef: RefObject<HTMLDivElement>;
  /** Spread onto the title bar element to enable dragging. */
  readonly titleBarProps: TitleBarProps;
  /** Refs to each of the eight resize handles. */
  readonly resizeHandleRefs: {
    readonly n: RefObject<HTMLDivElement>;
    readonly s: RefObject<HTMLDivElement>;
    readonly e: RefObject<HTMLDivElement>;
    readonly w: RefObject<HTMLDivElement>;
    readonly ne: RefObject<HTMLDivElement>;
    readonly nw: RefObject<HTMLDivElement>;
    readonly se: RefObject<HTMLDivElement>;
    readonly sw: RefObject<HTMLDivElement>;
  };
  /** Handlers + cursor styles for each of the eight resize handles. */
  readonly resizeHandleProps: Record<ResizeDirection, ResizeHandleProps>;
  /**
   * Convenience cursor string the consumer can apply to the body of
   * the window while a gesture is in progress.
   */
  readonly cursor: string;
}

interface DragSession {
  readonly pointerId: number;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly originX: number;
  readonly originY: number;
  readonly target: HTMLElement;
}

interface ResizeSession {
  readonly pointerId: number;
  readonly direction: ResizeDirection;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly originX: number;
  readonly originY: number;
  readonly originWidth: number;
  readonly originHeight: number;
  readonly target: HTMLElement;
}

interface PositionBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

interface SizeBounds {
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly minHeight: number;
  readonly maxHeight: number;
}

function getViewport(viewportRef?: RefObject<HTMLElement>): {
  width: number;
  height: number;
} {
  if (viewportRef?.current) {
    const rect = viewportRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }
  if (typeof window !== "undefined") {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 1024, height: 768 };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (min > max) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function resizeCursorFor(direction: ResizeDirection): string {
  switch (direction) {
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "nw":
    case "se":
      return "nwse-resize";
  }
}

/**
 * Drag-to-move + 8-way resize geometry hook for the desktop windows.
 *
 * The hook owns `position` and `size` state and exposes pointer-event
 * handlers + refs that the {@link Window} frame will wire up in the
 * next phase. All pointer events use the unified Pointer Events API so
 * the same code path drives mouse, pen, and touch input.
 *
 * Bounds:
 * - position is clamped so at least {@link MIN_WINDOW_VISIBLE} px of
 *   the window stays on-screen on the left/right and at least
 *   {@link MIN_BOTTOM_VISIBLE} px above the bottom edge.
 * - the top edge allows the window to be pulled up until only
 *   {@link MIN_TITLE_BAR_VISIBLE} px of the title bar remains visible
 *   — this matches macOS, which lets a window "shove" itself off the
 *   top as long as you can still grab it.
 * - size is clamped between `minWidth`/`minHeight` and the viewport's
 *   width/height on every pointer move.
 *
 * The hook is intentionally framework-agnostic beyond React itself:
 * it has no DOM knowledge beyond reading the optional viewport ref.
 */
export default function useWindowGeometry(
  options: UseWindowGeometryOptions = {}
): UseWindowGeometryResult {
  const {
    initialPosition = { x: 80, y: 60 },
    initialSize = { width: 800, height: 500 },
    minWidth = DEFAULT_MIN_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    titleBarHeight = DEFAULT_TITLE_BAR_HEIGHT,
    viewportRef,
    onPositionChange,
    onSizeChange,
  } = options;

  const [position, setPositionState] = useState<WindowPosition>(initialPosition);
  const [size, setSizeState] = useState<WindowSize>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const titleBarRef = useRef<HTMLDivElement>(null);
  const nHandleRef = useRef<HTMLDivElement>(null);
  const sHandleRef = useRef<HTMLDivElement>(null);
  const eHandleRef = useRef<HTMLDivElement>(null);
  const wHandleRef = useRef<HTMLDivElement>(null);
  const neHandleRef = useRef<HTMLDivElement>(null);
  const nwHandleRef = useRef<HTMLDivElement>(null);
  const seHandleRef = useRef<HTMLDivElement>(null);
  const swHandleRef = useRef<HTMLDivElement>(null);

  const dragSession = useRef<DragSession | null>(null);
  const resizeSession = useRef<ResizeSession | null>(null);

  // Keep latest values readable inside long-lived window listeners
  // without forcing those effects to re-bind on every state change.
  const sizeRef = useRef(size);
  const positionRef = useRef(position);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Bounds calculators --------------------------------------------------

  const computePositionBounds = useCallback(
    (currentSize: WindowSize): PositionBounds => {
      const vp = getViewport(viewportRef);
      return {
        minX: -(currentSize.width - MIN_WINDOW_VISIBLE),
        maxX: vp.width - MIN_WINDOW_VISIBLE,
        minY: -(titleBarHeight - MIN_TITLE_BAR_VISIBLE),
        maxY: vp.height - MIN_BOTTOM_VISIBLE,
      };
    },
    [viewportRef, titleBarHeight]
  );

  const computeSizeBounds = useCallback(
    (currentSize: WindowSize): SizeBounds => {
      const vp = getViewport(viewportRef);
      return {
        minWidth: Math.min(minWidth, currentSize.width, vp.width),
        maxWidth: Math.max(minWidth, vp.width),
        minHeight: Math.min(minHeight, currentSize.height, vp.height),
        maxHeight: Math.max(minHeight, vp.height),
      };
    },
    [viewportRef, minWidth, minHeight]
  );

  // Imperative setters (clamped) ----------------------------------------

  const setPosition = useCallback(
    (next: WindowPosition) => {
      setPositionState((prev) => {
        const bounds = computePositionBounds(sizeRef.current);
        const clamped: WindowPosition = {
          x: clamp(next.x, bounds.minX, bounds.maxX),
          y: clamp(next.y, bounds.minY, bounds.maxY),
        };
        if (clamped.x === prev.x && clamped.y === prev.y) return prev;
        return clamped;
      });
    },
    [computePositionBounds]
  );

  const setSize = useCallback(
    (next: WindowSize) => {
      setSizeState((prev) => {
        const bounds = computeSizeBounds(prev);
        const clamped: WindowSize = {
          width: clamp(next.width, bounds.minWidth, bounds.maxWidth),
          height: clamp(next.height, bounds.minHeight, bounds.maxHeight),
        };
        if (clamped.width === prev.width && clamped.height === prev.height) {
          return prev;
        }
        return clamped;
      });
    },
    [computeSizeBounds]
  );

  // Drag listeners ------------------------------------------------------

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (event: PointerEvent) => {
      const session = dragSession.current;
      if (!session || event.pointerId !== session.pointerId) return;
      const dx = event.clientX - session.startClientX;
      const dy = event.clientY - session.startClientY;
      const currentSize = sizeRef.current;
      const bounds = computePositionBounds(currentSize);
      setPositionState((prev) => {
        const next: WindowPosition = {
          x: clamp(session.originX + dx, bounds.minX, bounds.maxX),
          y: clamp(session.originY + dy, bounds.minY, bounds.maxY),
        };
        if (next.x === prev.x && next.y === prev.y) return prev;
        return next;
      });
    };

    const endDrag = (event: PointerEvent) => {
      const session = dragSession.current;
      if (!session || event.pointerId !== session.pointerId) return;
      try {
        session.target.releasePointerCapture(session.pointerId);
      } catch {
        // pointer capture is best-effort
      }
      dragSession.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [isDragging, computePositionBounds]);

  // Resize listeners ----------------------------------------------------

  useEffect(() => {
    if (!isResizing) return;

    const onMove = (event: PointerEvent) => {
      const session = resizeSession.current;
      if (!session || event.pointerId !== session.pointerId) return;
      const dx = event.clientX - session.startClientX;
      const dy = event.clientY - session.startClientY;

      let newX = session.originX;
      let newY = session.originY;
      let newW = session.originWidth;
      let newH = session.originHeight;

      if (session.direction.includes("e")) {
        newW = session.originWidth + dx;
      }
      if (session.direction.includes("w")) {
        newW = session.originWidth - dx;
        newX = session.originX + dx;
      }
      if (session.direction.includes("s")) {
        newH = session.originHeight + dy;
      }
      if (session.direction.includes("n")) {
        newH = session.originHeight - dy;
        newY = session.originY + dy;
      }

      // Clamp size against viewport + min/max. Use the original size so
      // a negative tentative dimension cannot corrupt the lower bound.
      const sizeBounds = computeSizeBounds(sizeRef.current);
      const clampedW = clamp(newW, sizeBounds.minWidth, sizeBounds.maxWidth);
      const clampedH = clamp(newH, sizeBounds.minHeight, sizeBounds.maxHeight);

      // When the dragged edge is clamped (at min or viewport max),
      // re-anchor the opposite edge so the window snaps instead of
      // tearing away from the user's intent.
      if (clampedW !== newW) {
        if (session.direction.includes("w")) {
          newX = session.originX + (session.originWidth - clampedW);
        }
        newW = clampedW;
      }
      if (clampedH !== newH) {
        if (session.direction.includes("n")) {
          newY = session.originY + (session.originHeight - clampedH);
        }
        newH = clampedH;
      }

      // Final position clamp against the freshly resized dimensions
      const posBounds = computePositionBounds({ width: newW, height: newH });
      newX = clamp(newX, posBounds.minX, posBounds.maxX);
      newY = clamp(newY, posBounds.minY, posBounds.maxY);

      setPositionState((prev) => {
        if (prev.x === newX && prev.y === newY) return prev;
        return { x: newX, y: newY };
      });
      setSizeState((prev) => {
        if (prev.width === newW && prev.height === newH) return prev;
        return { width: newW, height: newH };
      });
    };

    const endResize = (event: PointerEvent) => {
      const session = resizeSession.current;
      if (!session || event.pointerId !== session.pointerId) return;
      try {
        session.target.releasePointerCapture(session.pointerId);
      } catch {
        // ignore
      }
      resizeSession.current = null;
      setIsResizing(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endResize);
    window.addEventListener("pointercancel", endResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endResize);
      window.removeEventListener("pointercancel", endResize);
    };
  }, [isResizing, computePositionBounds, computeSizeBounds]);

  // External change notifications --------------------------------------

  useEffect(() => {
    onPositionChange?.(position);
  }, [position, onPositionChange]);
  useEffect(() => {
    onSizeChange?.(size);
  }, [size, onSizeChange]);

  // Title bar props -----------------------------------------------------

  const titleBarProps = useMemo<TitleBarProps>(() => {
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        const target = event.currentTarget;
        try {
          target.setPointerCapture(event.pointerId);
        } catch {
          // pointer capture is best-effort in jsdom-style environments
        }
        dragSession.current = {
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          originX: positionRef.current.x,
          originY: positionRef.current.y,
          target,
        };
        setIsDragging(true);
        event.preventDefault();
        event.stopPropagation();
      },
      style: { cursor: isDragging ? "grabbing" : "grab" },
    };
  }, [isDragging]);

  // Resize handle props -------------------------------------------------

  const makeHandleProps = useCallback(
    (direction: ResizeDirection): ResizeHandleProps => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        const target = event.currentTarget;
        try {
          target.setPointerCapture(event.pointerId);
        } catch {
          // ignore
        }
        resizeSession.current = {
          pointerId: event.pointerId,
          direction,
          startClientX: event.clientX,
          startClientY: event.clientY,
          originX: positionRef.current.x,
          originY: positionRef.current.y,
          originWidth: sizeRef.current.width,
          originHeight: sizeRef.current.height,
          target,
        };
        setIsResizing(true);
        event.preventDefault();
        event.stopPropagation();
      },
      style: { cursor: resizeCursorFor(direction) },
      "data-resize-handle": direction,
      "aria-label": `Resize ${direction.toUpperCase()}`,
      role: "separator",
    }),
    []
  );

  const resizeHandleProps = useMemo(() => {
    const result = {} as Record<ResizeDirection, ResizeHandleProps>;
    for (const dir of ALL_DIRECTIONS) {
      result[dir] = makeHandleProps(dir);
    }
    return result;
  }, [makeHandleProps]);

  const cursor = isResizing
    ? resizeCursorFor("se")
    : isDragging
    ? "grabbing"
    : "default";

  return {
    position,
    size,
    isDragging,
    isResizing,
    setPosition,
    setSize,
    titleBarRef,
    titleBarProps,
    resizeHandleRefs: {
      n: nHandleRef,
      s: sHandleRef,
      e: eHandleRef,
      w: wHandleRef,
      ne: neHandleRef,
      nw: nwHandleRef,
      se: seHandleRef,
      sw: swHandleRef,
    },
    resizeHandleProps,
    cursor,
  };
}
