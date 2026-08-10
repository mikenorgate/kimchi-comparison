/**
 * Notes Store — persisted note list with CRUD + search.
 *
 * Uses Zustand + persist middleware to localStorage (key: 'tahoe-notes').
 * Each note has: id, title (derived from first line), body, createdAt, modifiedAt.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  modifiedAt: number;
}

export interface NotesState {
  notes: Note[];
  selectedId: string | null;
  searchQuery: string;
  _idCounter: number;

  createNote: () => string;
  updateNote: (id: string, body: string) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  /** Derived: notes filtered by search query */
  getFilteredNotes: () => Note[];
}

// ── Helpers ───────────────────────────────────────────────────────

function deriveTitle(body: string): string {
  const firstLine = body.split('\n')[0].trim();
  if (!firstLine) return 'New Note';
  return firstLine.slice(0, 50);
}

let seedCounter = 0;

function createSeedNotes(): Note[] {
  const now = Date.now();
  seedCounter = 4;
  return [
    {
      id: 'note-seed-0',
      title: 'Welcome to Notes',
      body: 'Welcome to Notes\n\nThis is a mock Notes app for the macOS Tahoe web recreation. Your notes persist to localStorage and survive page reloads.\n\nTry creating a new note, editing, searching, and deleting!',
      createdAt: now - 86400000 * 3,
      modifiedAt: now - 86400000 * 2,
    },
    {
      id: 'note-seed-1',
      title: 'Grocery List',
      body: 'Grocery List\n\n- Milk\n- Eggs\n- Bread\n- Coffee\n- Bananas',
      createdAt: now - 86400000 * 2,
      modifiedAt: now - 86400000,
    },
    {
      id: 'note-seed-2',
      title: 'Meeting Notes',
      body: 'Meeting Notes\n\nQ4 Planning Discussion\n- Ship Phase 3 apps\n- Review design system\n- Plan additional apps\n- Test coverage check',
      createdAt: now - 86400000,
      modifiedAt: now - 3600000,
    },
    {
      id: 'note-seed-3',
      title: 'Ideas',
      body: 'Ideas\n\n1. Add visual regression testing\n2. Mission Control overview\n3. Spotlight file search\n4. Genie minimize animation',
      createdAt: now - 7200000,
      modifiedAt: now - 1800000,
    },
  ];
}

// ── Store ─────────────────────────────────────────────────────────

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => {
      const seedNotes = createSeedNotes();

      return {
        notes: seedNotes,
        selectedId: seedNotes[0]?.id ?? null,
        searchQuery: '',
        _idCounter: seedCounter,

        createNote: () => {
          const id = `note-${get()._idCounter}`;
          const now = Date.now();
          const newNote: Note = {
            id,
            title: 'New Note',
            body: '',
            createdAt: now,
            modifiedAt: now,
          };
          set((s) => ({
            notes: [newNote, ...s.notes],
            selectedId: id,
            _idCounter: s._idCounter + 1,
          }));
          return id;
        },

        updateNote: (id, body) => {
          set((s) => ({
            notes: s.notes.map((n) =>
              n.id === id
                ? { ...n, body, title: deriveTitle(body), modifiedAt: Date.now() }
                : n
            ),
          }));
        },

        deleteNote: (id) => {
          set((s) => {
            const filtered = s.notes.filter((n) => n.id !== id);
            const newSelected =
              s.selectedId === id
                ? (filtered[0]?.id ?? null)
                : s.selectedId;
            return { notes: filtered, selectedId: newSelected };
          });
        },

        selectNote: (id) => set({ selectedId: id }),

        setSearchQuery: (query) => set({ searchQuery: query }),

        getFilteredNotes: () => {
          const { notes, searchQuery } = get();
          if (!searchQuery.trim()) return notes;
          const q = searchQuery.toLowerCase();
          return notes.filter(
            (n) =>
              n.title.toLowerCase().includes(q) ||
              n.body.toLowerCase().includes(q),
          );
        },
      };
    },
    {
      name: 'tahoe-notes',
      partialize: (s) => ({
        notes: s.notes,
        _idCounter: s._idCounter,
      }),
    },
  ),
);
