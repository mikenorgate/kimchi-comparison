/**
 * Finder — macOS Tahoe file browser.
 *
 * Features:
 * - Sidebar with Favorites (Desktop, Documents, Downloads, Applications, Pictures)
 * - Three view modes: icon grid, list, column
 * - Folder navigation (double-click to enter, path breadcrumb to go back)
 * - Tabs (add/close, each with independent navigation)
 * - Create/rename/delete files and folders
 * - Tag application (color dots)
 * - Seeded virtual filesystem persisted to localStorage
 */

import { useState, useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useFSStore, TAGS, type FSNode } from '@/store/fs';

// ── Types ─────────────────────────────────────────────────────────

type ViewMode = 'icon' | 'list' | 'column';

interface FinderTab {
  id: string;
  currentFolderId: string;
  viewMode: ViewMode;
}

interface FinderProps {
  appId: string;
}

// ── Sidebar favorites ─────────────────────────────────────────────

const SIDEBAR_FAVORITES = [
  { id: 'desktop', name: 'Desktop', icon: '🖥' },
  { id: 'documents', name: 'Documents', icon: '📄' },
  { id: 'downloads', name: 'Downloads', icon: '⬇' },
  { id: 'applications', name: 'Applications', icon: '⊞' },
  { id: 'pictures', name: 'Pictures', icon: '🖼' },
];

// ── Helper: file/folder icon ──────────────────────────────────────

function getNodeIcon(node: FSNode): string {
  if (node.type === 'folder') return '📁';
  const ext = node.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼';
    case 'txt': return '📄';
    case 'pdf': return '📕';
    case 'docx': return '📘';
    case 'xlsx': return '📗';
    case 'dmg': return '💿';
    default: return '📄';
  }
}

function getNodeSize(node: FSNode, getChildren: (id: string) => FSNode[]): string {
  if (node.type === 'folder') {
    const count = getChildren(node.id).length;
    return `${count} item${count !== 1 ? 's' : ''}`;
  }
  const content = node.content ?? '';
  const bytes = new Blob([content]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Main Finder Component ────────────────────────────────────────

let tabCounter = 0;

export function Finder({ appId: _appId }: FinderProps) {
  const store = useFSStore();
  const { nodes, getChildren, createNode, renameNode, deleteNode, toggleTag } = store;

  const [tabs, setTabs] = useState<FinderTab[]>([
    { id: `tab-${tabCounter++}`, currentFolderId: 'documents', viewMode: 'icon' },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const currentFolderId = activeTab.currentFolderId;
  const currentFolder = nodes[currentFolderId];
  const currentChildren = currentFolder ? getChildren(currentFolderId) : [];

  const updateTab = useCallback((tabId: string, updates: Partial<FinderTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  }, []);

  const navigateTo = useCallback((folderId: string) => {
    updateTab(activeTabId, { currentFolderId: folderId });
    setSelectedNodeId(null);
  }, [activeTabId, updateTab]);

  const addTab = useCallback(() => {
    const newTab: FinderTab = {
      id: `tab-${tabCounter++}`,
      currentFolderId: 'documents',
      viewMode: activeTab.viewMode,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setSelectedNodeId(null);
  }, [activeTab.viewMode]);

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((t) => t.id !== tabId);
      if (tabId === activeTabId) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  }, [activeTabId]);

  const startRename = useCallback((nodeId: string) => {
    const node = useFSStore.getState().nodes[nodeId];
    if (!node) return;
    setRenamingId(nodeId);
    setRenameValue(node.name);
    setTimeout(() => renameInputRef.current?.select(), 0);
  }, []);

  const commitRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameNode(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  }, [renamingId, renameValue, renameNode]);

  const handleCreate = useCallback((type: 'folder' | 'file') => {
    const name = type === 'folder' ? 'New Folder' : 'New File.txt';
    const newId = createNode(currentFolderId, name, type, type === 'file' ? '' : undefined);
    setSelectedNodeId(newId);
    startRename(newId);
    setContextMenu(null);
  }, [currentFolderId, createNode, startRename]);

  const handleDelete = useCallback((nodeId: string) => {
    deleteNode(nodeId);
    setSelectedNodeId(null);
    setContextMenu(null);
  }, [deleteNode]);

  const handleNodeDoubleClick = useCallback((node: FSNode) => {
    if (node.type === 'folder') {
      navigateTo(node.id);
    }
  }, [navigateTo]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent) => {
    if (e.key === 'Delete' || (e.metaKey && e.key === 'Backspace')) {
      if (selectedNodeId) {
        e.preventDefault();
        handleDelete(selectedNodeId);
      }
    }
    if (e.key === 'Enter') {
      if (selectedNodeId && !renamingId) {
        const node = nodes[selectedNodeId];
        if (node?.type === 'folder') {
          navigateTo(node.id);
        } else {
          startRename(selectedNodeId);
        }
      }
    }
  }, [selectedNodeId, renamingId, nodes, navigateTo, startRename, handleDelete]);

  const breadcrumb = store.getPath(currentFolderId).filter((n) => n.id !== '/');

  return (
    <div className="flex h-full w-full" data-testid="finder-root" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Sidebar */}
      <div
        className="glass-surface w-48 shrink-0 border-r border-black/5 dark:border-white/5 p-2 overflow-y-auto"
        data-testid="finder-sidebar"
      >
        <div className="text-[11px] font-semibold text-black/40 dark:text-white/40 px-2 py-1 uppercase">Favorites</div>
        {SIDEBAR_FAVORITES.map((fav) => {
          const node = nodes[fav.id];
          if (!node) return null;
          return (
            <button
              key={fav.id}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-sm text-left transition-colors ${
                currentFolderId === fav.id
                  ? 'bg-[#0a84ff] text-white'
                  : 'text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onClick={() => navigateTo(fav.id)}
              data-testid={`finder-sidebar-${fav.id}`}
            >
              <span className="text-xs">{fav.icon}</span>
              <span className="truncate">{fav.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5" data-testid="finder-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`group flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer text-xs max-w-32 ${
                tab.id === activeTabId
                  ? 'bg-white/80 dark:bg-gray-700/80 text-black dark:text-white'
                  : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onClick={() => setActiveTabId(tab.id)}
              data-testid={`finder-tab-${tab.id}`}
            >
              <span className="truncate">{nodes[tab.currentFolderId]?.name ?? 'Finder'}</span>
              {tabs.length > 1 && (
                <button
                  className="rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  data-testid={`finder-tab-close-${tab.id}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            className="px-2 py-1 text-xs text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80"
            onClick={addTab}
            data-testid="finder-new-tab"
          >
            +
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-black/5 dark:border-white/5">
          {/* Back navigation */}
          <button
            className="text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80 disabled:opacity-20 px-1"
            onClick={() => {
              const parent = currentFolder?.parentId;
              if (parent && parent !== null) navigateTo(parent);
            }}
            disabled={!currentFolder?.parentId || currentFolder.parentId === null}
            data-testid="finder-back"
          >
            ‹
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 ml-auto" data-testid="finder-view-toggle">
            {(['icon', 'list', 'column'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`px-2 py-1 rounded text-xs ${
                  activeTab.viewMode === mode
                    ? 'bg-black/10 dark:bg-white/15 text-black dark:text-white'
                    : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                onClick={() => updateTab(activeTabId, { viewMode: mode })}
                data-testid={`finder-view-${mode}`}
              >
                {mode === 'icon' ? '⊞' : mode === 'list' ? '☰' : '∥'}
              </button>
            ))}
          </div>

          {/* New folder / file buttons */}
          <button
            className="px-2 py-1 rounded text-xs text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => handleCreate('folder')}
            data-testid="finder-new-folder"
          >
            📁+
          </button>
          <button
            className="px-2 py-1 rounded text-xs text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => handleCreate('file')}
            data-testid="finder-new-file"
          >
            📄+
          </button>
        </div>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 px-3 py-1 text-xs text-black/50 dark:text-white/50 border-b border-black/5 dark:border-white/5" data-testid="finder-breadcrumb">
          {breadcrumb.length === 0 && <span>root</span>}
          {breadcrumb.map((node, i) => (
            <span key={node.id} className="flex items-center gap-1">
              {i > 0 && <span>›</span>}
              <button
                className="hover:text-black/80 dark:hover:text-white/80"
                onClick={() => navigateTo(node.id)}
              >
                {node.name}
              </button>
            </span>
          ))}
        </div>

        {/* Content area */}
        <div
          className="flex-1 overflow-y-auto p-3"
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: null });
          }}
          data-testid="finder-content"
        >
          {/* Icon View */}
          {activeTab.viewMode === 'icon' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3" data-testid="finder-icon-view">
              {currentChildren.map((node) => (
                <div
                  key={node.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-default ${
                    selectedNodeId === node.id ? 'bg-[#0a84ff]/20' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedNodeId(node.id)}
                  onDoubleClick={() => handleNodeDoubleClick(node)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
                  }}
                  data-testid={`finder-node-${node.id}`}
                >
                  <span className="text-3xl">{getNodeIcon(node)}</span>
                  {renamingId === node.id ? (
                    <input
                      ref={renameInputRef}
                      className="text-xs text-center w-full bg-white dark:bg-gray-700 px-1 rounded outline-none border border-blue-500"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                      }}
                      data-testid="finder-rename-input"
                    />
                  ) : (
                    <span className="text-xs text-center truncate w-full text-black/80 dark:text-white/80">{node.name}</span>
                  )}
                  {/* Tag dots */}
                  <div className="flex gap-0.5 h-1.5">
                    {node.tags.map((tagId) => {
                      const tag = TAGS.find((t) => t.id === tagId);
                      return tag ? (
                        <div key={tagId} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
              {currentChildren.length === 0 && (
                <div className="text-sm text-black/30 dark:text-white/30 col-span-full text-center py-8">This folder is empty</div>
              )}
            </div>
          )}

          {/* List View */}
          {activeTab.viewMode === 'list' && (
            <table className="w-full text-sm" data-testid="finder-list-view">
              <thead>
                <tr className="text-left text-xs text-black/40 dark:text-white/40 border-b border-black/5 dark:border-white/5">
                  <th className="py-1 px-2 font-medium">Name</th>
                  <th className="py-1 px-2 font-medium">Date Modified</th>
                  <th className="py-1 px-2 font-medium">Size</th>
                  <th className="py-1 px-2 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {currentChildren.map((node) => (
                  <tr
                    key={node.id}
                    className={`cursor-default ${
                      selectedNodeId === node.id ? 'bg-[#0a84ff]/20' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedNodeId(node.id)}
                    onDoubleClick={() => handleNodeDoubleClick(node)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
                    }}
                    data-testid={`finder-node-${node.id}`}
                  >
                    <td className="py-1 px-2 flex items-center gap-2">
                      <span>{getNodeIcon(node)}</span>
                      {renamingId === node.id ? (
                        <input
                          ref={renameInputRef}
                          className="text-sm bg-white dark:bg-gray-700 px-1 rounded outline-none border border-blue-500"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename();
                            if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                          }}
                          data-testid="finder-rename-input"
                        />
                      ) : (
                        <span className="text-black/80 dark:text-white/80">{node.name}</span>
                      )}
                    </td>
                    <td className="py-1 px-2 text-xs text-black/50 dark:text-white/50">
                      {new Date(node.modifiedAt).toLocaleDateString()}
                    </td>
                    <td className="py-1 px-2 text-xs text-black/50 dark:text-white/50">
                      {getNodeSize(node, getChildren)}
                    </td>
                    <td className="py-1 px-2">
                      <div className="flex gap-0.5">
                        {node.tags.map((tagId) => {
                          const tag = TAGS.find((t) => t.id === tagId);
                          return tag ? (
                            <div key={tagId} className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                          ) : null;
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Column View */}
          {activeTab.viewMode === 'column' && (
            <div className="flex gap-0 overflow-x-auto" data-testid="finder-column-view">
              <ColumnPane
                folderId={currentFolderId}
                nodes={nodes}
                getChildren={getChildren}
                selectedNodeId={selectedNodeId}
                renamingId={renamingId}
                renameValue={renameValue}
                renameInputRef={renameInputRef}
                onSelect={(id) => setSelectedNodeId(id)}
                onNavigate={navigateTo}
                onRename={setRenameValue}
                onCommitRename={commitRename}
                onCancelRename={() => { setRenamingId(null); setRenameValue(''); }}
                onContextMenu={(x, y, nodeId) => setContextMenu({ x, y, nodeId })}
              />
              {/* Show file preview or sub-folder column */}
              {selectedNodeId && nodes[selectedNodeId]?.type === 'folder' && (
                <ColumnPane
                  folderId={selectedNodeId}
                  nodes={nodes}
                  getChildren={getChildren}
                  selectedNodeId={null}
                  renamingId={null}
                  renameValue=""
                  renameInputRef={renameInputRef}
                  onSelect={() => {}}
                  onNavigate={navigateTo}
                  onRename={() => {}}
                  onCommitRename={() => {}}
                  onCancelRename={() => {}}
                  onContextMenu={(x, y, nodeId) => setContextMenu({ x, y, nodeId })}
                />
              )}
              {selectedNodeId && nodes[selectedNodeId]?.type === 'file' && (
                <div className="flex-1 p-4 min-w-48 border-l border-black/5 dark:border-white/5">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{getNodeIcon(nodes[selectedNodeId])}</span>
                    <span className="text-sm font-medium text-black/80 dark:text-white/80">{nodes[selectedNodeId].name}</span>
                    <span className="text-xs text-black/40 dark:text-white/40">
                      {getNodeSize(nodes[selectedNodeId], getChildren)}
                    </span>
                    {nodes[selectedNodeId].content && (
                      <div className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs text-black/60 dark:text-white/60 max-w-xs whitespace-pre-wrap">
                        {nodes[selectedNodeId].content!.slice(0, 200)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} data-testid="finder-context-backdrop" />
          <div
            className="fixed glass-surface-heavy bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-window py-1 text-sm min-w-40 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            data-testid="finder-context-menu"
          >
            <button
              className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-black/80 dark:text-white/80"
              onClick={() => handleCreate('folder')}
            >
              New Folder
            </button>
            <button
              className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-black/80 dark:text-white/80"
              onClick={() => handleCreate('file')}
            >
              New File
            </button>
            {contextMenu.nodeId && (
              <>
                <div className="border-t border-black/5 dark:border-white/5 my-1" />
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-black/80 dark:text-white/80"
                  onClick={() => { startRename(contextMenu.nodeId!); }}
                >
                  Rename
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                  onClick={() => handleDelete(contextMenu.nodeId!)}
                >
                  Move to Trash
                </button>
                <div className="border-t border-black/5 dark:border-white/5 my-1" />
                <div className="px-3 py-1 text-[11px] text-black/40 dark:text-white/40 uppercase">Tags</div>
                {TAGS.map((tag) => {
                  const node = nodes[contextMenu.nodeId!];
                  const isActive = node?.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-black/80 dark:text-white/80"
                      onClick={() => {
                        toggleTag(contextMenu.nodeId!, tag.id);
                        setContextMenu(null);
                      }}
                      data-testid={`finder-tag-${tag.id}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span>{tag.name}</span>
                      {isActive && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Column Pane (for column view) ────────────────────────────────

interface ColumnPaneProps {
  folderId: string;
  nodes: Record<string, FSNode>;
  getChildren: (id: string) => FSNode[];
  selectedNodeId: string | null;
  renamingId: string | null;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (id: string) => void;
  onNavigate: (folderId: string) => void;
  onRename: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onContextMenu: (x: number, y: number, nodeId: string | null) => void;
}

function ColumnPane({
  folderId,
  nodes,
  getChildren,
  selectedNodeId,
  renamingId,
  renameValue,
  renameInputRef,
  onSelect,
  onNavigate,
  onRename,
  onCommitRename,
  onCancelRename,
  onContextMenu,
}: ColumnPaneProps) {
  const folder = nodes[folderId];
  if (!folder) return null;
  const children = getChildren(folderId);

  return (
    <div className="min-w-48 max-w-64 border-r border-black/5 dark:border-white/5 overflow-y-auto">
      {children.map((node) => (
        <div
          key={node.id}
          className={`flex items-center gap-2 px-2 py-1.5 cursor-default text-sm ${
            selectedNodeId === node.id ? 'bg-[#0a84ff]/20' : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          onClick={() => onSelect(node.id)}
          onDoubleClick={() => node.type === 'folder' && onNavigate(node.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(node.id);
            onContextMenu(e.clientX, e.clientY, node.id);
          }}
          data-testid={`finder-node-${node.id}`}
        >
          <span>{getNodeIcon(node)}</span>
          {renamingId === node.id ? (
            <input
              ref={renameInputRef}
              className="text-sm bg-white dark:bg-gray-700 px-1 rounded outline-none border border-blue-500 flex-1"
              value={renameValue}
              onChange={(e) => onRename(e.target.value)}
              onBlur={onCommitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitRename();
                if (e.key === 'Escape') onCancelRename();
              }}
              data-testid="finder-rename-input"
            />
          ) : (
            <span className="flex-1 truncate text-black/80 dark:text-white/80">{node.name}</span>
          )}
          {node.type === 'folder' && <span className="text-xs text-black/30 dark:text-white/30">›</span>}
        </div>
      ))}
      {children.length === 0 && (
        <div className="text-xs text-black/30 dark:text-white/30 text-center py-4">Empty</div>
      )}
    </div>
  );
}
