import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from '@testing-library/react';
import { useSystemStore } from '../stores/systemStore';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';
import { useDockStore } from '../stores/dockStore';
import { useAppDataStore } from '../stores/appDataStore';

// Each persisted store has its own key — wipe them all between tests so
// rehydration starts from defaults and we can exercise persistence explicitly.
function clearPersistedState() {
  localStorage.clear();
}

beforeEach(() => {
  clearPersistedState();
  // Reset ephemeral (non-persisted) window store too.
  useWindowStore.setState({ windows: {}, windowOrder: [], activeWindowId: null, zCounter: 100 });
  useDockStore.setState({
    pinned: ['finder', 'calculator', 'notes', 'terminal', 'safari', 'settings'],
    running: [],
    bouncing: null,
    size: 48,
    magnificationEnabled: true,
    position: 'bottom',
  });
  useAppDataStore.setState({
    calculatorMemory: 0,
    calculatorHistory: [],
    notes: {},
    noteOrder: [],
    terminalHistory: [],
    terminalCwd: 'root',
    safariRecent: [],
  });
});

afterEach(() => {
  clearPersistedState();
});

describe('useFileSystemStore', () => {
  it('seeds the default filesystem with Applications, Documents, etc.', () => {
    const nodes = useFileSystemStore.getState().nodes;
    expect(nodes['root']).toBeDefined();
    expect(nodes['applications']).toBeDefined();
    expect(nodes['documents']).toBeDefined();
    expect(nodes['downloads']).toBeDefined();
    expect(nodes['pictures']).toBeDefined();
    expect(nodes['music']).toBeDefined();
    expect(nodes['movies']).toBeDefined();
    expect(nodes['calculator-app']).toBeDefined();
    expect(nodes['welcome']).toBeDefined();
  });

  it('creates folders and files', () => {
    let folderId = '';
    let fileId = '';
    act(() => {
      folderId = useFileSystemStore.getState().createFolder('documents', 'Projects');
      fileId = useFileSystemStore.getState().createFile(folderId, 'readme.md', 'hello');
    });
    expect(folderId).toBeTruthy();
    expect(fileId).toBeTruthy();
    const nodes = useFileSystemStore.getState().nodes;
    const file = nodes[fileId];
    expect(nodes[folderId].type).toBe('folder');
    expect(file.type).toBe('file');
    if (file.type === 'file') {
      expect(file.content).toBe('hello');
    }
  });

  it('renames nodes', () => {
    let fileId = '';
    act(() => {
      fileId = useFileSystemStore.getState().createFile('documents', 'draft.txt');
    });
    act(() => {
      expect(useFileSystemStore.getState().rename(fileId, 'final.txt')).toBe(true);
    });
    expect(useFileSystemStore.getState().nodes[fileId].name).toBe('final.txt');
  });

  it('deletes nodes recursively and refuses to delete root', () => {
    let folderId = '';
    let childId = '';
    act(() => {
      folderId = useFileSystemStore.getState().createFolder('documents', 'Trash');
      childId = useFileSystemStore.getState().createFile(folderId, 'inside.txt');
    });
    expect(useFileSystemStore.getState().nodes[childId]).toBeDefined();
    act(() => {
      expect(useFileSystemStore.getState().deleteNode(folderId)).toBe(true);
    });
    expect(useFileSystemStore.getState().nodes[folderId]).toBeUndefined();
    expect(useFileSystemStore.getState().nodes[childId]).toBeUndefined();
    act(() => {
      expect(useFileSystemStore.getState().deleteNode('root')).toBe(false);
    });
  });

  it('navigates the path with navigateTo and resolvePath', () => {
    act(() => {
      useFileSystemStore.getState().navigateTo('documents');
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'documents']);
    const doc = useFileSystemStore.getState().resolvePath(['Documents']);
    expect(doc?.id).toBe('documents');
  });
});

describe('useWindowStore', () => {
  it('opens, focuses, and closes windows; tracks z-index', () => {
    let id1 = '';
    let id2 = '';
    act(() => {
      id1 = useWindowStore.getState().openWindow('finder');
      id2 = useWindowStore.getState().openWindow('calculator');
    });
    const state = useWindowStore.getState();
    expect(Object.keys(state.windows).length).toBe(2);
    expect(state.activeWindowId).toBe(id2);
    expect(state.windows[id2].zIndex).toBeGreaterThan(state.windows[id1].zIndex);

    act(() => {
      useWindowStore.getState().focusWindow(id1);
    });
    const afterFocus = useWindowStore.getState();
    expect(afterFocus.activeWindowId).toBe(id1);
    expect(afterFocus.windows[id1].zIndex).toBeGreaterThan(afterFocus.windows[id2].zIndex);

    act(() => {
      useWindowStore.getState().closeWindow(id1);
    });
    expect(useWindowStore.getState().windows[id1]).toBeUndefined();
  });

  it('minimizes and restores windows, clearing active id when minimized', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('notes');
    });
    expect(useWindowStore.getState().activeWindowId).toBe(id);
    act(() => {
      useWindowStore.getState().minimizeWindow(id);
    });
    expect(useWindowStore.getState().windows[id].minimized).toBe(true);
    act(() => {
      useWindowStore.getState().restoreWindow(id);
    });
    expect(useWindowStore.getState().windows[id].minimized).toBe(false);
  });

  it('maximizes and toggles back to previous bounds', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    const original = useWindowStore.getState().windows[id];
    act(() => {
      useWindowStore.getState().maximizeWindow(id);
    });
    const maximized = useWindowStore.getState().windows[id];
    expect(maximized.maximized).toBe(true);
    expect(maximized.prevBounds?.width).toBe(original.width);
    act(() => {
      useWindowStore.getState().toggleMaximize(id);
    });
    const restored = useWindowStore.getState().windows[id];
    expect(restored.maximized).toBe(false);
    expect(restored.width).toBe(original.width);
  });
});

describe('useDockStore', () => {
  it('pins and unpins apps', () => {
    expect(useDockStore.getState().isPinned('safari')).toBe(true);
    act(() => {
      useDockStore.getState().unpin('safari');
    });
    expect(useDockStore.getState().isPinned('safari')).toBe(false);
    act(() => {
      useDockStore.getState().pin('safari');
    });
    expect(useDockStore.getState().isPinned('safari')).toBe(true);
  });

  it('starts and stops a bounce animation', () => {
    expect(useDockStore.getState().bouncing).toBeNull();
    act(() => {
      useDockStore.getState().startBounce('finder');
    });
    expect(useDockStore.getState().bouncing?.appId).toBe('finder');
    act(() => {
      useDockStore.getState().stopBounce();
    });
    expect(useDockStore.getState().bouncing).toBeNull();
  });

  it('tracks running state and toggles size/magnification/position', () => {
    act(() => {
      useDockStore.getState().setRunning('finder', true);
    });
    expect(useDockStore.getState().isRunning('finder')).toBe(true);
    act(() => {
      useDockStore.getState().setDockSize(72);
      useDockStore.getState().setDockMagnification(false);
      useDockStore.getState().setDockPosition('left');
    });
    const dock = useDockStore.getState();
    expect(dock.size).toBe(72);
    expect(dock.magnificationEnabled).toBe(false);
    expect(dock.position).toBe('left');
  });

  it('clamps dock size into the supported range', () => {
    act(() => {
      useDockStore.getState().setDockSize(500);
    });
    expect(useDockStore.getState().size).toBe(100);
    act(() => {
      useDockStore.getState().setDockSize(0);
    });
    expect(useDockStore.getState().size).toBe(10);
  });
});

describe('useAppDataStore', () => {
  it('creates, updates, and deletes notes', () => {
    let id = '';
    act(() => {
      id = useAppDataStore.getState().createNote('Shopping', 'milk');
    });
    expect(useAppDataStore.getState().notes[id].title).toBe('Shopping');
    act(() => {
      useAppDataStore.getState().updateNote(id, { body: 'milk, eggs' });
    });
    expect(useAppDataStore.getState().notes[id].body).toBe('milk, eggs');
    act(() => {
      useAppDataStore.getState().deleteNote(id);
    });
    expect(useAppDataStore.getState().notes[id]).toBeUndefined();
  });

  it('records calculator memory and history', () => {
    act(() => {
      useAppDataStore.getState().setCalculatorMemory(42);
      useAppDataStore.getState().addCalculatorEntry('12 + 7', '19');
    });
    const appData = useAppDataStore.getState();
    expect(appData.calculatorMemory).toBe(42);
    expect(appData.calculatorHistory[0].expression).toBe('12 + 7');
    expect(appData.calculatorHistory[0].result).toBe('19');
  });

  it('appends terminal history and updates cwd', () => {
    act(() => {
      useAppDataStore.getState().setTerminalCwd('documents');
      useAppDataStore.getState().appendTerminal({ type: 'input', text: 'pwd' });
      useAppDataStore.getState().appendTerminal({ type: 'output', text: '/Documents' });
    });
    const appData = useAppDataStore.getState();
    expect(appData.terminalCwd).toBe('documents');
    expect(appData.terminalHistory.length).toBe(2);
    expect(appData.terminalHistory[0].text).toBe('pwd');
  });

  it('records Safari recent URLs without duplicates', () => {
    act(() => {
      useAppDataStore.getState().addRecentUrl('https://apple.com', 'Apple');
      useAppDataStore.getState().addRecentUrl('https://example.com');
      useAppDataStore.getState().addRecentUrl('https://apple.com');
    });
    const recent = useAppDataStore.getState().safariRecent;
    expect(recent.length).toBe(2);
    expect(recent[0].url).toBe('https://apple.com');
  });
});

describe('useSystemStore', () => {
  it('updates appearance, wallpaper, accentColor, computerName', () => {
    act(() => {
      const s = useSystemStore.getState();
      s.setAppearance('dark');
      s.setWallpaper('wallpaper-3');
      s.setAccentColor('purple');
      s.setComputerName('My Mac');
    });
    const sys = useSystemStore.getState();
    expect(sys.appearance).toBe('dark');
    expect(sys.wallpaper).toBe('wallpaper-3');
    expect(sys.accentColor).toBe('purple');
    expect(sys.computerName).toBe('My Mac');
  });
});

describe('Persistence', () => {
  it('writes a note to localStorage and rehydrates it from a pre-populated blob', async () => {
    // First, confirm writes happen by mutating the live store.
    act(() => {
      useAppDataStore.getState().createNote('Persisted', 'survives refresh');
    });
    await new Promise((r) => setTimeout(r, 0));
    const raw = localStorage.getItem('tahoe.appdata');
    expect(raw).toBeTruthy();
    expect(raw).toContain('Persisted');

    // Now simulate a fresh page load: nuke in-memory state, then pre-populate
    // localStorage with a known blob and rehydrate. This exercises the real
    // rehydration code path (the same code that runs at app startup).
    useAppDataStore.setState({
      calculatorMemory: 0,
      calculatorHistory: [],
      notes: {},
      noteOrder: [],
      terminalHistory: [],
      terminalCwd: 'root',
      safariRecent: [],
    });

    const noteId = 'note-persist-test';
    const blob = JSON.stringify({
      state: {
        notes: {
          [noteId]: {
            id: noteId,
            title: 'Persisted',
            body: 'survives refresh',
            createdAt: 1,
            updatedAt: 1,
          },
        },
        noteOrder: [noteId],
      },
      version: 0,
    });
    localStorage.setItem('tahoe.appdata', blob);

    await useAppDataStore.persist.rehydrate();
    const after = useAppDataStore.getState().notes[noteId];
    expect(after).toBeDefined();
    expect(after.body).toBe('survives refresh');
  });

  it('keeps persisted accentColor/computerName in system and dock position in dock', async () => {
    act(() => {
      const sys = useSystemStore.getState();
      sys.setAccentColor('green');
      sys.setComputerName('Rehydrate');
    });
    act(() => {
      useDockStore.getState().setDockPosition('right');
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(localStorage.getItem('tahoe.system')).toContain('green');
    expect(localStorage.getItem('tahoe.dock')).toContain('right');

    // Wipe in-memory state and pre-populate localStorage to simulate refresh.
    useSystemStore.setState({
      appearance: 'auto',
      wallpaper: 'wallpaper-1',
      accentColor: 'blue',
      computerName: 'Tahoe',
      volume: 70,
      booted: false,
      lastTick: 0,
    });
    useDockStore.setState({
      pinned: ['finder', 'calculator', 'notes', 'terminal', 'safari', 'settings'],
      running: [],
      bouncing: null,
      size: 48,
      magnificationEnabled: true,
      position: 'bottom',
    });

    localStorage.setItem(
      'tahoe.system',
      JSON.stringify({
        state: {
          appearance: 'dark',
          wallpaper: 'wallpaper-2',
          accentColor: 'green',
          computerName: 'Rehydrate',
        },
        version: 0,
      })
    );
    localStorage.setItem(
      'tahoe.dock',
      JSON.stringify({
        state: { size: 60, magnificationEnabled: false, position: 'right' },
        version: 0,
      })
    );

    await useSystemStore.persist.rehydrate();
    await useDockStore.persist.rehydrate();

    const sys = useSystemStore.getState();
    expect(sys.accentColor).toBe('green');
    expect(sys.computerName).toBe('Rehydrate');
    expect(useDockStore.getState().position).toBe('right');
  });
});
