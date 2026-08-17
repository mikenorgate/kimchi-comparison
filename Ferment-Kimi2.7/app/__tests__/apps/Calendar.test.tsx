import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Calendar } from '@/app/components/apps/Calendar';

describe('Calendar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the calendar header and month label', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar')).toBeTruthy();
    expect(screen.getByTestId('calendar-month')).toBeTruthy();
  });

  it('renders a grid of day cells', () => {
    render(<Calendar />);
    const dayCells = screen.queryAllByTestId(/calendar-day-/);
    expect(dayCells.length).toBeGreaterThanOrEqual(28);
  });

  it('navigates to the next month', () => {
    render(<Calendar />);
    const monthBefore = screen.getByTestId('calendar-month').textContent;
    fireEvent.click(screen.getByTestId('calendar-next'));
    const monthAfter = screen.getByTestId('calendar-month').textContent;
    expect(monthAfter).not.toBe(monthBefore);
  });

  it('navigates to the previous month', () => {
    render(<Calendar />);
    const monthBefore = screen.getByTestId('calendar-month').textContent;
    fireEvent.click(screen.getByTestId('calendar-prev'));
    const monthAfter = screen.getByTestId('calendar-month').textContent;
    expect(monthAfter).not.toBe(monthBefore);
  });

  it('returns to today when Today is clicked', () => {
    render(<Calendar />);
    fireEvent.click(screen.getByTestId('calendar-next'));
    const monthAfter = screen.getByTestId('calendar-month').textContent;
    fireEvent.click(screen.getByTestId('calendar-today'));
    const monthToday = screen.getByTestId('calendar-month').textContent;
    expect(monthToday).not.toBe(monthAfter);
  });

  it('shows mock events on the expected day cells', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar-event-1')).toBeTruthy();
    expect(screen.getByTestId('calendar-event-2')).toBeTruthy();
  });

  it('displays event details when a day with events is selected', () => {
    render(<Calendar />);
    fireEvent.click(screen.getByTestId('calendar-day-3'));
    expect(screen.getByTestId('calendar-detail')).toBeTruthy();
    expect(screen.getByTestId('calendar-detail-event-1')).toBeTruthy();
    expect(screen.getByTestId('calendar-detail-event-1').textContent).toContain('Team standup');
  });
});
