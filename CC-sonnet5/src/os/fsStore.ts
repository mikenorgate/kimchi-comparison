import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

export interface FsNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  content?: string;
  updatedAt: number;
}

export const ROOT_ID = 'root';

function defaultNodes(): FsNode[] {
  const now = Date.now();
  return [
    { id: ROOT_ID, name: 'Macintosh HD', type: 'folder', parentId: null, updatedAt: now },
    { id: 'desktop', name: 'Desktop', type: 'folder', parentId: ROOT_ID, updatedAt: now },
    { id: 'documents', name: 'Documents', type: 'folder', parentId: ROOT_ID, updatedAt: now },
    { id: 'downloads', name: 'Downloads', type: 'folder', parentId: ROOT_ID, updatedAt: now },
    {
      id: 'readme',
      name: 'Read Me.txt',
      type: 'file',
      parentId: 'documents',
      content: 'Welcome to macOS Tahoe (web edition).\n\nThis is a real virtual filesystem — try creating folders and files, editing this document in TextEdit, and they will persist across reloads.',
      updatedAt: now,
    },
  ];
}

interface FsStore {
  nodes: FsNode[];
  children: (parentId: string | null) => FsNode[];
  getNode: (id: string) => FsNode | undefined;
  getPath: (id: string) => FsNode[];
  createFolder: (parentId: string, name?: string) => string;
  createFile: (parentId: string, name?: string, content?: string) => string;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  move: (id: string, newParentId: string) => void;
}

export const useFsStore = create<FsStore>()(
  persist(
    (set, get) => ({
      nodes: defaultNodes(),

      children: (parentId) => get().nodes.filter((n) => n.parentId === parentId),

      getNode: (id) => get().nodes.find((n) => n.id === id),

      getPath: (id) => {
        const path: FsNode[] = [];
        let current = get().nodes.find((n) => n.id === id);
        while (current) {
          path.unshift(current);
          current = current.parentId ? get().nodes.find((n) => n.id === current!.parentId) : undefined;
        }
        return path;
      },

      createFolder: (parentId, name = 'Untitled Folder') => {
        const id = uuid();
        const siblings = get().children(parentId).map((n) => n.name);
        const uniqueName = uniquify(name, siblings);
        set((s) => ({
          nodes: [...s.nodes, { id, name: uniqueName, type: 'folder', parentId, updatedAt: Date.now() }],
        }));
        return id;
      },

      createFile: (parentId, name = 'Untitled.txt', content = '') => {
        const id = uuid();
        const siblings = get().children(parentId).map((n) => n.name);
        const uniqueName = uniquify(name, siblings);
        set((s) => ({
          nodes: [...s.nodes, { id, name: uniqueName, type: 'file', parentId, content, updatedAt: Date.now() }],
        }));
        return id;
      },

      rename: (id, name) => {
        set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, name, updatedAt: Date.now() } : n)) }));
      },

      remove: (id) => {
        const toRemove = new Set<string>([id]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const n of get().nodes) {
            if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n.id)) {
              toRemove.add(n.id);
              changed = true;
            }
          }
        }
        set((s) => ({ nodes: s.nodes.filter((n) => !toRemove.has(n.id)) }));
      },

      updateContent: (id, content) => {
        set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, content, updatedAt: Date.now() } : n)) }));
      },

      move: (id, newParentId) => {
        set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, parentId: newParentId } : n)) }));
      },
    }),
    { name: 'tahoe-fs' },
  ),
);

function uniquify(name: string, existing: string[]): string {
  if (!existing.includes(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (existing.includes(`${base} ${i}${ext}`)) i++;
  return `${base} ${i}${ext}`;
}
