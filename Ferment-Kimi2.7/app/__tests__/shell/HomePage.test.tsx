import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Home from '@/app/page';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider } from '@/app/lib/shellContext';

function mockMatchMedia(isDark = false) {
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

function renderHome() {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <Home />
      </ShellProvider>
    </ThemeProvider>
  );
}

describe('Home page', () => {
  it('renders the desktop, menu bar, dock, and control center toggle', () => {
    renderHome();
    expect(screen.getByTestId('desktop')).toBeTruthy();
    expect(screen.getByTestId('menubar')).toBeTruthy();
    expect(screen.getByTestId('dock')).toBeTruthy();
    expect(screen.getByTestId('control-center-toggle')).toBeTruthy();
  });

  it('opens the Control Center panel when the toggle is clicked', () => {
    renderHome();
    expect(screen.queryByTestId('control-center')).toBeNull();
    fireEvent.click(screen.getByTestId('control-center-toggle'));
    expect(screen.getByTestId('control-center')).toBeTruthy();
  });
});
