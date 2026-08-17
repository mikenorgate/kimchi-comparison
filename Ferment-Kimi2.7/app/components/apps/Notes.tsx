'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

const STORAGE_KEY = 'tahoe-notes';

const defaultNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome',
    body: 'This is a simple notes app. Select a note from the list to edit it.',
    updatedAt: Date.now(),
  },
  {
    id: 'note-2',
    title: 'Ideas',
    body: ' - Build a Tahoe desktop replica\n - Add more apps',
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [activeId, setActiveId] = useState<string>(defaultNotes[0].id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Note[];
        if (parsed.length > 0) {
          setNotes(parsed);
          setActiveId(parsed[0].id);
        }
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotes));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore storage errors
    }
  }, [notes, mounted]);

  const activeNote = notes.find((n) => n.id === activeId) ?? notes[0] ?? null;

  const updateActive = (partial: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? { ...n, ...partial, updatedAt: Date.now() }
          : n
      )
    );
  };

  const addNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      body: '',
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      if (remaining.length === 0) {
        const fallback: Note = {
          id: `note-${Date.now()}`,
          title: 'New Note',
          body: '',
          updatedAt: Date.now(),
        };
        remaining.push(fallback);
      }
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
      return remaining;
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      <aside
        className="flex h-full w-56 flex-col border-r"
        style={{ borderColor: 'var(--window-border)', background: 'var(--window-bg)' }}
        data-testid="notes-sidebar"
      >
        <div
          className="flex items-center justify-between border-b px-3 py-2"
          style={{ borderColor: 'var(--window-border)' }}
        >
          <span className="text-sm font-semibold">Notes</span>
          <button
            data-testid="notes-new"
            onClick={addNote}
            className="rounded-md p-1 hover:bg-foreground/10"
            aria-label="New note"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto py-1">
          {notes.map((note) => (
            <button
              key={note.id}
              data-testid={`notes-item-${note.id}`}
              onClick={() => setActiveId(note.id)}
              className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors ${
                activeId === note.id ? 'bg-accent text-accent-foreground' : 'hover:bg-foreground/5'
              }`}
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{note.title || 'Untitled'}</div>
                <div className="truncate text-xs opacity-60">
                  {note.body.trim() || 'No additional text'}
                </div>
                <div className="mt-0.5 text-[10px] opacity-50">{formatDate(note.updatedAt)}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex flex-1 flex-col bg-background" data-testid="notes-editor">
        {activeNote ? (
          <>
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderColor: 'var(--window-border)' }}
            >
              <input
                data-testid="notes-title"
                value={activeNote.title}
                onChange={(e) => updateActive({ title: e.target.value })}
                placeholder="Title"
                className="flex-1 bg-transparent text-lg font-semibold outline-none placeholder:opacity-40"
              />
              <button
                data-testid="notes-delete"
                onClick={() => deleteNote(activeNote.id)}
                className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              data-testid="notes-body"
              value={activeNote.body}
              onChange={(e) => updateActive({ body: e.target.value })}
              placeholder="Start typing..."
              className="flex-1 resize-none bg-transparent px-4 py-3 outline-none placeholder:opacity-40"
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
