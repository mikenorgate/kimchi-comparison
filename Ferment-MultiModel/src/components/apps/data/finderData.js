import {
  Folder,
  HardDrive,
  Cloud,
  Clock,
  Wifi,
  AppWindow,
  Download,
  FileText,
  FileImage,
  FileMusic,
  FileVideo,
  FileArchive,
  FileCode,
  File,
} from 'lucide-react';

/**
 * Mock data for the Finder app.
 *
 * The Finder is a presentational mock: there is no filesystem access, no
 * persistence, no backend. Every "location" exposed in the sidebar maps
 * to a static list of items that the right-hand grid renders. Items are
 * declared in a single source so tests and the component stay in sync.
 *
 * Each item has the shape:
 *   {
 *     id: string,          // unique within the location
 *     name: string,        // display name shown under the icon
 *     kind: 'folder' | 'file',
 *     type?: string,       // file extension without the dot, lower-cased
 *   }
 */

export const FAVORITES = Object.freeze([
  { id: 'airdrop', name: 'AirDrop', icon: Wifi },
  { id: 'recents', name: 'Recents', icon: Clock },
  { id: 'applications', name: 'Applications', icon: AppWindow },
  { id: 'desktop', name: 'Desktop', icon: Folder },
  { id: 'documents', name: 'Documents', icon: Folder },
  { id: 'downloads', name: 'Downloads', icon: Download },
]);

export const LOCATIONS = Object.freeze([
  { id: 'icloud', name: 'iCloud Drive', icon: Cloud },
  { id: 'macintosh-hd', name: 'Macintosh HD', icon: HardDrive },
]);

/**
 * Pick a Lucide icon component for a file based on its extension. Falls
 * back to a generic `File` glyph for unknown types so the grid always
 * has something to render.
 */
export function iconForItem(item) {
  if (!item) return File;
  if (item.kind === 'folder') return Folder;
  const ext = (item.type || '').toLowerCase();
  switch (ext) {
    case 'txt':
    case 'md':
    case 'rtf':
      return FileText;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'heic':
      return FileImage;
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'flac':
    case 'm4a':
      return FileMusic;
    case 'mp4':
    case 'mov':
    case 'm4v':
    case 'webm':
      return FileVideo;
    case 'zip':
    case 'tar':
    case 'gz':
    case '7z':
    case 'rar':
      return FileArchive;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
      return FileCode;
    default:
      return File;
  }
}

/**
 * Static, in-memory "filesystem" keyed by location id. Values are
 * arrays of item descriptors as defined above.
 */
export const MOCK_LOCATIONS = Object.freeze({
  airdrop: [],
  recents: [
    { id: 'recents-notes', name: 'notes.txt', kind: 'file', type: 'txt' },
    { id: 'recents-resume', name: 'Resume.pdf', kind: 'file', type: 'pdf' },
    { id: 'recents-project', name: 'Project', kind: 'folder' },
  ],
  applications: [
    { id: 'apps-safari', name: 'Safari', kind: 'folder' },
    { id: 'apps-notes', name: 'Notes', kind: 'folder' },
    { id: 'apps-calculator', name: 'Calculator', kind: 'folder' },
    { id: 'apps-music', name: 'Music', kind: 'folder' },
  ],
  desktop: [
    { id: 'desktop-screenshot', name: 'screenshot.png', kind: 'file', type: 'png' },
    { id: 'desktop-notes', name: 'notes.txt', kind: 'file', type: 'txt' },
    { id: 'desktop-project', name: 'Project', kind: 'folder' },
    { id: 'desktop-resume', name: 'Resume.pdf', kind: 'file', type: 'pdf' },
  ],
  documents: [
    { id: 'docs-budget', name: 'Budget 2026.numbers', kind: 'file', type: 'numbers' },
    { id: 'docs-resume', name: 'Resume.pdf', kind: 'file', type: 'pdf' },
    { id: 'docs-proposal', name: 'Proposal.md', kind: 'file', type: 'md' },
    { id: 'docs-archive', name: 'Archive', kind: 'folder' },
  ],
  downloads: [
    { id: 'dl-installer', name: 'TahoeInstaller.dmg', kind: 'file', type: 'dmg' },
    { id: 'dl-archive', name: 'photos.zip', kind: 'file', type: 'zip' },
    { id: 'dl-song', name: 'vacation.mp3', kind: 'file', type: 'mp3' },
  ],
  icloud: [
    { id: 'icloud-keynote', name: 'Keynote Presentation', kind: 'folder' },
    { id: 'icloud-numbers', name: 'Numbers Spreadsheet', kind: 'folder' },
    { id: 'icloud-photos', name: 'Photos Library', kind: 'folder' },
  ],
  'macintosh-hd': [
    { id: 'mac-users', name: 'Users', kind: 'folder' },
    { id: 'mac-applications', name: 'Applications', kind: 'folder' },
    { id: 'mac-library', name: 'Library', kind: 'folder' },
    { id: 'mac-system', name: 'System', kind: 'folder' },
  ],
});

export const DEFAULT_LOCATION_ID = 'desktop';

/**
 * Look up a sidebar entry by id across both Favorites and Locations.
 * Returns `null` when nothing matches.
 */
export function findSidebarEntry(id) {
  for (const entry of FAVORITES) {
    if (entry.id === id) return { entry, section: 'favorites' };
  }
  for (const entry of LOCATIONS) {
    if (entry.id === id) return { entry, section: 'locations' };
  }
  return null;
}

/**
 * Resolve the items for a given sidebar id. Falls back to the default
 * location when the id is unknown or the location is empty so the grid
 * never renders completely blank on first paint.
 */
export function getItemsForLocation(id) {
  if (id && Object.prototype.hasOwnProperty.call(MOCK_LOCATIONS, id)) {
    return MOCK_LOCATIONS[id] ?? [];
  }
  return MOCK_LOCATIONS[DEFAULT_LOCATION_ID] ?? [];
}
