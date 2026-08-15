import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light theme and sets data-theme attribute', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles between light and dark', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    const button = screen.getByRole('button', { name: 'Toggle' });
    fireEvent.click(button);
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(button);
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
  });

  it('ignores invalid theme values', () => {
    function InvalidSetter() {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme-value">{theme}</span>
          <button onClick={() => setTheme('invalid')}>Bad</button>
        </div>
      );
    }
    render(
      <ThemeProvider defaultTheme="dark">
        <InvalidSetter />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Bad' }));
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });
});
