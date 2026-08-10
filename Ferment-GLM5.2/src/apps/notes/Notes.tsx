/**
 * Notes — macOS Tahoe Notes app.
 *
 * Features:
 * - Note list with title preview and modification date
 * - Create new note (button in toolbar)
 * - Edit note body in textarea (title auto-derived from first line)
 * - Delete note (button in toolbar)
 * - Search notes by title/body
 * - Notes persisted to localStorage via useNotesStore
 */

import { useState, useRef, useEffect } from 'react';
import { useNotesStore } from '@/store/notes';

interface NotesProps {
  appId: string;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function Notes({ appId: _appId }: NotesProps) {
  const notes = useNotesStore((s) => s.notes);
  const selectedId = useNotesStore((s) => s.selectedId);
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const createNote = useNotesStore((s) => s.createNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const selectNote = useNotesStore((s) => s.selectNote);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);
  const getFilteredNotes = useNotesStore((s) => s.getFilteredNotes);

  const filteredNotes = getFilteredNotes();
  const selectedNote = notes.find((n) => n.id === selectedId);

  const [editBody, setEditBody] = useState(selectedNote?.body ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local edit state when selected note changes
  useEffect(() => {
    setEditBody(selectedNote?.body ?? '');
    if (selectedNote) {
      // Focus textarea when a note is selected
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [selectedId, selectedNote]);

  const handleBodyChange = (value: string) => {
    setEditBody(value);
    if (selectedId) {
      updateNote(selectedId, value);
    }
  };

  const handleCreate = () => {
    createNote();
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteNote(selectedId);
    }
  };

  return (
    <div className="flex h-full w-full" data-testid="notes-root">
      {/* Sidebar: note list + search */}
      <div className="w-72 shrink-0 flex flex-col border-r border-black/5 dark:border-white/5" data-testid="notes-sidebar">
        {/* Search bar */}
        <div className="p-2 border-b border-black/5 dark:border-white/5">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-sm text-black/80 dark:text-white/80 placeholder:text-black/30 dark:placeholder:text-white/30 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="notes-search"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-black/5 dark:border-white/5">
          <button
            className="px-2 py-1 rounded text-xs text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={handleCreate}
            data-testid="notes-new"
          >
            ✏ New
          </button>
          <button
            className="px-2 py-1 rounded text-xs text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
            onClick={handleDelete}
            disabled={!selectedId}
            data-testid="notes-delete"
          >
            🗑 Delete
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto" data-testid="notes-list">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              className={`w-full text-left px-3 py-2.5 border-b border-black/3 dark:border-white/3 transition-colors ${
                selectedId === note.id
                  ? 'bg-[#ffd700]/20'
                  : 'hover:bg-black/3 dark:hover:bg-white/3'
              }`}
              onClick={() => selectNote(note.id)}
              data-testid={`notes-item-${note.id}`}
            >
              <div className="text-sm font-medium text-black/80 dark:text-white/80 truncate">
                {note.title || 'New Note'}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-black/40 dark:text-white/40">
                  {formatRelativeTime(note.modifiedAt)}
                </span>
                <span className="text-xs text-black/30 dark:text-white/30 truncate">
                  {note.body.split('\n').slice(1).join(' ').trim().slice(0, 40) || 'No additional text'}
                </span>
              </div>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-sm text-black/30 dark:text-white/30 text-center py-8" data-testid="notes-empty">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col" data-testid="notes-editor">
        {selectedNote ? (
          <>
            <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 text-xs text-black/40 dark:text-white/40">
              {new Date(selectedNote.modifiedAt).toLocaleString()}
            </div>
            <textarea
              ref={textareaRef}
              className="flex-1 w-full p-4 bg-transparent text-sm text-black/80 dark:text-white/80 outline-none resize-none font-sans leading-relaxed"
              value={editBody}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Start writing..."
              data-testid="notes-textarea"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-black/30 dark:text-white/30 text-sm" data-testid="notes-no-selection">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
