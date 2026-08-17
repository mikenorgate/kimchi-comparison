import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider, useShell } from '@/app/lib/shellContext';
import { WindowManager } from '@/app/components/WindowManager';

const WINDOW_TEST_ID = /^window-(?!manager)/;

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

function TestHarness({ apps }: { apps: string[] }) {
  const { state, openApp, restoreWindow } = useShell();
  return (
    <div>
      {apps.map((appId) => (
        <button
          key={appId}
          data-testid={`open-${appId}`}
          onClick={() => openApp(appId as any)}
        >
          Open {appId}
        </button>
      ))}
      {apps.map((appId) => (
        <button
          key={`restore-${appId}`}
          data-testid={`restore-${appId}`}
          onClick={() => {
            const win = state.windows.find(
              (w) => w.appId === appId && w.minimized
            );
            if (win) restoreWindow(win.id);
          }}
        >
          Restore {appId}
        </button>
      ))}
      <div data-testid="active-app">{state.activeAppId}</div>
      <WindowManager />
    </div>
  );
}

function renderManager(apps: string[] = ['finder']) {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <TestHarness apps={apps} />
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

describe('WindowManager', () => {
  it('renders windows for each open app', () => {
    renderManager(['finder']);
    fireEvent.click(screen.getByTestId('open-finder'));
    expect(screen.getByTestId(WINDOW_TEST_ID)).toBeTruthy();
    expect(screen.getByTestId('app-content-finder')).toBeTruthy();
  });

  it('drags a window by its title bar', () => {
    renderManager(['safari']);
    fireEvent.click(screen.getByTestId('open-safari'));
    const windowEl = screen.getByTestId(WINDOW_TEST_ID);
    const titlebar = screen.getByTestId(/^titlebar-/);
    const initialLeft = parseInt(windowEl.style.left, 10);
    const initialTop = parseInt(windowEl.style.top, 10);

    fireEvent.mouseDown(titlebar, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 150, clientY: 130 });
    fireEvent.mouseUp(document);

    expect(parseInt(windowEl.style.left, 10)).toBe(initialLeft + 50);
    expect(parseInt(windowEl.style.top, 10)).toBe(initialTop + 30);
  });

  it('focuses a window and raises its z-index when clicked', () => {
    renderManager(['finder', 'safari']);
    fireEvent.click(screen.getByTestId('open-finder'));
    const firstWindow = screen.getByTestId(WINDOW_TEST_ID);
    const firstZ = parseInt(firstWindow.style.zIndex, 10);

    fireEvent.click(screen.getByTestId('open-safari'));
    const windows = screen.getAllByTestId(WINDOW_TEST_ID);
    expect(windows.length).toBe(2);
    const safariWindow = windows.find((el) => el.getAttribute('aria-label') === 'Safari')!;
    const safariZ = parseInt(safariWindow.style.zIndex, 10);
    expect(safariZ).toBeGreaterThan(firstZ);

    fireEvent.mouseDown(firstWindow);
    const updatedFirstZ = parseInt(firstWindow.style.zIndex, 10);
    expect(updatedFirstZ).toBeGreaterThan(safariZ);
  });

  it('restores a minimized window when the dock app is reopened', () => {
    renderManager(['notes']);
    fireEvent.click(screen.getByTestId('open-notes'));
    expect(screen.getByTestId(WINDOW_TEST_ID)).toBeTruthy();
    fireEvent.click(screen.getByTestId(/^minimize-/));
    expect(screen.getByTestId(/^minimized-/)).toBeTruthy();
    fireEvent.click(screen.getByTestId('open-notes'));
    expect(screen.getAllByTestId(WINDOW_TEST_ID).length).toBe(1);
    expect(screen.getByTestId(WINDOW_TEST_ID)).toBeTruthy();
  });

  it('focuses an existing window instead of creating a duplicate', () => {
    renderManager(['finder']);
    fireEvent.click(screen.getByTestId('open-finder'));
    const windowEl = screen.getByTestId(WINDOW_TEST_ID);
    const firstZ = parseInt(windowEl.style.zIndex, 10);

    fireEvent.click(screen.getByTestId('open-finder'));
    expect(screen.getAllByTestId(WINDOW_TEST_ID).length).toBe(1);
    expect(parseInt(windowEl.style.zIndex, 10)).toBeGreaterThan(firstZ);
    expect(screen.getByTestId('active-app').textContent).toBe('finder');
  });

  it('resizes a window from the resize handle', () => {
    renderManager(['notes']);
    fireEvent.click(screen.getByTestId('open-notes'));
    const windowEl = screen.getByTestId(WINDOW_TEST_ID);
    const resizeHandle = screen.getByTestId(/^resize-/);
    const initialWidth = parseInt(windowEl.style.width, 10);
    const initialHeight = parseInt(windowEl.style.height, 10);

    fireEvent.mouseDown(resizeHandle, { clientX: 400, clientY: 300 });
    fireEvent.mouseMove(document, { clientX: 450, clientY: 330 });
    fireEvent.mouseUp(document);

    expect(parseInt(windowEl.style.width, 10)).toBe(initialWidth + 50);
    expect(parseInt(windowEl.style.height, 10)).toBe(initialHeight + 30);
  });
});
