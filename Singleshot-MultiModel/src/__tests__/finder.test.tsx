import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import WindowManager from '../components/WindowManager';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';
import { useAppRegistry, APP_REGISTRY } from '../lib/apps';
import { buildInitialFileSystem } from '../lib/initialFs';

function resetFileSystemStore() {
  const initialNodes = buildInitialFileSystem();
  useFileSystemStore.setState({
    nodes: Object.fromEntries(initialNodes.map((n) => [n.id, n])),
    rootOrder: initialNodes.map((n) => n.id),
    currentPath: ['root'],
    selectedIds: [],
    viewMode: 'icon',
  });
}

beforeEach(() => {
  localStorage.clear();
  // Reset window store to a clean slate.
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
  // Reset filesystem to a freshly built seeded initial state. Rebuilding from
  // scratch avoids sharing a mutable nodes object across tests.
  resetFileSystemStore();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
  useAppRegistry.setState({ apps: APP_REGISTRY });
});

function openFinder(): string {
  let id = '';
  act(() => {
    id = useWindowStore.getState().openWindow('finder');
  });
  return id;
}

function renderFinder() {
  openFinder();
  return render(<WindowManager />);
}

describe('Finder', () => {
  it('renders current folder contents (root shows seeded folders)', () => {
    renderFinder();
    expect(screen.getByTestId('finder-root')).toBeInTheDocument();
    expect(screen.getByTestId('finder-main')).toBeInTheDocument();

    const applications = useFileSystemStore.getState().nodes['applications'];
    const documents = useFileSystemStore.getState().nodes['documents'];
    expect(screen.getByTestId(`finder-item-${applications.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`finder-item-${documents.id}`)).toBeInTheDocument();
    // Item should expose its node name and type for debugging / testing.
    const appItem = screen.getByTestId(`finder-item-${applications.id}`);
    expect(appItem.getAttribute('data-node-name')).toBe('Applications');
    expect(appItem.getAttribute('data-node-type')).toBe('folder');
  });

  it('double-clicking a folder navigates into it and updates the path', () => {
    renderFinder();
    const documents = useFileSystemStore.getState().nodes['documents'];
    const item = screen.getByTestId(`finder-item-${documents.id}`);

    act(() => {
      fireEvent.doubleClick(item);
    });

    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'documents']);
    // The seeded Welcome.txt should now be visible.
    const welcome = useFileSystemStore.getState().nodes['welcome'];
    expect(screen.getByTestId(`finder-item-${welcome.id}`)).toBeInTheDocument();
    // Window title should follow the current folder name.
    const id = useWindowStore.getState().windowOrder[0];
    expect(useWindowStore.getState().windows[id].title).toBe('Documents');
  });

  it('double-clicking a .app file launches that app', () => {
    renderFinder();
    // Navigate to Applications so .app files are visible.
    act(() => {
      useFileSystemStore.getState().navigateTo('applications');
    });
    const calcApp = useFileSystemStore.getState().nodes['calculator-app'];
    expect(calcApp).toBeDefined();
    const item = screen.getByTestId(`finder-item-${calcApp.id}`);

    const orderBefore = useWindowStore.getState().windowOrder.length;
    act(() => {
      fireEvent.doubleClick(item);
    });

    expect(useWindowStore.getState().windowOrder.length).toBe(orderBefore + 1);
    const latestId = useWindowStore.getState().windowOrder.at(-1)!;
    expect(useWindowStore.getState().windows[latestId].appId).toBe('calculator');
  });

  it('double-clicking a .txt file opens a read-only preview overlay', () => {
    renderFinder();
    act(() => {
      useFileSystemStore.getState().navigateTo('documents');
    });
    const welcome = useFileSystemStore.getState().nodes['welcome'];
    const item = screen.getByTestId(`finder-item-${welcome.id}`);
    act(() => {
      fireEvent.doubleClick(item);
    });
    const preview = screen.getByTestId('finder-preview');
    expect(preview).toBeInTheDocument();
    // Preview should contain the file content.
    expect(within(preview).getByText(/Welcome to Tahoe/i)).toBeInTheDocument();
  });

  it('toolbar "new folder" creates a node in the current folder', () => {
    renderFinder();
    const before = Object.values(useFileSystemStore.getState().nodes).filter(
      (n) => n.parentId === 'root',
    ).length;
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-folder'));
    });
    const afterNodes = Object.values(useFileSystemStore.getState().nodes).filter(
      (n) => n.parentId === 'root',
    );
    expect(afterNodes.length).toBe(before + 1);
    expect(afterNodes[afterNodes.length - 1].type).toBe('folder');
    expect(afterNodes[afterNodes.length - 1].name).toMatch(/untitled folder/);
  });

  it('toolbar "new file" creates a node in the current folder', () => {
    renderFinder();
    const before = Object.values(useFileSystemStore.getState().nodes).filter(
      (n) => n.parentId === 'root',
    ).length;
    act(() => {
      fireEvent.click(screen.getByTestId('finder-new-file'));
    });
    const afterNodes = Object.values(useFileSystemStore.getState().nodes).filter(
      (n) => n.parentId === 'root',
    );
    expect(afterNodes.length).toBe(before + 1);
    const created = afterNodes[afterNodes.length - 1];
    expect(created.type).toBe('file');
    expect(created.name).toMatch(/untitled(\s\d+)?\.txt/);
  });

  it('toolbar view toggle switches between icon and list view', () => {
    renderFinder();
    expect(screen.getByTestId('finder-icon-view')).toBeInTheDocument();
    expect(screen.queryByTestId('finder-list-view')).not.toBeInTheDocument();
    expect(useFileSystemStore.getState().viewMode).toBe('icon');

    act(() => {
      fireEvent.click(screen.getByTestId('finder-toggle-view'));
    });
    expect(useFileSystemStore.getState().viewMode).toBe('list');
    expect(screen.getByTestId('finder-list-view')).toBeInTheDocument();
    expect(screen.queryByTestId('finder-icon-view')).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('finder-toggle-view'));
    });
    expect(useFileSystemStore.getState().viewMode).toBe('icon');
  });

  it('sidebar click navigates to the corresponding folder', () => {
    renderFinder();
    act(() => {
      fireEvent.click(screen.getByTestId('finder-sidebar-pictures'));
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'pictures']);
  });

  it('back/forward buttons navigate through history', () => {
    renderFinder();
    const documents = useFileSystemStore.getState().nodes['documents'];

    act(() => {
      fireEvent.doubleClick(screen.getByTestId(`finder-item-${documents.id}`));
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'documents']);

    // Use the sidebar to jump to Pictures (a sibling of Documents).
    act(() => {
      fireEvent.click(screen.getByTestId('finder-sidebar-pictures'));
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'pictures']);

    // Back returns to documents.
    act(() => {
      fireEvent.click(screen.getByTestId('finder-back'));
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'documents']);

    // Forward returns to pictures.
    act(() => {
      fireEvent.click(screen.getByTestId('finder-forward'));
    });
    expect(useFileSystemStore.getState().currentPath).toEqual(['root', 'pictures']);
  });

  it('right-click context menu offers Open / Rename / Delete on items', () => {
    renderFinder();
    const documents = useFileSystemStore.getState().nodes['documents'];
    const item = screen.getByTestId(`finder-item-${documents.id}`);
    act(() => {
      fireEvent.contextMenu(item, { clientX: 50, clientY: 80 });
    });
    const menu = screen.getByTestId('context-menu');
    expect(menu).toBeInTheDocument();
    expect(within(menu).getByText('Open')).toBeInTheDocument();
    expect(within(menu).getByText('Rename')).toBeInTheDocument();
    expect(within(menu).getByText('Delete')).toBeInTheDocument();
  });

  it('right-click context menu offers New Folder / New File on empty space', () => {
    renderFinder();
    const main = screen.getByTestId('finder-main');
    act(() => {
      fireEvent.contextMenu(main, { clientX: 200, clientY: 200 });
    });
    const menu = screen.getByTestId('context-menu');
    expect(within(menu).getByText('New Folder')).toBeInTheDocument();
    expect(within(menu).getByText('New File')).toBeInTheDocument();
  });

  it('context menu Delete removes the selected item', () => {
    renderFinder();
    const documents = useFileSystemStore.getState().nodes['documents'];
    const item = screen.getByTestId(`finder-item-${documents.id}`);
    act(() => {
      fireEvent.contextMenu(item, { clientX: 50, clientY: 80 });
    });
    const menu = screen.getByTestId('context-menu');
    act(() => {
      fireEvent.click(within(menu).getByText('Delete'));
    });
    expect(useFileSystemStore.getState().nodes['documents']).toBeUndefined();
  });

  it('context menu New Folder on empty space creates a folder in the current folder', () => {
    renderFinder();
    const main = screen.getByTestId('finder-main');
    const before = Object.values(useFileSystemStore.getState().nodes).filter(
      (n) => n.parentId === 'root',
    ).length;
    act(() => {
      fireEvent.contextMenu(main, { clientX: 200, clientY: 200 });
    });
    const menu = screen.getByTestId('context-menu');
    act(() => {
      fireEvent.click(within(menu).getByText('New Folder'));
    });
    const after = Object.values(useFileSystemStore.getState().nodes).filter(
      (n) => n.parentId === 'root',
    );
    expect(after.length).toBe(before + 1);
  });

  it('Finder contributes File / Edit / View / Go menus in the registry', () => {
    const finderDef = APP_REGISTRY.finder;
    const ids = finderDef.menus.map((m) => m.id);
    expect(ids).toContain('file');
    expect(ids).toContain('edit');
    expect(ids).toContain('view');
    expect(ids).toContain('go');
  });

  it('Finder opens at the root path by default', () => {
    openFinder();
    render(<WindowManager />);
    expect(useFileSystemStore.getState().currentPath).toEqual(['root']);
  });
});
