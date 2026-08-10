import { useState } from 'react';
import {
  Folder as FolderIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSystemStore } from '../stores/systemStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';
import { getWallpaperById, WALLPAPERS } from '../lib/wallpapers';
import ContextMenu from './ContextMenu';
import type { MenuItem } from '../types';

interface DesktopIcon {
  id: string;
  label: string;
  /** Lucide icon component. */
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Action performed on double-click. `appId` opens the corresponding app;
   * `folder` navigates Finder to the specified folder node id.
   */
  kind: 'app' | 'folder';
  target: string;
}

const DEFAULT_ICONS: DesktopIcon[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    kind: 'folder',
    // Future chunks may add a dedicated Home folder; for now Home just opens
    // Finder rooted at the user's Documents folder.
    target: 'documents',
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: FolderIcon,
    kind: 'folder',
    target: 'applications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    kind: 'app',
    target: 'settings',
  },
];

interface DesktopProps {
  children?: React.ReactNode;
}

export default function Desktop({ children }: DesktopProps) {
  const wallpaperId = useSystemStore((s) => s.wallpaper);
  const setWallpaper = useSystemStore((s) => s.setWallpaper);
  const openWindow = useWindowStore((s) => s.openWindow);
  const createFolder = useFileSystemStore((s) => s.createFolder);
  const wallpaper = getWallpaperById(wallpaperId);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.kind === 'app') {
      openWindow(icon.target);
      return;
    }
    // Folders: open Finder at the requested folder. For Chunk 2 we simply
    // launch Finder; later chunks can pre-navigate to the right path.
    openWindow('finder', { title: 'Finder' });
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const menuItems: MenuItem[] = [
    {
      id: 'new-folder',
      label: 'New Folder',
      action: () => {
        createFolder('root', 'untitled folder');
      },
    },
    { id: 'sep-1', separator: true },
    {
      id: 'change-wallpaper',
      label: 'Change Desktop Background…',
      action: () => {
        const idx = WALLPAPERS.findIndex((w) => w.id === wallpaperId);
        const next = WALLPAPERS[(idx + 1) % WALLPAPERS.length];
        setWallpaper(next.id);
      },
    },
    ...WALLPAPERS.map((w) => ({
      id: `wp-${w.id}`,
      label: w.id === wallpaperId ? `${w.name} (current)` : w.name,
      action: () => setWallpaper(w.id),
    })),
    { id: 'sep-2', separator: true },
    {
      id: 'open-settings',
      label: 'System Settings…',
      action: () => openWindow('settings'),
    },
  ];

  return (
    <div
      data-testid="desktop"
      onContextMenu={handleContextMenu}
      className="absolute inset-0 select-none"
      style={{ background: wallpaper.background }}
    >
      {/* Desktop icons stacked top-to-bottom just below the menu bar. */}
      <div
        className="absolute left-4 top-10 flex flex-col gap-3"
        data-testid="desktop-icons"
      >
        {DEFAULT_ICONS.map((icon) => {
          const Icon = icon.icon;
          return (
            <button
              key={icon.id}
              type="button"
              data-testid={`desktop-icon-${icon.id}`}
              data-icon-kind={icon.kind}
              data-icon-target={icon.target}
              onDoubleClick={() => handleIconDoubleClick(icon)}
              className="group flex w-20 flex-col items-center gap-1 rounded p-1 text-white hover:bg-white/10 focus:bg-white/15 focus:outline-none"
            >
              <Icon className="h-10 w-10 drop-shadow" />
              <span className="text-center text-[11px] leading-tight drop-shadow">
                {icon.label}
              </span>
            </button>
          );
        })}
      </div>

      {children}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
