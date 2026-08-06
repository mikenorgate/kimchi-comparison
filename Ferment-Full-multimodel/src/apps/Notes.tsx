import { useCallback, useMemo, useState } from 'react';

import { Plus, Search, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  body: string;
  /** ISO date string for display in the sidebar. */
  updatedAt: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to Notes',
    body:
      'Tahoe Notes is a simple place to jot down thoughts. Try selecting a note from the sidebar, or create a new one with the + button.',
    updatedAt: '2026-01-12T09:15:00Z',
  },
  {
    id: 'note-tahoe-ideas',
    title: 'Tahoe ideas',
    body:
      '- Multi-window apps\n- Mock file system shared with Terminal\n- Drag-and-drop file moves in Finder\n- Spotlight that searches notes',
    updatedAt: '2026-01-08T17:42:00Z',
  },
  {
    id: 'note-shopping',
    title: 'Shopping list',
    body: 'Milk\nBread\nCoffee\nApples\nEggs',
    updatedAt: '2025-12-29T08:00:00Z',
  },
  {
    id: 'note-reading',
    title: 'Reading list',
    body: '- The Pragmatic Programmer\n- Designing Data-Intensive Applications\n- A Philosophy of Software Design',
    updatedAt: '2025-11-21T19:30:00Z',
  },
];

let noteIdCounter = 0;
function nextNoteId(): string {
  noteIdCounter += 1;
  return `note-${Date.now()}-${noteIdCounter}`;
}

/** Format an ISO date string into a short human-friendly label. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

/**
 * Notes app — sidebar list of notes + editor. Notes live in component
 * state; nothing persists beyond the session. The selected note id is
 * also kept in component state.
 */
export function Notes({ windowId: _windowId }: { windowId: string }): JSX.Element {
  void _windowId;

  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [selectedId, setSelectedId] = useState<string | null>(
    INITIAL_NOTES[0]?.id ?? null,
  );
  const [search, setSearch] = useState<string>('');

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    );
  }, [notes, search]);

  const createNote = useCallback(() => {
    const note: Note = {
      id: nextNoteId(),
      title: 'New note',
      body: '',
      updatedAt: new Date().toISOString(),
    };
    setNotes((current) => [note, ...current]);
    setSelectedId(note.id);
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((current) => {
        const next = current.filter((n) => n.id !== id);
        if (id === selectedId) {
          setSelectedId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [selectedId],
  );

  const updateSelected = useCallback(
    (patch: Partial<Pick<Note, 'title' | 'body'>>) => {
      setNotes((current) =>
        current.map((n) =>
          n.id === selectedId
            ? { ...n, ...patch, updatedAt: new Date().toISOString() }
            : n,
        ),
      );
    },
    [selectedId],
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: '#ffffff',
        color: '#1d1d1f',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          borderRight: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(245,245,247,0.7)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: '10px 10px 6px 10px',
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            <Search size={12} aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes"
              aria-label="Search notes"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 12,
                color: '#1d1d1f',
              }}
            />
          </div>
          <button
            type="button"
            onClick={createNote}
            aria-label="New note"
            title="New note"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6e6e73',
            }}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 6px 6px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 12,
                fontSize: 12,
                color: '#6e6e73',
                textAlign: 'center',
              }}
            >
              No notes match "{search}"
            </div>
          ) : (
            filtered.map((note) => {
              const isSelected = note.id === selectedId;
              return (
                <div
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(note.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedId(note.id);
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: isSelected ? '#f4d35e' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 2,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1d1d1f',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {note.title || 'Untitled'}
                    </span>
                    <span style={{ fontSize: 10, color: '#6e6e73' }}>
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#6e6e73',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 2,
                    }}
                  >
                    {note.body.split('\n')[0] || 'No additional text'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Editor */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: '#ffffff',
        }}
      >
        {selected ? (
          <>
            <div
              style={{
                padding: '14px 24px 6px 24px',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <input
                type="text"
                value={selected.title}
                onChange={(event) => updateSelected({ title: event.target.value })}
                placeholder="Title"
                aria-label="Note title"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1d1d1f',
                  padding: 0,
                }}
              />
              <button
                type="button"
                onClick={() => deleteNote(selected.id)}
                aria-label="Delete note"
                title="Delete note"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6e6e73',
                }}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
            <textarea
              value={selected.body}
              onChange={(event) => updateSelected({ body: event.target.value })}
              placeholder="Start writing…"
              aria-label="Note body"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '12px 24px 24px 24px',
                fontSize: 14,
                lineHeight: 1.5,
                color: '#1d1d1f',
                background: 'transparent',
                fontFamily: 'inherit',
              }}
            />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: '#6e6e73',
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 36 }}>📝</div>
            <div>No note selected</div>
            <button
              type="button"
              onClick={createNote}
              style={{
                marginTop: 4,
                padding: '6px 12px',
                background: 'var(--color-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Create note
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Notes;
