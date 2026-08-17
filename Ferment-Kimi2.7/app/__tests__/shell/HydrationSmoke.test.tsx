import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, act } from '@testing-library/react';
import ReactDOMServer from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ShellProvider } from '@/app/lib/shellContext';
import Home from '@/app/page';

function mockMatchMedia() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function App() {
  return (
    <ThemeProvider>
      <ShellProvider>
        <Home />
      </ShellProvider>
    </ThemeProvider>
  );
}

describe('Hydration smoke', () => {
  beforeEach(() => {
    mockMatchMedia();
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('hydrates the Home page without console errors when server and client clocks differ', async () => {
    vi.useFakeTimers();
    const serverTime = new Date('2026-08-17T10:00:00.000Z');
    vi.setSystemTime(serverTime);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const html = ReactDOMServer.renderToString(<App />);

    const clientTime = new Date('2026-08-18T22:30:00.000Z');
    vi.setSystemTime(clientTime);

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;

    await act(async () => {
      hydrateRoot(container, <App />);
      vi.advanceTimersByTime(100);
    });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
    container.remove();
  });
});
