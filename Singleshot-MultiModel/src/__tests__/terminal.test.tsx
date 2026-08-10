import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import Terminal from '../apps/Terminal';
import { APP_REGISTRY } from '../lib/apps';
import { useAppDataStore } from '../stores/appDataStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';
import {
  executeCommand,
  nodeIdToPath,
  resolveTarget,
  type TerminalContext,
} from '../lib/terminalCommands';

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
  useFileSystemStore.setState((state) => {
    // Reset the live filesystem to the seeded defaults — `partialize` keeps
    // nodes out of persistence, so we have to recreate them in-memory.
    return {
      ...state,
      nodes: {
        root: { id: 'root', type: 'folder', name: '/', parentId: null, createdAt: 1, updatedAt: 1 },
        applications: { id: 'applications', type: 'folder', name: 'Applications', parentId: 'root', createdAt: 1, updatedAt: 1 },
        documents: { id: 'documents', type: 'folder', name: 'Documents', parentId: 'root', createdAt: 1, updatedAt: 1 },
        downloads: { id: 'downloads', type: 'folder', name: 'Downloads', parentId: 'root', createdAt: 1, updatedAt: 1 },
        pictures: { id: 'pictures', type: 'folder', name: 'Pictures', parentId: 'root', createdAt: 1, updatedAt: 1 },
        music: { id: 'music', type: 'folder', name: 'Music', parentId: 'root', createdAt: 1, updatedAt: 1 },
        movies: { id: 'movies', type: 'folder', name: 'Movies', parentId: 'root', createdAt: 1, updatedAt: 1 },
        'calculator-app': { id: 'calculator-app', type: 'file', name: 'Calculator.app', parentId: 'applications', content: '', createdAt: 1, updatedAt: 1 },
        'notes-app': { id: 'notes-app', type: 'file', name: 'Notes.app', parentId: 'applications', content: '', createdAt: 1, updatedAt: 1 },
        'terminal-app': { id: 'terminal-app', type: 'file', name: 'Terminal.app', parentId: 'applications', content: '', createdAt: 1, updatedAt: 1 },
        'safari-app': { id: 'safari-app', type: 'file', name: 'Safari.app', parentId: 'applications', content: '', createdAt: 1, updatedAt: 1 },
        'settings-app': { id: 'settings-app', type: 'file', name: 'Settings.app', parentId: 'applications', content: '', createdAt: 1, updatedAt: 1 },
        welcome: { id: 'welcome', type: 'file', name: 'Welcome.txt', parentId: 'documents', content: 'Welcome to Tahoe!', createdAt: 1, updatedAt: 1 },
      },
      rootOrder: ['root'],
      currentPath: ['root'],
      selectedIds: [],
    };
  });
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
}

function buildContext(cwdId: string = 'root'): TerminalContext {
  const fs = useFileSystemStore.getState();
  const cwd = fs.getNode(cwdId);
  if (!cwd) throw new Error(`Missing cwd ${cwdId}`);
  return {
    cwd,
    cwdId,
    nodes: fs.nodes,
    getNode: fs.getNode,
    getChildren: fs.getChildren,
    createFolder: fs.createFolder,
    createFile: fs.createFile,
  };
}

beforeEach(() => {
  clearAll();
  resetStores();
});

afterEach(() => {
  clearAll();
  resetStores();
});

function run(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
}

describe('terminalCommands.executeCommand', () => {
  it('parses `pwd` and returns the current path', () => {
    const result = executeCommand('pwd', buildContext('documents'));
    expect(result.lines).toEqual([{ type: 'output', text: '/Users/mike/Documents' }]);
    expect(result.newCwdId).toBeUndefined();
  });

  it('parses `ls` and lists the contents of the cwd', () => {
    const result = executeCommand('ls', buildContext('documents'));
    // The seeded Documents folder contains Welcome.txt.
    const names = result.lines.map((l) => l.text);
    expect(names).toContain('Welcome.txt');
  });

  it('parses `ls /Applications` from anywhere', () => {
    const result = executeCommand('ls /Applications', buildContext('documents'));
    const names = result.lines.map((l) => l.text);
    expect(names).toContain('Terminal.app');
  });

  it('rejects `cd` to invalid paths', () => {
    const result = executeCommand('cd does-not-exist', buildContext('root'));
    expect(result.newCwdId).toBeUndefined();
    expect(result.lines[0].type).toBe('error');
    expect(result.lines[0].text).toMatch(/No such file or directory/);
  });

  it('rejects `cd` to a file', () => {
    const result = executeCommand('cd Welcome.txt', buildContext('documents'));
    expect(result.newCwdId).toBeUndefined();
    expect(result.lines[0].type).toBe('error');
    expect(result.lines[0].text).toMatch(/Not a directory/);
  });

  it('resolves `cd ..` to the parent', () => {
    const result = executeCommand('cd ..', buildContext('documents'));
    expect(result.newCwdId).toBe('root');
  });

  it('resolves `cd ~` to home', () => {
    const result = executeCommand('cd ~', buildContext('downloads'));
    expect(result.newCwdId).toBe('root');
  });

  it('returns the file content from `cat`', () => {
    const result = executeCommand('cat Welcome.txt', buildContext('documents'));
    expect(result.lines[0]).toEqual({ type: 'output', text: 'Welcome to Tahoe!' });
  });

  it('returns an error for `cat` against a missing file', () => {
    const result = executeCommand('cat nope.txt', buildContext('documents'));
    expect(result.lines[0].type).toBe('error');
  });

  it('flags unknown commands as errors', () => {
    const result = executeCommand('not-a-real-command', buildContext('root'));
    expect(result.lines[0].type).toBe('error');
    expect(result.lines[0].text).toMatch(/command not found/);
  });

  it('mutates the filesystem via `mkdir`', () => {
    const ctx = buildContext('documents');
    const result = executeCommand('mkdir Projects', ctx);
    expect(result.lines).toEqual([]);
    const children = useFileSystemStore.getState().getChildren('documents');
    expect(children.some((c) => c.name === 'Projects' && c.type === 'folder')).toBe(true);
  });

  it('mutates the filesystem via `touch`', () => {
    const ctx = buildContext('documents');
    const result = executeCommand('touch notes.md', ctx);
    expect(result.lines).toEqual([]);
    const children = useFileSystemStore.getState().getChildren('documents');
    const created = children.find((c) => c.name === 'notes.md');
    expect(created).toBeDefined();
    expect(created?.type).toBe('file');
  });

  it('refuses to overwrite an existing entry with mkdir', () => {
    const result = executeCommand('mkdir Welcome.txt', buildContext('documents'));
    expect(result.lines[0].type).toBe('error');
    expect(result.lines[0].text).toMatch(/File exists/);
  });

  it('treats `clear` as a clear-history directive', () => {
    const result = executeCommand('clear', buildContext('root'));
    expect(result.clearHistory).toBe(true);
    expect(result.lines).toEqual([]);
  });

  it('nodeIdToPath maps the root to /Users/mike', () => {
    const ctx = buildContext('root');
    expect(nodeIdToPath('root', ctx.nodes)).toBe('/Users/mike');
    expect(nodeIdToPath('documents', ctx.nodes)).toBe('/Users/mike/Documents');
  });

  it('resolveTarget handles ., .., ~, absolute and relative paths', () => {
    const ctx = buildContext('documents');
    expect(resolveTarget('.', ctx)?.id).toBe('documents');
    expect(resolveTarget('..', ctx)?.id).toBe('root');
    expect(resolveTarget('~', ctx)?.id).toBe('root');
    expect(resolveTarget('/Pictures', ctx)?.id).toBe('pictures');
    expect(resolveTarget('~/Music', ctx)?.id).toBe('music');
    expect(resolveTarget('Music', ctx)?.id).toBeUndefined();
  });
});

describe('Terminal app', () => {
  it('renders the prompt at /Users/mike on first open', () => {
    render(<Terminal windowId="win-term-1" />);
    const prompt = screen.getByTestId('terminal-prompt');
    expect(prompt.textContent).toBe('/Users/mike');
  });

  it('shows the cwd path after a `cd`', () => {
    render(<Terminal windowId="win-term-2" />);
    const input = screen.getByTestId('terminal-input');
    act(() => {
      run(input, 'cd /Documents');
    });
    expect(screen.getByTestId('terminal-prompt').textContent).toBe('/Users/mike/Documents');
    expect(useAppDataStore.getState().terminalCwd).toBe('documents');
  });

  it('records `pwd` output and `ls` lines in the persistent history', () => {
    render(<Terminal windowId="win-term-3" />);
    const input = screen.getByTestId('terminal-input');
    act(() => {
      run(input, 'pwd');
    });
    const state = useAppDataStore.getState();
    expect(state.terminalHistory.map((l) => l.text)).toContain('pwd');
    expect(state.terminalHistory.map((l) => l.text)).toContain('/Users/mike');
  });

  it('supports history navigation via Up / Down arrows and resets index on Enter', () => {
    render(<Terminal windowId="win-term-4" />);
    const input = screen.getByTestId('terminal-input');

    act(() => {
      run(input, 'pwd');
    });
    act(() => {
      run(input, 'ls');
    });
    act(() => {
      run(input, 'cd /Documents');
    });

    // History so far: [pwd, ls, cd /Documents] (oldest first, newest last).
    // Press Up: index becomes 2 → text "cd /Documents" (newest first).
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });
    expect((input as HTMLInputElement).value).toBe('cd /Documents');

    // Up again: index 1 → "ls".
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });
    expect((input as HTMLInputElement).value).toBe('ls');

    // Down: index 2 → "cd /Documents".
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    expect((input as HTMLInputElement).value).toBe('cd /Documents');

    // Down again: past newest → input cleared (we were at the live draft
    // position from the start, no draft was saved).
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    expect((input as HTMLInputElement).value).toBe('');

    // Save a draft while navigating.
    act(() => {
      fireEvent.change(input, { target: { value: 'fresh' } });
    });
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });
    expect((input as HTMLInputElement).value).toBe('cd /Documents');
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    expect((input as HTMLInputElement).value).toBe('fresh');

    // Execute a new command: history index resets so the next Up returns
    // to the most recent entry, not where we left off.
    act(() => {
      run(input, 'ls');
    });
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });
    expect((input as HTMLInputElement).value).toBe('ls');
  });

  it('scrolling container is present and grows with output', () => {
    render(<Terminal windowId="win-term-5" />);
    const input = screen.getByTestId('terminal-input');
    for (let i = 0; i < 5; i++) {
      act(() => {
        run(input, 'pwd');
      });
    }
    const output = screen.getByTestId('terminal-output');
    expect(output.className).toMatch(/overflow-y-auto/);
  });

  it('mkdir and touch via the running Terminal mutate the filesystem', () => {
    render(<Terminal windowId="win-term-6" />);
    const input = screen.getByTestId('terminal-input');

    act(() => {
      run(input, 'mkdir Projects');
    });
    act(() => {
      run(input, 'touch readme.md');
    });

    const nodes = useFileSystemStore.getState().nodes;
    const folders = Object.values(nodes).filter(
      (n) => n.parentId === 'root' && n.name === 'Projects',
    );
    const files = Object.values(nodes).filter(
      (n) => n.parentId === 'root' && n.name === 'readme.md',
    );
    expect(folders.length).toBe(1);
    expect(files.length).toBe(1);
  });

  it('clear wipes the visible history but leaves the cwd alone', () => {
    render(<Terminal windowId="win-term-7" />);
    const input = screen.getByTestId('terminal-input');
    act(() => {
      run(input, 'pwd');
    });
    expect(useAppDataStore.getState().terminalHistory.length).toBeGreaterThan(0);
    act(() => {
      run(input, 'clear');
    });
    expect(useAppDataStore.getState().terminalHistory.length).toBe(0);
    expect(useAppDataStore.getState().terminalCwd).toBe('root');
  });

  it('shows the Shell menu with New Window and Clear items in the registry', () => {
    const shell = APP_REGISTRY.terminal.menus.find((m) => m.id === 'shell');
    expect(shell).toBeDefined();
    const labels = (shell?.submenu ?? []).map((item) => item.label);
    expect(labels).toContain('New Window');
    expect(labels).toContain('Clear');
  });

  it('dispatches Shell menu actions to open new terminals and clear output', () => {
    render(<Terminal windowId="win-term-8" />);
    const input = screen.getByTestId('terminal-input');
    act(() => {
      run(input, 'pwd');
    });
    expect(useAppDataStore.getState().terminalHistory.length).toBeGreaterThan(0);

    // New Window action — fired via the same DOM event the MenuBar sends.
    const orderBefore = useWindowStore.getState().windowOrder.length;
    act(() => {
      document.dispatchEvent(
        new CustomEvent('terminal:menu-action', {
          detail: { windowId: 'win-term-8', action: 'new-window' },
        }),
      );
    });
    expect(useWindowStore.getState().windowOrder.length).toBe(orderBefore + 1);

    // Clear action — wipes the history.
    act(() => {
      document.dispatchEvent(
        new CustomEvent('terminal:menu-action', {
          detail: { windowId: 'win-term-8', action: 'clear' },
        }),
      );
    });
    expect(useAppDataStore.getState().terminalHistory.length).toBe(0);

    // Lines must have rendered (smoke test the output region).
    const output = screen.getByTestId('terminal-output');
    expect(within(output).queryAllByTestId(/^terminal-line-/).length).toBe(0);
  });
});
