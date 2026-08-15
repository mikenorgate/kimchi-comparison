import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useState } from 'react';
import { WindowProvider, useWindows } from './WindowContext';

function TestHarness() {
  const {
    windows,
    activeId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
  } = useWindows();
  const [lastAction, setLastAction] = useState('');

  return (
    <div>
      <div data-testid="count">{windows.length}</div>
      <div data-testid="active">{activeId || 'none'}</div>
      <div data-testid="lastAction">{lastAction}</div>
      {windows.map((w) => (
        <div key={w.id} data-testid={`win-${w.appId}`}>
          <span data-testid={`z-${w.appId}`}>{w.zIndex}</span>
          <span data-testid={`min-${w.appId}`}>{w.minimized ? 'min' : 'vis'}</span>
          <span data-testid={`max-${w.appId}`}>{w.maximized ? 'max' : 'norm'}</span>
        </div>
      ))}
      <button onClick={() => { openWindow('finder'); setLastAction('open'); }}>Open Finder</button>
      <button onClick={() => { openWindow('safari'); setLastAction('open safari'); }}>Open Safari</button>
      <button onClick={() => { openWindow('finder'); setLastAction('reopen finder'); }}>Reopen Finder</button>
      <button onClick={() => { const id = windows[0]?.id; if (id) { focusWindow(id); setLastAction('focus'); } }}>Focus First</button>
      <button onClick={() => { const id = windows.find((w) => w.appId === 'finder')?.id; if (id) { focusWindow(id); setLastAction('focus finder'); } }}>Focus Finder</button>
      <button onClick={() => { const id = windows[0]?.id; if (id) { minimizeWindow(id); setLastAction('minimize'); } }}>Minimize First</button>
      <button onClick={() => { const id = windows[0]?.id; if (id) { maximizeWindow(id); setLastAction('maximize'); } }}>Maximize First</button>
      <button onClick={() => { const id = windows.find((w) => w.maximized)?.id; if (id) { restoreWindow(id); setLastAction('restore'); } }}>Restore Maximized</button>
      <button onClick={() => { const id = windows[0]?.id; if (id) { closeWindow(id); setLastAction('close'); } }}>Close First</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <WindowProvider>
      <TestHarness />
    </WindowProvider>
  );
}

describe('WindowContext', () => {
  it('opens a new window and makes it active', () => {
    renderProvider();
    act(() => {
      screen.getByText('Open Finder').click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('active')).not.toHaveTextContent('none');
  });

  it('opens multiple windows with increasing z-index', () => {
    renderProvider();
    act(() => screen.getByText('Open Finder').click());
    act(() => screen.getByText('Open Safari').click());
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    const z1 = screen.getByTestId('z-finder').textContent;
    const z2 = screen.getByTestId('z-safari').textContent;
    expect(Number(z2)).toBeGreaterThan(Number(z1));
  });

  it('focuses a window and raises its z-index', () => {
    renderProvider();
    act(() => screen.getByText('Open Finder').click());
    act(() => screen.getByText('Open Safari').click());
    const zFinderBefore = Number(screen.getByTestId('z-finder').textContent);
    act(() => screen.getByText('Focus Finder').click());
    const zFinderAfter = Number(screen.getByTestId('z-finder').textContent);
    expect(zFinderAfter).toBeGreaterThan(zFinderBefore);
    expect(screen.getByTestId('active')).not.toHaveTextContent('none');
  });

  it('reopening an already-open app focuses the existing window and does not create a second one', () => {
    renderProvider();
    act(() => screen.getByText('Open Finder').click());
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    act(() => screen.getByText('Reopen Finder').click());
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('active')).not.toHaveTextContent('none');
  });

  it('minimizes a window', () => {
    renderProvider();
    act(() => screen.getByText('Open Finder').click());
    act(() => screen.getByText('Minimize First').click());
    expect(screen.getByTestId('min-finder')).toHaveTextContent('min');
  });

  it('maximizes and restores a window', () => {
    renderProvider();
    act(() => screen.getByText('Open Finder').click());
    act(() => screen.getByText('Maximize First').click());
    expect(screen.getByTestId('max-finder')).toHaveTextContent('max');
    act(() => screen.getByText('Restore Maximized').click());
    expect(screen.getByTestId('max-finder')).toHaveTextContent('norm');
  });

  it('closes a window', () => {
    renderProvider();
    act(() => screen.getByText('Open Finder').click());
    act(() => screen.getByText('Close First').click());
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
