import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Notes from '../apps/Notes';
import { useAppDataStore } from '../stores/appDataStore';
import { useWindowStore } from '../stores/windowStore';

function clearAll() {
  localStorage.clear();
}

function resetStores() {
  useAppDataStore.setState({
    calculatorMemory: 0,
    calculatorHistory: [],
    notes: {},
    noteOrder: [],
    terminalHistory: [],
    terminalCwd: 'root',
    safariRecent: [],
  });
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
}

beforeEach(() => {
  clearAll();
  resetStores();
});

afterEach(() => {
  clearAll();
  resetStores();
});

describe('Notes app', () => {
  it('creates a starter note on first render', () => {
    render(<Notes windowId="win-notes-1" />);
    const list = screen.getByTestId('notes-list');
    expect(list.children.length).toBe(1);
    // The starter note has body "Welcome to Notes.\n\nStart typing here."
    // so the derived title should be "Welcome to Notes."
    expect(screen.getByTestId('note-active-title').textContent).toBe('Welcome to Notes.');
  });

  it('creates a new note via the New button', () => {
    render(<Notes windowId="win-notes-2" />);
    const initial = useAppDataStore.getState().noteOrder.length;

    act(() => {
      fireEvent.click(screen.getByTestId('new-note-btn'));
    });

    const after = useAppDataStore.getState().noteOrder.length;
    expect(after).toBe(initial + 1);

    const list = screen.getByTestId('notes-list');
    expect(list.children.length).toBe(after);

    // The newly created note is empty so the active title is "New Note".
    expect(screen.getByTestId('note-active-title').textContent).toBe('New Note');
  });

  it('derives the title from the first non-empty line of the body', () => {
    render(<Notes windowId="win-notes-3" />);
    const editor = screen.getByTestId('note-editor') as HTMLTextAreaElement;

    act(() => {
      fireEvent.change(editor, { target: { value: '' } });
    });
    expect(useAppDataStore.getState().notes[
      useAppDataStore.getState().noteOrder[0]
    ].title).toBe('New Note');

    act(() => {
      fireEvent.change(editor, { target: { value: 'Shopping list\nMilk, eggs' } });
    });
    const notes1 = useAppDataStore.getState();
    expect(notes1.notes[notes1.noteOrder[0]].title).toBe('Shopping list');
    expect(notes1.notes[notes1.noteOrder[0]].body).toBe('Shopping list\nMilk, eggs');

    // Leading blank lines should be skipped.
    act(() => {
      fireEvent.change(editor, { target: { value: '\n\n   \nReal title here' } });
    });
    const notes2 = useAppDataStore.getState();
    expect(notes2.notes[notes2.noteOrder[0]].title).toBe('Real title here');
  });

  it('updates the active note when typing', () => {
    render(<Notes windowId="win-notes-4" />);
    const editor = screen.getByTestId('note-editor') as HTMLTextAreaElement;

    act(() => {
      fireEvent.change(editor, { target: { value: 'Project plan' } });
    });

    const state = useAppDataStore.getState();
    const id = state.noteOrder[0];
    expect(state.notes[id].body).toBe('Project plan');
    expect(state.notes[id].title).toBe('Project plan');

    // Sidebar reflects the new title.
    expect(screen.getByTestId(`note-title-${id}`).textContent).toBe('Project plan');
  });

  it('deletes the selected note via the trash button', () => {
    render(<Notes windowId="win-notes-5" />);

    // Create an extra note so we have two.
    act(() => {
      fireEvent.click(screen.getByTestId('new-note-btn'));
    });

    const beforeIds = useAppDataStore.getState().noteOrder.slice();
    expect(beforeIds.length).toBe(2);
    const activeId = beforeIds[0]; // New notes are prepended.

    // Delete the active note via its trash button.
    act(() => {
      fireEvent.click(screen.getByTestId(`delete-note-${activeId}`));
    });

    const afterState = useAppDataStore.getState();
    expect(afterState.notes[activeId]).toBeUndefined();
    expect(afterState.noteOrder).not.toContain(activeId);
    expect(afterState.noteOrder.length).toBe(1);
  });

  it('persists notes via the store and survives re-render', () => {
    const { unmount } = render(<Notes windowId="win-notes-6" />);

    act(() => {
      fireEvent.click(screen.getByTestId('new-note-btn'));
    });
    const editor = screen.getByTestId('note-editor') as HTMLTextAreaElement;
    act(() => {
      fireEvent.change(editor, { target: { value: 'Persistent idea' } });
    });

    const persistedId = useAppDataStore.getState().noteOrder[0];
    const persistedBody = useAppDataStore.getState().notes[persistedId].body;
    expect(persistedBody).toBe('Persistent idea');

    unmount();

    // Re-mount with the same persisted store: the note should still be there.
    render(<Notes windowId="win-notes-6b" />);
    const state = useAppDataStore.getState();
    expect(state.notes[persistedId]).toBeDefined();
    expect(state.notes[persistedId].body).toBe('Persistent idea');

    // Sidebar lists it.
    expect(screen.getByTestId(`note-title-${persistedId}`).textContent).toBe('Persistent idea');
  });

  it('switches the active note when another sidebar entry is clicked', () => {
    render(<Notes windowId="win-notes-7" />);

    act(() => {
      fireEvent.click(screen.getByTestId('new-note-btn'));
    });
    const ids = useAppDataStore.getState().noteOrder;
    const newId = ids[0];
    const starterId = ids[1];

    // Type into the new note, then click the starter; then click back.
    let editor = screen.getByTestId('note-editor') as HTMLTextAreaElement;
    act(() => {
      fireEvent.change(editor, { target: { value: 'Draft' } });
    });

    act(() => {
      fireEvent.click(screen.getByTestId(`note-item-${starterId}`));
    });
    expect(screen.getByTestId('note-active-title').textContent).toBe('Welcome to Notes.');

    act(() => {
      fireEvent.click(screen.getByTestId(`note-item-${newId}`));
    });
    editor = screen.getByTestId('note-editor') as HTMLTextAreaElement;
    expect(editor.value).toBe('Draft');
  });
});
