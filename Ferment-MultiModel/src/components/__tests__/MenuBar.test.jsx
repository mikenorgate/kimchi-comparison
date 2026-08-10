import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import MenuBar, {
  DEFAULT_APP_LABEL,
  buildMenus,
  resolveAppName,
} from '../MenuBar.jsx';

afterEach(() => {
  cleanup();
});

describe('<MenuBar /> component', () => {
  it('renders the menu bar root with default "Finder" app label', () => {
    render(<MenuBar />);
    const root = screen.getByTestId('menu-bar');
    expect(root).toBeInTheDocument();
    expect(root.getAttribute('data-active-app')).toBe(DEFAULT_APP_LABEL);

    const label = screen.getByTestId('menu-bar-app-label');
    expect(label).toHaveTextContent(DEFAULT_APP_LABEL);
  });

  it('renders the standard menu labels in the top bar', () => {
    render(<MenuBar />);
    // Second menu slot defaults to "Finder" when no activeApp is given
    expect(screen.getByTestId('menu-bar-trigger-app')).toHaveTextContent(
      'Finder',
    );
    expect(screen.getByTestId('menu-bar-trigger-file')).toHaveTextContent(
      'File',
    );
    expect(screen.getByTestId('menu-bar-trigger-edit')).toHaveTextContent(
      'Edit',
    );
    expect(screen.getByTestId('menu-bar-trigger-view')).toHaveTextContent(
      'View',
    );
    expect(screen.getByTestId('menu-bar-trigger-window')).toHaveTextContent(
      'Window',
    );
    expect(screen.getByTestId('menu-bar-trigger-help')).toHaveTextContent(
      'Help',
    );
  });

  it('updates the left-side label when activeApp prop changes (string form)', () => {
    const { rerender } = render(<MenuBar activeApp="Safari" />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Safari',
    );
    expect(screen.getByTestId('menu-bar').getAttribute('data-active-app')).toBe(
      'Safari',
    );

    rerender(<MenuBar activeApp="Notes" />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Notes',
    );
  });

  it('updates the left-side label when activeApp prop changes (object form)', () => {
    const { rerender } = render(
      <MenuBar activeApp={{ id: 'safari', name: 'Safari' }} />,
    );
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Safari',
    );

    rerender(<MenuBar activeApp={{ id: 'notes', name: 'Notes' }} />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Notes',
    );
  });

  it('reflects activeApp in the second menu slot label', () => {
    render(<MenuBar activeApp="Safari" />);
    expect(screen.getByTestId('menu-bar-trigger-app')).toHaveTextContent(
      'Safari',
    );
  });

  it('falls back to "Finder" when activeApp is null/undefined/empty', () => {
    const { rerender } = render(<MenuBar activeApp={null} />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Finder',
    );

    rerender(<MenuBar activeApp={undefined} />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Finder',
    );

    rerender(<MenuBar activeApp="" />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Finder',
    );

    rerender(<MenuBar activeApp={{ name: '' }} />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Finder',
    );
  });

  it('opens a dropdown when a menu label is clicked', () => {
    render(<MenuBar />);
    expect(
      screen.queryByTestId('menu-bar-dropdown-file'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-bar-trigger-file'));

    const dropdown = screen.getByTestId('menu-bar-dropdown-file');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveAttribute('role', 'menu');

    // The File menu should expose its known items.
    expect(
      screen.getByTestId('menu-bar-item-file-Open…'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('menu-bar-item-file-Close Window'),
    ).toBeInTheDocument();
  });

  it('closes an open dropdown when the same trigger is clicked again', () => {
    render(<MenuBar />);
    fireEvent.click(screen.getByTestId('menu-bar-trigger-edit'));
    expect(
      screen.getByTestId('menu-bar-dropdown-edit'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-bar-trigger-edit'));
    expect(
      screen.queryByTestId('menu-bar-dropdown-edit'),
    ).not.toBeInTheDocument();
  });

  it('closes an open dropdown when Escape is pressed', () => {
    render(<MenuBar />);
    fireEvent.click(screen.getByTestId('menu-bar-trigger-view'));
    expect(
      screen.getByTestId('menu-bar-dropdown-view'),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.queryByTestId('menu-bar-dropdown-view'),
    ).not.toBeInTheDocument();
  });

  it('closes an open dropdown when clicking outside the menu bar', () => {
    render(
      <div>
        <MenuBar />
        <button type="button" data-testid="outside">
          Outside
        </button>
      </div>,
    );

    fireEvent.click(screen.getByTestId('menu-bar-trigger-help'));
    expect(
      screen.getByTestId('menu-bar-dropdown-help'),
    ).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId('outside'));

    expect(
      screen.queryByTestId('menu-bar-dropdown-help'),
    ).not.toBeInTheDocument();
  });

  it('calls onMenuAction with menu id and item label when a menu item is clicked', () => {
    const handleAction = vi.fn();
    render(<MenuBar onMenuAction={handleAction} />);

    fireEvent.click(screen.getByTestId('menu-bar-trigger-file'));
    fireEvent.click(screen.getByTestId('menu-bar-item-file-New Window'));

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledWith('file', 'New Window');
  });

  it('closes the dropdown after a menu item is clicked', () => {
    const handleAction = vi.fn();
    render(<MenuBar onMenuAction={handleAction} />);

    fireEvent.click(screen.getByTestId('menu-bar-trigger-edit'));
    fireEvent.click(screen.getByTestId('menu-bar-item-edit-Copy'));

    expect(handleAction).toHaveBeenCalledWith('edit', 'Copy');
    expect(
      screen.queryByTestId('menu-bar-dropdown-edit'),
    ).not.toBeInTheDocument();
  });

  it('does not throw when onMenuAction is not provided', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<MenuBar />);

    fireEvent.click(screen.getByTestId('menu-bar-trigger-file'));
    expect(() =>
      fireEvent.click(screen.getByTestId('menu-bar-item-file-Open…')),
    ).not.toThrow();

    logSpy.mockRestore();
  });

  it('ignores clicks on separator entries', () => {
    const handleAction = vi.fn();
    render(<MenuBar onMenuAction={handleAction} />);

    fireEvent.click(screen.getByTestId('menu-bar-trigger-file'));
    // Find any separator in the file dropdown and click it; no action
    // should fire and the menu should remain open.
    const dropdown = screen.getByTestId('menu-bar-dropdown-file');
    const separators = dropdown.querySelectorAll('[role="separator"]');
    expect(separators.length).toBeGreaterThan(0);
    fireEvent.click(separators[0]);

    expect(handleAction).not.toHaveBeenCalled();
    expect(
      screen.getByTestId('menu-bar-dropdown-file'),
    ).toBeInTheDocument();
  });

  it('uses the Liquid Glass menu utility class on the root', () => {
    const { container } = render(<MenuBar />);
    const root = container.querySelector('[data-testid="menu-bar"]');
    expect(root).not.toBeNull();
    expect(root.className).toContain('glass-menu');
    expect(root.className).toContain('fixed');
    expect(root.className).toContain('top-0');
  });
});

describe('resolveAppName helper', () => {
  it('returns the default for null/undefined/empty inputs', () => {
    expect(resolveAppName(null)).toBe(DEFAULT_APP_LABEL);
    expect(resolveAppName(undefined)).toBe(DEFAULT_APP_LABEL);
    expect(resolveAppName('')).toBe(DEFAULT_APP_LABEL);
    expect(resolveAppName({})).toBe(DEFAULT_APP_LABEL);
    expect(resolveAppName({ name: '' })).toBe(DEFAULT_APP_LABEL);
  });

  it('returns the string for string input', () => {
    expect(resolveAppName('Safari')).toBe('Safari');
  });

  it('returns the .name for object input', () => {
    expect(resolveAppName({ id: 'safari', name: 'Safari' })).toBe('Safari');
  });
});

describe('buildMenus helper', () => {
  it('returns the base menu order when no activeApp is provided', () => {
    const menus = buildMenus(null);
    expect(menus.map((m) => m.id)).toEqual([
      'apple',
      'app',
      'file',
      'edit',
      'view',
      'window',
      'help',
    ]);
    expect(menus.find((m) => m.id === 'app').label).toBe(DEFAULT_APP_LABEL);
  });

  it('uses the activeApp name as the second menu label', () => {
    const menus = buildMenus('Safari');
    expect(menus.find((m) => m.id === 'app').label).toBe('Safari');
  });
});
