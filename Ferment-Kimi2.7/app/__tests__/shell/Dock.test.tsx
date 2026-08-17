import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider, useShell } from '@/app/lib/shellContext';
import { Dock } from '@/app/components/Dock';

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

function TestHarness() {
  const { state } = useShell();
  return (
    <div>
      <Dock />
      <div data-testid="window-count">{state.windows.length}</div>
      <div data-testid="active-app">{state.activeAppId}</div>
    </div>
  );
}

function renderDock() {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <TestHarness />
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

describe('Dock', () => {
  it('renders all dock app icons', () => {
    renderDock();
    const apps = ['finder', 'safari', 'notes', 'terminal', 'settings', 'calculator', 'calendar', 'clock', 'photos', 'music'];
    apps.forEach((appId) => {
      expect(screen.getByTestId(`dock-${appId}`)).toBeTruthy();
    });
  });

  it('opens an app window when a dock icon is clicked', () => {
    renderDock();
    expect(screen.getByTestId('window-count').textContent).toBe('0');
    fireEvent.click(screen.getByTestId('dock-safari'));
    expect(screen.getByTestId('window-count').textContent).toBe('1');
    expect(screen.getByTestId('active-app').textContent).toBe('safari');
  });

  it('shows an active indicator for the active app', () => {
    renderDock();
    fireEvent.click(screen.getByTestId('dock-notes'));
    expect(screen.getByTestId('dock-dot-notes')).toBeTruthy();
  });
});
