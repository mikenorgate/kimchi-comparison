import { render, screen, fireEvent } from '@testing-library/react';
import CalendarApp from '../CalendarApp.jsx';

describe('<CalendarApp />', () => {
  it('renders the app root, header, and day grid', () => {
    render(<CalendarApp />);
    expect(screen.getByTestId('calendar-app')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-month-year')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-weekday-row')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-day-grid')).toBeInTheDocument();
  });

  it('renders all weekday headers', () => {
    render(<CalendarApp />);
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day) => {
      expect(screen.getByTestId(`calendar-weekday-${day}`)).toBeInTheDocument();
    });
  });

  it('displays the current month and year', () => {
    render(<CalendarApp />);
    const today = new Date();
    const expected = today.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    expect(screen.getByTestId('calendar-month-year')).toHaveTextContent(expected);
  });

  it('renders a day cell for today', () => {
    render(<CalendarApp />);
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(screen.getByTestId(`calendar-day-${iso}`)).toBeInTheDocument();
  });

  it('highlights the current day', () => {
    render(<CalendarApp />);
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const cell = screen.getByTestId(`calendar-day-${iso}`);
    expect(cell.getAttribute('data-is-today')).toBe('true');
  });

  it('navigates to the previous month', () => {
    render(<CalendarApp />);
    const before = screen.getByTestId('calendar-month-year').textContent;
    fireEvent.click(screen.getByTestId('calendar-prev-month'));
    const after = screen.getByTestId('calendar-month-year').textContent;
    expect(after).not.toBe(before);
  });

  it('navigates to the next month', () => {
    render(<CalendarApp />);
    const before = screen.getByTestId('calendar-month-year').textContent;
    fireEvent.click(screen.getByTestId('calendar-next-month'));
    const after = screen.getByTestId('calendar-month-year').textContent;
    expect(after).not.toBe(before);
  });

  it('renders the correct number of day cells for the current month', () => {
    render(<CalendarApp />);
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const cells = screen.getAllByTestId(/^calendar-day-\d{4}-\d{2}-\d{2}$/);
    expect(cells).toHaveLength(daysInMonth);
  });
});
