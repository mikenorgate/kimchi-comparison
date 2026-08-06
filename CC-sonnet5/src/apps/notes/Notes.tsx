import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppMenuActions } from '../../os/menuActionStore';
import './notes.css';

interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

const STORAGE_KEY = 'tahoe-notes';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function Notes({ windowId }: { windowId: string }) {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [selectedId, setSelectedId] = useState<string | null>(() => loadNotes()[0]?.id ?? null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const newNote = () => {
    const note: Note = { id: uuid(), title: 'New Note', body: '', updatedAt: Date.now() };
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
  };

  const updateBody = (body: string) => {
    if (!selected) return;
    const firstLine = body.split('\n')[0].trim() || 'New Note';
    setNotes((prev) =>
      prev.map((n) => (n.id === selected.id ? { ...n, body, title: firstLine, updatedAt: Date.now() } : n)),
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  useAppMenuActions(windowId, {
    new: newNote,
    delete: () => selectedId && deleteNote(selectedId),
  });

  return (
    <div className="notes-app">
      <div className="notes-sidebar">
        <button className="notes-new" onClick={newNote}>
          + New Note
        </button>
        <div className="notes-list">
          {sorted.map((n) => (
            <div
              key={n.id}
              className={`notes-item ${n.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(n.id)}
            >
              <div className="notes-item-title">{n.title || 'New Note'}</div>
              <div className="notes-item-preview">{n.body.split('\n').slice(1).join(' ').slice(0, 60) || 'No additional text'}</div>
              <button
                className="notes-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(n.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
          {sorted.length === 0 && <div className="notes-empty">No notes yet</div>}
        </div>
      </div>
      <div className="notes-editor">
        {selected ? (
          <textarea
            key={selected.id}
            className="notes-textarea"
            defaultValue={selected.body}
            onChange={(e) => updateBody(e.target.value)}
            placeholder="Start typing..."
            autoFocus
          />
        ) : (
          <div className="notes-placeholder">Select or create a note</div>
        )}
      </div>
    </div>
  );
}
