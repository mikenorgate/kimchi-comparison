import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FsNode } from '../types';
import { buildInitialFileSystem } from '../lib/initialFs';

export type FsViewMode = 'icon' | 'list';

export interface FileSystemState {
  nodes: Record<string, FsNode>;
  /** Ordered list of root-level ids so the tree layout is stable. */
  rootOrder: string[];
  currentPath: string[];
  selectedIds: string[];
  viewMode: FsViewMode;

  // Read helpers
  getNode: (id: string) => FsNode | undefined;
  getChildren: (parentId: string | null) => FsNode[];
  getCurrentFolder: () => FsNode | undefined;
  resolvePath: (segments: string[]) => FsNode | undefined;

  // Navigation / selection
  navigateTo: (id: string) => void;
  navigateUp: () => void;
  navigateToPath: (segments: string[]) => void;
  setSelection: (ids: string[]) => void;
  setViewMode: (mode: FsViewMode) => void;

  // CRUD
  createFolder: (parentId: string | null, name: string) => string;
  createFile: (parentId: string | null, name: string, content?: string) => string;
  rename: (id: string, newName: string) => boolean;
  deleteNode: (id: string) => boolean;
  writeFile: (id: string, content: string) => boolean;
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function indexNodes(nodes: FsNode[]) {
  const map: Record<string, FsNode> = {};
  const order: string[] = [];
  for (const node of nodes) {
    map[node.id] = node;
    order.push(node.id);
  }
  return { map, order };
}

const initial = buildInitialFileSystem();
const { map, order } = indexNodes(initial);

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      nodes: map,
      rootOrder: order,
      currentPath: ['root'],
      selectedIds: [],
      viewMode: 'icon',

      getNode: (id) => get().nodes[id],
      getChildren: (parentId) => {
        const all = Object.values(get().nodes);
        return all
          .filter((n) => n.parentId === parentId)
          .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
      },
      getCurrentFolder: () => {
        const path = get().currentPath;
        const last = path[path.length - 1];
        return last ? get().nodes[last] : undefined;
      },
      resolvePath: (segments) => {
        let current: FsNode | undefined = get().nodes['root'];
        for (const seg of segments) {
          if (!current || current.type !== 'folder') return undefined;
          const next = Object.values(get().nodes).find(
            (n) => n.parentId === current!.id && n.name === seg
          );
          if (!next) return undefined;
          current = next;
        }
        return current;
      },

      navigateTo: (id) => {
        const node = get().nodes[id];
        if (!node || node.type !== 'folder') return;
        set({ currentPath: buildPath(get().nodes, id), selectedIds: [] });
      },
      navigateUp: () => {
        const path = get().currentPath;
        if (path.length <= 1) return;
        set({ currentPath: path.slice(0, -1), selectedIds: [] });
      },
      navigateToPath: (segments) => {
        const node = get().resolvePath(segments);
        if (!node || node.type !== 'folder') return;
        set({ currentPath: buildPath(get().nodes, node.id), selectedIds: [] });
      },
      setSelection: (ids) => set({ selectedIds: ids }),
      setViewMode: (mode) => set({ viewMode: mode }),

      createFolder: (parentId, name) => {
        if (!name.trim()) return '';
        const siblings = get().getChildren(parentId);
        if (siblings.some((n) => n.name === name)) return '';
        const now = Date.now();
        const id = generateId('folder');
        const folder: FsNode = {
          id,
          type: 'folder',
          name,
          parentId,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ nodes: { ...state.nodes, [id]: folder } }));
        return id;
      },
      createFile: (parentId, name, content = '') => {
        if (!name.trim()) return '';
        const siblings = get().getChildren(parentId);
        if (siblings.some((n) => n.name === name)) return '';
        const now = Date.now();
        const id = generateId('file');
        const file: FsNode = {
          id,
          type: 'file',
          name,
          parentId,
          content,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ nodes: { ...state.nodes, [id]: file } }));
        return id;
      },
      rename: (id, newName) => {
        const node = get().nodes[id];
        if (!node || !newName.trim()) return false;
        const siblings = get().getChildren(node.parentId);
        if (siblings.some((n) => n.id !== id && n.name === newName)) return false;
        set((state) => ({
          nodes: {
            ...state.nodes,
            [id]: { ...node, name: newName, updatedAt: Date.now() } as FsNode,
          },
        }));
        return true;
      },
      deleteNode: (id) => {
        const node = get().nodes[id];
        if (!node || id === 'root') return false;
        const toDelete = new Set<string>();
        const stack = [id];
        while (stack.length) {
          const current = stack.pop()!;
          toDelete.add(current);
          for (const child of Object.values(get().nodes)) {
            if (child.parentId === current) stack.push(child.id);
          }
        }
        set((state) => {
          const next = { ...state.nodes };
          for (const del of toDelete) delete next[del];
          return { nodes: next };
        });
        return true;
      },
      writeFile: (id, content) => {
        const node = get().nodes[id];
        if (!node || node.type !== 'file') return false;
        set((state) => ({
          nodes: {
            ...state.nodes,
            [id]: { ...node, content, updatedAt: Date.now() },
          },
        }));
        return true;
      },
    }),
    {
      name: 'tahoe.filesystem',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ nodes: state.nodes, rootOrder: state.rootOrder }),
    }
  )
);

function buildPath(nodes: Record<string, FsNode>, id: string): string[] {
  const path: string[] = [];
  let current: FsNode | undefined = nodes[id];
  while (current) {
    path.unshift(current.id);
    const parentId: string | null = current.parentId;
    current = parentId ? nodes[parentId] : undefined;
  }
  return path.length ? path : ['root'];
}
