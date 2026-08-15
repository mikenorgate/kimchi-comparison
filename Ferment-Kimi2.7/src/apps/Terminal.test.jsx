import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Terminal from './Terminal';

describe('Terminal', () => {
  it('renders the terminal prompt and accepts a command', () => {
    render(<Terminal />);
    expect(screen.getByText('/Users/developer %')).toBeInTheDocument();
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('developer')).toBeInTheDocument();
  });

  it('shows an error for unknown commands', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'foo' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText(/command not found/)).toBeInTheDocument();
  });

  it('clears the screen on clear command', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'echo hello' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('hello')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });
});
