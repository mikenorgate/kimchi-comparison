import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Dock, { TRASH_ID } from '../Dock.jsx';
import { CURATED_APP_IDS } from '../AppIcon.jsx';

afterEach(() => {
  cleanup();
});

describe('<Dock /> component', () => {
  it('renders the dock root', () => {
    render(<Dock />);
    const root = screen.getByTestId('dock');
    expect(root).toBeInTheDocument();
  });

  it('renders exactly 12 curated app icons', () => {
    render(<Dock />);
    expect(CURATED_APP_IDS.length).toBe(12);
    for (const appId of CURATED_APP_IDS) {
      const icon = screen.getByTestId(`dock-icon-${appId}`);
      expect(
        icon,
        `expected dock icon for "${appId}" to be in the document`,
      ).toBeInTheDocument();
    }
  });

  it('renders a trash icon at the end', () => {
    render(<Dock />);
    const trash = screen.getByTestId(`dock-icon-${TRASH_ID}`);
    expect(trash).toBeInTheDocument();
    expect(TRASH_ID).toBe('trash');
  });

  it('renders a separator between the apps and the trash', () => {
    render(<Dock />);
    expect(screen.getByTestId('dock-separator')).toBeInTheDocument();
  });

  it('calls onOpenApp with the appId when an app icon is clicked', () => {
    const handleOpen = vi.fn();
    render(<Dock onOpenApp={handleOpen} />);

    fireEvent.click(screen.getByTestId('dock-icon-safari'));
    fireEvent.click(screen.getByTestId('dock-icon-mail'));

    expect(handleOpen).toHaveBeenCalledTimes(2);
    expect(handleOpen).toHaveBeenNthCalledWith(1, 'safari');
    expect(handleOpen).toHaveBeenNthCalledWith(2, 'mail');
  });

  it('calls onOpenApp with "trash" when the trash icon is clicked', () => {
    const handleOpen = vi.fn();
    render(<Dock onOpenApp={handleOpen} />);
    fireEvent.click(screen.getByTestId('dock-icon-trash'));
    expect(handleOpen).toHaveBeenCalledTimes(1);
    expect(handleOpen).toHaveBeenCalledWith('trash');
  });

  it('does not throw when onOpenApp is omitted', () => {
    render(<Dock />);
    expect(() =>
      fireEvent.click(screen.getByTestId('dock-icon-notes')),
    ).not.toThrow();
    expect(() =>
      fireEvent.click(screen.getByTestId('dock-icon-trash')),
    ).not.toThrow();
  });

  it('uses button elements for keyboard accessibility', () => {
    render(<Dock />);
    expect(screen.getByTestId('dock-icon-safari').tagName).toBe('BUTTON');
    expect(screen.getByTestId('dock-icon-trash').tagName).toBe('BUTTON');
  });

  it('exposes a label via title for hover tooltips', () => {
    render(<Dock />);
    expect(screen.getByTestId('dock-icon-safari').getAttribute('title')).toBe(
      'Safari',
    );
    expect(screen.getByTestId('dock-icon-mail').getAttribute('title')).toBe(
      'Mail',
    );
    expect(screen.getByTestId('dock-icon-trash').getAttribute('title')).toBe(
      'Trash',
    );
  });

  it('exposes a label via aria-label for screen readers', () => {
    render(<Dock />);
    expect(
      screen.getByTestId('dock-icon-safari').getAttribute('aria-label'),
    ).toBe('Safari');
    expect(
      screen.getByTestId('dock-icon-trash').getAttribute('aria-label'),
    ).toBe('Trash');
  });

  it('is keyboard-focusable', () => {
    render(<Dock />);
    const safari = screen.getByTestId('dock-icon-safari');
    safari.focus();
    expect(safari).toHaveFocus();
  });

  it('applies a hover/focus class for the scale animation', () => {
    render(<Dock />);
    const safari = screen.getByTestId('dock-icon-safari');
    const cls = safari.getAttribute('class') ?? '';
    expect(cls).toContain('hover:scale-110');
    expect(cls).toContain('focus:scale-110');
    expect(cls).toContain('focus-visible:ring-2');
  });

  it('uses the Liquid Glass dock utility class and is pinned to the bottom', () => {
    render(<Dock />);
    const root = screen.getByTestId('dock');
    const cls = root.getAttribute('class') ?? '';
    expect(cls).toContain('dock-glass');
    expect(cls).toContain('fixed');
    expect(cls).toContain('bottom-3');
    expect(cls).toContain('left-1/2');
    expect(cls).toContain('-translate-x-1/2');
  });

  it('appends an optional className to the root element', () => {
    render(<Dock className="my-dock-override" />);
    const root = screen.getByTestId('dock');
    expect(root.getAttribute('class')).toContain('my-dock-override');
  });

  it('renders an svg inside each icon button', () => {
    const { container } = render(<Dock />);
    const buttons = container.querySelectorAll(
      '[data-testid^="dock-icon-"]',
    );
    expect(buttons.length).toBe(CURATED_APP_IDS.length + 1); // apps + trash
    buttons.forEach((btn) => {
      const svg = btn.querySelector('svg');
      expect(svg, `expected svg inside ${btn.getAttribute('data-testid')}`).not.toBeNull();
    });
  });
});
