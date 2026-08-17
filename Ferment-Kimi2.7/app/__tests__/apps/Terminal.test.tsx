import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Terminal } from '@/app/components/apps/Terminal';

describe('Terminal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a scrollback buffer and input prompt', () => {
    render(<Terminal />);
    expect(screen.getByTestId('terminal')).toBeTruthy();
    expect(screen.getByTestId('terminal-scrollback')).toBeTruthy();
    expect(screen.getByTestId('terminal-input')).toBeTruthy();
  });

  it('shows the welcome banner in scrollback', () => {
    render(<Terminal />);
    const scrollback = screen.getByTestId('terminal-scrollback');
    expect(scrollback.textContent).toContain('Tahoe Shell');
  });

  it('echoes a typed command and displays its output', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'echo hello world' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    const scrollback = screen.getByTestId('terminal-scrollback');
    expect(scrollback.textContent).toContain('$ echo hello world');
    expect(scrollback.textContent).toContain('hello world');
  });

  it('responds to unknown commands with an error', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'bogus' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    const errors = screen.getAllByTestId('terminal-line-error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].textContent).toContain('command not found');
  });

  it('clears the scrollback when clear is run', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'echo before' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    expect(screen.getByTestId('terminal-scrollback').textContent).toContain('before');
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    expect(screen.getByTestId('terminal-scrollback').textContent).not.toContain('before');
  });

  it('lists directories with ls', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    const scrollback = screen.getByTestId('terminal-scrollback');
    expect(scrollback.textContent).toContain('Documents');
    expect(scrollback.textContent).toContain('Desktop');
  });

  it('shows available commands for help', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    const scrollback = screen.getByTestId('terminal-scrollback');
    expect(scrollback.textContent).toContain('Available commands');
    expect(scrollback.textContent).toContain('whoami');
  });

  it('reports the current date', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'date' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    const scrollback = screen.getByTestId('terminal-scrollback');
    expect(scrollback.textContent).toMatch(/\d{4}/);
  });

  it('reports the current user', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    expect(screen.getByTestId('terminal-scrollback').textContent).toContain('tahoe-user');
  });

  it('reports the current directory', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'pwd' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    expect(screen.getByTestId('terminal-scrollback').textContent).toContain('/Users/tahoe-user');
  });

  it('reports system information for uname', () => {
    render(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'uname' } });
    fireEvent.submit(screen.getByTestId('terminal-form'));
    const scrollback = screen.getByTestId('terminal-scrollback');
    expect(scrollback.textContent).toContain('Darwin');
    expect(scrollback.textContent).toContain('Tahoe');
  });
});
