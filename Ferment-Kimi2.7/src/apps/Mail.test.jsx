import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Mail from './Mail';

describe('Mail', () => {
  it('switches mailboxes and shows messages for the selected mailbox', () => {
    render(<Mail />);
    expect(screen.getByText('Your macOS Tahoe preview is ready')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Junk'));
    expect(screen.getByText('You have won a free Mac!')).toBeInTheDocument();
    expect(screen.queryByText('Your macOS Tahoe preview is ready')).not.toBeInTheDocument();
  });

  it('marks a message as read when selected', () => {
    render(<Mail />);
    const unread = screen.getByText('Your macOS Tahoe preview is ready').closest('.mail-message');
    expect(unread).toHaveClass('unread');
    fireEvent.click(screen.getByText('Your macOS Tahoe preview is ready'));
    expect(screen.getByText(/exclusive preview of macOS Tahoe/)).toBeInTheDocument();
    expect(unread).toHaveClass('read');
  });

  it('filters messages by search query', () => {
    render(<Mail />);
    const search = screen.getByLabelText('Search mail');
    fireEvent.change(search, { target: { value: 'keynote' } });
    expect(screen.getByText('Keynote rehearsal')).toBeInTheDocument();
    expect(screen.queryByText('Security alert for your repository')).not.toBeInTheDocument();
  });
});
