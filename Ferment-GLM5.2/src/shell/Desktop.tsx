/**
 * Desktop — the root shell component for the macOS Tahoe web recreation.
 *
 * Renders the full-screen `.desktop` layer with the active wallpaper
 * from the settings store. Calls `useApplyAppearance()` to sync appearance
 * classes (light/dark/tinted, reduce-transparency) onto `<html>`.
 *
 * Mounts MenuBar, Dock, WindowManager, and system panels
 * (Spotlight, Control Center, Notification Center) inside this component.
 * Panel visibility state lives here so MenuBar icons and keyboard shortcuts
 * can toggle them.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSettingsStore, useApplyAppearance } from '@/store/settings';
import { getWallpaper } from './wallpapers';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { WindowManager } from './WindowManager';
import { Spotlight } from './Spotlight';
import { ControlCenter } from './ControlCenter';
import { NotificationCenter } from './NotificationCenter';
import { useWindowStore } from '@/store/windows';

export function Desktop() {
  useApplyAppearance();

  const wallpaperId = useSettingsStore((s) => s.wallpaper);
  const wallpaper = getWallpaper(wallpaperId);

  const openWindow = useWindowStore((s) => s.openWindow);
  const getRunningApps = useWindowStore((s) => s.getRunningApps);
  const windows = useWindowStore((s) => s.windows);
  const currentSpace = useWindowStore((s) => s.currentSpace);

  // Panel visibility state
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Toggle a panel, closing others first
  const toggleSpotlight = useCallback(() => {
    setControlCenterOpen(false);
    setNotificationCenterOpen(false);
    setSpotlightOpen((v) => !v);
  }, []);

  const toggleControlCenter = useCallback(() => {
    setSpotlightOpen(false);
    setNotificationCenterOpen(false);
    setControlCenterOpen((v) => !v);
  }, []);

  const toggleNotificationCenter = useCallback(() => {
    setSpotlightOpen(false);
    setControlCenterOpen(false);
    setNotificationCenterOpen((v) => !v);
  }, []);

  // Cmd+Space toggles Spotlight
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Check both e.code and e.key for cross-browser/Playwright compatibility
      const isSpace = e.code === 'Space' || e.key === ' ';
      if (e.metaKey && isSpace) {
        e.preventDefault();
        e.stopPropagation();
        toggleSpotlight();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSpotlight]);

  // Recompute running apps when windows/space changes
  const runningApps = getRunningApps();
  // Touch windows/currentSpace to trigger re-render on change
  void windows;
  void currentSpace;

  const handleLaunchApp = (appId: string) => {
    openWindow(appId);
  };

  return (
    <div
      className="desktop relative h-full w-full overflow-hidden"
      data-testid="desktop"
      style={{ background: wallpaper.css, backgroundSize: 'cover' }}
    >
      <MenuBar
        onSpotlightClick={toggleSpotlight}
        onControlCenterClick={toggleControlCenter}
        onNotificationCenterClick={toggleNotificationCenter}
      />
      <WindowManager />
      <Dock runningApps={runningApps} onLaunchApp={handleLaunchApp} />
      <Spotlight isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <ControlCenter isOpen={controlCenterOpen} onClose={() => setControlCenterOpen(false)} />
      <NotificationCenter isOpen={notificationCenterOpen} onClose={() => setNotificationCenterOpen(false)} />
    </div>
  );
}
