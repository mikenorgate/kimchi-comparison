import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import JournalApp, { ENTRIES } from '../JournalApp.jsx';

afterEach(() => {
  cleanup();
});

function renderJournalApp(props = {}) {
  return render(<JournalApp {...props} />);
}

describe('<JournalApp />', () => {
  it('renders the root container with the expected testid and app id', () => {
    renderJournalApp();

    const root = screen.getByTestId('journal-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'journal');
  });

  it('renders an entry list containing every mocked entry', () => {
    renderJournalApp();

    const list = screen.getByTestId('journal-entry-list');
    expect(list).toBeInTheDocument();

    // Each entry id should produce a corresponding row in the DOM.
    ENTRIES.forEach((entry) => {
      expect(
        screen.getByTestId(`journal-entry-${entry.id}`),
      ).toBeInTheDocument();
    });

    const rows = ENTRIES.map((entry) =>
      screen.getByTestId(`journal-entry-${entry.id}`),
    );
    expect(rows).toHaveLength(ENTRIES.length);
  });

  it('selects the first entry by default and shows its content in the detail pane', () => {
    renderJournalApp();

    const firstRow = screen.getByTestId(`journal-entry-${ENTRIES[0].id}`);
    expect(firstRow).toHaveAttribute('data-selected', 'true');

    const detail = screen.getByTestId('journal-detail');
    expect(within(detail).getByTestId('journal-detail-title')).toHaveTextContent(
      ENTRIES[0].title,
    );
    expect(within(detail).getByTestId('journal-detail-body')).toHaveTextContent(
      ENTRIES[0].body,
    );
  });

  it('clicking a different entry updates the detail pane', () => {
    renderJournalApp();

    // Click every entry other than the first and verify the detail pane
    // reflects the newly selected entry each time.
    for (let i = 1; i < ENTRIES.length; i += 1) {
      const target = ENTRIES[i];
      const row = screen.getByTestId(`journal-entry-${target.id}`);
      fireEvent.click(row);

      expect(row).toHaveAttribute('data-selected', 'true');

      const detail = screen.getByTestId('journal-detail');
      expect(
        within(detail).getByTestId('journal-detail-title'),
      ).toHaveTextContent(target.title);
      expect(
        within(detail).getByTestId('journal-detail-body'),
      ).toHaveTextContent(target.body);

      // Exactly one row should be flagged as selected at any time.
      const selectedRows = ENTRIES.map((entry) =>
        screen.getByTestId(`journal-entry-${entry.id}`),
      ).filter((r) => r.getAttribute('data-selected') === 'true');
      expect(selectedRows).toHaveLength(1);
    }
  });

  it('renders title, date, mood badge, and body in the detail pane', () => {
    renderJournalApp();

    const detail = screen.getByTestId('journal-detail');
    const title = within(detail).getByTestId('journal-detail-title');
    const date = within(detail).getByTestId('journal-detail-date');
    const mood = within(detail).getByTestId('journal-detail-mood');
    const body = within(detail).getByTestId('journal-detail-body');

    expect(title).toBeInTheDocument();
    expect(title.textContent.length).toBeGreaterThan(0);

    expect(date).toBeInTheDocument();
    expect(date.textContent.length).toBeGreaterThan(0);

    expect(mood).toBeInTheDocument();
    expect(mood.textContent.length).toBeGreaterThan(0);
    expect(mood).toHaveAttribute('data-mood');

    expect(body).toBeInTheDocument();
    expect(body.textContent.length).toBeGreaterThan(0);
  });

  it('each entry row shows a one-line preview derived from the body', () => {
    renderJournalApp();

    ENTRIES.forEach((entry) => {
      const row = screen.getByTestId(`journal-entry-${entry.id}`);
      const firstSentence = entry.body.split(/[.\n]/)[0].trim();
      // The preview must contain at least the first sentence fragment.
      expect(row.textContent).toContain(firstSentence.slice(0, 10));
      // The full multi-sentence body must NOT be rendered inside the row.
      expect(row.textContent).not.toContain(entry.body);
    });
  });

  it('marks exactly one row as selected at any time', () => {
    renderJournalApp();

    const rows = ENTRIES.map((entry) =>
      screen.getByTestId(`journal-entry-${entry.id}`),
    );

    const selected = rows.filter(
      (row) => row.getAttribute('data-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAttribute('data-entry-id', ENTRIES[0].id);

    // Click a different entry and re-check.
    fireEvent.click(rows[2]);
    const updated = rows
      .map((row) => screen.getByTestId(`journal-entry-${row.getAttribute('data-entry-id')}`))
      .filter((row) => row.getAttribute('data-selected') === 'true');
    expect(updated).toHaveLength(1);
    expect(updated[0]).toHaveAttribute('data-entry-id', ENTRIES[2].id);
  });

  it('does not render the empty state while an entry is selected', () => {
    renderJournalApp();

    // With the default first-entry selection, the empty state should be absent.
    expect(screen.queryByTestId('journal-empty-state')).toBeNull();

    // Click each entry in turn and ensure the empty state stays hidden.
    ENTRIES.forEach((entry) => {
      fireEvent.click(screen.getByTestId(`journal-entry-${entry.id}`));
      expect(screen.queryByTestId('journal-empty-state')).toBeNull();
    });
  });

  it('uses accessible labels for the list and detail regions', () => {
    renderJournalApp();

    expect(screen.getByLabelText('Journal entries')).toBe(
      screen.getByTestId('journal-entry-list'),
    );
    expect(screen.getByLabelText('Journal entry')).toBe(
      screen.getByTestId('journal-detail'),
    );
  });
});
