"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  addNote,
  buildBlankNote,
  formatUpdatedAt,
  initialMockNotes,
  listNotesInOrder,
  removeNote,
  updateNote,
} from "./mockNotes";
import type { Note, NotesDataset } from "./mockNotes";

/**
 * Notes window content.
 *
 * Renders a two-pane macOS-Notes-inspired layout:
 *
 *   | note list (with "+" / trash controls per row) | editor (title + body) |
 *
 * The component owns its own state for:
 *
 * - The current dataset (always derived through the immutable helpers
 *   in `mockNotes.ts` so the seed is never mutated).
 * - The currently selected note id (may be `undefined` when the list
 *   is empty).
 * - A pending delete-target id (drives the inline delete confirmation
 *   UX).
 *
 * Behavioural notes:
 * - Selecting a note populates the editor with that note's title and
 *   body. The selection is "sticky": when the selected note is
 *   deleted, the editor falls back to the first remaining note so
 *   the pane never goes blank mid-flow.
 * - Title and body edits are kept in local component state and
 *   flushed into the dataset synchronously on change. The flush
 *   uses {@link updateNote}, which bumps the `updatedAt` and
 *   therefore moves the note back to the top of the list — matching
 *   real macOS Notes behaviour.
 * - The delete button first reveals an inline "Delete" / "Cancel"
 *   confirmation. Confirming removes the note; canceling hides the
 *   prompt. The confirmation auto-collapses when the user selects a
 *   different note.
 * - The note list order is read straight from
 *   {@link NotesDataset.order}; the dataset helpers keep that array
 *   sorted on every mutation.
 * - When the dataset becomes empty, the editor shows a friendly
 *   "No notes" placeholder so the layout never collapses.
 */

/** Notes-specific delete confirmation state. */
type PendingDeletion = { readonly noteId: string } | null;

export interface NotesProps {
  /**
   * Optional starting dataset. Defaults to {@link initialMockNotes}.
   * Tests can pass a smaller fixture to keep the rendered list
   * compact.
   */
  readonly initialDataset?: NotesDataset;
  /**
   * Optional starting selection id. When omitted the first note in
   * the dataset is selected (or `undefined` when the list is empty).
   * Unknown ids fall back to the same default.
   */
  readonly initialSelectedId?: string;
}

/**
 * Truncate a string for use in the list preview caption. Multi-line
 * bodies get collapsed to a single line so the row stays a fixed
 * height regardless of how chatty the user is.
 */
function previewLine(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) return "No additional text";
  const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? "";
  if (firstLine.length <= 80) return firstLine;
  return firstLine.slice(0, 77) + "...";
}

/**
 * Resolve the initial selection from a dataset. Picks the first
 * ordered id when `requestedId` is unknown or missing.
 */
function resolveInitialSelectedId(
  dataset: NotesDataset,
  requestedId: string | undefined
): string | undefined {
  if (
    requestedId &&
    dataset.order.includes(requestedId) &&
    dataset.notes[requestedId]
  ) {
    return requestedId;
  }
  return dataset.order[0];
}

export default function Notes({
  initialDataset,
  initialSelectedId,
}: NotesProps): JSX.Element {
  const seedDataset: NotesDataset = initialDataset ?? initialMockNotes;
  const seedSelectedId = resolveInitialSelectedId(
    seedDataset,
    initialSelectedId
  );

  const [dataset, setDataset] = useState<NotesDataset>(seedDataset);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    seedSelectedId
  );
  const [pendingDeletion, setPendingDeletion] =
    useState<PendingDeletion>(null);

  // The editor inputs are controlled components, so we keep "draft"
  // copies of the title and body in local state. Each onChange flushes
  // the draft into the dataset so the list re-sorts and the editor
  // stays in sync with the source of truth.
  const [titleDraft, setTitleDraft] = useState<string>(
    seedDataset.notes[seedSelectedId ?? ""]?.title ?? ""
  );
  const [bodyDraft, setBodyDraft] = useState<string>(
    seedDataset.notes[seedSelectedId ?? ""]?.body ?? ""
  );

  // Track the selection so the flush effect can detect transitions
  // and synchronously write back any in-flight draft before we
  // overwrite the drafts with the newly-selected note's content.
  const previousSelectedIdRef = useRef<string | undefined>(seedSelectedId);

  const notes = useMemo(() => listNotesInOrder(dataset), [dataset]);

  const selectedNote: Note | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    return dataset.notes[selectedId];
  }, [dataset, selectedId]);

  // ---------------------------------------------------------------------------
  // Selection / delete / create handlers
  // ---------------------------------------------------------------------------

  /**
   * Select a note by id. Cancels any pending delete confirmation so
   * the prompt doesn't linger when the user has moved on.
   */
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setPendingDeletion(null);
  }, []);

  /**
   * Begin a delete on `id`. Reveals the inline confirmation so the
   * user can either confirm or cancel.
   */
  const handleRequestDelete = useCallback((id: string) => {
    setPendingDeletion({ noteId: id });
  }, []);

  /**
   * Cancel a pending delete confirmation without removing the note.
   */
  const handleCancelDelete = useCallback(() => {
    setPendingDeletion(null);
  }, []);

  /**
   * Confirm a pending delete. Removes the note and advances the
   * selection to a sensible neighbour. If the deleted note was the
   * current selection we move to the first remaining note (or drop
   * the selection when the dataset becomes empty).
   */
  const handleConfirmDelete = useCallback(
    (id: string) => {
      const wasSelected = selectedId === id;
      // Compute the next selection against the post-mutation order
      // so React's batched state updates see a consistent pair of
      // changes when both happen in the same event.
      const nextOrder = dataset.order.filter((nid) => nid !== id);
      const nextSelected = wasSelected ? nextOrder[0] : selectedId;
      setDataset((prev) => removeNote(id, prev));
      setPendingDeletion(null);
      if (wasSelected) {
        setSelectedId(nextSelected);
      }
    },
    [dataset.order, selectedId]
  );

  /**
   * Create a new blank note, add it to the dataset, and select it.
   * The newly-created note gets the default title "New Note" and an
   * empty body — both of which the user can immediately edit in
   * place.
   */
  const handleCreateNote = useCallback(() => {
    const blank = buildBlankNote();
    setDataset((prev) => addNote(blank, prev));
    setSelectedId(blank.id);
    setPendingDeletion(null);
    setTitleDraft(blank.title);
    setBodyDraft(blank.body);
  }, []);

  /**
   * Handle a change to the title input. Updates the local draft and
   * synchronously writes the new value into the dataset so the note
   * moves to the top of the list immediately.
   */
  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setTitleDraft(next);
      const id = selectedId;
      if (!id) return;
      setDataset((prev) =>
        updateNote(id, { title: next }, prev)
      );
    },
    [selectedId]
  );

  /**
   * Handle a change to the body textarea. Mirrors {@link handleTitleChange}
   * but for the body field.
   */
  const handleBodyChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      setBodyDraft(next);
      const id = selectedId;
      if (!id) return;
      setDataset((prev) =>
        updateNote(id, { body: next }, prev)
      );
    },
    [selectedId]
  );

  // Whenever the selection changes, reset the editor drafts to the
  // newly-selected note's title/body. This intentionally depends
  // ONLY on `selectedId`, not on `selectedNote` — the onChange
  // handlers synchronously rebuild the dataset (and therefore the
  // `selectedNote` reference) on every keystroke, so a `selectedNote`
  // dependency would clobber the user's draft while they type.
  useEffect(() => {
    if (previousSelectedIdRef.current === selectedId) {
      return;
    }
    previousSelectedIdRef.current = selectedId;
    const nextId = selectedId;
    const next = nextId ? dataset.notes[nextId] : undefined;
    setTitleDraft(next?.title ?? "");
    setBodyDraft(next?.body ?? "");
    // `dataset.notes` changes whenever the user edits a note, but
    // those edits are *also* what populates the drafts via the
    // onChange handler. Resetting on dataset changes would create a
    // feedback loop that overwrites the user's in-flight input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div
      className="notes"
      data-testid="notes"
      data-selected-note={selectedId ?? ""}
      data-note-count={notes.length}
    >
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        pendingDeletion={pendingDeletion}
        onSelect={handleSelect}
        onRequestDelete={handleRequestDelete}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        onCreate={handleCreateNote}
      />

      <Editor
        note={selectedNote}
        titleDraft={titleDraft}
        bodyDraft={bodyDraft}
        onTitleChange={handleTitleChange}
        onBodyChange={handleBodyChange}
        onRequestDelete={() =>
          selectedId ? handleRequestDelete(selectedId) : undefined
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  readonly notes: readonly Note[];
  readonly selectedId: string | undefined;
  readonly pendingDeletion: PendingDeletion;
  readonly onSelect: (id: string) => void;
  readonly onRequestDelete: (id: string) => void;
  readonly onConfirmDelete: (id: string) => void;
  readonly onCancelDelete: () => void;
  readonly onCreate: () => void;
}

/**
 * Left column: a header bar with a "New Note" button, followed by a
 * vertical list of notes. Each row shows the title, a one-line body
 * preview, and the "Updated …" label. Each row also exposes a
 * delete button that toggles into an inline Delete / Cancel prompt.
 */
function Sidebar({
  notes,
  selectedId,
  pendingDeletion,
  onSelect,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onCreate,
}: SidebarProps): JSX.Element {
  return (
    <aside
      className="notes__sidebar"
      data-testid="notes-sidebar"
      aria-label="Notes"
    >
      <header
        className="notes__sidebar-header"
        data-testid="notes-sidebar-header"
      >
        <h2 className="notes__sidebar-title">Notes</h2>
        <button
          type="button"
          className="notes__new-button"
          data-testid="notes-new"
          aria-label="Create new note"
          title="New Note"
          onClick={onCreate}
        >
          <span aria-hidden="true">{"\u270E"}</span>
        </button>
      </header>

      {notes.length === 0 ? (
        <div
          className="notes__sidebar-empty"
          data-testid="notes-sidebar-empty"
          role="status"
        >
          No notes yet
        </div>
      ) : (
        <ul
          className="notes__sidebar-list"
          data-testid="notes-sidebar-list"
          aria-label="Note list"
        >
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              isSelected={note.id === selectedId}
              pendingDeletion={
                pendingDeletion?.noteId === note.id ? pendingDeletion : null
              }
              onSelect={onSelect}
              onRequestDelete={onRequestDelete}
              onConfirmDelete={onConfirmDelete}
              onCancelDelete={onCancelDelete}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

interface NoteRowProps {
  readonly note: Note;
  readonly isSelected: boolean;
  readonly pendingDeletion: PendingDeletion;
  readonly onSelect: (id: string) => void;
  readonly onRequestDelete: (id: string) => void;
  readonly onConfirmDelete: (id: string) => void;
  readonly onCancelDelete: () => void;
}

/**
 * A single note row in the sidebar. Clicking the row body (or the
 * title) selects the note; clicking the trash button stages a
 * delete; while a delete is staged for this row, the trash button is
 * replaced with a "Delete" / "Cancel" pair. The trash button uses
 * `event.stopPropagation()` so clicking it doesn't also fire the row
 * selection.
 */
function NoteRow({
  note,
  isSelected,
  pendingDeletion,
  onSelect,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: NoteRowProps): JSX.Element {
  const className =
    "notes__row" +
    (isSelected ? " notes__row--selected" : "") +
    (pendingDeletion ? " notes__row--pending" : "");
  return (
    <li
      className={className}
      data-testid={`notes-row-${note.id}`}
      data-note-id={note.id}
      data-selected={isSelected ? "true" : "false"}
      data-pending-deletion={pendingDeletion ? "true" : "false"}
    >
      <button
        type="button"
        className="notes__row-button"
        data-testid={`notes-row-button-${note.id}`}
        onClick={() => onSelect(note.id)}
        aria-current={isSelected ? "true" : undefined}
      >
        <span
          className="notes__row-title"
          data-testid={`notes-row-title-${note.id}`}
        >
          {note.title || "Untitled"}
        </span>
        <span
          className="notes__row-preview"
          data-testid={`notes-row-preview-${note.id}`}
        >
          {previewLine(note.body)}
        </span>
        <span
          className="notes__row-date"
          data-testid={`notes-row-date-${note.id}`}
        >
          {formatUpdatedAt(note.updatedAt)}
        </span>
      </button>
      <div className="notes__row-actions">
        {pendingDeletion ? (
          <>
            <button
              type="button"
              className="notes__row-action notes__row-action--confirm"
              data-testid={`notes-confirm-delete-${note.id}`}
              aria-label="Confirm delete note"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmDelete(note.id);
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="notes__row-action notes__row-action--cancel"
              data-testid={`notes-cancel-delete-${note.id}`}
              aria-label="Cancel delete note"
              onClick={(e) => {
                e.stopPropagation();
                onCancelDelete();
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="notes__row-delete"
            data-testid={`notes-delete-${note.id}`}
            aria-label={`Delete ${note.title || "note"}`}
            title="Delete note"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(note.id);
            }}
          >
            <span aria-hidden="true">{"\u2716"}</span>
          </button>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

interface EditorProps {
  readonly note: Note | undefined;
  readonly titleDraft: string;
  readonly bodyDraft: string;
  readonly onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onBodyChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly onRequestDelete: () => void;
}

/**
 * Right column: a large title input on top of an auto-resizing body
 * textarea. When no note is selected the editor shows a friendly
 * placeholder so the column never collapses. The "Delete" button in
 * the header mirrors the trash control in the list row so users can
 * delete the open note from either side.
 */
function Editor({
  note,
  titleDraft,
  bodyDraft,
  onTitleChange,
  onBodyChange,
  onRequestDelete,
}: EditorProps): JSX.Element {
  if (!note) {
    return (
      <section
        className="notes__editor"
        data-testid="notes-editor"
        data-empty="true"
        aria-label="Note editor"
      >
        <div
          className="notes__editor-empty"
          data-testid="notes-editor-empty"
          role="status"
        >
          <span className="notes__editor-empty-title">No note selected</span>
          <span className="notes__editor-empty-sub">
            Pick a note from the list, or create a new one to get started.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="notes__editor"
      data-testid="notes-editor"
      data-empty="false"
      data-note-id={note.id}
      aria-label="Note editor"
    >
      <header
        className="notes__editor-header"
        data-testid="notes-editor-header"
      >
        <div className="notes__editor-meta">
          <span
            className="notes__editor-updated"
            data-testid="notes-editor-updated"
          >
            Edited {formatUpdatedAt(note.updatedAt)}
          </span>
        </div>
        <button
          type="button"
          className="notes__editor-delete"
          data-testid="notes-editor-delete"
          aria-label="Delete this note"
          title="Delete note"
          onClick={onRequestDelete}
        >
          <span aria-hidden="true">{"\u2716"}</span>
          <span className="notes__editor-delete-label">Delete</span>
        </button>
      </header>
      <input
        type="text"
        className="notes__editor-title"
        data-testid="notes-editor-title"
        value={titleDraft}
        onChange={onTitleChange}
        placeholder="Title"
        aria-label="Note title"
        spellCheck
      />
      <textarea
        className="notes__editor-body"
        data-testid="notes-editor-body"
        value={bodyDraft}
        onChange={onBodyChange}
        placeholder="Start writing..."
        aria-label="Note body"
        spellCheck
      />
    </section>
  );
}
