import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { Settings } from '@/app/components/apps/Settings';

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderSettings() {
  return render(
    <ThemeProvider>
      <Settings />
    </ThemeProvider>
  );
}

describe('Settings', () => {
  beforeEach(() => {
    mockMatchMedia();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the settings sidebar with all panes', () => {
    renderSettings();
    expect(screen.getByTestId('settings-sidebar')).toBeTruthy();
    expect(screen.getByTestId('settings-pane-appearance')).toBeTruthy();
    expect(screen.getByTestId('settings-pane-wifi')).toBeTruthy();
    expect(screen.getByTestId('settings-pane-bluetooth')).toBeTruthy();
  });

  it('shows the Appearance pane by default with theme options', () => {
    renderSettings();
    expect(screen.getByTestId('settings-content').textContent).toContain('Choose a look for your Mac.');
    expect(screen.getByTestId('settings-appearance-light')).toBeTruthy();
    expect(screen.getByTestId('settings-appearance-dark')).toBeTruthy();
    expect(screen.getByTestId('settings-appearance-system')).toBeTruthy();
  });

  it('switches between panes when sidebar items are clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByTestId('settings-pane-wifi'));
    expect(screen.getByTestId('settings-content').textContent).toContain('Wi-Fi');
    expect(screen.getByTestId('settings-wifi-toggle')).toBeTruthy();
    fireEvent.click(screen.getByTestId('settings-pane-bluetooth'));
    expect(screen.getByTestId('settings-content').textContent).toContain('Bluetooth');
    expect(screen.getByTestId('settings-bluetooth-toggle')).toBeTruthy();
  });

  it('toggles the theme when appearance options are clicked', () => {
    renderSettings();
    const darkButton = screen.getByTestId('settings-appearance-dark');
    fireEvent.click(darkButton);
    expect(document.documentElement.dataset.theme).toBe('dark');
    const lightButton = screen.getByTestId('settings-appearance-light');
    fireEvent.click(lightButton);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('toggles Wi-Fi and shows the network list', () => {
    renderSettings();
    fireEvent.click(screen.getByTestId('settings-pane-wifi'));
    expect(screen.getByTestId('settings-wifi-Home-5G')).toBeTruthy();
    fireEvent.click(screen.getByTestId('settings-wifi-toggle'));
    expect(screen.queryByTestId('settings-wifi-Home-5G')).toBeFalsy();
  });
});
