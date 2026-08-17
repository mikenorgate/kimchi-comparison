import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider } from '@/app/lib/shellContext';
import Home from '@/app/page';
import { APP_IDS } from '@/app/lib/apps';

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

function renderHome() {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <Home />
      </ShellProvider>
    </ThemeProvider>
  );
}

describe('HomePage smoke', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('unlocks, opens every app via the Dock, and toggles theme without console errors', () => {
    renderHome();

    expect(screen.getByTestId('login-screen')).toBeTruthy();
    fireEvent.click(screen.getByTestId('login-unlock-button'));
    expect(screen.queryByTestId('login-screen')).toBeFalsy();
    expect(screen.getByTestId('dock')).toBeTruthy();

    APP_IDS.forEach((appId) => {
      fireEvent.click(screen.getByTestId(`dock-${appId}`));
      expect(screen.getByTestId(`app-content-${appId}`)).toBeTruthy();
    });

    const initialTheme = screen.getByTestId('menubar').getAttribute('data-theme');
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(screen.getByTestId('menubar')).toBeTruthy();

    expect(console.error).not.toHaveBeenCalled();
  });
});
