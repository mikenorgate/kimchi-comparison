import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider, useShell } from '@/app/lib/shellContext';
import type { AppId } from '@/app/lib/types';

function TestHarness() {
  const {
    state,
    activeAppId,
    openApp,
    closeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    setWindowPosition,
    setWindowSize,
    lock,
    unlock,
    toggleSpaces,
    theme,
  } = useShell();

  const firstWindow = state.windows[0];

  return (
    <div>
      <div data-testid="active-app">{activeAppId}</div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="spaces">{String(state.showSpaces)}</div>
      <div data-testid="window-count">{state.windows.length}</div>
      <div data-testid="locked">{String(state.locked)}</div>
      {firstWindow && (
        <div data-testid="first-window">
          <span data-testid="first-x">{firstWindow.x}</span>
          <span data-testid="first-y">{firstWindow.y}</span>
          <span data-testid="first-width">{firstWindow.width}</span>
          <span data-testid="first-height">{firstWindow.height}</span>
        </div>
      )}
      {state.windows.map((w) => (
        <div key={w.id} data-testid={`window-${w.appId}`}>
          <span data-testid={`title-${w.id}`}>{w.title}</span>
          <button
            data-testid={`close-${w.id}`}
            onClick={() => closeWindow(w.id)}
          >
            close
          </button>
          <button
            data-testid={`focus-${w.id}`}
            onClick={() => focusWindow(w.id)}
          >
            focus
          </button>
          <button
            data-testid={`minimize-${w.id}`}
            onClick={() => minimizeWindow(w.id)}
          >
            minimize
          </button>
          <button
            data-testid={`restore-${w.id}`}
            onClick={() => restoreWindow(w.id)}
          >
            restore
          </button>
          <button
            data-testid={`move-${w.id}`}
            onClick={() => setWindowPosition(w.id, 123, 456)}
          >
            move
          </button>
          <button
            data-testid={`resize-${w.id}`}
            onClick={() => setWindowSize(w.id, 300, 200)}
          >
            resize
          </button>
          <span data-testid={`z-${w.id}`}>{w.zIndex}</span>
          <span data-testid={`minimized-${w.id}`}>
            {String(w.minimized)}
          </span>
        </div>
      ))}
      {(['finder', 'safari', 'notes'] as AppId[]).map((appId) => (
        <button
          key={appId}
          data-testid={`open-${appId}`}
          onClick={() => openApp(appId)}
        >
          open {appId}
        </button>
      ))}
      <button data-testid="toggle-spaces" onClick={toggleSpaces}>
        spaces
      </button>
      <button data-testid="lock" onClick={lock}>
        lock
      </button>
      <button data-testid="unlock" onClick={unlock}>
        unlock
      </button>
    </div>
  );
}

function renderWithProviders() {
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
});

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
});

describe('ShellState', () => {
  it('starts with no windows and the Finder menu', () => {
    renderWithProviders();
    expect(screen.getByTestId('window-count').textContent).toBe('0');
    expect(screen.getByTestId('active-app').textContent).toBe('finder');
  });

  it('opens a window and updates the active app', () => {
    renderWithProviders();
    fireEvent.click(screen.getByTestId('open-safari'));
    expect(screen.getByTestId('window-count').textContent).toBe('1');
    expect(screen.getByTestId('active-app').textContent).toBe('safari');
    expect(screen.getByTestId('window-safari')).toBeDefined();
  });

  it('focuses a window and raises its z-index', () => {
    renderWithProviders();
    fireEvent.click(screen.getByTestId('open-finder'));
    fireEvent.click(screen.getByTestId('open-safari'));
    const finderZ = Number(
      screen.getByTestId(/z-finder-/).textContent
    );
    fireEvent.click(screen.getByTestId(/focus-finder-/));
    expect(screen.getByTestId('active-app').textContent).toBe('finder');
    expect(
      Number(screen.getByTestId(/z-finder-/).textContent)
    ).toBeGreaterThan(finderZ);
  });

  it('minimizes a window and resets the active app', () => {
    renderWithProviders();
    fireEvent.click(screen.getByTestId('open-safari'));
    const id = screen.getByTestId(/minimize-safari-/).dataset.testid!.replace(
      'minimize-',
      ''
    );
    fireEvent.click(screen.getByTestId(`minimize-${id}`));
    expect(screen.getByTestId(`minimized-${id}`).textContent).toBe('true');
    expect(screen.getByTestId('active-app').textContent).toBe('finder');
  });

  it('restores a minimized window and focuses it', () => {
    renderWithProviders();
    fireEvent.click(screen.getByTestId('open-notes'));
    const id = screen.getByTestId(/minimize-notes-/).dataset.testid!.replace(
      'minimize-',
      ''
    );
    fireEvent.click(screen.getByTestId(`minimize-${id}`));
    fireEvent.click(screen.getByTestId(`restore-${id}`));
    expect(screen.getByTestId(`minimized-${id}`).textContent).toBe('false');
    expect(screen.getByTestId('active-app').textContent).toBe('notes');
  });

  it('closes a window and reverts the active app', () => {
    renderWithProviders();
    fireEvent.click(screen.getByTestId('open-safari'));
    const id = screen.getByTestId(/close-safari-/).dataset.testid!.replace(
      'close-',
      ''
    );
    fireEvent.click(screen.getByTestId(`close-${id}`));
    expect(screen.getByTestId('window-count').textContent).toBe('0');
    expect(screen.getByTestId('active-app').textContent).toBe('finder');
  });

  it('toggles the spaces view', () => {
    renderWithProviders();
    expect(screen.getByTestId('spaces').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('toggle-spaces'));
    expect(screen.getByTestId('spaces').textContent).toBe('true');
  });

  it('locks and unlocks the session', () => {
    renderWithProviders();
    expect(screen.getByTestId('locked').textContent).toBe('true');
    fireEvent.click(screen.getByTestId('unlock'));
    expect(screen.getByTestId('locked').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('lock'));
    expect(screen.getByTestId('locked').textContent).toBe('true');
  });

  it('updates window position and size', () => {
    renderWithProviders();
    fireEvent.click(screen.getByTestId('open-safari'));
    const id = screen.getByTestId(/move-safari-/).dataset.testid!.replace(
      'move-',
      ''
    );
    fireEvent.click(screen.getByTestId(`move-${id}`));
    expect(screen.getByTestId('first-x').textContent).toBe('123');
    expect(screen.getByTestId('first-y').textContent).toBe('456');
    fireEvent.click(screen.getByTestId(`resize-${id}`));
    expect(screen.getByTestId('first-width').textContent).toBe('300');
    expect(screen.getByTestId('first-height').textContent).toBe('200');
  });
});
