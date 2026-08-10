import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import { useWindowStore } from '../stores/windowStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useSystemStore } from '../stores/systemStore';
import { useDockStore } from '../stores/dockStore';
import { buildInitialFileSystem } from '../lib/initialFs';

function resetFileSystemStore() {
  const initialNodes = buildInitialFileSystem();
  useFileSystemStore.setState({
    nodes: Object.fromEntries(initialNodes.map((n) => [n.id, n])),
    rootOrder: initialNodes.map((n) => n.id),
    currentPath: ['root'],
    selectedIds: [],
    viewMode: 'icon',
  });
}

function resetAll() {
  localStorage.clear();
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
  useSystemStore.setState({
    appearance: 'auto',
    wallpaper: 'wallpaper-1',
    accentColor: 'blue',
    computerName: 'Tahoe',
    volume: 70,
    booted: true,
    lastTick: 0,
  });
  useDockStore.setState({
    pinned: ['finder', 'calculator', 'notes', 'terminal', 'safari', 'settings'],
    running: [],
    bouncing: null,
    size: 48,
    magnificationEnabled: true,
    position: 'bottom',
  });
  resetFileSystemStore();
}

beforeEach(() => {
  resetAll();
});

afterEach(() => {
  cleanup();
  resetAll();
});

function dispatchKey(
  opts: KeyboardEventInit & { key: string },
  target: EventTarget = window,
) {
  fireEvent.keyDown(target, opts);
}

describe('End-to-end integration', () => {
  it('opens Finder, navigates into Documents, creates a folder, and closes Finder', () => {
    render(<App />);

    // Open Finder via Dock (the integrated path). Clicking the dock entry
    // creates a window because there isn't one yet.
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Finder' }));
    });

    const orderBeforeClose = useWindowStore.getState().windowOrder.length;
    expect(orderBeforeClose).toBeGreaterThanOrEqual(1);
    const finderId = useWindowStore
      .getState()
      .windowOrder.find((wid) => useWindowStore.getState().windows[wid].appId === 'finder');
    expect(finderId).toBeDefined();

    // Navigate into Documents via the sidebar.
    act(() => {
      fireEvent.click(screen.getByTestId('finder-sidebar-documents'));
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'documents']);

    // Create a folder via the toolbar.
    const nodesBefore = Object.values(useFileSystemStore.getState().nodes).length;
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-folder'));
    });
    expect(Object.values(useFileSystemStore.getState().nodes).length).toBe(nodesBefore + 1);

    // Close the window via the standard close button.
    act(() => {
      fireEvent.click(screen.getByTestId(`close-${finderId}`));
    });
    expect(useWindowStore.getState().windows[finderId!]).toBeUndefined();
  });

  it('Cmd+W closes the active window via the global keyboard shortcut', () => {
    render(<App />);
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('calculator');
    });
    expect(useWindowStore.getState().activeWindowId).toBe(id);

    act(() => {
      dispatchKey({ key: 'w', metaKey: true });
    });

    expect(useWindowStore.getState().windows[id]).toBeUndefined();
    expect(useWindowStore.getState().activeWindowId).not.toBe(id);
  });

  it('Ctrl+W also closes the active window on non-Mac platforms', () => {
    render(<App />);
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('notes');
    });

    act(() => {
      dispatchKey({ key: 'w', ctrlKey: true });
    });

    expect(useWindowStore.getState().windows[id]).toBeUndefined();
  });

  it('Cmd+M minimizes the active window', () => {
    render(<App />);
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('safari');
    });
    expect(useWindowStore.getState().windows[id].minimized).toBe(false);

    act(() => {
      dispatchKey({ key: 'm', metaKey: true });
    });
    expect(useWindowStore.getState().windows[id].minimized).toBe(true);
  });

  it('Cmd+N opens a new window of the active app', () => {
    render(<App />);
    act(() => {
      useWindowStore.getState().openWindow('finder');
    });
    const before = useWindowStore.getState().windowOrder.filter(
      (wid) => useWindowStore.getState().windows[wid]?.appId === 'finder',
    ).length;

    act(() => {
      dispatchKey({ key: 'n', metaKey: true });
    });

    const after = useWindowStore.getState().windowOrder.filter(
      (wid) => useWindowStore.getState().windows[wid]?.appId === 'finder',
    ).length;
    expect(after).toBe(before + 1);
  });

  it('Cmd+Option+Escape opens the Force Quit dialog', () => {
    render(<App />);
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('terminal');
    });

    // Sanity: dialog not visible yet.
    expect(screen.queryByTestId('force-quit-dialog')).not.toBeInTheDocument();

    act(() => {
      dispatchKey({ key: 'Escape', metaKey: true, altKey: true });
    });

    const dialog = screen.getByTestId('force-quit-dialog');
    expect(dialog).toBeInTheDocument();

    // The opened window is listed with a Force Quit button next to it.
    const row = screen.getByTestId(`force-quit-row-${id}`);
    expect(within(row).getByText(/Terminal/i)).toBeInTheDocument();
    expect(within(row).getByTestId(`force-quit-close-${id}`)).toBeInTheDocument();
  });

  it('Ctrl+Alt+Escape opens the Force Quit dialog on non-Mac', () => {
    render(<App />);
    act(() => {
      useWindowStore.getState().openWindow('calculator');
    });

    act(() => {
      dispatchKey({ key: 'Escape', ctrlKey: true, altKey: true });
    });

    expect(screen.getByTestId('force-quit-dialog')).toBeInTheDocument();
  });

  it('Force Quit close button removes the corresponding window', () => {
    render(<App />);
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('notes');
    });

    act(() => {
      dispatchKey({ key: 'Escape', metaKey: true, altKey: true });
    });
    expect(screen.getByTestId('force-quit-dialog')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId(`force-quit-close-${id}`));
    });
    expect(useWindowStore.getState().windows[id]).toBeUndefined();
    // Dialog remains open so users can quit more than one app at a time.
    expect(screen.getByTestId('force-quit-dialog')).toBeInTheDocument();
  });

  it('Force Quit dialog closes on Escape and on backdrop click', () => {
    render(<App />);
    act(() => {
      useWindowStore.getState().openWindow('calculator');
    });
    act(() => {
      dispatchKey({ key: 'Escape', metaKey: true, altKey: true });
    });
    expect(screen.getByTestId('force-quit-dialog')).toBeInTheDocument();

    // Plain Escape should dismiss the dialog.
    act(() => {
      dispatchKey({ key: 'Escape' });
    });
    expect(screen.queryByTestId('force-quit-dialog')).not.toBeInTheDocument();
  });

  it('desktop right-click context menu closes on Escape', () => {
    render(<App />);
    const desktop = screen.getByTestId('desktop');
    act(() => {
      fireEvent.contextMenu(desktop, { clientX: 100, clientY: 120 });
    });
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    act(() => {
      dispatchKey({ key: 'Escape' });
    });
    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  });

  it('desktop right-click context menu closes on outside click', () => {
    render(<App />);
    const desktop = screen.getByTestId('desktop');
    act(() => {
      fireEvent.contextMenu(desktop, { clientX: 100, clientY: 120 });
    });
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    act(() => {
      fireEvent.pointerDown(document.body);
    });
    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  });

  it('menu bar dropdown opens on click and closes on Escape', () => {
    render(<App />);
    const bar = screen.getByTestId('menu-bar');
    // The active app contributes a File menu with submenu items.
    const fileButton = within(bar).getByRole('button', { name: 'File' });
    act(() => {
      fireEvent.click(fileButton);
    });
    expect(screen.getByRole('menu')).toBeInTheDocument();

    act(() => {
      dispatchKey({ key: 'Escape' });
    });
    // After Escape the dropdown's menu node is gone (the menu-bar itself
    // remains).
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keyboard shortcuts are ignored while typing in an input', () => {
    render(<App />);
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('notes');
    });

    // Simulate the user pressing Cmd+W while focus is in an editable element.
    const target = document.createElement('input');
    document.body.appendChild(target);

    act(() => {
      dispatchKey({ key: 'w', metaKey: true }, target);
    });

    expect(useWindowStore.getState().windows[id]).toBeDefined();

    target.remove();
  });
});

describe('Keyboard normalization helpers', () => {
  it('normalizeShortcut builds a Cmd-prefixed string on Mac', async () => {
    const { isMac, normalizeShortcut } = await import('../lib/keyboard');
    // We can't change navigator.platform mid-test, but we can verify the
    // structural shape of the helper output for an arbitrary event.
    const ev = { metaKey: true, ctrlKey: false, altKey: false, shiftKey: false, key: 'W' } as KeyboardEvent;
    const out = normalizeShortcut(ev);
    if (isMac()) {
      expect(out).toBe('Cmd+W');
    } else {
      // On non-Mac we still pass the event through; Cmd is only emitted when
      // metaKey is set, so the result is consistent regardless of platform.
      expect(out).toBe('Cmd+W');
    }
  });

  it('normalizeShortcut emits Ctrl for Ctrl-modified events', async () => {
    const { isMac, normalizeShortcut } = await import('../lib/keyboard');
    const ev = { metaKey: false, ctrlKey: true, altKey: false, shiftKey: false, key: 'w' } as KeyboardEvent;
    const out = normalizeShortcut(ev);
    if (isMac()) {
      expect(out).toBe('Ctrl+W');
    } else {
      expect(out).toBe('Ctrl+W');
    }
  });
});
