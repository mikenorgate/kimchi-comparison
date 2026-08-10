import { describe, it, expect, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from '@testing-library/react';
import NotesApp, { NOTES } from '../NotesApp.jsx';

afterEach(() => {
  cleanup();
});

function renderNotesApp(props = {}) {
  return render(<NotesApp {...props} />);
}

// JSDOM does not honour CSS whitespace rules when reading `textContent`,
// so runs of whitespace (including newlines and leading indentation) get
// collapsed. Normalise both sides before comparing.
function normalise(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

describe('<NotesApp />', () => {
  it('renders the root container with the expected testid and app id', () => {
    renderNotesApp();

    const root = screen.getByTestId('notes-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'notes');
  });

  it('renders the note list with every mocked note', () => {
    renderNotesApp();

    const list = screen.getByTestId('notes-list');
    expect(list).toBeInTheDocument();

    // Every mocked note id should produce a corresponding row in the DOM.
    NOTES.forEach((note) => {
      expect(screen.getByTestId(`notes-item-${note.id}`)).toBeInTheDocument();
    });

    const rows = NOTES.map((note) =>
      screen.getByTestId(`notes-item-${note.id}`),
    );
    expect(rows).toHaveLength(NOTES.length);
  });

  it('selects the first note by default and shows it in the detail pane', () => {
    renderNotesApp();

    const firstRow = screen.getByTestId(`notes-item-${NOTES[0].id}`);
    expect(firstRow).toHaveAttribute('data-selected', 'true');

    const detail = screen.getByTestId('notes-detail');
    expect(within(detail).getByTestId('notes-detail-title')).toHaveTextContent(
      NOTES[0].title,
    );
    expect(
      normalise(within(detail).getByTestId('notes-detail-body').textContent),
    ).toBe(normalise(NOTES[0].body));
    expect(within(detail).getByTestId('notes-detail-folder')).toHaveTextContent(
      NOTES[0].folder,
    );
  });

  it('clicking a different note updates the detail pane', () => {
    renderNotesApp();

    // Click every note other than the first and verify the detail pane
    // reflects the newly selected note each time.
    for (let i = 1; i < NOTES.length; i += 1) {
      const target = NOTES[i];
      const row = screen.getByTestId(`notes-item-${target.id}`);
      fireEvent.click(row);

      expect(row).toHaveAttribute('data-selected', 'true');

      const detail = screen.getByTestId('notes-detail');
      expect(
        within(detail).getByTestId('notes-detail-title'),
      ).toHaveTextContent(target.title);
      expect(
        normalise(within(detail).getByTestId('notes-detail-body').textContent),
      ).toBe(normalise(target.body));
      expect(
        within(detail).getByTestId('notes-detail-folder'),
      ).toHaveTextContent(target.folder);

      // Exactly one row should be flagged as selected at any time.
      const selectedRows = NOTES.map((note) =>
        screen.getByTestId(`notes-item-${note.id}`),
      ).filter((r) => r.getAttribute('data-selected') === 'true');
      expect(selectedRows).toHaveLength(1);
    }
  });

  it('renders title, date, folder badge, and body in the detail pane', () => {
    renderNotesApp();

    const detail = screen.getByTestId('notes-detail');
    const title = within(detail).getByTestId('notes-detail-title');
    const date = within(detail).getByTestId('notes-detail-date');
    const folder = within(detail).getByTestId('notes-detail-folder');
    const body = within(detail).getByTestId('notes-detail-body');

    expect(title).toBeInTheDocument();
    expect(title.textContent.length).toBeGreaterThan(0);

    expect(date).toBeInTheDocument();
    expect(date.textContent.length).toBeGreaterThan(0);

    expect(folder).toBeInTheDocument();
    expect(folder.textContent.length).toBeGreaterThan(0);
    expect(folder).toHaveAttribute('data-folder');

    expect(body).toBeInTheDocument();
    expect(body.textContent.length).toBeGreaterThan(0);
  });

  it('each note row shows a one-line preview derived from the body', () => {
    renderNotesApp();

    NOTES.forEach((note) => {
      const row = screen.getByTestId(`notes-item-${note.id}`);
      const firstLine = note.body.split('\n')[0].trim();
      // The preview must contain at least a fragment of the first line.
      expect(row.textContent).toContain(firstLine.slice(0, 10));
      // The full multi-line body must NOT be rendered inside the row.
      expect(row.textContent).not.toContain(note.body);
    });
  });

  it('marks exactly one row as selected at any time', () => {
    renderNotesApp();

    const rows = NOTES.map((note) =>
      screen.getByTestId(`notes-item-${note.id}`),
    );

    const selected = rows.filter(
      (row) => row.getAttribute('data-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAttribute('data-note-id', NOTES[0].id);

    // Click a different note and re-check.
    fireEvent.click(rows[2]);
    const updated = rows
      .map((row) =>
        screen.getByTestId(`notes-item-${row.getAttribute('data-note-id')}`),
      )
      .filter((row) => row.getAttribute('data-selected') === 'true');
    expect(updated).toHaveLength(1);
    expect(updated[0]).toHaveAttribute('data-note-id', NOTES[2].id);
  });

  it('does not render the empty state while a note is selected', () => {
    renderNotesApp();

    // With the default first-note selection, the empty state should be absent.
    expect(screen.queryByTestId('notes-empty-state')).toBeNull();

    // Click each note in turn and ensure the empty state stays hidden.
    NOTES.forEach((note) => {
      fireEvent.click(screen.getByTestId(`notes-item-${note.id}`));
      expect(screen.queryByTestId('notes-empty-state')).toBeNull();
    });
  });

  it('uses accessible labels for the list and detail regions', () => {
    renderNotesApp();

    expect(screen.getByLabelText('Notes')).toBe(screen.getByTestId('notes-list'));
    expect(screen.getByLabelText('Note')).toBe(screen.getByTestId('notes-detail'));
  });

  it('preserves newlines in the detail body via whitespace-pre-wrap', () => {
    renderNotesApp();

    // Default selection is the first note, whose body contains \n newlines.
    const body = screen.getByTestId('notes-detail-body');
    expect(body.className).toContain('whitespace-pre-wrap');
    expect(body.textContent).toContain('\n');

    // Switch to a note whose body has multiple lines and verify the
    // rendered text retains those line breaks.
    const multi = NOTES.find((note) => (note.body.match(/\n/g) || []).length >= 2);
    expect(multi).toBeDefined();
    fireEvent.click(screen.getByTestId(`notes-item-${multi.id}`));
    const updated = screen.getByTestId('notes-detail-body');
    expect(updated.textContent).toContain('\n');
  });
});
