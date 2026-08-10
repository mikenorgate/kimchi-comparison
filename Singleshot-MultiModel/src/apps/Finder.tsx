import { useCallback, useEffect, useRef, useState } from 'react';
import { useFileSystemStore } from '../stores/fileSystemStore';
import { useWindowStore } from '../stores/windowStore';
import type { FsNode } from '../types';
import FinderToolbar from './FinderToolbar';
import FinderSidebar from './FinderSidebar';
import FinderIconView from './FinderIconView';
import FinderListView from './FinderListView';
import FinderContextMenu from './FinderContextMenu';

interface FinderProps {
  windowId: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  /** When set, the menu acts on this node; when null, it acts on empty space. */
  targetId: string | null;
}

const HOME_ID = 'root';

/**
 * Map a `.app` file name (e.g. "Calculator.app") to its app registry id
 * (e.g. "calculator"). Unknown app names yield undefined.
 */
export function appFileToAppId(name: string): string | undefined {
  const m = name.match(/^(.+)\.app$/i);
  if (!m) return undefined;
  const base = m[1].trim().toLowerCase();
  if (base === 'system settings') return 'settings';
  return base.replace(/\s+/g, '');
}

export default function Finder({ windowId }: FinderProps) {
  const nodes = useFileSystemStore((s) => s.nodes);
  const currentPath = useFileSystemStore((s) => s.currentPath);
  const selectedIds = useFileSystemStore((s) => s.selectedIds);
  const viewMode = useFileSystemStore((s) => s.viewMode);
  const setViewMode = useFileSystemStore((s) => s.setViewMode);
  const setSelection = useFileSystemStore((s) => s.setSelection);
  const navigateTo = useFileSystemStore((s) => s.navigateTo);
  const createFolder = useFileSystemStore((s) => s.createFolder);
  const createFile = useFileSystemStore((s) => s.createFile);
  const renameNode = useFileSystemStore((s) => s.rename);
  const deleteNode = useFileSystemStore((s) => s.deleteNode);
  const getChildren = useFileSystemStore((s) => s.getChildren);

  const setTitle = useWindowStore((s) => s.setTitle);
  const openWindow = useWindowStore((s) => s.openWindow);

  // History stacks for back/forward navigation. We track only folder ids so
  // we can re-navigate via the store on demand.
  const backStack = useRef<string[]>([]);
  const forwardStack = useRef<string[]>([]);
  const [, setHistoryTick] = useState(0);
  const refreshHistory = useCallback(() => setHistoryTick((t) => t + 1), []);

  const currentFolderId = currentPath[currentPath.length - 1] ?? HOME_ID;
  const currentFolder = nodes[currentFolderId];
  const children = currentFolder ? getChildren(currentFolder.id) : [];

  // Update window title when the current folder changes.
  useEffect(() => {
    if (!currentFolder) return;
    setTitle(windowId, currentFolder.name || '/');
  }, [currentFolder, windowId, setTitle]);

  const recordNavigation = useCallback(
    (nextId: string) => {
      if (!currentFolderId || currentFolderId === nextId) return;
      backStack.current.push(currentFolderId);
      forwardStack.current = [];
      refreshHistory();
    },
    [currentFolderId, refreshHistory],
  );

  const goBack = useCallback(() => {
    const prev = backStack.current.pop();
    if (!prev) return;
    if (currentFolderId) forwardStack.current.push(currentFolderId);
    navigateTo(prev);
    refreshHistory();
  }, [currentFolderId, navigateTo, refreshHistory]);

  const goForward = useCallback(() => {
    const next = forwardStack.current.pop();
    if (!next) return;
    if (currentFolderId) backStack.current.push(currentFolderId);
    navigateTo(next);
    refreshHistory();
  }, [currentFolderId, navigateTo, refreshHistory]);

  const goUp = useCallback(() => {
    if (currentPath.length <= 1) return;
    const parentId = currentPath[currentPath.length - 2];
    if (!parentId) return;
    recordNavigation(parentId);
    navigateTo(parentId);
  }, [currentPath, navigateTo, recordNavigation]);

  const navigateToId = useCallback(
    (id: string) => {
      recordNavigation(id);
      navigateTo(id);
    },
    [navigateTo, recordNavigation],
  );

  const handleNewFolder = useCallback(() => {
    if (!currentFolder) return;
    const baseName = 'untitled folder';
    let name = baseName;
    let n = 1;
    while (
      Object.values(nodes).some(
        (node) => node.parentId === currentFolder.id && node.name === name,
      )
    ) {
      n += 1;
      name = `${baseName} ${n}`;
    }
    createFolder(currentFolder.id, name);
  }, [createFolder, currentFolder, nodes]);

  const handleNewFile = useCallback(() => {
    if (!currentFolder) return;
    const baseName = 'untitled';
    let name = `${baseName}.txt`;
    let n = 1;
    while (
      Object.values(nodes).some(
        (node) => node.parentId === currentFolder.id && node.name === name,
      )
    ) {
      n += 1;
      name = `${baseName} ${n}.txt`;
    }
    createFile(currentFolder.id, name, '');
  }, [createFile, currentFolder, nodes]);

  const openItem = useCallback(
    (node: FsNode) => {
      if (node.type === 'folder') {
        navigateToId(node.id);
        return;
      }
      if (node.name.toLowerCase().endsWith('.app')) {
        const appId = appFileToAppId(node.name);
        if (appId) {
          openWindow(appId);
          return;
        }
      }
      // Plain file (txt or other) — show a read-only preview.
      setPreview(node);
    },
    [navigateToId, openWindow],
  );

  const [preview, setPreview] = useState<FsNode | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const trimmed = renameDraft.trim();
    if (trimmed) renameNode(renamingId, trimmed);
    setRenamingId(null);
    setRenameDraft('');
  }, [renameDraft, renameNode, renamingId]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameDraft('');
  }, []);

  const handleSurfaceContextMenu = useCallback(
    (event: React.MouseEvent, targetId: string | null) => {
      event.preventDefault();
      event.stopPropagation();
      if (targetId) setSelection([targetId]);
      setContextMenu({ x: event.clientX, y: event.clientY, targetId });
    },
    [setSelection],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const contextMenuItems = (() => {
    if (!contextMenu) return [];
    if (!contextMenu.targetId) {
      return [
        {
          id: 'new-folder',
          label: 'New Folder',
          action: () => {
            handleNewFolder();
          },
        },
        {
          id: 'new-file',
          label: 'New File',
          action: () => {
            handleNewFile();
          },
        },
        { id: 'sep-1', separator: true },
        {
          id: 'view-icon',
          label: 'View as Icons',
          action: () => setViewMode('icon'),
          disabled: viewMode === 'icon',
        },
        {
          id: 'view-list',
          label: 'View as List',
          action: () => setViewMode('list'),
          disabled: viewMode === 'list',
        },
      ];
    }
    const node = nodes[contextMenu.targetId];
    return [
      {
        id: 'open',
        label: 'Open',
        disabled: !node,
        action: () => {
          if (node) openItem(node);
        },
      },
      {
        id: 'rename',
        label: 'Rename',
        disabled: !node,
        action: () => {
          if (!node) return;
          setRenamingId(node.id);
          setRenameDraft(node.name);
        },
      },
      { id: 'sep-2', separator: true },
      {
        id: 'delete',
        label: 'Delete',
        disabled: !node,
        action: () => {
          if (!node) return;
          deleteNode(node.id);
        },
      },
    ];
  })();

  const handleItemActivate = useCallback(
    (event: React.MouseEvent, node: FsNode) => {
      // Use event type rather than event.detail because jsdom/React Testing
      // Library do not reliably populate detail >= 2 for synthetic dblclick.
      if (event.type === 'dblclick') {
        openItem(node);
      } else {
        setSelection([node.id]);
      }
    },
    [openItem, setSelection],
  );

  const breadcrumbs = currentPath
    .map((id) => nodes[id])
    .filter(Boolean) as FsNode[];

  return (
    <div className="flex h-full w-full flex-col bg-slate-100 text-slate-800" data-testid="finder-root">
      <FinderToolbar
        canBack={backStack.current.length > 0}
        canForward={forwardStack.current.length > 0}
        viewMode={viewMode}
        onBack={goBack}
        onForward={goForward}
        onUp={goUp}
        onToggleView={() => setViewMode(viewMode === 'icon' ? 'list' : 'icon')}
        onNewFolder={handleNewFolder}
        onNewFile={handleNewFile}
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={(id) => navigateToId(id)}
      />

      <div className="flex flex-1 overflow-hidden">
        <FinderSidebar
          currentRootId={currentPath[0] ?? HOME_ID}
          onSelectFolder={(id) => navigateToId(id)}
        />

        <div
          className="flex-1 overflow-auto bg-white"
          data-testid="finder-main"
          onContextMenu={(e) => handleSurfaceContextMenu(e, null)}
          onClick={() => setSelection([])}
        >
          {viewMode === 'icon' ? (
            <FinderIconView
              nodes={children}
              selectedIds={selectedIds}
              renamingId={renamingId}
              renameDraft={renameDraft}
              onRenameDraftChange={setRenameDraft}
              onCommitRename={commitRename}
              onCancelRename={cancelRename}
              onItemActivate={handleItemActivate}
              onContextMenu={handleSurfaceContextMenu}
            />
          ) : (
            <FinderListView
              nodes={children}
              selectedIds={selectedIds}
              renamingId={renamingId}
              renameDraft={renameDraft}
              onRenameDraftChange={setRenameDraft}
              onCommitRename={commitRename}
              onCancelRename={cancelRename}
              onItemActivate={handleItemActivate}
              onContextMenu={handleSurfaceContextMenu}
            />
          )}
        </div>
      </div>

      {contextMenu && (
        <FinderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={closeContextMenu}
        />
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30"
          data-testid="finder-preview"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[70vh] w-[520px] max-w-[90vw] flex-col rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
              <span className="text-sm font-medium">{preview.name}</span>
              <button
                type="button"
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
              >
                x
              </button>
            </div>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap p-4 text-xs leading-relaxed text-slate-700">
              {preview.type === 'file' ? preview.content || '(empty)' : ''}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
