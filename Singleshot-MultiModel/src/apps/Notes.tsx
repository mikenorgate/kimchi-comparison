import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useAppDataStore } from '../stores/appDataStore';
import { useWindowStore } from '../stores/windowStore';

interface NotesProps {
  windowId: string;
}

function deriveTitle(body: string): string {
  const firstLine = body.split(/\r?\n/).find((line) => line.trim().length > 0);
  if (!firstLine) return 'New Note';
  const trimmed = firstLine.trim();
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
}

function formatTimestamp(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function Notes({ windowId }: NotesProps) {
  const notes = useAppDataStore((s) => s.notes);
  const noteOrder = useAppDataStore((s) => s.noteOrder);
  const createNote = useAppDataStore((s) => s.createNote);
  const updateNote = useAppDataStore((s) => s.updateNote);
  const deleteNote = useAppDataStore((s) => s.deleteNote);
  const setWindowTitle = useWindowStore((s) => s.setTitle);

  const orderedNotes = useMemo(() => {
    const result = [];
    for (const id of noteOrder) {
      const note = notes[id];
      if (note) result.push(note);
    }
    return result;
  }, [noteOrder, notes]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Pick a sensible selection on first render: most recent note or create one.
  useEffect(() => {
    if (selectedId && notes[selectedId]) return;
    if (orderedNotes.length > 0) {
      setSelectedId(orderedNotes[0].id);
      return;
    }
    const id = createNote(deriveTitle('Welcome to Notes.\n\nStart typing here.'), 'Welcome to Notes.\n\nStart typing here.');
    setSelectedId(id);
    // Run only on mount; createNote is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the active note changes, sync the window title.
  useEffect(() => {
    const note = selectedId ? notes[selectedId] : null;
    if (!note) return;
    const title = note.title && note.title !== 'New Note' ? note.title : 'Notes';
    setWindowTitle(windowId, title);
  }, [notes, selectedId, setWindowTitle, windowId]);

  const selectedNote = selectedId ? notes[selectedId] : null;

  const handleCreate = () => {
    const id = createNote('New Note', '');
    setSelectedId(id);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    if (selectedId === id) {
      const remaining = noteOrder.filter((nid) => nid !== id);
      const next = remaining[0];
      setSelectedId(next ?? null);
      if (!next) {
        // Keep the user with at least one note so the editor stays usable.
        const fresh = createNote('New Note', '');
        setSelectedId(fresh);
      }
    }
  };

  const handleBodyChange = (body: string) => {
    if (!selectedNote) return;
    const nextTitle = deriveTitle(body);
    updateNote(selectedNote.id, {
      body,
      title: nextTitle,
    });
  };

  return (
    <div
      data-testid="notes-app"
      data-window-id={windowId}
      className="flex h-full bg-white text-neutral-900"
    >
      <aside className="w-56 border-r border-neutral-200 flex flex-col bg-neutral-50">
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Notes
          </span>
          <button
            type="button"
            data-testid="new-note-btn"
            onClick={handleCreate}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
            aria-label="New note"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
        <ul data-testid="notes-list" className="flex-1 overflow-y-auto">
          {orderedNotes.length === 0 && (
            <li className="px-3 py-4 text-xs text-neutral-400 italic">No notes yet.</li>
          )}
          {orderedNotes.map((note) => {
            const active = note.id === selectedId;
            return (
              <li
                key={note.id}
                className={`flex items-stretch border-b border-neutral-100 hover:bg-white ${
                  active ? 'bg-white shadow-inner' : ''
                }`}
              >
                <div
                  role="listitem"
                  tabIndex={0}
                  aria-current={active ? 'true' : undefined}
                  data-testid={`note-item-${note.id}`}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => setSelectedId(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(note.id);
                    }
                  }}
                  className="flex-1 cursor-pointer px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <div
                    data-testid={`note-title-${note.id}`}
                    className={`truncate text-sm ${active ? 'font-semibold text-neutral-900' : 'text-neutral-800'}`}
                  >
                    {note.title || 'New Note'}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="truncate">{formatTimestamp(note.updatedAt)}</span>
                  </div>
                </div>
                {active && (
                  <button
                    type="button"
                    data-testid={`delete-note-${note.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="m-2 inline-flex items-center gap-1 self-start rounded px-1 py-0.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-neutral-500" />
                <span
                  data-testid="note-active-title"
                  className="truncate text-sm font-medium text-neutral-800"
                >
                  {selectedNote.title || 'New Note'}
                </span>
              </div>
              <span className="text-xs text-neutral-400">
                {formatTimestamp(selectedNote.updatedAt)}
              </span>
            </header>
            <textarea
              key={selectedNote.id}
              data-testid="note-editor"
              value={selectedNote.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Start typing your note…"
              className="flex-1 resize-none bg-white px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none focus:outline-none"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
            Select or create a note to start writing.
          </div>
        )}
      </section>
    </div>
  );
}
