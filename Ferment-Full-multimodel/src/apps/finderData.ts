/**
 * Mock file system for the Finder app.
 *
 * Stores nodes in a flat list keyed by id, with `parentId` forming a tree.
 * Special "pseudo" locations (Recents, Trash, AirDrop) are not backed by a
 * node — they're virtual views computed at select time.
 *
 * State is kept in a small Zustand store so that mutating actions
 * (move, moveToTrash, rename, toggleTag) trigger React re-renders in any
 * Finder window without prop drilling. The store persists across window
 * open/close cycles within a page session.
 */
import { create } from 'zustand';

import type { MenuBarMenuItem } from '../types/os';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FinderNodeKind = 'folder' | 'file';

/** Special, non-folder "locations" exposed in the sidebar. */
export type FinderPseudoId = 'recents' | 'trash' | 'airdrop';

/** Tag-scoped location ids are prefixed with `tag:`. */
export const TAG_PREFIX = 'tag:';

export function isPseudoId(id: string): id is FinderPseudoId {
  return id === 'recents' || id === 'trash' || id === 'airdrop';
}

export function isTagLocationId(id: string): boolean {
  return id.startsWith(TAG_PREFIX);
}

export function tagIdFromLocation(locationId: string): string {
  return locationId.slice(TAG_PREFIX.length);
}

export interface FinderNode {
  id: string;
  /** Null only for the root disk; folders/files always have a parent. */
  parentId: string | null;
  name: string;
  kind: FinderNodeKind;
  /** Emoji glyph shown as the item's icon. */
  icon: string;
  /** Size in bytes; 0 for folders. */
  size: number;
  /** ISO 8601 timestamp. */
  modifiedAt: string;
  /** Human-readable "kind" label, e.g. "Folder", "PNG Image". */
  kindLabel: string;
  /** Tag ids applied to this node. */
  tagIds: string[];
  /** True when the item has been moved to the Trash. */
  inTrash: boolean;
}

export interface FinderTag {
  id: string;
  label: string;
  color: string;
}

export interface FinderLocationEntry {
  id: string;
  name: string;
  icon: string;
  /** Set when the entry maps to a real folder node. */
  folderId?: string;
  /** Set when the entry is a pseudo location. */
  pseudo?: FinderPseudoId;
}

// ---------------------------------------------------------------------------
// Sidebar data
// ---------------------------------------------------------------------------

export const PSEUDO_RECENTS: FinderPseudoId = 'recents';
export const PSEUDO_TRASH: FinderPseudoId = 'trash';
export const PSEUDO_AIRDROP: FinderPseudoId = 'airdrop';

export const TAGS: FinderTag[] = [
  { id: 'red', label: 'Red', color: '#ff3b30' },
  { id: 'orange', label: 'Orange', color: '#ff9500' },
  { id: 'yellow', label: 'Yellow', color: '#ffcc00' },
  { id: 'green', label: 'Green', color: '#34c759' },
  { id: 'blue', label: 'Blue', color: '#007aff' },
  { id: 'purple', label: 'Purple', color: '#af52de' },
  { id: 'gray', label: 'Gray', color: '#8e8e93' },
];

export const SIDEBAR_LOCATIONS: {
  favorites: FinderLocationEntry[];
  locations: FinderLocationEntry[];
} = {
  favorites: [
    { id: 'airdrop', name: 'AirDrop', icon: '📡', pseudo: 'airdrop' },
    { id: 'recents', name: 'Recents', icon: '🕘', pseudo: 'recents' },
    { id: 'applications', name: 'Applications', icon: '📦', folderId: 'applications' },
    { id: 'desktop', name: 'Desktop', icon: '🖥️', folderId: 'desktop' },
    { id: 'documents', name: 'Documents', icon: '📄', folderId: 'documents' },
    { id: 'downloads', name: 'Downloads', icon: '⬇️', folderId: 'downloads' },
  ],
  locations: [
    { id: 'macintosh-hd', name: 'Macintosh HD', icon: '💽', folderId: 'root' },
  ],
};

// ---------------------------------------------------------------------------
// Mock file system tree
// ---------------------------------------------------------------------------

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const initialNodes: FinderNode[] = [
  // Root disk.
  {
    id: 'root',
    parentId: null,
    name: 'Macintosh HD',
    kind: 'folder',
    icon: '💽',
    size: 0,
    modifiedAt: isoDaysAgo(60),
    kindLabel: 'Disk',
    tagIds: [],
    inTrash: false,
  },

  // Applications.
  {
    id: 'applications',
    parentId: 'root',
    name: 'Applications',
    kind: 'folder',
    icon: '📦',
    size: 0,
    modifiedAt: isoDaysAgo(30),
    kindLabel: 'Folder',
    tagIds: [],
    inTrash: false,
  },
  { id: 'app-safari', parentId: 'applications', name: 'Safari', kind: 'file', icon: '🧭', size: 102400, modifiedAt: isoDaysAgo(7), kindLabel: 'Application', tagIds: [], inTrash: false },
  { id: 'app-mail', parentId: 'applications', name: 'Mail', kind: 'file', icon: '✉️', size: 204800, modifiedAt: isoDaysAgo(7), kindLabel: 'Application', tagIds: [], inTrash: false },
  { id: 'app-notes', parentId: 'applications', name: 'Notes', kind: 'file', icon: '📝', size: 51200, modifiedAt: isoDaysAgo(14), kindLabel: 'Application', tagIds: [], inTrash: false },
  { id: 'app-terminal', parentId: 'applications', name: 'Terminal', kind: 'file', icon: '⌨️', size: 40960, modifiedAt: isoDaysAgo(20), kindLabel: 'Application', tagIds: [], inTrash: false },
  { id: 'app-calculator', parentId: 'applications', name: 'Calculator', kind: 'file', icon: '🧮', size: 32768, modifiedAt: isoDaysAgo(40), kindLabel: 'Application', tagIds: [], inTrash: false },
  { id: 'app-music', parentId: 'applications', name: 'Music', kind: 'file', icon: '🎵', size: 81920, modifiedAt: isoDaysAgo(11), kindLabel: 'Application', tagIds: [], inTrash: false },

  // Desktop.
  {
    id: 'desktop',
    parentId: 'root',
    name: 'Desktop',
    kind: 'folder',
    icon: '🖥️',
    size: 0,
    modifiedAt: isoDaysAgo(3),
    kindLabel: 'Folder',
    tagIds: [],
    inTrash: false,
  },
  { id: 'desktop-screenshot', parentId: 'desktop', name: 'Screen Shot 2026-08-05.png', kind: 'file', icon: '🖼️', size: 524288, modifiedAt: isoDaysAgo(1), kindLabel: 'PNG Image', tagIds: ['blue'], inTrash: false },
  { id: 'desktop-notes-txt', parentId: 'desktop', name: 'notes.txt', kind: 'file', icon: '📄', size: 2048, modifiedAt: isoDaysAgo(5), kindLabel: 'Plain Text', tagIds: ['yellow'], inTrash: false },

  // Documents.
  {
    id: 'documents',
    parentId: 'root',
    name: 'Documents',
    kind: 'folder',
    icon: '📄',
    size: 0,
    modifiedAt: isoDaysAgo(2),
    kindLabel: 'Folder',
    tagIds: [],
    inTrash: false,
  },
  {
    id: 'docs-projects',
    parentId: 'documents',
    name: 'Projects',
    kind: 'folder',
    icon: '📁',
    size: 0,
    modifiedAt: isoDaysAgo(2),
    kindLabel: 'Folder',
    tagIds: ['red'],
    inTrash: false,
  },
  { id: 'docs-project-readme', parentId: 'docs-projects', name: 'README.md', kind: 'file', icon: '📄', size: 4096, modifiedAt: isoDaysAgo(2), kindLabel: 'Markdown', tagIds: [], inTrash: false },
  { id: 'docs-project-main', parentId: 'docs-projects', name: 'main.tsx', kind: 'file', icon: '📄', size: 8192, modifiedAt: isoDaysAgo(3), kindLabel: 'TypeScript', tagIds: [], inTrash: false },
  { id: 'docs-project-utils', parentId: 'docs-projects', name: 'utils.ts', kind: 'file', icon: '📄', size: 4096, modifiedAt: isoDaysAgo(4), kindLabel: 'TypeScript', tagIds: [], inTrash: false },
  { id: 'docs-resume', parentId: 'documents', name: 'Resume.pdf', kind: 'file', icon: '📑', size: 102400, modifiedAt: isoDaysAgo(20), kindLabel: 'PDF Document', tagIds: ['green'], inTrash: false },
  { id: 'docs-budget', parentId: 'documents', name: 'Budget.xlsx', kind: 'file', icon: '📊', size: 32768, modifiedAt: isoDaysAgo(8), kindLabel: 'Excel Spreadsheet', tagIds: ['orange'], inTrash: false },
  { id: 'docs-presentation', parentId: 'documents', name: 'Quarterly Review.key', kind: 'file', icon: '📈', size: 2621440, modifiedAt: isoDaysAgo(1), kindLabel: 'Keynote Presentation', tagIds: [], inTrash: false },
  {
    id: 'docs-photos',
    parentId: 'documents',
    name: 'Photos',
    kind: 'folder',
    icon: '🖼️',
    size: 0,
    modifiedAt: isoDaysAgo(12),
    kindLabel: 'Folder',
    tagIds: [],
    inTrash: false,
  },
  { id: 'docs-photo1', parentId: 'docs-photos', name: 'IMG_1234.heic', kind: 'file', icon: '🖼️', size: 2097152, modifiedAt: isoDaysAgo(14), kindLabel: 'HEIC Image', tagIds: ['blue'], inTrash: false },
  { id: 'docs-photo2', parentId: 'docs-photos', name: 'IMG_5678.heic', kind: 'file', icon: '🖼️', size: 1835008, modifiedAt: isoDaysAgo(15), kindLabel: 'HEIC Image', tagIds: [], inTrash: false },
  { id: 'docs-photo3', parentId: 'docs-photos', name: 'Sunset.jpg', kind: 'file', icon: '🌅', size: 1048576, modifiedAt: isoDaysAgo(10), kindLabel: 'JPEG Image', tagIds: ['orange'], inTrash: false },

  // Downloads.
  {
    id: 'downloads',
    parentId: 'root',
    name: 'Downloads',
    kind: 'folder',
    icon: '⬇️',
    size: 0,
    modifiedAt: isoDaysAgo(0),
    kindLabel: 'Folder',
    tagIds: [],
    inTrash: false,
  },
  { id: 'dl-installer', parentId: 'downloads', name: 'Installer.dmg', kind: 'file', icon: '💿', size: 104857600, modifiedAt: isoDaysAgo(0), kindLabel: 'Disk Image', tagIds: [], inTrash: false },
  { id: 'dl-archive', parentId: 'downloads', name: 'archive.zip', kind: 'file', icon: '🗜️', size: 5242880, modifiedAt: isoDaysAgo(2), kindLabel: 'ZIP Archive', tagIds: ['gray'], inTrash: false },
  { id: 'dl-doc', parentId: 'downloads', name: 'Annual Report.pdf', kind: 'file', icon: '📑', size: 524288, modifiedAt: isoDaysAgo(4), kindLabel: 'PDF Document', tagIds: [], inTrash: false },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface FinderStore {
  nodes: FinderNode[];
  /** Move an item into a folder (no-op on cycles, missing nodes, trash targets). */
  move: (id: string, toFolderId: string) => void;
  /** Mark an item as moved to the Trash. */
  moveToTrash: (id: string) => void;
  /** Restore an item from the Trash back to Documents. */
  restoreFromTrash: (id: string) => void;
  /** Rename an item in place. Empty names are ignored. */
  rename: (id: string, name: string) => void;
  /** Toggle a tag on/off for the given node. */
  toggleTag: (id: string, tagId: string) => void;
}

/**
 * Returns true when `candidateAncestorId` is `nodeId` or a descendant of it.
 * Used to detect cycles when moving folders.
 */
function isSelfOrDescendant(
  nodes: FinderNode[],
  candidateAncestorId: string,
  nodeId: string,
): boolean {
  let current: string | null = candidateAncestorId;
  // Bound the walk to avoid runaway loops on data bugs.
  for (let i = 0; i < nodes.length + 1; i += 1) {
    if (current === null) return false;
    if (current === nodeId) return true;
    const node: FinderNode | undefined = nodes.find((n) => n.id === current);
    if (!node) return false;
    current = node.parentId;
  }
  return false;
}

export const useFinderStore = create<FinderStore>((set) => ({
  nodes: initialNodes,
  move: (id, toFolderId) =>
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (!node) return state;
      if (node.parentId === toFolderId && !node.inTrash) return state;
      if (node.inTrash) return state;
      const target = state.nodes.find((n) => n.id === toFolderId);
      if (!target || target.kind !== 'folder' || target.inTrash) return state;
      if (node.kind === 'folder' && isSelfOrDescendant(state.nodes, toFolderId, id)) {
        return state;
      }
      return {
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, parentId: toFolderId, inTrash: false } : n,
        ),
      };
    }),
  moveToTrash: (id) =>
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (!node || node.inTrash) return state;
      return {
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, inTrash: true, parentId: null } : n,
        ),
      };
    }),
  restoreFromTrash: (id) =>
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (!node || !node.inTrash) return state;
      return {
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, inTrash: false, parentId: 'documents' } : n,
        ),
      };
    }),
  rename: (id, name) =>
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed) return state;
      return {
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, name: trimmed } : n,
        ),
      };
    }),
  toggleTag: (id, tagId) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== id) return n;
        const has = n.tagIds.includes(tagId);
        return {
          ...n,
          tagIds: has ? n.tagIds.filter((t) => t !== tagId) : [...n.tagIds, tagId],
        };
      }),
    })),
}));

// ---------------------------------------------------------------------------
// Selectors / helpers (pure functions over the nodes array)
// ---------------------------------------------------------------------------

export function getNodeById(nodes: FinderNode[], id: string): FinderNode | null {
  return nodes.find((n) => n.id === id) ?? null;
}

export function getChildren(
  nodes: FinderNode[],
  parentId: string | null,
): FinderNode[] {
  return nodes
    .filter((n) => n.parentId === parentId && !n.inTrash)
    .slice()
    .sort((a, b) => {
      // Folders first, then alphabetical.
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function getTrashed(nodes: FinderNode[]): FinderNode[] {
  return nodes
    .filter((n) => n.inTrash)
    .slice()
    .sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));
}

export function getRecents(nodes: FinderNode[], limit = 20): FinderNode[] {
  return nodes
    .filter((n) => !n.inTrash)
    .slice()
    .sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1))
    .slice(0, limit);
}

export function getForTag(nodes: FinderNode[], tagId: string): FinderNode[] {
  return nodes
    .filter((n) => !n.inTrash && n.tagIds.includes(tagId))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getParent(
  nodes: FinderNode[],
  nodeId: string,
): FinderNode | null {
  const node = getNodeById(nodes, nodeId);
  if (!node || node.parentId === null) return null;
  return getNodeById(nodes, node.parentId);
}

export function trashCount(nodes: FinderNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.inTrash) count += 1;
  }
  return count;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return 'Zero Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const display = value < 10 && unitIndex > 0 ? value.toFixed(1) : Math.round(value).toString();
  return `${display} ${units[unitIndex]}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Resolve a display title for the current navigation location, used to
 * update the window title bar.
 */
export function resolveLocationTitle(
  nodes: FinderNode[],
  location: string,
): string {
  if (location === PSEUDO_TRASH) return 'Trash';
  if (location === PSEUDO_RECENTS) return 'Recents';
  if (location === PSEUDO_AIRDROP) return 'AirDrop';
  if (isTagLocationId(location)) {
    const tag = TAGS.find((t) => t.id === tagIdFromLocation(location));
    return tag ? tag.label : 'Tag';
  }
  const node = getNodeById(nodes, location);
  return node ? node.name : 'Finder';
}

// ---------------------------------------------------------------------------
// Context-menu item helpers
// ---------------------------------------------------------------------------

/** Build the per-tag toggle menu items for a node. */
export function tagMenuItemsFor(node: FinderNode): MenuBarMenuItem[] {
  return TAGS.map((t) => {
    const has = node.tagIds.includes(t.id);
    return {
      label: `${has ? '\u2713  ' : '     '}${t.label}`,
    };
  });
}
