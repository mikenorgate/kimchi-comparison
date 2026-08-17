import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/app/components/ThemeProvider';

function TestHarness() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved">{resolvedTheme}</div>
      <button data-testid="toggle" onClick={toggleTheme}>
        toggle
      </button>
      <button data-testid="system" onClick={() => setTheme('system')}>
        system
      </button>
    </div>
  );
}

function renderWithTheme(initialStorage?: string) {
  if (initialStorage) {
    window.localStorage.setItem('tahoe-theme', initialStorage);
  }
  return render(
    <ThemeProvider>
      <TestHarness />
    </ThemeProvider>
  );
}

function mockMatchMedia(isDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? isDark : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockMatchMedia(false);
});

describe('ThemeProvider', () => {
  it('applies the system light theme by default', () => {
    mockMatchMedia(false);
    renderWithTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('applies the system dark theme when preferred', () => {
    mockMatchMedia(true);
    renderWithTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('toggles the theme and persists to localStorage', () => {
    renderWithTheme();
    expect(window.localStorage.getItem('tahoe-theme')).toBe('system');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(window.localStorage.getItem('tahoe-theme')).toBe('dark');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('tahoe-theme')).toBe('light');
  });

  it('restores the stored theme on mount', () => {
    renderWithTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('reacts to system preference changes while in system mode', () => {
    const listeners = new Set<EventListener>();
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn((_: string, cb: EventListener) => listeners.add(cb)),
        removeEventListener: vi.fn((_: string, cb: EventListener) =>
          listeners.delete(cb)
        ),
        dispatchEvent: vi.fn((event: Event) => {
          listeners.forEach((cb) => cb(event));
          return true;
        }),
      }))
    );
    renderWithTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent.click(screen.getByTestId('system'));
    (window.matchMedia as ReturnType<typeof vi.fn>).mock.results[0].value.dispatchEvent(
      new Event('change')
    );
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
