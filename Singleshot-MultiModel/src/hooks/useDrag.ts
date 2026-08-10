import { useCallback, useEffect, useRef } from 'react';

export interface DragDelta {
  dx: number;
  dy: number;
}

/**
 * Attach to a pointer-down event to start a drag. While the pointer is down,
 * the supplied `onMove` is invoked with incremental pixel deltas (the change
 * since the previous move event). `onEnd`, if provided, fires once when the
 * pointer is released or cancelled.
 *
 * Listeners are attached to `window` so the drag continues even if the
 * pointer leaves the original element. The callback identity is captured via
 * a ref so re-renders during a drag always invoke the latest closure.
 */
export function useDrag(
  onMove: (delta: DragDelta) => void,
  onEnd?: () => void,
): { startDrag: (e: PointerEvent | React.PointerEvent) => void } {
  const onMoveRef = useRef(onMove);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onMoveRef.current = onMove;
    onEndRef.current = onEnd;
  }, [onMove, onEnd]);

  const startDrag = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    let lastX = e.clientX;
    let lastY = e.clientY;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;
      onMoveRef.current({ dx, dy });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      onEndRef.current?.();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  }, []);

  return { startDrag };
}
