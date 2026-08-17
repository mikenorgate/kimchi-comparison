import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider } from '@/app/lib/shellContext';
import { ControlCenter } from '@/app/components/ControlCenter';

function mockMatchMedia(isDark = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? isDark : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function renderControlCenter(open = true) {
  return render(
    <ThemeProvider>
      <ShellProvider>
        <ControlCenter open={open} />
      </ShellProvider>
    </ThemeProvider>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockMatchMedia(false);
});

describe('ControlCenter', () => {
  it('renders nothing when closed', () => {
    renderControlCenter(false);
    expect(screen.queryByTestId('control-center')).toBeNull();
  });

  it('renders toggles and sliders when open', () => {
    renderControlCenter(true);
    expect(screen.getByTestId('control-center')).toBeTruthy();
    expect(screen.getByTestId('cc-wifi')).toBeTruthy();
    expect(screen.getByTestId('cc-bluetooth')).toBeTruthy();
    expect(screen.getByTestId('cc-brightness')).toBeTruthy();
    expect(screen.getByTestId('cc-volume')).toBeTruthy();
    expect(screen.getByTestId('cc-theme')).toBeTruthy();
  });

  it('toggles Wi-Fi and Bluetooth labels', () => {
    renderControlCenter(true);
    expect(screen.getByTestId('cc-wifi').textContent).toBe('Wi-Fi On');
    expect(screen.getByTestId('cc-bluetooth').textContent).toBe('Bluetooth On');
    fireEvent.click(screen.getByTestId('cc-wifi'));
    expect(screen.getByTestId('cc-wifi').textContent).toBe('Wi-Fi Off');
    fireEvent.click(screen.getByTestId('cc-bluetooth'));
    expect(screen.getByTestId('cc-bluetooth').textContent).toBe('Bluetooth Off');
  });

  it('updates brightness and volume values', () => {
    renderControlCenter(true);
    const brightness = screen.getByLabelText('Brightness') as HTMLInputElement;
    const volume = screen.getByLabelText('Volume') as HTMLInputElement;
    fireEvent.change(brightness, { target: { value: '42' } });
    fireEvent.change(volume, { target: { value: '75' } });
    expect(screen.getByTestId('cc-brightness-value').textContent).toBe('42%');
    expect(screen.getByTestId('cc-volume-value').textContent).toBe('75%');
  });

  it('toggles the theme from the control center', () => {
    renderControlCenter(true);
    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent.click(screen.getByTestId('cc-theme'));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
