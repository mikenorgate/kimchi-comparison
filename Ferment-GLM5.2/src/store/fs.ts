/**
 * Virtual Filesystem Store
 *
 * A tree-structured filesystem persisted to localStorage via Zustand's
 * persist middleware. Supports folders, files, tags, and CRUD operations.
 *
 * Nodes are identified by unique string IDs. The root node is '/' and has
 * no parent. The tree is stored as a flat Record<id, FSNode> for O(1) lookups,
 * with children referenced by ID in the parent's `children` array.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────

export type FSNodeType = 'folder' | 'file';

export interface FSNode {
  id: string;
  name: string;
  type: FSNodeType;
  parentId: string | null;
  children: string[]; // child IDs (folders and files)
  tags: string[]; // tag IDs applied to this node
  /** File content (mock text) — empty for folders */
  content?: string;
  /** ISO timestamp of creation */
  createdAt: number;
  /** ISO timestamp of last modification */
  modifiedAt: number;
}

export interface FSState {
  nodes: Record<string, FSNode>;
  /** Counter for generating unique IDs */
  _idCounter: number;

  // Queries
  getNode: (id: string) => FSNode | undefined;
  getChildren: (id: string) => FSNode[];
  getPath: (id: string) => FSNode[];
  search: (query: string) => FSNode[];

  // Mutations
  createNode: (parentId: string, name: string, type: FSNodeType, content?: string) => string;
  renameNode: (id: string, name: string) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, newParentId: string) => void;
  addTag: (id: string, tagId: string) => void;
  removeTag: (id: string, tagId: string) => void;
  toggleTag: (id: string, tagId: string) => void;
  updateContent: (id: string, content: string) => void;

  // Reset to seed data (useful for testing)
  resetToSeed: () => void;
}

// ── Tag definitions ──────────────────────────────────────────────

export interface TagDef {
  id: string;
  name: string;
  color: string;
}

export const TAGS: TagDef[] = [
  { id: 'red', name: 'Red', color: '#ff5f57' },
  { id: 'orange', name: 'Orange', color: '#ff9f0a' },
  { id: 'yellow', name: 'Yellow', color: '#ffbd2e' },
  { id: 'green', name: 'Green', color: '#28c840' },
  { id: 'blue', name: 'Blue', color: '#0a84ff' },
  { id: 'purple', name: 'Purple', color: '#bf5af2' },
  { id: 'gray', name: 'Gray', color: '#8e8e93' },
];

// ── Seed data ────────────────────────────────────────────────────

function createSeedNodes(): { nodes: Record<string, FSNode>; counter: number } {
  const nodes: Record<string, FSNode> = {};
  let counter = 0;

  const now = Date.now();

  function makeNode(
    id: string,
    name: string,
    type: FSNodeType,
    parentId: string | null,
    children: string[] = [],
    tags: string[] = [],
    content = '',
  ): FSNode {
    return {
      id,
      name,
      type,
      parentId,
      children,
      tags,
      content,
      createdAt: now,
      modifiedAt: now,
    };
  }

  // Root
  nodes['/'] = makeNode('/', 'root', 'folder', null, ['desktop', 'documents', 'downloads', 'applications', 'pictures']);

  // Top-level folders
  nodes['desktop'] = makeNode('desktop', 'Desktop', 'folder', '/', ['desktop-proj', 'desktop-screenshot']);
  nodes['documents'] = makeNode('documents', 'Documents', 'folder', '/', ['docs-resume', 'docs-budget', 'docs-work']);
  nodes['downloads'] = makeNode('downloads', 'Downloads', 'folder', '/', ['dl-installer']);
  nodes['applications'] = makeNode('applications', 'Applications', 'folder', '/', []);
  nodes['pictures'] = makeNode('pictures', 'Pictures', 'folder', '/', ['pics-vacation', 'pics-wallpaper']);

  // Desktop children
  nodes['desktop-proj'] = makeNode('desktop-proj', 'Project Ideas.txt', 'file', 'desktop', [], ['blue'], '1. Build a web app\n2. Learn Rust\n3. Make a game');
  nodes['desktop-screenshot'] = makeNode('desktop-screenshot', 'Screenshot.png', 'file', 'desktop', [], [], '');

  // Documents children
  nodes['docs-resume'] = makeNode('docs-resume', 'Resume.pdf', 'file', 'documents', [], ['red'], '');
  nodes['docs-budget'] = makeNode('docs-budget', 'Budget 2024.xlsx', 'file', 'documents', [], ['green'], '');
  nodes['docs-work'] = makeNode('docs-work', 'Work', 'folder', 'documents', ['work-notes', 'work-report'], ['orange']);
  nodes['work-notes'] = makeNode('work-notes', 'Meeting Notes.txt', 'file', 'docs-work', [], [], 'Team standup notes:\n- Ship feature X\n- Fix bug Y');
  nodes['work-report'] = makeNode('work-report', 'Q4 Report.docx', 'file', 'docs-work', [], ['purple'], '');

  // Downloads children
  nodes['dl-installer'] = makeNode('dl-installer', 'Installer.dmg', 'file', 'downloads', [], [], '');

  // Pictures children
  nodes['pics-vacation'] = makeNode('pics-vacation', 'Vacation', 'folder', 'pictures', ['vacation-1', 'vacation-2'], ['yellow']);
  nodes['vacation-1'] = makeNode('vacation-1', 'Beach.jpg', 'file', 'pics-vacation', [], [], '');
  nodes['vacation-2'] = makeNode('vacation-2', 'Sunset.jpg', 'file', 'pics-vacation', [], [], '');
  nodes['pics-wallpaper'] = makeNode('pics-wallpaper', 'Wallpaper.png', 'file', 'pictures', [], [], '');

  counter = 100; // Start counter above seed IDs
  return { nodes, counter };
}

// ── Store ─────────────────────────────────────────────────────────

export const useFSStore = create<FSState>()(
  persist(
    (set, get) => {
      const seed = createSeedNodes();

      return {
        nodes: seed.nodes,
        _idCounter: seed.counter,

        getNode: (id) => get().nodes[id],

        getChildren: (id) => {
          const node = get().nodes[id];
          if (!node) return [];
          return node.children
            .map((cid) => get().nodes[cid])
            .filter((n): n is FSNode => n !== undefined);
        },

        getPath: (id) => {
          const path: FSNode[] = [];
          let current = get().nodes[id];
          while (current) {
            path.unshift(current);
            if (current.parentId === null) break;
            current = get().nodes[current.parentId];
          }
          return path;
        },

        search: (query) => {
          const q = query.toLowerCase();
          return Object.values(get().nodes).filter(
            (n) => n.id !== '/' && n.name.toLowerCase().includes(q),
          );
        },

        createNode: (parentId, name, type, content = '') => {
          const id = `node-${get()._idCounter}`;
          const now = Date.now();
          set((s) => {
            const parent = s.nodes[parentId];
            if (!parent) return s;
            const newNode: FSNode = {
              id,
              name,
              type,
              parentId,
              children: [],
              tags: [],
              content,
              createdAt: now,
              modifiedAt: now,
            };
            return {
              nodes: {
                ...s.nodes,
                [id]: newNode,
                [parentId]: {
                  ...parent,
                  children: [...parent.children, id],
                  modifiedAt: now,
                },
              },
              _idCounter: s._idCounter + 1,
            };
          });
          return id;
        },

        renameNode: (id, name) => {
          set((s) => {
            const node = s.nodes[id];
            if (!node) return s;
            return {
              ...s,
              nodes: {
                ...s.nodes,
                [id]: { ...node, name, modifiedAt: Date.now() },
              },
            };
          });
        },

        deleteNode: (id) => {
          set((s) => {
            const node = s.nodes[id];
            if (!node || node.parentId === null) return s;

            // Recursively collect all descendant IDs
            const toDelete = new Set<string>([id]);
            const queue = [id];
            while (queue.length > 0) {
              const current = s.nodes[queue.shift()!];
              if (!current) continue;
              for (const childId of current.children) {
                if (!toDelete.has(childId)) {
                  toDelete.add(childId);
                  queue.push(childId);
                }
              }
            }

            // Remove from parent's children
            const parent = s.nodes[node.parentId];
            const newNodes = { ...s.nodes };

            for (const delId of toDelete) {
              delete newNodes[delId];
            }

            if (parent) {
              newNodes[node.parentId] = {
                ...parent,
                children: parent.children.filter((c) => c !== id),
                modifiedAt: Date.now(),
              };
            }

            return { ...s, nodes: newNodes };
          });
        },

        moveNode: (id, newParentId) => {
          set((s) => {
            const node = s.nodes[id];
            const newParent = s.nodes[newParentId];
            if (!node || !newParent || node.parentId === null) return s;
            if (node.parentId === newParentId) return s;

            const oldParent = s.nodes[node.parentId!];
            const newNodes = { ...s.nodes };

            if (oldParent) {
              newNodes[oldParent.id] = {
                ...oldParent,
                children: oldParent.children.filter((c) => c !== id),
              };
            }

            newNodes[newParentId] = {
              ...newParent,
              children: [...newParent.children, id],
            };

            newNodes[id] = {
              ...node,
              parentId: newParentId,
              modifiedAt: Date.now(),
            };

            return { ...s, nodes: newNodes };
          });
        },

        addTag: (id, tagId) => {
          set((s) => {
            const node = s.nodes[id];
            if (!node || node.tags.includes(tagId)) return s;
            return {
              ...s,
              nodes: {
                ...s.nodes,
                [id]: { ...node, tags: [...node.tags, tagId] },
              },
            };
          });
        },

        removeTag: (id, tagId) => {
          set((s) => {
            const node = s.nodes[id];
            if (!node) return s;
            return {
              ...s,
              nodes: {
                ...s.nodes,
                [id]: { ...node, tags: node.tags.filter((t) => t !== tagId) },
              },
            };
          });
        },

        toggleTag: (id, tagId) => {
          const node = get().nodes[id];
          if (!node) return;
          if (node.tags.includes(tagId)) {
            get().removeTag(id, tagId);
          } else {
            get().addTag(id, tagId);
          }
        },

        updateContent: (id, content) => {
          set((s) => {
            const node = s.nodes[id];
            if (!node) return s;
            return {
              ...s,
              nodes: {
                ...s.nodes,
                [id]: { ...node, content, modifiedAt: Date.now() },
              },
            };
          });
        },

        resetToSeed: () => {
          const fresh = createSeedNodes();
          set({ nodes: fresh.nodes, _idCounter: fresh.counter });
        },
      };
    },
    {
      name: 'tahoe-fs',
      partialize: (s) => ({ nodes: s.nodes, _idCounter: s._idCounter }),
    },
  ),
);
