import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider, useShell } from '@/app/lib/shellContext';
import { WindowFrame } from '@/app/components/WindowFrame';

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

function TestHarness({ appId }: { appId: string }) {
  const { state, openApp } = useShell();
  return (
    <div>
      <button data-testid="open" onClick={() => openApp(appId as any)}>
        Open
      </button>
      {state.windows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          <div data-testid={`content-${win.id}`}>content</div>
        </WindowFrame>
      ))}
    </div>
  );
}

function renderWindowFrame(appId = 'finder') {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <TestHarness appId={appId} />
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

describe('WindowFrame', () => {
  it('renders a window with title bar and traffic-light buttons after opening an app', () => {
    renderWindowFrame('finder');
    fireEvent.click(screen.getByTestId('open'));
    const windowEl = screen.getByTestId(/^window-/);
    expect(windowEl).toBeTruthy();
    expect(screen.getByTestId(/^titlebar-/)).toBeTruthy();
    expect(screen.getByTestId(/^title-/).textContent).toBe('Finder');
    expect(screen.getByTestId(/^close-/)).toBeTruthy();
    expect(screen.getByTestId(/^minimize-/)).toBeTruthy();
    expect(screen.getByTestId(/^zoom-/)).toBeTruthy();
  });

  it('closes the window when the close button is clicked', () => {
    renderWindowFrame('safari');
    fireEvent.click(screen.getByTestId('open'));
    const closeBtn = screen.getByTestId(/^close-/);
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId(/^window-/)).toBeNull();
  });

  it('minimizes the window when the minimize button is clicked', () => {
    renderWindowFrame('notes');
    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByTestId(/^window-/)).toBeTruthy();
    fireEvent.click(screen.getByTestId(/^minimize-/));
    expect(screen.getByTestId(/^minimized-/)).toBeTruthy();
  });
});
