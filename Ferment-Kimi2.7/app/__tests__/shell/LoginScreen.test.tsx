import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LoginScreen } from '@/app/components/LoginScreen';
import { ShellProvider } from '@/app/lib/shellContext';
import { ThemeProvider } from '@/app/components/ThemeProvider';

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the lock screen with time, date, user, and unlock button', () => {
    render(
      <ThemeProvider>
        <ShellProvider>
          <LoginScreen onUnlock={() => {}} />
        </ShellProvider>
      </ThemeProvider>
    );
    expect(screen.getByTestId('login-screen')).toBeTruthy();
    expect(screen.getByTestId('login-time')).toBeTruthy();
    expect(screen.getByTestId('login-date')).toBeTruthy();
    expect(screen.getByTestId('login-user').textContent).toBe('User');
    expect(screen.getByTestId('login-unlock-button')).toBeTruthy();
  });

  it('calls onUnlock when the unlock button is clicked', () => {
    const onUnlock = vi.fn();
    render(
      <ThemeProvider>
        <ShellProvider>
          <LoginScreen onUnlock={onUnlock} />
        </ShellProvider>
      </ThemeProvider>
    );
    fireEvent.click(screen.getByTestId('login-unlock-button'));
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });
});
