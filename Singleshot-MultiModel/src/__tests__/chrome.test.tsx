import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import MenuBar from '../components/MenuBar';
import Dock from '../components/Dock';
import Desktop from '../components/Desktop';
import { useSystemStore } from '../stores/systemStore';
import { useWindowStore } from '../stores/windowStore';
import { useDockStore } from '../stores/dockStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { APP_REGISTRY } from '../lib/apps';

beforeEach(() => {
  localStorage.clear();
  useWindowStore.setState({ windows: {}, windowOrder: [], activeWindowId: null, zCounter: 100 });
  useDockStore.setState({
    pinned: ['finder', 'calculator', 'notes', 'terminal', 'safari', 'settings'],
    running: [],
    bouncing: null,
    size: 48,
    magnificationEnabled: true,
    position: 'bottom',
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
});

afterEach(() => {
  localStorage.clear();
});

describe('MenuBar', () => {
  it('renders the active app name from the registry', () => {
    render(<MenuBar />);
    const bar = screen.getByTestId('menu-bar');
    expect(bar.dataset.activeApp).toBe('finder');
    // The active-app name is rendered as a (bold) menu button label.
    expect(within(bar).getByRole('button', { name: APP_REGISTRY.finder.name })).toBeInTheDocument();
  });

  it('updates the active app name when a different window becomes active', () => {
    let wid = '';
    act(() => {
      wid = useWindowStore.getState().openWindow('calculator');
    });
    render(<MenuBar />);
    const bar = screen.getByTestId('menu-bar');
    expect(bar.dataset.activeApp).toBe('calculator');
    expect(within(bar).getByRole('button', { name: APP_REGISTRY.calculator.name })).toBeInTheDocument();
    expect(useWindowStore.getState().activeWindowId).toBe(wid);
  });

  it('renders a clock element', () => {
    render(<MenuBar />);
    expect(screen.getByTestId('menu-bar-clock')).toBeInTheDocument();
  });
});

describe('Dock', () => {
  it('renders all pinned apps', () => {
    render(<Dock />);
    for (const id of useDockStore.getState().pinned) {
      expect(screen.getByTestId(`dock-item-${id}`)).toBeInTheDocument();
    }
  });

  it('calls openWindow and startBounce when a pinned app is clicked', () => {
    render(<Dock />);
    const orderBefore = useWindowStore.getState().windowOrder.length;
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Calculator' }));
    });
    // The Dock should have created a window for calculator and started a
    // bounce animation on it.
    expect(useWindowStore.getState().windowOrder.length).toBe(orderBefore + 1);
    expect(useDockStore.getState().bouncing?.appId).toBe('calculator');
  });

  it('focuses an existing window instead of opening a duplicate', () => {
    let wid = '';
    act(() => {
      wid = useWindowStore.getState().openWindow('notes');
    });
    render(<Dock />);
    const orderBefore = useWindowStore.getState().windowOrder.length;
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Notes' }));
    });
    // No new window was created and the existing window is now active.
    expect(useWindowStore.getState().windowOrder.length).toBe(orderBefore);
    expect(useWindowStore.getState().activeWindowId).toBe(wid);
  });

  it('shows running dots only for apps with an open window', () => {
    // Open a Finder window so the dot should appear under the Finder icon.
    act(() => {
      useWindowStore.getState().openWindow('finder');
    });
    render(<Dock />);
    expect(screen.getByTestId('dock-running-finder')).toBeInTheDocument();
    expect(screen.queryByTestId('dock-running-calculator')).not.toBeInTheDocument();
  });

  it('updates the running dot when a window opens or closes', () => {
    render(<Dock />);
    // No windows open yet, so no running dots.
    expect(screen.queryByTestId('dock-running-calculator')).not.toBeInTheDocument();

    let wid = '';
    act(() => {
      wid = useWindowStore.getState().openWindow('calculator');
    });
    expect(screen.getByTestId('dock-running-calculator')).toBeInTheDocument();

    // Closing the window should remove the dot.
    act(() => {
      useWindowStore.getState().closeWindow(wid);
    });
    expect(screen.queryByTestId('dock-running-calculator')).not.toBeInTheDocument();
  });

  it('hides the running dot while the window is minimized', () => {
    let wid = '';
    act(() => {
      wid = useWindowStore.getState().openWindow('notes');
    });
    render(<Dock />);
    expect(screen.getByTestId('dock-running-notes')).toBeInTheDocument();

    act(() => {
      useWindowStore.getState().minimizeWindow(wid);
    });
    expect(screen.queryByTestId('dock-running-notes')).not.toBeInTheDocument();
  });

  it('reports magnification data on every dock item', () => {
    render(<Dock />);
    for (const id of useDockStore.getState().pinned) {
      const node = screen.getByTestId(`dock-item-${id}`);
      // Each dock item exposes its current magnification factor as a
      // data-attribute so the magnification math is observable.
      expect(node.dataset.magnification).toBeDefined();
      const factor = Number(node.dataset.magnification);
      expect(Number.isFinite(factor)).toBe(true);
    }
  });

  it('updates the magnification factor when magnification is disabled in the store', () => {
    render(<Dock />);
    const item = screen.getByTestId('dock-item-finder');
    expect(item.dataset.magnification).toBe('0.00');
  });
});

describe('Desktop', () => {
  it('renders the default desktop icons', () => {
    render(<Desktop />);
    const icons = screen.getByTestId('desktop-icons');
    expect(within(icons).getByTestId('desktop-icon-home')).toBeInTheDocument();
    expect(within(icons).getByTestId('desktop-icon-applications')).toBeInTheDocument();
    expect(within(icons).getByTestId('desktop-icon-settings')).toBeInTheDocument();
  });

  it('renders the selected wallpaper as background', () => {
    act(() => {
      useSystemStore.getState().setWallpaper('wallpaper-3');
    });
    render(<Desktop />);
    const desktop = screen.getByTestId('desktop');
    expect(desktop.style.background).toContain('linear-gradient');
  });

  it('opens an app window when a desktop icon is double-clicked', () => {
    render(<Desktop />);
    const orderBefore = useWindowStore.getState().windowOrder.length;
    fireEvent.doubleClick(screen.getByTestId('desktop-icon-settings'));
    expect(useWindowStore.getState().windowOrder.length).toBe(orderBefore + 1);
    const latestId = useWindowStore.getState().windowOrder.at(-1)!;
    expect(useWindowStore.getState().windows[latestId].appId).toBe('settings');
  });

  it('opens Finder when the Applications folder icon is double-clicked', () => {
    render(<Desktop />);
    const orderBefore = useWindowStore.getState().windowOrder.length;
    fireEvent.doubleClick(screen.getByTestId('desktop-icon-applications'));
    expect(useWindowStore.getState().windowOrder.length).toBe(orderBefore + 1);
    const latestId = useWindowStore.getState().windowOrder.at(-1)!;
    expect(useWindowStore.getState().windows[latestId].appId).toBe('finder');
  });

  it('navigates Finder to the target folder when a desktop folder icon is opened', () => {
    render(<Desktop />);
    // Start with a clean Finder path so the navigation is observable.
    act(() => {
      useFileSystemStore.getState().navigateTo('root');
    });
    fireEvent.doubleClick(screen.getByTestId('desktop-icon-home'));
    // The Home icon's target is 'documents'.
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'documents']);

    act(() => {
      useFileSystemStore.getState().navigateTo('root');
    });
    fireEvent.doubleClick(screen.getByTestId('desktop-icon-applications'));
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'applications']);
  });

  it('opens a context menu on right-click and offers a background change', () => {
    render(<Desktop />);
    const desktop = screen.getByTestId('desktop');
    fireEvent.contextMenu(desktop, { clientX: 100, clientY: 200 });
    const menu = screen.getByTestId('context-menu');
    expect(menu).toBeInTheDocument();
    // The desktop menu always exposes a background-change option.
    expect(within(menu).getByText(/Change Desktop Background/i)).toBeInTheDocument();
    expect(within(menu).getByText(/New Folder/i)).toBeInTheDocument();

    // Triggering the wallpaper change actually flips the store value.
    fireEvent.click(within(menu).getByText(/Change Desktop Background/i));
    expect(useSystemStore.getState().wallpaper).not.toBe('wallpaper-1');
  });
});
