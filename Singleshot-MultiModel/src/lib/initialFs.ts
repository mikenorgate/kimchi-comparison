import type { FsNode } from '../types';

export function buildInitialFileSystem(now: number = Date.now()): FsNode[] {
  const root: FsNode = {
    id: 'root',
    type: 'folder',
    name: '/',
    parentId: null,
    createdAt: now,
    updatedAt: now,
  };

  const applications: FsNode = {
    id: 'applications',
    type: 'folder',
    name: 'Applications',
    parentId: 'root',
    createdAt: now,
    updatedAt: now,
  };

  const documents: FsNode = {
    id: 'documents',
    type: 'folder',
    name: 'Documents',
    parentId: 'root',
    createdAt: now,
    updatedAt: now,
  };

  const downloads: FsNode = {
    id: 'downloads',
    type: 'folder',
    name: 'Downloads',
    parentId: 'root',
    createdAt: now,
    updatedAt: now,
  };

  const pictures: FsNode = {
    id: 'pictures',
    type: 'folder',
    name: 'Pictures',
    parentId: 'root',
    createdAt: now,
    updatedAt: now,
  };

  const music: FsNode = {
    id: 'music',
    type: 'folder',
    name: 'Music',
    parentId: 'root',
    createdAt: now,
    updatedAt: now,
  };

  const movies: FsNode = {
    id: 'movies',
    type: 'folder',
    name: 'Movies',
    parentId: 'root',
    createdAt: now,
    updatedAt: now,
  };

  const appFiles: FsNode[] = [
    'Calculator.app',
    'Notes.app',
    'Terminal.app',
    'Safari.app',
    'Settings.app',
  ].map((name) => ({
    id: name.toLowerCase().replace(/\.app$/, '-app'),
    type: 'file' as const,
    name,
    parentId: 'applications',
    content: '',
    createdAt: now,
    updatedAt: now,
  }));

  const welcome: FsNode = {
    id: 'welcome',
    type: 'file',
    name: 'Welcome.txt',
    parentId: 'documents',
    content:
      'Welcome to Tahoe!\n\nThis is a high-fidelity prototype of macOS Tahoe running in the browser. ' +
      'Double-click any app in the Dock or open Finder to get started.',
    createdAt: now,
    updatedAt: now,
  };

  const wallpapers: FsNode[] = ['Wallpaper 1.png', 'Wallpaper 2.png', 'Wallpaper 3.png'].map(
    (name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: 'file' as const,
      name,
      parentId: 'pictures',
      content: '',
      createdAt: now,
      updatedAt: now,
    })
  );

  return [
    root,
    applications,
    documents,
    downloads,
    pictures,
    music,
    movies,
    ...appFiles,
    welcome,
    ...wallpapers,
  ];
}
