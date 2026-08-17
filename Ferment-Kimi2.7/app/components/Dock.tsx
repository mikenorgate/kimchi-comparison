'use client';

import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  Folder,
  Compass,
  StickyNote,
  Terminal,
  Settings,
  Calculator,
  Calendar,
  Clock,
  Image,
  Music,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { useShell } from '@/app/lib/shellContext';
import { APPS } from '@/app/lib/apps';
import type { AppId } from '@/app/lib/types';

const ICONS: Record<AppId, LucideIcon> = {
  finder: Folder,
  safari: Compass,
  notes: StickyNote,
  terminal: Terminal,
  settings: Settings,
  calculator: Calculator,
  calendar: Calendar,
  clock: Clock,
  photos: Image,
  music: Music,
};

function useMagnification(itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const scales = useMemo(() => {
    if (mouseX === null || !containerRef.current) {
      return Array(itemCount).fill(1);
    }
    const rect = containerRef.current.getBoundingClientRect();
    const gap = 12;
    const baseSize = 48;
    const totalItemWidth = baseSize + gap;
    const totalWidth = itemCount * totalItemWidth - gap;
    const start = (rect.width - totalWidth) / 2;
    return Array.from({ length: itemCount }, (_, i) => {
      const center = start + i * totalItemWidth + baseSize / 2;
      const distance = Math.abs(mouseX - center);
      const maxScale = 1.55;
      const sigma = 90;
      const scale = 1 + (maxScale - 1) * Math.exp(-(distance * distance) / (2 * sigma * sigma));
      return Math.min(maxScale, Math.max(1, scale));
    });
  }, [mouseX, itemCount]);

  return { containerRef, scales, handleMouseMove, handleMouseLeave };
}

export function Dock() {
  const { state, openApp, activeAppId, toggleSpaces } = useShell();
  const [bouncing, setBouncing] = useState<Set<AppId>>(new Set());
  const { containerRef, scales, handleMouseMove, handleMouseLeave } = useMagnification(
    state.dockItems.length
  );

  const handleLaunch = useCallback(
    (appId: AppId) => {
      setBouncing((prev) => new Set(prev).add(appId));
      window.setTimeout(() => {
        setBouncing((prev) => {
          const next = new Set(prev);
          next.delete(appId);
          return next;
        });
      }, 600);
      openApp(appId);
    },
    [openApp]
  );

  return (
    <div
      data-testid="dock"
      className="glass fixed bottom-2 left-1/2 z-[9000] -translate-x-1/2 rounded-2xl px-3 py-2"
      style={{
        background: 'var(--dock-bg)',
        border: '1px solid var(--menubar-border)',
      }}
    >
      <div
        ref={containerRef}
        className="flex items-end gap-3"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {state.dockItems.map((appId, index) => {
          const AppIcon = ICONS[appId];
          const isBouncing = bouncing.has(appId);
          const isActive = activeAppId === appId;
          const scale = scales[index] ?? 1;
          return (
            <button
              key={appId}
              data-testid={`dock-${appId}`}
              aria-label={APPS[appId].name}
              onClick={() => handleLaunch(appId)}
              className={`group relative flex flex-col items-center justify-end transition-transform duration-200 ease-out ${
                isBouncing ? 'dock-bounce' : ''
              }`}
              style={{
                width: 48,
                height: 48,
                transform: `scale(${scale})`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-white/60 shadow-sm dark:from-white/20 dark:to-white/10">
                <AppIcon className="h-6 w-6 text-foreground" />
              </div>
              <span className="pointer-events-none absolute -top-8 rounded-md bg-black/80 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {APPS[appId].name}
              </span>
              {isActive && (
                <span
                  data-testid={`dock-dot-${appId}`}
                  className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-foreground/70"
                />
              )}
            </button>
          );
        })}
        <div className="mx-1 h-10 w-px bg-foreground/20" />
        <button
          data-testid="dock-mission-control"
          aria-label="Mission Control"
          onClick={toggleSpaces}
          className="group relative flex flex-col items-center justify-end"
          style={{ width: 48, height: 48 }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-white/60 shadow-sm dark:from-white/20 dark:to-white/10">
            <LayoutGrid className="h-6 w-6 text-foreground" />
          </div>
          <span className="pointer-events-none absolute -top-8 rounded-md bg-black/80 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            Mission Control
          </span>
        </button>
      </div>
    </div>
  );
}
