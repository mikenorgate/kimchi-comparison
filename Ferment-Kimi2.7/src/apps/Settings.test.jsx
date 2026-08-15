import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './Settings';

describe('Settings', () => {
  it('renders the settings sidebar and default panel', () => {
    render(<Settings />);
    expect(screen.getByTestId('settings-app')).toBeInTheDocument();
    expect(screen.getByText('About This Mac')).toBeInTheDocument();
    expect(screen.getByText('macOS Tahoe 26.0 · MacBook Pro')).toBeInTheDocument();
  });

  it('switches settings sections when a sidebar row is clicked', () => {
    render(<Settings />);
    fireEvent.click(screen.getByText('Appearance'));
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Network'));
    expect(screen.getByText('Connected to LiquidGlass')).toBeInTheDocument();
  });

  it('toggles a preference switch', () => {
    render(<Settings />);
    fireEvent.click(screen.getByText('Appearance'));
    const checkbox = screen.getByLabelText('Dark mode');
    expect(checkbox.checked).toBe(false);
    fireEvent.click(screen.getByLabelText('Dark mode'));
    expect(checkbox.checked).toBe(true);
  });
});
