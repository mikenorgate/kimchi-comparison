import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Notes from './Notes';

describe('Notes', () => {
  it('selects a note and shows its body in the editor', () => {
    render(<Notes />);
    fireEvent.click(screen.getByText('Grocery List'));
    const body = screen.getByLabelText('Note body');
    expect(body.value).toContain('Almond milk');
  });

  it('updates the note title and body on change', () => {
    render(<Notes />);
    const titleInput = screen.getByLabelText('Note title');
    const bodyInput = screen.getByLabelText('Note body');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(bodyInput, { target: { value: 'Updated body content' } });
    expect(titleInput.value).toBe('Updated Title');
    expect(bodyInput.value).toBe('Updated body content');
  });

  it('creates a new note', () => {
    render(<Notes />);
    fireEvent.click(screen.getByLabelText('New note'));
    expect(screen.getByText('New Note')).toBeInTheDocument();
    expect(screen.getByLabelText('Note body').value).toBe('');
  });

  it('deletes a note and selects another one', () => {
    render(<Notes />);
    fireEvent.click(screen.getByText('Grocery List'));
    expect(screen.getByLabelText('Note title').value).toBe('Grocery List');
    fireEvent.click(screen.getByLabelText('Delete note'));
    expect(screen.queryByText('Grocery List')).not.toBeInTheDocument();
    expect(screen.getByText('Tahoe Design Ideas')).toBeInTheDocument();
    expect(screen.getByLabelText('Note title').value).toBe('Tahoe Design Ideas');
  });
});
