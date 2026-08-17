import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Finder } from '@/app/components/apps/Finder';

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('Finder', () => {
  beforeEach(() => {
    mockMatchMedia();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the sidebar with favorite locations', () => {
    render(<Finder />);
    expect(screen.getByTestId('finder-sidebar')).toBeTruthy();
    expect(screen.getByTestId('finder-location-recents')).toBeTruthy();
    expect(screen.getByTestId('finder-location-documents')).toBeTruthy();
  });

  it('shows Recents items by default', () => {
    render(<Finder />);
    expect(screen.getByTestId('finder-grid')).toBeTruthy();
    expect(screen.getByText('Project Plan.txt')).toBeTruthy();
    expect(screen.getByTestId('finder-item-count').textContent).toBe('3 items');
  });

  it('navigates to a different folder and updates the grid', () => {
    render(<Finder />);
    fireEvent.click(screen.getByTestId('finder-location-documents'));
    expect(screen.getByText('Resume.pdf')).toBeTruthy();
    expect(screen.getByText('Budget 2026.numbers')).toBeTruthy();
    expect(screen.getByTestId('finder-item-count').textContent).toBe('4 items');
  });

  it('selects an item when clicked', () => {
    render(<Finder />);
    fireEvent.click(screen.getByTestId('finder-item-recent-1'));
    expect(screen.getByText('1 selected')).toBeTruthy();
  });

  it('switches between grid and list view', () => {
    render(<Finder />);
    expect(screen.getByTestId('finder-view-grid')).toBeTruthy();
    expect(screen.getByTestId('finder-view-list')).toBeTruthy();
    fireEvent.click(screen.getByTestId('finder-view-list'));
    expect(screen.getByText('Date Modified')).toBeTruthy();
    fireEvent.click(screen.getByTestId('finder-view-grid'));
    expect(screen.getByTestId('finder-grid')).toBeTruthy();
  });
});
