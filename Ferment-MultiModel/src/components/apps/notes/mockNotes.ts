/**
 * In-memory mock dataset and immutable helpers for the Notes app.
 *
 * Conventions:
 * - Notes are stored as plain objects keyed by id so the dataset
 *   stays flat and trivially freezable.
 * - `updatedAt` is an ISO-8601 string rather than a `Date` object
 *   so the seed dataset is JSON-stable and `Object.freeze`-safe.
 *   The UI formats it for display at render time.
 * - The exported {@link initialMockNotes} constant is deeply frozen
 *   at module load; the helpers below return new objects so callers
 *   never mutate the shared seed.
 * - Notes do not own any kind of folder / tag system — the UI is a
 *   flat list sorted by `updatedAt` descending. That matches what
 *   the macOS Notes default view shows when "All iCloud" or the
 *   "Notes" smart folder is selected.
 */

/**
 * A single note. Body is plain text (no markdown rendering in this
 * step) so the editor can be a straightforward textarea.
 */
export interface Note {
  /** Stable unique identifier (e.g. "note-001"). */
  readonly id: string;
  /** Headline shown in the note list and at the top of the editor. */
  readonly title: string;
  /** Plain-text body. Multi-line content is preserved verbatim. */
  readonly body: string;
  /**
   * ISO-8601 timestamp of the last edit. Drives the list sort order
   * and the "Updated …" caption in the editor.
   */
  readonly updatedAt: string;
}

/**
 * Snapshot of a notes dataset — a frozen record of notes keyed by id
 * plus an `order` array that drives the sidebar list. The `order`
 * array is always kept in sync with the record so we can render the
 * list without re-sorting on every keystroke.
 */
export interface NotesDataset {
  readonly notes: Readonly<Record<string, Note>>;
  readonly order: readonly string[];
}

/**
 * Return the notes in display order (most recently updated first).
 * The `order` array is already sorted, but we re-derive the rows
 * here so tests can build custom fixtures without having to maintain
 * the order array themselves.
 */
export function listNotesInOrder(
  dataset: NotesDataset = initialMockNotes
): readonly Note[] {
  const rows: Note[] = [];
  for (const id of dataset.order) {
    const note = dataset.notes[id];
    if (note) rows.push(note);
  }
  return rows;
}

/**
 * Build a brand-new blank note with a generated id and a default
 * title. The id is deterministic when `now` is provided so tests can
 * assert against it; otherwise the id is derived from `Date.now()`
 * and a counter so successive calls produce distinct ids in the same
 * millisecond.
 */
let noteCounter = 0;
export function buildBlankNote(now?: Date): Note {
  if (now === undefined) {
    noteCounter += 1;
    // Use a synthetic timestamp so two blank notes created in the
    // same render still end up with distinct ids. The counter is
    // monotonically increasing within a single page load.
    return makeBlankNoteWithTimestamp(
      `note-new-${noteCounter}`,
      new Date()
    );
  }
  // When `now` is supplied (test fixture path), derive the id from
  // the timestamp so the result is fully deterministic.
  const id = `note-new-${now.getTime()}`;
  return makeBlankNoteWithTimestamp(id, now);
}

function makeBlankNoteWithTimestamp(id: string, now: Date): Note {
  // Truncate milliseconds so two blank notes created back-to-back
  // share an updatedAt and therefore appear next to each other in
  // the sorted list — which is what macOS Notes does too.
  const truncated = new Date(now.getTime() - (now.getTime() % 1000));
  return {
    id,
    title: "New Note",
    body: "",
    updatedAt: truncated.toISOString(),
  };
}

/**
 * Sort comparator for {@link NotesDataset.order}. Most recently
 * updated notes appear first; ties break on the note id so the
 * order is fully deterministic.
 */
function compareByUpdatedDesc(a: Note, b: Note): number {
  if (a.updatedAt === b.updatedAt) {
    return a.id.localeCompare(b.id);
  }
  // ISO-8601 strings sort lexicographically in chronological order,
  // so reverse the comparison to get "most recent first".
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

/**
 * Build a fresh {@link NotesDataset} from a flat note array, sorting
 * the result by `updatedAt` descending and returning an immutable
 * structure. Used by all of the mutation helpers below.
 */
function assembleDataset(notes: readonly Note[]): NotesDataset {
  const sorted = notes.slice().sort(compareByUpdatedDesc);
  const map: Record<string, Note> = {};
  const order: string[] = [];
  for (const note of sorted) {
    map[note.id] = note;
    order.push(note.id);
  }
  return { notes: Object.freeze(map), order: Object.freeze(order) };
}

/**
 * Add a note to the dataset. Returns a brand-new dataset with the
 * note inserted and the order array updated.
 */
export function addNote(note: Note, dataset: NotesDataset): NotesDataset {
  const all = listNotesInOrder(dataset).concat([note]);
  return assembleDataset(all);
}

/**
 * Replace a note's title, body, or both, bumping its `updatedAt`
 * timestamp. Returns the same dataset reference when the id does
 * not exist so callers can detect the no-op via reference equality.
 */
export function updateNote(
  id: string,
  changes: { readonly title?: string; readonly body?: string },
  dataset: NotesDataset,
  now: Date = new Date()
): NotesDataset {
  const existing = dataset.notes[id];
  if (!existing) return dataset;
  const merged: Note = {
    id: existing.id,
    title: changes.title ?? existing.title,
    body: changes.body ?? existing.body,
    updatedAt: now.toISOString(),
  };
  const others = listNotesInOrder(dataset).filter((n) => n.id !== id);
  return assembleDataset(others.concat([merged]));
}

/**
 * Remove a note from the dataset. Returns the same dataset reference
 * when the id does not exist so callers can detect the no-op via
 * reference equality.
 */
export function removeNote(id: string, dataset: NotesDataset): NotesDataset {
  if (!dataset.notes[id]) return dataset;
  const remaining = listNotesInOrder(dataset).filter((n) => n.id !== id);
  return assembleDataset(remaining);
}

/**
 * Format an ISO timestamp as a friendly "Updated …" label. The
 * output is intentionally not locale-aware so tests don't have to
 * stub `Intl`. The clock uses UTC so the rendered value matches the
 * stored value regardless of where the test runs.
 */
export function formatUpdatedAt(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const sameDay =
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();
  if (sameDay) {
    const hours24 = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours12}:${mm} ${period}`;
  }
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  // Two-digit year is enough for a "list view" caption and keeps the
  // row narrow enough not to wrap.
  const yy = year % 100;
  const yyStr = yy < 10 ? `0${yy}` : `${yy}`;
  return `${month} ${day}, '${yyStr}`;
}

/**
 * Format an ISO timestamp as a short preview label for the note
 * list — e.g. "2:30 PM" today, or "Jan 15" otherwise. Mirrors the
 * label the macOS Notes sidebar uses.
 */
export function formatNoteListDate(
  iso: string,
  now: Date = new Date()
): string {
  return formatUpdatedAt(iso, now);
}

/**
 * The frozen seed dataset that powers the Notes app by default.
 * Five mock notes spanning a variety of lengths and freshness so
 * the seeded list view has interesting visual variation.
 *
 * Tests can swap in a smaller fixture via the `initialNotes` prop
 * on `<Notes />`.
 */
export const initialMockNotes: NotesDataset = Object.freeze({
  notes: Object.freeze({
    "note-001": Object.freeze({
      id: "note-001",
      title: "Tahoe launch checklist",
      body:
        "Final pre-launch checklist for the macOS Tahoe build:\n\n" +
        "1. Verify Mail, Calendar, Notes, Finder, Safari all boot clean.\n" +
        "2. Confirm Dock indicators update when apps are focused.\n" +
        "3. Smoke-test the window manager's minimize / maximize flow.\n" +
        "4. Capture screenshots for the marketing site.\n",
      updatedAt: "2025-01-15T17:45:00.000Z",
    }),
    "note-002": Object.freeze({
      id: "note-002",
      title: "Recipe — Lemon pasta",
      body:
        "Quick weeknight lemon pasta:\n\n" +
        "- 250 g spaghetti\n" +
        "- 1 lemon (zest + juice)\n" +
        "- 60 g unsalted butter\n" +
        "- 30 g parmesan, finely grated\n" +
        "- Black pepper, sea salt\n\n" +
        "Cook the pasta. Melt butter, add lemon zest and a splash of " +
        "pasta water. Toss with the drained pasta, parmesan, and lemon " +
        "juice. Season to taste and serve immediately.",
      updatedAt: "2025-01-14T19:10:00.000Z",
    }),
    "note-003": Object.freeze({
      id: "note-003",
      title: "Reading list — Q1",
      body:
        "Books to get through before the end of Q1:\n\n" +
        "- The Pragmatic Programmer (re-read)\n" +
        "- Designing Data-Intensive Applications, ch. 5–9\n" +
        "- A return to mountain biking — pick up a new helmet\n",
      updatedAt: "2025-01-12T08:00:00.000Z",
    }),
    "note-004": Object.freeze({
      id: "note-004",
      title: "Quick thought",
      body: "Coffee with Avery on Friday moved to 11 AM.",
      updatedAt: "2025-01-10T15:30:00.000Z",
    }),
    "note-005": Object.freeze({
      id: "note-005",
      title: "Trip — Yosemite",
      body:
        "Plan for the long weekend:\n\n" +
        "- Drive in Friday evening, stay in Mariposa\n" +
        "- Glacier Point at sunrise Saturday\n" +
        "- Mist Trail if the water level cooperates\n" +
        "- Cook dinner at the cabin Sunday night\n",
      updatedAt: "2025-01-08T21:20:00.000Z",
    }),
  }),
  order: Object.freeze([
    "note-001",
    "note-002",
    "note-003",
    "note-004",
    "note-005",
  ]),
}) as NotesDataset;
