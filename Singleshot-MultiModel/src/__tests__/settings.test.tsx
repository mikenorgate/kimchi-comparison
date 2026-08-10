import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Settings from '../apps/Settings';
import { useSystemStore } from '../stores/systemStore';
import { useDockStore } from '../stores/dockStore';
import { useAppDataStore } from '../stores/appDataStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';

function clearAll() {
  localStorage.clear();
}

function resetStores() {
  useSystemStore.setState({
    appearance: 'auto',
    wallpaper: 'wallpaper-1',
    accentColor: 'blue',
    computerName: 'Tahoe',
    volume: 70,
    booted: false,
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
  useAppDataStore.setState({
    calculatorMemory: 0,
    calculatorHistory: [],
    notes: {},
    noteOrder: [],
    terminalHistory: [],
    terminalCwd: 'root',
    safariRecent: [],
  });
  useFileSystemStore.setState({
    nodes: {},
    rootOrder: [],
    currentPath: ['root'],
    selectedIds: [],
    viewMode: 'icon',
  });
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
}

beforeEach(() => {
  clearAll();
  resetStores();
});

afterEach(() => {
  clearAll();
  resetStores();
  vi.restoreAllMocks();
});

function getRoot() {
  return screen.getByTestId('settings-root');
}

describe('Settings app', () => {
  it('renders the General pane by default', () => {
    render(<Settings windowId="win-settings-1" />);
    expect(getRoot()).toBeInTheDocument();
    expect(screen.getByTestId('settings-general-appearance')).toBeInTheDocument();
    expect(screen.getByTestId('settings-general-name')).toBeInTheDocument();
  });

  it('toggles appearance to dark and persists immediately', () => {
    render(<Settings windowId="win-settings-2" />);

    act(() => {
      fireEvent.click(screen.getByTestId('appearance-dark'));
    });

    expect(useSystemStore.getState().appearance).toBe('dark');

    // Verify the button shows the active state.
    const dark = screen.getByTestId('appearance-dark');
    expect(dark.className).toContain('bg-blue-500');
  });

  it('changes wallpaper and reflects immediately in the store', () => {
    render(<Settings windowId="win-settings-3" />);

    // Switch to Desktop pane.
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-desktop'));
    });
    expect(screen.getByTestId('wallpaper-picker')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('wallpaper-wallpaper-3'));
    });

    expect(useSystemStore.getState().wallpaper).toBe('wallpaper-3');

    // The selected wallpaper button should have the active border class.
    const selected = screen.getByTestId('wallpaper-wallpaper-3');
    expect(selected.className).toContain('border-blue-500');
  });

  it('changes accent color and persists after remount', async () => {
    const { unmount } = render(<Settings windowId="win-settings-4" />);

    act(() => {
      fireEvent.click(screen.getByTestId('accent-purple'));
    });
    expect(useSystemStore.getState().accentColor).toBe('purple');

    unmount();

    // Rehydrate to simulate a fresh page load reading from localStorage.
    await useSystemStore.persist.rehydrate();
    expect(useSystemStore.getState().accentColor).toBe('purple');
  });

  it('changes dock position and persists after remount', async () => {
    const { unmount } = render(<Settings windowId="win-settings-5" />);

    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-dock'));
    });
    expect(screen.getByTestId('settings-dock-position')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('dock-position-left'));
    });
    expect(useDockStore.getState().position).toBe('left');

    unmount();

    await useDockStore.persist.rehydrate();
    expect(useDockStore.getState().position).toBe('left');
  });

  it('updates the dock size slider and magnification toggle', () => {
    render(<Settings windowId="win-settings-6" />);

    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-dock'));
    });

    const slider = screen.getByTestId('dock-size-slider') as HTMLInputElement;
    act(() => {
      fireEvent.change(slider, { target: { value: '80' } });
    });
    expect(useDockStore.getState().size).toBe(80);

    act(() => {
      fireEvent.click(screen.getByTestId('dock-magnification-toggle'));
    });
    expect(useDockStore.getState().magnificationEnabled).toBe(false);
  });

  it('computer name input commits on blur', () => {
    render(<Settings windowId="win-settings-7" />);
    const input = screen.getByTestId('computer-name-input') as HTMLInputElement;
    expect(input.value).toBe('Tahoe');

    act(() => {
      fireEvent.change(input, { target: { value: '  Studio  ' } });
    });
    act(() => {
      fireEvent.blur(input);
    });
    expect(useSystemStore.getState().computerName).toBe('Studio');

    // Empty draft reverts to the stored value.
    act(() => {
      fireEvent.change(input, { target: { value: '' } });
    });
    act(() => {
      fireEvent.blur(input);
    });
    expect(useSystemStore.getState().computerName).toBe('Studio');
    expect(input.value).toBe('Studio');
  });

  it('Reset to Defaults clears all four persisted localStorage keys and reloads', () => {
    // Pre-populate the four persisted keys so we can observe them being cleared.
    localStorage.setItem('tahoe.system', JSON.stringify({ state: { computerName: 'X' }, version: 0 }));
    localStorage.setItem('tahoe.filesystem', JSON.stringify({ state: { nodes: {} }, version: 0 }));
    localStorage.setItem('tahoe.dock', JSON.stringify({ state: { position: 'left' }, version: 0 }));
    localStorage.setItem('tahoe.appdata', JSON.stringify({ state: { notes: {} }, version: 0 }));

    // Stub window.location.reload so the test doesn't actually navigate.
    const reloadMock = vi.fn();
    // jsdom doesn't allow reassigning window.location, so use defineProperty.
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });

    render(<Settings windowId="win-settings-8" />);

    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-reset'));
    });
    expect(screen.getByTestId('reset-defaults-btn')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('reset-defaults-btn'));
    });

    expect(localStorage.getItem('tahoe.system')).toBeNull();
    expect(localStorage.getItem('tahoe.filesystem')).toBeNull();
    expect(localStorage.getItem('tahoe.dock')).toBeNull();
    expect(localStorage.getItem('tahoe.appdata')).toBeNull();
    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore for any subsequent tests.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('Clear Recents only wipes Safari recent URLs', () => {
    act(() => {
      useAppDataStore.getState().addRecentUrl('https://apple.com');
    });
    render(<Settings windowId="win-settings-9" />);

    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-reset'));
    });

    act(() => {
      fireEvent.click(screen.getByTestId('clear-safari-recent-btn'));
    });

    expect(useAppDataStore.getState().safariRecent.length).toBe(0);
    // Other system state is untouched.
    expect(useSystemStore.getState().computerName).toBe('Tahoe');
  });
});
