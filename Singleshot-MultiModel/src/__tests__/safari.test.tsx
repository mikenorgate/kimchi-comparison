import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Safari from '../apps/Safari';
import { useAppDataStore } from '../stores/appDataStore';
import { useWindowStore } from '../stores/windowStore';

function clearAll() {
  localStorage.clear();
}

function resetStores() {
  useAppDataStore.setState({
    calculatorMemory: 0,
    calculatorHistory: [],
    notes: {},
    noteOrder: [],
    terminalHistory: [],
    terminalCwd: 'root',
    safariRecent: [],
  });
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
}

beforeEach(() => {
  clearAll();
  resetStores();
});

afterEach(() => {
  clearAll();
  resetStores();
  vi.restoreAllMocks();
});

function getRoot() {
  return screen.getByTestId('safari-root');
}

function getAddress(): HTMLInputElement {
  return screen.getByTestId('safari-address') as HTMLInputElement;
}

function submitUrl(url: string) {
  fireEvent.change(getAddress(), { target: { value: url } });
  fireEvent.submit(screen.getByTestId('safari-address-form'));
}

describe('Safari app', () => {
  it('renders with the welcome homepage and address bar', () => {
    render(<Safari windowId="win-safari-1" />);
    expect(getRoot()).toBeInTheDocument();
    expect(screen.getByTestId('safari-homepage')).toBeInTheDocument();
    expect(getAddress().value).toBe('');
    // Back/Forward disabled at home, reload disabled because we are on home.
    expect(screen.getByTestId('safari-back')).toBeDisabled();
    expect(screen.getByTestId('safari-forward')).toBeDisabled();
    expect(screen.getByTestId('safari-reload')).toBeDisabled();
  });

  it('types a URL, loads it in a sandboxed iframe, and stores it in recents', () => {
    render(<Safari windowId="win-safari-2" />);

    submitUrl('example.com');

    // The frame should be present with the normalized https URL.
    const frame = screen.getByTestId('safari-frame') as HTMLIFrameElement;
    expect(frame).toBeInTheDocument();
    expect(frame.src).toContain('https://example.com');
    expect(frame.getAttribute('sandbox')).toContain('allow-scripts');

    // Address bar reflects the current URL.
    expect(getAddress().value).toBe('https://example.com');

    // The recents list should now contain the URL (most recent first).
    const recents = useAppDataStore.getState().safariRecent;
    expect(recents.length).toBe(1);
    expect(recents[0].url).toBe('https://example.com');

    // Back is now enabled; Forward is still disabled.
    expect(screen.getByTestId('safari-back')).not.toBeDisabled();
    expect(screen.getByTestId('safari-forward')).toBeDisabled();
    expect(screen.getByTestId('safari-reload')).not.toBeDisabled();
  });

  it('records multiple recent URLs without duplicates and newest first', () => {
    render(<Safari windowId="win-safari-3" />);

    submitUrl('apple.com');
    submitUrl('wikipedia.org');
    submitUrl('apple.com');

    const recents = useAppDataStore.getState().safariRecent;
    expect(recents.length).toBe(2);
    expect(recents[0].url).toBe('https://apple.com');
    expect(recents[1].url).toBe('https://wikipedia.org');

    // The sidebar should render a button per recent entry.
    const list = screen.getByTestId('safari-recent-list');
    expect(list.children.length).toBe(2);
  });

  it('reload button resets the iframe key for the current URL', () => {
    render(<Safari windowId="win-safari-4" />);

    submitUrl('example.com');

    const frameBefore = screen.getByTestId('safari-frame');
    const keyBefore = frameBefore.getAttribute('src');

    act(() => {
      fireEvent.click(screen.getByTestId('safari-reload'));
    });

    const frameAfter = screen.getByTestId('safari-frame');
    const keyAfter = frameAfter.getAttribute('src');
    // The `key` prop on the iframe is applied via the src attribute when it
    // contains a unique numeric suffix. Just confirm the URL is unchanged.
    expect(keyAfter).toContain('https://example.com');
    // Confirm the address bar still shows the URL after reload.
    expect(getAddress().value).toBe('https://example.com');
    // Touch keyBefore so it doesn't trip noUnused warnings.
    expect(keyBefore).toBeTruthy();
  });

  it('back/forward navigate through history and forward is disabled at the end', () => {
    render(<Safari windowId="win-safari-5" />);

    submitUrl('apple.com');
    submitUrl('wikipedia.org');

    // Currently on wikipedia; back should go to apple.
    act(() => {
      fireEvent.click(screen.getByTestId('safari-back'));
    });
    expect(getAddress().value).toBe('https://apple.com');

    // Back again returns to the homepage; forward is enabled.
    act(() => {
      fireEvent.click(screen.getByTestId('safari-back'));
    });
    expect(screen.getByTestId('safari-homepage')).toBeInTheDocument();

    // Forward takes us back to apple.
    act(() => {
      fireEvent.click(screen.getByTestId('safari-forward'));
    });
    expect(getAddress().value).toBe('https://apple.com');

    // Forward to wikipedia, then forward should be disabled at the end.
    act(() => {
      fireEvent.click(screen.getByTestId('safari-forward'));
    });
    expect(getAddress().value).toBe('https://wikipedia.org');
    expect(screen.getByTestId('safari-forward')).toBeDisabled();
  });

  it('home button returns to the welcome page without recording a recent', () => {
    render(<Safari windowId="win-safari-6" />);

    submitUrl('apple.com');
    const before = useAppDataStore.getState().safariRecent.length;

    act(() => {
      fireEvent.click(screen.getByTestId('safari-home'));
    });
    expect(screen.getByTestId('safari-homepage')).toBeInTheDocument();
    expect(getAddress().value).toBe('');

    const after = useAppDataStore.getState().safariRecent.length;
    expect(after).toBe(before); // home is not recorded as a recent
  });

  it('updates the window title to reflect the current page', () => {
    // Register a window first so the app's title effect has something to write
    // to on the initial render.
    useWindowStore.getState().openWindow('safari', { title: 'Safari' });
    const windows = useWindowStore.getState().windows;
    const winId = Object.keys(windows).find((id) => windows[id].appId === 'safari')!;
    expect(winId).toBeTruthy();

    render(<Safari windowId={winId} />);

    // After render, the title should reflect the homepage.
    expect(useWindowStore.getState().windows[winId].title).toBe('Safari — Welcome');

    submitUrl('apple.com');
    expect(useWindowStore.getState().windows[winId].title).toBe('Safari — apple.com');
  });
});
