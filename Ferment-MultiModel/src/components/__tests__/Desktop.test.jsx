import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Desktop, { WALLPAPERS } from '../Desktop.jsx';

describe('<Desktop /> component', () => {
  it('renders the desktop root element', () => {
    const { container } = render(<Desktop />);
    const root = container.querySelector('[data-testid="desktop-root"]');
    expect(root).not.toBeNull();
    expect(root).toBeInTheDocument();
  });

  it('applies the default wallpaper when no prop is given', () => {
    const { container } = render(<Desktop />);
    const root = container.querySelector('[data-testid="desktop-root"]');
    expect(root).not.toBeNull();
    const defaultId = WALLPAPERS[0].id;
    expect(root.getAttribute('data-wallpaper-id')).toBe(defaultId);
  });

  it('applies a custom built-in wallpaper by id', () => {
    const { container } = render(<Desktop wallpaper="mountains" />);
    const root = container.querySelector('[data-testid="desktop-root"]');
    expect(root.getAttribute('data-wallpaper-id')).toBe('mountains');

    const wallpaperEl = container.querySelector('[data-testid="desktop-wallpaper"]');
    expect(wallpaperEl).not.toBeNull();
    const styleAttr = wallpaperEl.getAttribute('style') ?? '';
    const gradient = WALLPAPERS.find((w) => w.id === 'mountains').gradient;
    expect(styleAttr).toContain(gradient);
  });

  it('applies a custom CSS gradient string as wallpaper', () => {
    const customGradient = 'linear-gradient(90deg, #ff0000 0%, #00ff00 100%)';
    const { container } = render(<Desktop wallpaper={customGradient} />);
    const wallpaperEl = container.querySelector('[data-testid="desktop-wallpaper"]');
    expect(wallpaperEl).not.toBeNull();
    const styleAttr = wallpaperEl.getAttribute('style') ?? '';
    expect(styleAttr).toContain(customGradient);
  });

  it('applies an image URL as wallpaper via url()', () => {
    const url = 'https://example.com/wallpaper.jpg';
    const { container } = render(<Desktop wallpaper={url} />);
    const wallpaperEl = container.querySelector('[data-testid="desktop-wallpaper"]');
    expect(wallpaperEl).not.toBeNull();
    const styleAttr = wallpaperEl.getAttribute('style') ?? '';
    expect(styleAttr).toContain(`url("${url}")`);
  });

  it('renders children inside the desktop window layer', () => {
    render(
      <Desktop>
        <div data-testid="child-window">A window</div>
      </Desktop>,
    );
    const child = screen.getByTestId('child-window');
    expect(child).toBeInTheDocument();
  });

  it('renders the vignette overlay for Liquid Glass depth', () => {
    const { container } = render(<Desktop />);
    const vignette = container.querySelector('[data-testid="desktop-vignette"]');
    expect(vignette).not.toBeNull();
  });

  it('appends optional className to the root element', () => {
    const { container } = render(<Desktop className="my-custom-class" />);
    const root = container.querySelector('[data-testid="desktop-root"]');
    expect(root.className).toContain('my-custom-class');
  });
});

describe('WALLPAPERS export', () => {
  it('exports a WALLPAPERS array', () => {
    expect(Array.isArray(WALLPAPERS)).toBe(true);
  });

  it('contains at least 3 entries', () => {
    expect(WALLPAPERS.length).toBeGreaterThanOrEqual(3);
  });

  it('each entry has an id and a gradient', () => {
    for (const w of WALLPAPERS) {
      expect(typeof w.id).toBe('string');
      expect(w.id.length).toBeGreaterThan(0);
      expect(typeof w.gradient).toBe('string');
      expect(w.gradient.length).toBeGreaterThan(0);
    }
  });

  it('contains the curated built-ins: aurora, mountains, waves', () => {
    const ids = WALLPAPERS.map((w) => w.id);
    expect(ids).toContain('aurora');
    expect(ids).toContain('mountains');
    expect(ids).toContain('waves');
  });
});
