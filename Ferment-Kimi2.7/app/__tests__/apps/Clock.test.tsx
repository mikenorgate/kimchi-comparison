import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { Clock } from '@/app/components/apps/Clock';

describe('Clock', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('renders the local time and date', () => {
    vi.useFakeTimers();
    const fixed = new Date('2026-08-17T10:30:00');
    vi.setSystemTime(fixed);
    render(<Clock />);
    expect(screen.getByTestId('clock-local-time').textContent).toMatch(/10:30/);
    expect(screen.getByTestId('clock-local-date').textContent).toContain('August');
  });

  it('renders the world clock list', () => {
    vi.useFakeTimers();
    const fixed = new Date('2026-08-17T10:30:00');
    vi.setSystemTime(fixed);
    render(<Clock />);
    expect(screen.getByTestId('clock-world-list')).toBeTruthy();
    expect(screen.getByTestId('clock-city-cupertino')).toBeTruthy();
    expect(screen.getByTestId('clock-city-new-york')).toBeTruthy();
    expect(screen.getByTestId('clock-city-london')).toBeTruthy();
    expect(screen.getByTestId('clock-city-tokyo')).toBeTruthy();
  });

  it('renders each world city name, region, time, and offset', () => {
    vi.useFakeTimers();
    const fixed = new Date('2026-08-17T10:30:00');
    vi.setSystemTime(fixed);
    render(<Clock />);
    expect(screen.getByTestId('clock-city-name-cupertino').textContent).toBe('Cupertino');
    expect(screen.getByTestId('clock-city-region-cupertino').textContent).toBe('USA');
    expect(screen.getByTestId('clock-city-time-cupertino').textContent).toMatch(/\d/);
    expect(screen.getByTestId('clock-city-offset-cupertino').textContent).toBeTruthy();
  });

  it('updates the local time every second', () => {
    vi.useFakeTimers();
    const fixed = new Date('2026-08-17T10:30:00');
    vi.setSystemTime(fixed);
    render(<Clock />);
    expect(screen.getByTestId('clock-local-time').textContent).toMatch(/10:30/);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('clock-local-time').textContent).toMatch(/10:30:03/);
  });
});
