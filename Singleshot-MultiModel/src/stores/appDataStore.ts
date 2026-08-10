import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CalculatorHistoryEntry,
  NoteData,
  SafariRecentUrl,
  TerminalHistoryLine,
} from '../types';

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export interface AppDataState {
  // Calculator
  calculatorMemory: number;
  calculatorHistory: CalculatorHistoryEntry[];

  // Notes
  notes: Record<string, NoteData>;
  noteOrder: string[];

  // Terminal
  terminalHistory: TerminalHistoryLine[];
  terminalCwd: string; // node id

  // Safari
  safariRecent: SafariRecentUrl[];

  // Calculator actions
  setCalculatorMemory: (value: number) => void;
  addCalculatorEntry: (expression: string, result: string) => void;
  clearCalculatorHistory: () => void;

  // Notes actions
  createNote: (title?: string, body?: string) => string;
  updateNote: (id: string, patch: Partial<Pick<NoteData, 'title' | 'body'>>) => void;
  deleteNote: (id: string) => void;
  getNotes: () => NoteData[];

  // Terminal actions
  appendTerminal: (line: Omit<TerminalHistoryLine, 'id' | 'createdAt'>) => void;
  clearTerminal: () => void;
  setTerminalCwd: (nodeId: string) => void;

  // Safari actions
  addRecentUrl: (url: string, title?: string) => void;
  clearRecentUrls: () => void;
}

const DEFAULTS = {
  calculatorMemory: 0,
  calculatorHistory: [] as CalculatorHistoryEntry[],
  notes: {} as Record<string, NoteData>,
  noteOrder: [] as string[],
  terminalHistory: [] as TerminalHistoryLine[],
  terminalCwd: 'root',
  safariRecent: [] as SafariRecentUrl[],
};

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setCalculatorMemory: (value) => set({ calculatorMemory: value }),
      addCalculatorEntry: (expression, result) => {
        const entry: CalculatorHistoryEntry = {
          id: generateId('calc'),
          expression,
          result,
          createdAt: Date.now(),
        };
        set({ calculatorHistory: [entry, ...get().calculatorHistory].slice(0, 100) });
      },
      clearCalculatorHistory: () => set({ calculatorHistory: [] }),

      createNote: (title = 'New Note', body = '') => {
        const now = Date.now();
        const id = generateId('note');
        const note: NoteData = {
          id,
          title,
          body,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          notes: { ...state.notes, [id]: note },
          noteOrder: [id, ...state.noteOrder],
        }));
        return id;
      },
      updateNote: (id, patch) => {
        const note = get().notes[id];
        if (!note) return;
        const updated: NoteData = { ...note, ...patch, updatedAt: Date.now() };
        set((state) => ({ notes: { ...state.notes, [id]: updated } }));
      },
      deleteNote: (id) => {
        set((state) => {
          const rest: Record<string, NoteData> = {};
          for (const [nid, note] of Object.entries(state.notes)) {
            if (nid !== id) rest[nid] = note;
          }
          return {
            notes: rest,
            noteOrder: state.noteOrder.filter((nid) => nid !== id),
          };
        });
      },
      getNotes: () => {
        const { notes, noteOrder } = get();
        return noteOrder.map((id) => notes[id]).filter((n): n is NoteData => Boolean(n));
      },

      appendTerminal: (line) => {
        const entry: TerminalHistoryLine = {
          ...line,
          id: generateId('term'),
          createdAt: Date.now(),
        };
        set({ terminalHistory: [...get().terminalHistory, entry] });
      },
      clearTerminal: () => set({ terminalHistory: [] }),
      setTerminalCwd: (nodeId) => set({ terminalCwd: nodeId }),

      addRecentUrl: (url, title) => {
        const filtered = get().safariRecent.filter((r) => r.url !== url);
        const entry: SafariRecentUrl = {
          id: generateId('url'),
          url,
          title,
          visitedAt: Date.now(),
        };
        set({ safariRecent: [entry, ...filtered].slice(0, 20) });
      },
      clearRecentUrls: () => set({ safariRecent: [] }),
    }),
    {
      name: 'tahoe.appdata',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
