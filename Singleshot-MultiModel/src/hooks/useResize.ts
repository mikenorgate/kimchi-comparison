import { useCallback, useEffect, useRef } from 'react';
import type { DragDelta } from './useDrag';

export type ResizeAnchor = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/**
 * Same shape as `useDrag` but specialised for window resize. The anchor is
 * captured once at hook-setup time; the consumer uses it to interpret the
 * delta in terms of width/height/x/y. The cursor is changed for the duration
 * of the resize to provide visual feedback and reverted on release.
 */
export function useResize(
  anchor: ResizeAnchor,
  onResize: (delta: DragDelta) => void,
): { startResize: (e: PointerEvent | React.PointerEvent) => void } {
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const startResize = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      if (e && typeof e.stopPropagation === 'function') {
        // Don't let the drag-handler also pick this up.
        e.stopPropagation();
      }
      let lastX = e.clientX;
      let lastY = e.clientY;
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = cursorForAnchor(anchor);

      const handleMove = (ev: PointerEvent) => {
        const dx = ev.clientX - lastX;
        const dy = ev.clientY - lastY;
        lastX = ev.clientX;
        lastY = ev.clientY;
        onResizeRef.current({ dx, dy });
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
        document.body.style.cursor = previousCursor;
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
    },
    [anchor],
  );

  return { startResize };
}

function cursorForAnchor(anchor: ResizeAnchor): string {
  switch (anchor) {
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    default:
      return 'default';
  }
}
