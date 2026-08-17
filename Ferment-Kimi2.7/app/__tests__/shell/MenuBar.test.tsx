import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider, useShell } from '@/app/lib/shellContext';
import { MenuBar } from '@/app/components/MenuBar';

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

function TestHarness({ openAppId }: { openAppId?: string } = {}) {
  const { openApp } = useShell();
  return (
    <div>
      <MenuBar />
      {openAppId && (
        <button
          data-testid="open-app"
          onClick={() => openApp(openAppId as never)}
        >
          open app
        </button>
      )}
    </div>
  );
}

function renderMenuBar(openAppId?: string) {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <TestHarness openAppId={openAppId} />
      </ShellProvider>
    </ThemeProvider>
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

describe('MenuBar', () => {
  it('renders the Apple icon, active app name, and Finder menus by default', () => {
    renderMenuBar();
    expect(screen.getByTestId('apple-menu')).toBeTruthy();
    expect(screen.getByTestId('active-app-name').textContent).toBe('Finder');
    expect(screen.getByTestId('menu-Finder')).toBeTruthy();
    expect(screen.getByTestId('menu-Go')).toBeTruthy();
    expect(screen.getByTestId('clock')).toBeTruthy();
  });

  it('updates menus when the active app changes', () => {
    renderMenuBar('safari');
    expect(screen.getByTestId('active-app-name').textContent).toBe('Finder');
    fireEvent.click(screen.getByTestId('open-app'));
    expect(screen.getByTestId('active-app-name').textContent).toBe('Safari');
    expect(screen.getByTestId('menu-Safari')).toBeTruthy();
    expect(screen.getByTestId('menu-Bookmarks')).toBeTruthy();
  });

  it('toggles the theme when the theme button is clicked', () => {
    renderMenuBar();
    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
