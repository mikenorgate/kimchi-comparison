/**
 * Dock — the macOS Tahoe magnifying dock at the bottom of the desktop.
 *
 * Features:
 * - Liquid Glass surface (glass-surface-bar + dock gradient + dock shadow)
 * - Magnification on hover: icons grow smoothly as the mouse approaches
 * - Running-app indicators (small dot below running apps)
 * - App icons from the app registry (original SVG approximations)
 * - Click to launch/open an app (callback, wired to WindowManager in Step 4)
 * - Bounce animation on click
 * - Trash icon at the right end
 * - Tooltip showing app name on hover
 */

import { useState, useRef, useCallback, type MouseEvent } from 'react';
import { appRegistry, trashIcon, type AppDef } from './appRegistry';

// ── Types ────────────────────────────────────────────────────────

export interface DockProps {
  /** Set of running app IDs (from WindowManager store in Step 4) */
  runningApps?: Set<string>;
  /** Callback when an app icon is clicked */
  onLaunchApp?: (appId: string) => void;
}

// ── Magnification constants ──────────────────────────────────────

const BASE_SIZE = 48; // px — base icon size
const MAGNIFIED_SIZE = 72; // px — fully magnified icon size
const MAGNIFY_RANGE = 80; // px — how far the magnification effect reaches from cursor
const BASE_SCALE = BASE_SIZE / MAGNIFIED_SIZE; // 0.667

/**
 * Compute the scale for an icon based on mouse X position.
 * Icons closer to the cursor get larger, following a cosine curve.
 */
function computeScale(
  iconCenterX: number,
  mouseX: number | null,
): number {
  if (mouseX === null) return BASE_SCALE;
  const distance = Math.abs(iconCenterX - mouseX);
  if (distance > MAGNIFY_RANGE) return BASE_SCALE;
  // Cosine curve: 1.0 at distance=0, BASE_SCALE at distance=MAGNIFY_RANGE
  const t = distance / MAGNIFY_RANGE;
  const magnifyAmount = (Math.cos(t * Math.PI) + 1) / 2; // 0..1
  return BASE_SCALE + (1 - BASE_SCALE) * magnifyAmount;
}

// ── Dock Item ────────────────────────────────────────────────────

interface DockItemProps {
  app: AppDef;
  isRunning: boolean;
  scale: number;
  bounced: boolean;
  onHover: (appId: string | null) => void;
  onClick: (appId: string) => void;
  registerIconRef: (id: string, el: HTMLButtonElement | null) => void;
  showTooltip: boolean;
}

function DockItem({
  app,
  isRunning,
  scale,
  bounced,
  onHover,
  onClick,
  registerIconRef,
  showTooltip,
}: DockItemProps) {
  const Icon = app.icon;

  return (
    <div className="relative flex flex-col items-center justify-end">
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="glass-surface absolute bottom-full mb-2 px-2.5 py-1 rounded-md text-xs whitespace-nowrap text-black/80 dark:text-white/80"
          style={{ zIndex: 950 }}
          data-testid={`dock-tooltip-${app.id}`}
        >
          {app.name}
        </div>
      )}

      <button
        ref={(el) => registerIconRef(app.id, el)}
        className="relative flex items-center justify-center transition-transform"
        style={{
          width: MAGNIFIED_SIZE,
          height: MAGNIFIED_SIZE,
          transform: bounced
            ? `translateY(-20px) scale(${scale})`
            : `scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: bounced
            ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 0.1s ease-out',
        }}
        onMouseEnter={() => onHover(app.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(app.id)}
        data-testid={`dock-icon-${app.id}`}
        aria-label={app.name}
      >
        <Icon className="w-full h-full" />
      </button>

      {/* Running indicator dot */}
      <div
        className="absolute -bottom-1.5 w-1 h-1 rounded-full transition-opacity"
        style={{
          backgroundColor: 'currentColor',
          opacity: isRunning ? 0.8 : 0,
        }}
        data-testid={`dock-indicator-${app.id}`}
      />
    </div>
  );
}

// ── Dock ─────────────────────────────────────────────────────────

export function Dock({ runningApps, onLaunchApp }: DockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [bouncedApp, setBouncedApp] = useState<string | null>(null);
  const iconRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const running = runningApps ?? new Set<string>();

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setHoveredApp(null);
  }, []);

  const handleHover = useCallback((appId: string | null) => {
    setHoveredApp(appId);
  }, []);

  const handleClick = useCallback((appId: string) => {
    // Trigger bounce
    setBouncedApp(appId);
    setTimeout(() => setBouncedApp(null), 400);
    onLaunchApp?.(appId);
  }, [onLaunchApp]);

  const registerIconRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      iconRefs.current.set(id, el);
    } else {
      iconRefs.current.delete(id);
    }
  }, []);

  const getIconCenterX = useCallback((id: string): number => {
    const el = iconRefs.current.get(id);
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }, []);

  const TrashIcon = trashIcon;

  return (
    <div
      id="dock"
      className="glass-surface-bar fixed bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-2 px-3 py-1.5"
      style={{
        zIndex: 900,
        borderRadius: 'var(--radius-dock)',
        boxShadow: 'var(--shadow-dock)',
        backgroundImage: 'var(--gradient-dock-bg)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-testid="dock"
    >
      {appRegistry.map((app) => {
        const scale = computeScale(getIconCenterX(app.id), mouseX);
        const isRunning = running.has(app.id) || app.alwaysRunning === true;

        return (
          <DockItem
            key={app.id}
            app={app}
            isRunning={isRunning}
            scale={scale}
            bounced={bouncedApp === app.id}
            onHover={handleHover}
            onClick={handleClick}
            registerIconRef={registerIconRef}
            showTooltip={hoveredApp === app.id}
          />
        );
      })}

      {/* Divider */}
      <div className="w-px h-10 bg-black/10 dark:bg-white/10 mx-1 self-center" />

      {/* Trash */}
      <div className="relative flex flex-col items-center justify-end">
        <button
          ref={(el) => { if (el) iconRefs.current.set('trash', el); }}
          className="relative flex items-center justify-center transition-transform"
          style={{
            width: MAGNIFIED_SIZE,
            height: MAGNIFIED_SIZE,
            transform: `scale(${computeScale(
              (() => {
                const el = iconRefs.current.get('trash');
                if (!el) return 0;
                const rect = el.getBoundingClientRect();
                return rect.left + rect.width / 2;
              })(),
              mouseX,
            )})`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.1s ease-out',
          }}
          onMouseEnter={() => setHoveredApp('trash')}
          onMouseLeave={() => setHoveredApp(null)}
          data-testid="dock-icon-trash"
          aria-label="Trash"
        >
          <TrashIcon className="w-3/4 h-3/4 text-black/60 dark:text-white/60" />
        </button>
        {hoveredApp === 'trash' && (
          <div
            className="glass-surface absolute bottom-full mb-2 px-2.5 py-1 rounded-md text-xs whitespace-nowrap text-black/80 dark:text-white/80"
            style={{ zIndex: 950 }}
            data-testid="dock-tooltip-trash"
          >
            Trash
          </div>
        )}
      </div>
    </div>
  );
}
