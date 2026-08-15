import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppIcon from './AppIcon';

const app = { name: 'Finder', color: '#007aff', iconFace: 'finder' };

describe('AppIcon', () => {
  it('renders with default variant', () => {
    render(<AppIcon app={app} variant="default" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-variant', 'default');
  });

  it('supports light variant', () => {
    render(<AppIcon app={app} variant="light" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('data-variant', 'light');
    expect(icon.classList.contains('app-icon--light')).toBe(true);
  });

  it('supports dark variant', () => {
    render(<AppIcon app={app} variant="dark" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('data-variant', 'dark');
    expect(icon.classList.contains('app-icon--dark')).toBe(true);
  });

  it('supports clear variant', () => {
    render(<AppIcon app={app} variant="clear" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('data-variant', 'clear');
    expect(icon.style.background).toBe('transparent');
  });

  it('supports tinted variant with translucent background', () => {
    render(<AppIcon app={app} variant="tinted" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('data-variant', 'tinted');
    expect(icon.classList.contains('app-icon--tinted')).toBe(true);
    const bg = icon.style.background;
    expect(bg.startsWith('rgba')).toBe(true);
    expect(bg).toContain('0.35');
  });

  it('uses variant-specific glyph color', () => {
    const { rerender } = render(<AppIcon app={app} variant="light" />);
    let icon = screen.getByTestId('app-icon');
    expect(icon.style.color).toContain('0, 122, 255');
    rerender(<AppIcon app={app} variant="dark" />);
    icon = screen.getByTestId('app-icon');
    expect(icon.style.color).toContain('255, 255, 255');
  });

  it('supports dock variant', () => {
    render(<AppIcon app={app} variant="dock" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('data-variant', 'dock');
  });
});
