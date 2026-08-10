/**
 * Desktop — the root shell component for the macOS Tahoe web recreation.
 *
 * Renders the full-screen `.desktop` layer with the active wallpaper
 * from the settings store. Calls `useApplyAppearance()` to sync appearance
 * classes (light/dark/tinted, reduce-transparency) onto `<html>`.
 *
 * Future steps mount MenuBar, Dock, WindowManager, and system panels
 * (Spotlight, Control Center, Notification Center) inside this component.
 */

import { useSettingsStore, useApplyAppearance } from '@/store/settings';
import { getWallpaper } from './wallpapers';
import { MenuBar } from './MenuBar';

export function Desktop() {
  useApplyAppearance();

  const wallpaperId = useSettingsStore((s) => s.wallpaper);
  const wallpaper = getWallpaper(wallpaperId);

  return (
    <div
      className="desktop relative h-full w-full overflow-hidden"
      data-testid="desktop"
      style={{ background: wallpaper.css, backgroundSize: 'cover' }}
    >
      <MenuBar />
      {/* Dock, WindowManager, and system panels mount here in later steps */}
    </div>
  );
}
