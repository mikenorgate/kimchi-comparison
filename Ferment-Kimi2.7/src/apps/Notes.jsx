import { useState } from 'react';
import './Notes.css';

const DEFAULT_NOTES = [
  {
    id: 'n1',
    title: 'Tahoe Design Ideas',
    body: 'Liquid Glass effects\nTransparent menu bar\nRefined Dock\nNew Spotlight UI\nControl Center sliders',
    updated: 'Today, 9:41 AM',
    pinned: true,
  },
  {
    id: 'n2',
    title: 'Grocery List',
    body: '- Almond milk\n- Sourdough bread\n- Avocados\n- Blueberries\n- Coffee beans',
    updated: 'Yesterday, 6:15 PM',
    pinned: false,
  },
  {
    id: 'n3',
    title: 'Project Roadmap',
    body: 'Phase 1: Scaffold\nPhase 2: Window Manager\nPhase 3: Core Apps\nPhase 4: Utilities + Overlays\nPhase 5: Polish',
    updated: 'Aug 14, 2026',
    pinned: false,
  },
];

export default function Notes() {
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [selectedId, setSelectedId] = useState(DEFAULT_NOTES[0].id);
  const [search, setSearch] = useState('');

  const selectedNote = notes.find((n) => n.id === selectedId) || notes[0];

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase())
  );

  const updateNote = (updates) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? { ...n, ...updates, updated: 'Just now' }
          : n
      )
    );
  };

  const createNote = () => {
    const newNote = {
      id: `n${Date.now()}`,
      title: 'New Note',
      body: '',
      updated: 'Just now',
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  const deleteNote = () => {
    if (notes.length <= 1) return;
    setNotes((prev) => {
      const nextNotes = prev.filter((n) => n.id !== selectedId);
      const idx = prev.findIndex((n) => n.id === selectedId);
      const nextId = prev[idx === 0 ? 1 : 0]?.id;
      if (nextId) setSelectedId(nextId);
      return nextNotes;
    });
  };

  const togglePin = () => {
    updateNote({ pinned: !selectedNote.pinned });
  };

  return (
    <div className="notes">
      <div className="notes-sidebar">
        <div className="notes-toolbar">
          <button className="notes-tool-button" onClick={createNote} aria-label="New note">
            ✎
          </button>
          <button
            className="notes-tool-button"
            onClick={deleteNote}
            aria-label="Delete note"
          >
            🗑
          </button>
          <button className="notes-tool-button" onClick={togglePin} aria-label="Pin note">
            📌
          </button>
        </div>
        <input
          type="text"
          className="notes-search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search notes"
        />
        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <div className="notes-empty">No notes found</div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                className={`notes-item ${selectedId === note.id ? 'selected' : ''} ${
                  note.pinned ? 'pinned' : ''
                }`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="notes-item-title">
                  {note.pinned && <span className="notes-pin">📌</span>}
                  {note.title || 'Untitled Note'}
                </div>
                <div className="notes-item-preview">{note.body}</div>
                <div className="notes-item-date">{note.updated}</div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="notes-editor">
        <input
          type="text"
          className="notes-title-input"
          value={selectedNote.title}
          onChange={(e) => updateNote({ title: e.target.value })}
          placeholder="Title"
          aria-label="Note title"
        />
        <div className="notes-meta">
          <span>{selectedNote.updated}</span>
          <span>{selectedNote.body.length} characters</span>
        </div>
        <textarea
          className="notes-body-input"
          value={selectedNote.body}
          onChange={(e) => updateNote({ body: e.target.value })}
          placeholder="Start typing..."
          aria-label="Note body"
        />
      </div>
    </div>
  );
}
