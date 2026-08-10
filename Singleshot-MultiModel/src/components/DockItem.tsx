import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';

interface DockItemProps {
  appId: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  size: number;
  magnificationEnabled: boolean;
  magnificationFactor: number;
  isRunning: boolean;
  isBouncing: boolean;
  onActivate: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  /** Horizontal index of the icon; used to compute proximity for magnification. */
  index: number;
  total: number;
}

/**
 * Individual dock icon. Owns a magnification scale factor derived from the
 * current pointer distance (computed by the parent Dock and passed down).
 * Also triggers a bounce animation when `isBouncing` flips true.
 */
export default function DockItem({
  appId,
  icon: Icon,
  label,
  size,
  magnificationEnabled,
  magnificationFactor,
  isRunning,
  isBouncing,
  onActivate,
  onContextMenu,
  index,
  total,
}: DockItemProps) {
  const tooltipTimerRef = useRef<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  // DockItem receives a 0..1 magnification factor from the parent Dock. The
  // factor is already squared for falloff, so here we simply interpolate
  // between the base size and the boosted size.
  const maxSize = size * 1.6;
  const computedSize = magnificationEnabled
    ? size + (maxSize - size) * magnificationFactor
    : size;
  const finalSize = Math.max(size, Math.min(maxSize, computedSize));

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current !== null) {
        window.clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  const handleEnter = () => {
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
    }
    tooltipTimerRef.current = window.setTimeout(() => setTooltipVisible(true), 350);
  };
  const handleLeave = () => {
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setTooltipVisible(false);
  };

  return (
    <div
      data-testid={`dock-item-${appId}`}
      data-magnification={magnificationFactor.toFixed(2)}
      data-index={index}
      data-total={total}
      className="group relative flex flex-col items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu(event);
      }}
    >
      {tooltipVisible && (
        <div
          data-testid={`dock-tooltip-${appId}`}
          className="pointer-events-none absolute -top-9 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white shadow"
        >
          {label}
        </div>
      )}
      <button
        type="button"
        aria-label={label}
        onClick={onActivate}
        style={{ width: finalSize, height: finalSize }}
        className={
          'dock-icon-btn relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-white/40 to-white/5 p-2 shadow-lg ring-1 ring-white/10 transition-transform duration-150 ease-out ' +
          (isBouncing ? 'dock-bounce ' : '')
        }
      >
        <Icon className="h-full w-full text-white drop-shadow" />
      </button>
      {isRunning && (
        <span
          data-testid={`dock-running-${appId}`}
          className="mt-1 h-1 w-1 rounded-full bg-white/90 shadow"
        />
      )}
    </div>
  );
}
