import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from './Calendar';

describe('Calendar', () => {
  it('renders the month grid with event dots', () => {
    render(<Calendar />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    const days = document.querySelectorAll('.calendar-day:not(.empty)');
    expect(days.length).toBeGreaterThan(27);
    expect(document.querySelectorAll('.calendar-dot').length).toBeGreaterThan(0);
  });

  it('navigates to the previous and next month', () => {
    render(<Calendar />);
    const title = screen.getByRole('heading', { level: 2 });
    const monthBefore = title.textContent;
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(title.textContent).not.toBe(monthBefore);
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(title.textContent).toBe(monthBefore);
  });

  it('shows events for a selected day', () => {
    render(<Calendar />);
    fireEvent.click(screen.getByText('15').closest('button'));
    expect(screen.getByText('Product Sync')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });
});
