'use client';

import { useMemo, useState } from 'react';
import {
  Folder,
  FileText,
  HardDrive,
  Download,
  Clock,
  Star,
  Monitor,
  Image as ImageIcon,
  Music as MusicIcon,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Plus,
} from 'lucide-react';

export type FileKind = 'folder' | 'file' | 'image' | 'audio';

export interface FileItem {
  id: string;
  name: string;
  kind: FileKind;
  size?: string;
  modified?: string;
}

export interface FinderLocation {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FileItem[];
}

const LOCATIONS: FinderLocation[] = [
  {
    id: 'airdrop',
    name: 'AirDrop',
    icon: <Monitor className="h-4 w-4" />,
    items: [
      { id: 'airdrop-1', name: 'MacBook Pro', kind: 'folder' },
      { id: 'airdrop-2', name: 'iPhone', kind: 'folder' },
    ],
  },
  {
    id: 'recents',
    name: 'Recents',
    icon: <Clock className="h-4 w-4" />,
    items: [
      { id: 'recent-1', name: 'Project Plan.txt', kind: 'file', modified: 'Today, 9:41 AM' },
      { id: 'recent-2', name: 'Screenshot.png', kind: 'image', modified: 'Yesterday, 4:20 PM' },
      { id: 'recent-3', name: 'Vacation.jpg', kind: 'image', modified: 'Mon, 11:30 AM' },
    ],
  },
  {
    id: 'applications',
    name: 'Applications',
    icon: <HardDrive className="h-4 w-4" />,
    items: [
      { id: 'app-1', name: 'Safari.app', kind: 'folder' },
      { id: 'app-2', name: 'Notes.app', kind: 'folder' },
      { id: 'app-3', name: 'Music.app', kind: 'folder' },
      { id: 'app-4', name: 'Photos.app', kind: 'folder' },
    ],
  },
  {
    id: 'desktop',
    name: 'Desktop',
    icon: <Monitor className="h-4 w-4" />,
    items: [
      { id: 'desktop-1', name: 'Tahoe Wallpaper.jpg', kind: 'image', size: '3.2 MB' },
      { id: 'desktop-2', name: 'To Do.txt', kind: 'file', size: '1 KB' },
      { id: 'desktop-3', name: 'Project X', kind: 'folder' },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: <Folder className="h-4 w-4" />,
    items: [
      { id: 'docs-1', name: 'Work', kind: 'folder' },
      { id: 'docs-2', name: 'Personal', kind: 'folder' },
      { id: 'docs-3', name: 'Resume.pdf', kind: 'file', size: '120 KB' },
      { id: 'docs-4', name: 'Budget 2026.numbers', kind: 'file', size: '45 KB' },
    ],
  },
  {
    id: 'downloads',
    name: 'Downloads',
    icon: <Download className="h-4 w-4" />,
    items: [
      { id: 'dl-1', name: 'installer.dmg', kind: 'file', size: '512 MB' },
      { id: 'dl-2', name: 'track.mp3', kind: 'audio', size: '8 MB' },
      { id: 'dl-3', name: 'Archive.zip', kind: 'file', size: '12 MB' },
    ],
  },
];

function ItemIcon({ kind }: { kind: FileKind }) {
  switch (kind) {
    case 'folder':
      return <Folder className="h-10 w-10 text-sky-400" />;
    case 'image':
      return <ImageIcon className="h-10 w-10 text-purple-400" />;
    case 'audio':
      return <MusicIcon className="h-10 w-10 text-rose-400" />;
    default:
      return <FileText className="h-10 w-10 text-foreground/70" />;
  }
}

function ListIcon({ kind }: { kind: FileKind }) {
  switch (kind) {
    case 'folder':
      return <Folder className="h-4 w-4 text-sky-400" />;
    case 'image':
      return <ImageIcon className="h-4 w-4 text-purple-400" />;
    case 'audio':
      return <MusicIcon className="h-4 w-4 text-rose-400" />;
    default:
      return <FileText className="h-4 w-4 text-foreground/70" />;
  }
}

export function Finder() {
  const [currentId, setCurrentId] = useState('recents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const current = useMemo(
    () => LOCATIONS.find((loc) => loc.id === currentId) ?? LOCATIONS[0],
    [currentId]
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      <aside
        className="flex h-full w-44 flex-col gap-1 border-r p-3"
        style={{ borderColor: 'var(--window-border)', background: 'var(--window-bg)' }}
        data-testid="finder-sidebar"
      >
        <div className="text-[10px] font-semibold uppercase tracking-wide opacity-50">Favorites</div>
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            data-testid={`finder-location-${loc.id}`}
            onClick={() => {
              setCurrentId(loc.id);
              setSelectedIds(new Set());
            }}
            className={`flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${
              currentId === loc.id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-foreground/5'
            }`}
          >
            {loc.icon}
            {loc.name}
          </button>
        ))}
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header
          className="flex items-center justify-between border-b px-3 py-2"
          style={{ borderColor: 'var(--window-border)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{current.name}</span>
            <ChevronRight className="h-3 w-3 opacity-40" />
            <span className="text-xs opacity-50" data-testid="finder-item-count">
              {current.items.length} items
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                placeholder="Search"
                className="rounded-md border bg-transparent py-1 pl-7 pr-2 text-xs outline-none"
                style={{ borderColor: 'var(--window-border)' }}
              />
            </div>
            <button
              data-testid="finder-view-grid"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1 ${viewMode === 'grid' ? 'bg-foreground/10' : ''}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              data-testid="finder-view-list"
              onClick={() => setViewMode('list')}
              className={`rounded-md p-1 ${viewMode === 'list' ? 'bg-foreground/10' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1 hover:bg-foreground/5">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div
          className="flex-1 overflow-auto p-4"
          data-testid="finder-grid"
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-4">
              {current.items.map((item) => (
                <button
                  key={item.id}
                  data-testid={`finder-item-${item.id}`}
                  onClick={() => toggleSelection(item.id)}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors ${
                    selectedIds.has(item.id) ? 'bg-accent/30' : 'hover:bg-foreground/5'
                  }`}
                >
                  <ItemIcon kind={item.kind} />
                  <span className="line-clamp-2 text-xs leading-tight">{item.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-3 gap-2 border-b px-2 py-1 text-[10px] font-semibold uppercase tracking-wide opacity-50" style={{ borderColor: 'var(--window-border)' }}>
                <span>Name</span>
                <span>Date Modified</span>
                <span>Size</span>
              </div>
              {current.items.map((item) => (
                <button
                  key={item.id}
                  data-testid={`finder-item-${item.id}`}
                  onClick={() => toggleSelection(item.id)}
                  className={`grid grid-cols-3 gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${
                    selectedIds.has(item.id) ? 'bg-accent/30' : 'hover:bg-foreground/5'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <ListIcon kind={item.kind} />
                    {item.name}
                  </span>
                  <span className="truncate opacity-60">{item.modified ?? '—'}</span>
                  <span className="truncate opacity-60">{item.size ?? '—'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <footer
          className="border-t px-3 py-1.5 text-[10px] opacity-60"
          style={{ borderColor: 'var(--window-border)' }}
        >
          {selectedIds.size > 0
            ? `${selectedIds.size} selected`
            : `${current.items.length} items, ${current.items.filter((i) => i.kind === 'folder').length} folders`}
        </footer>
      </main>
    </div>
  );
}
