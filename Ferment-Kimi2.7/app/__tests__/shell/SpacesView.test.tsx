import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider, useShell } from '@/app/lib/shellContext';
import { SpacesView } from '@/app/components/SpacesView';
import { Dock } from '@/app/components/Dock';

function mockMatchMedia() {
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
}

function TestHarness() {
  const { state, toggleSpaces } = useShell();
  return (
    <div>
      {state.showSpaces && <SpacesView />}
      <Dock />
      <button data-testid="toggle-spaces" onClick={toggleSpaces}>
        toggle spaces
      </button>
      <div data-testid="spaces-open">{String(state.showSpaces)}</div>
    </div>
  );
}

function renderSpacesView() {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <TestHarness />
      </ShellProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  mockMatchMedia();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('SpacesView', () => {
  it('renders when Mission Control is toggled from the Dock', () => {
    renderSpacesView();
    expect(screen.queryByTestId('spaces-view')).toBeFalsy();
    fireEvent.click(screen.getByTestId('dock-mission-control'));
    expect(screen.getByTestId('spaces-view')).toBeTruthy();
    expect(screen.getByTestId('spaces-desktop-1')).toBeTruthy();
    expect(screen.getByTestId('spaces-add-desktop')).toBeTruthy();
  });

  it('closes when the close button is clicked', () => {
    renderSpacesView();
    fireEvent.click(screen.getByTestId('dock-mission-control'));
    expect(screen.getByTestId('spaces-view')).toBeTruthy();
    fireEvent.click(screen.getByTestId('spaces-close'));
    expect(screen.queryByTestId('spaces-view')).toBeFalsy();
    expect(screen.getByTestId('spaces-open').textContent).toBe('false');
  });

  it('closes when the desktop thumbnail is clicked', () => {
    renderSpacesView();
    fireEvent.click(screen.getByTestId('toggle-spaces'));
    expect(screen.getByTestId('spaces-view')).toBeTruthy();
    fireEvent.click(screen.getByTestId('spaces-desktop-1'));
    expect(screen.queryByTestId('spaces-view')).toBeFalsy();
  });
});
