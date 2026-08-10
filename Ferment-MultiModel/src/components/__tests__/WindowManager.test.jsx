import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WindowManager from '../WindowManager.jsx';
import Dock from '../Dock.jsx';
import { WindowProvider } from '../../contexts/WindowContext.jsx';

afterEach(() => {
  cleanup();
});

function makeWindow(overrides = {}) {
  return {
    id: 'win-1',
    appId: 'safari',
    x: 100,
    y: 80,
    width: 800,
    height: 500,
    minimized: false,
    zIndex: 5,
    ...overrides,
  };
}

function makeInitialState(windows = [], activeAppId = null, nextZIndex = 10) {
  return {
    windows,
    nextZIndex,
    activeAppId,
  };
}

function renderManager({ initialState, children } = {}) {
  return render(
    <WindowProvider initialState={initialState}>
      <WindowManager>{children}</WindowManager>
    </WindowProvider>,
  );
}

describe('<WindowManager />', () => {
  it('renders without crashing when there are no windows', () => {
    renderManager({ initialState: makeInitialState() });
    expect(screen.queryAllByTestId('window')).toHaveLength(0);
    expect(screen.queryByTestId('window-content')).not.toBeInTheDocument();
  });

  it('renders a window when state contains one non-minimized window', () => {
    const state = makeInitialState(
      [makeWindow({ id: 'win-a', appId: 'safari', zIndex: 3 })],
      'safari',
    );
    renderManager({ initialState: state });

    const windows = screen.getAllByTestId('window');
    expect(windows).toHaveLength(1);
    expect(windows[0]).toHaveAttribute('data-app-id', 'safari');
    expect(windows[0]).toHaveAttribute('data-window-id', 'win-a');
    expect(windows[0]).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('window-content')).toHaveAttribute(
      'data-app-id',
      'safari',
    );
    expect(screen.getByTestId('titlebar-title')).toHaveTextContent('Safari');
  });

  it('does not render windows that are minimized', () => {
    const state = makeInitialState([
      makeWindow({ id: 'win-a', appId: 'safari', minimized: false }),
      makeWindow({ id: 'win-b', appId: 'notes', minimized: true }),
    ]);
    renderManager({ initialState: state });

    expect(screen.getAllByTestId('window')).toHaveLength(1);
    expect(screen.getByTestId('window')).toHaveAttribute('data-app-id', 'safari');
    expect(screen.queryByTestId('window-content')).toHaveAttribute(
      'data-app-id',
      'safari',
    );
  });

  it('calls focusWindow (via body click) and updates the active window', () => {
    const state = makeInitialState(
      [
        makeWindow({ id: 'win-a', appId: 'safari', zIndex: 2 }),
        makeWindow({ id: 'win-b', appId: 'notes', zIndex: 1 }),
      ],
      'safari',
    );
    renderManager({ initialState: state });

    const noteWindow = screen
      .getAllByTestId('window')
      .find((el) => el.getAttribute('data-app-id') === 'notes');
    expect(noteWindow).toBeDefined();
    expect(noteWindow).toHaveAttribute('data-active', 'false');

    // Clicking the body focuses the window via Window's onFocus -> focusWindow.
    fireEvent.mouseDown(
      noteWindow.querySelector('[data-testid="window-body"]'),
      { button: 0 },
    );

    // After focus, the Notes window should be the active one.
    const updated = screen
      .getAllByTestId('window')
      .find((el) => el.getAttribute('data-app-id') === 'notes');
    expect(updated).toHaveAttribute('data-active', 'true');
    const safari = screen
      .getAllByTestId('window')
      .find((el) => el.getAttribute('data-app-id') === 'safari');
    expect(safari).toHaveAttribute('data-active', 'false');
  });

  it('calls closeWindow when the close button is clicked', () => {
    const state = makeInitialState(
      [makeWindow({ id: 'win-a', appId: 'safari' })],
      'safari',
    );
    renderManager({ initialState: state });

    expect(screen.getAllByTestId('window')).toHaveLength(1);

    fireEvent.click(screen.getByTestId('window-close'));

    // After close, the window should be removed from the DOM.
    expect(screen.queryAllByTestId('window')).toHaveLength(0);
    expect(screen.queryByTestId('window-content')).not.toBeInTheDocument();
  });

  it('calls minimizeWindow when the minimize button is clicked', () => {
    const state = makeInitialState(
      [makeWindow({ id: 'win-a', appId: 'safari' })],
      'safari',
    );
    renderManager({ initialState: state });

    expect(screen.getAllByTestId('window')).toHaveLength(1);

    fireEvent.click(screen.getByTestId('window-minimize'));

    // After minimize, the window is hidden (both WindowManager filters
    // minimized windows and Window itself returns null when minimized).
    expect(screen.queryAllByTestId('window')).toHaveLength(0);
  });

  it('calls setFullscreen when the fullscreen button is clicked', () => {
    const state = makeInitialState(
      [
        makeWindow({
          id: 'win-a',
          appId: 'safari',
          x: 100,
          y: 80,
          width: 800,
          height: 500,
        }),
      ],
      'safari',
    );
    renderManager({ initialState: state });

    fireEvent.click(screen.getByTestId('window-fullscreen'));

    // After fullscreen, the window should be repositioned to (0, 0) and
    // sized to the viewport, per the windowReducer's FULLSCREEN case.
    const win = screen.getByTestId('window');
    const style = win.getAttribute('style') ?? '';
    expect(style).toContain('left: 0px');
    expect(style).toContain('top: 0px');
    // viewport comes from window.innerWidth / innerHeight in jsdom
    expect(style).toMatch(/width:\s*\d+px/);
    expect(style).toMatch(/height:\s*\d+px/);
    // Width/height should differ from the original 800x500 since fullscreen
    // sizes to the viewport.
    expect(style).not.toContain('width: 800px');
    expect(style).not.toContain('height: 500px');
  });

  it('renders children passed to WindowManager', () => {
    const state = makeInitialState();
    renderManager({
      initialState: state,
      children: <div data-testid="wm-child">Hello child</div>,
    });

    const child = screen.getByTestId('wm-child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Hello child');
  });

  it('renders two windows with different zIndex values applied as inline styles', () => {
    const state = makeInitialState(
      [
        makeWindow({
          id: 'win-a',
          appId: 'safari',
          x: 40,
          y: 40,
          width: 600,
          height: 400,
          zIndex: 7,
        }),
        makeWindow({
          id: 'win-b',
          appId: 'notes',
          x: 120,
          y: 100,
          width: 600,
          height: 400,
          zIndex: 11,
        }),
      ],
      'notes',
    );
    renderManager({ initialState: state });

    const wins = screen.getAllByTestId('window');
    expect(wins).toHaveLength(2);

    const safari = wins.find(
      (el) => el.getAttribute('data-app-id') === 'safari',
    );
    const notes = wins.find(
      (el) => el.getAttribute('data-app-id') === 'notes',
    );

    const safariStyle = safari.getAttribute('style') ?? '';
    const notesStyle = notes.getAttribute('style') ?? '';
    expect(safariStyle).toMatch(/z-index:\s*7/);
    expect(notesStyle).toMatch(/z-index:\s*11/);

    // Positions should also differ between windows.
    expect(safariStyle).toContain('left: 40px');
    expect(safariStyle).toContain('top: 40px');
    expect(notesStyle).toContain('left: 120px');
    expect(notesStyle).toContain('top: 100px');
  });
});

describe('<Dock /> wired to WindowContext', () => {
  function renderDockWithManager() {
    return render(
      <WindowProvider>
        <WindowManager />
        <Dock />
      </WindowProvider>,
    );
  }

  it('opens a new window when a Dock icon is clicked', () => {
    renderDockWithManager();
    expect(screen.queryAllByTestId('window')).toHaveLength(0);

    fireEvent.click(screen.getByTestId('dock-icon-safari'));

    const windows = screen.getAllByTestId('window');
    expect(windows).toHaveLength(1);
    expect(windows[0]).toHaveAttribute('data-app-id', 'safari');
    expect(windows[0]).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('titlebar-title')).toHaveTextContent('Safari');
  });

  it('opens separate windows for different Dock icons', () => {
    renderDockWithManager();

    fireEvent.click(screen.getByTestId('dock-icon-safari'));
    fireEvent.click(screen.getByTestId('dock-icon-notes'));

    const windows = screen.getAllByTestId('window');
    expect(windows).toHaveLength(2);
    const appIds = windows.map((w) => w.getAttribute('data-app-id')).sort();
    expect(appIds).toEqual(['notes', 'safari']);
    // The most recently opened app (notes) should be the active one.
    const notesWin = windows.find(
      (w) => w.getAttribute('data-app-id') === 'notes',
    );
    expect(notesWin).toHaveAttribute('data-active', 'true');
  });

  it('focuses an existing non-minimized window when the same Dock icon is clicked again', () => {
    renderDockWithManager();

    fireEvent.click(screen.getByTestId('dock-icon-safari'));
    const firstWindow = screen.getByTestId('window');
    const firstId = firstWindow.getAttribute('data-window-id');
    expect(firstWindow).toHaveAttribute('data-active', 'true');

    // Open another app to make safari no longer the topmost window.
    fireEvent.click(screen.getByTestId('dock-icon-notes'));
    const safariAfterNotes = screen
      .getAllByTestId('window')
      .find((w) => w.getAttribute('data-app-id') === 'safari');
    expect(safariAfterNotes).toHaveAttribute('data-active', 'false');

    // Click the Safari Dock icon again — should refocus the existing
    // window rather than opening a duplicate.
    fireEvent.click(screen.getByTestId('dock-icon-safari'));

    const windows = screen.getAllByTestId('window');
    expect(windows).toHaveLength(2);
    const safariNow = windows.find(
      (w) => w.getAttribute('data-app-id') === 'safari',
    );
    expect(safariNow).toHaveAttribute('data-active', 'true');
    expect(safariNow.getAttribute('data-window-id')).toBe(firstId);
  });
});
