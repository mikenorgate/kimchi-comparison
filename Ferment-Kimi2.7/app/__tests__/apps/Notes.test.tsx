import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Notes } from '@/app/components/apps/Notes';

describe('Notes', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a list of notes and an editor', () => {
    render(<Notes />);
    expect(screen.getByTestId('notes-sidebar')).toBeTruthy();
    expect(screen.getByTestId('notes-editor')).toBeTruthy();
    expect(screen.getByTestId('notes-item-note-1')).toBeTruthy();
  });

  it('selects a note when clicked in the list', () => {
    render(<Notes />);
    fireEvent.click(screen.getByTestId('notes-item-note-2'));
    const title = screen.getByTestId('notes-title') as HTMLInputElement;
    expect(title.value).toBe('Ideas');
  });

  it('updates the note title and body', () => {
    render(<Notes />);
    const title = screen.getByTestId('notes-title') as HTMLInputElement;
    const body = screen.getByTestId('notes-body') as HTMLTextAreaElement;
    fireEvent.change(title, { target: { value: 'Shopping List' } });
    fireEvent.change(body, { target: { value: 'Milk, eggs' } });
    expect(title.value).toBe('Shopping List');
    expect(body.value).toBe('Milk, eggs');
  });

  it('persists notes to localStorage', async () => {
    render(<Notes />);
    const title = screen.getByTestId('notes-title') as HTMLInputElement;
    fireEvent.change(title, { target: { value: 'Persistent Note' } });
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('tahoe-notes') || '[]');
      expect(stored[0].title).toBe('Persistent Note');
    });
  });

  it('loads notes from localStorage on mount', () => {
    const stored = [{ id: 'note-a', title: 'Stored Note', body: 'Hello', updatedAt: Date.now() }];
    window.localStorage.setItem('tahoe-notes', JSON.stringify(stored));
    render(<Notes />);
    expect(screen.getByTestId('notes-item-note-a')).toBeTruthy();
    const title = screen.getByTestId('notes-title') as HTMLInputElement;
    expect(title.value).toBe('Stored Note');
  });

  it('adds a new note', () => {
    render(<Notes />);
    fireEvent.click(screen.getByTestId('notes-new'));
    const title = screen.getByTestId('notes-title') as HTMLInputElement;
    expect(title.value).toBe('New Note');
    expect(screen.getAllByTestId(/^notes-item-/)).toHaveLength(3);
  });

  it('deletes the active note and selects another', () => {
    render(<Notes />);
    fireEvent.click(screen.getByTestId('notes-delete'));
    expect(screen.getAllByTestId(/^notes-item-/)).toHaveLength(1);
    const title = screen.getByTestId('notes-title') as HTMLInputElement;
    expect(title.value).toBe('Ideas');
  });
});
