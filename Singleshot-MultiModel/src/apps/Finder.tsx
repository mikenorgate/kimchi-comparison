import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Info,
  List as ListIcon,
  Search,
  Share2,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';

import { ContextMenu } from '../components/ui/ContextMenu';
import { IconButton } from '../components/ui/IconButton';
import { useWindow } from '../hooks/useWindow';
import type { MenuBarMenu, MenuBarMenuItem } from '../types/os';

import {
  formatBytes,
  formatDate,
  getChildren,
  getForTag,
  getNodeById,
  getParent,
  getRecents,
  getTrashed,
  isPseudoId,
  isTagLocationId,
  PSEUDO_TRASH,
  resolveLocationTitle,
  SIDEBAR_LOCATIONS,
  TAGS,
  TAG_PREFIX,
  tagIdFromLocation,
  tagMenuItemsFor,
  trashCount,
  useFinderStore,
} from './finderData';
import type { FinderLocationEntry, FinderNode } from './finderData';

// ---------------------------------------------------------------------------
// Navigation history helpers
// ---------------------------------------------------------------------------

interface NavState {
  /** Stack of visited locations. */
  stack: string[];
  /** Index into `stack` for the current location. */
  index: number;
}

const HOME_LOCATION = 'documents';

function pushLocation(state: NavState, next: string): NavState {
  // Collapse duplicates.
  if (state.stack[state.index] === next) return state;
  // Truncate forward history (a forward branch is replaced by the new nav).
  const truncated = state.stack.slice(0, state.index + 1);
  return { stack: [...truncated, next], index: truncated.length };
}

function goBack(state: NavState): NavState {
  if (state.index <= 0) return state;
  return { ...state, index: state.index - 1 };
}

function goForward(state: NavState): NavState {
  if (state.index >= state.stack.length - 1) return state;
  return { ...state, index: state.index + 1 };
}

// ---------------------------------------------------------------------------
// Drag payload
// ---------------------------------------------------------------------------

const FINDER_DRAG_MIME = 'application/x-ferment-finder-node-id';

function isFinderDrag(event: ReactDragEvent): string | null {
  const types = event.dataTransfer.types;
  if (!Array.from(types).includes(FINDER_DRAG_MIME)) return null;
  const raw = event.dataTransfer.getData(FINDER_DRAG_MIME);
  return raw || null;
}

// ---------------------------------------------------------------------------
// Context-menu builders
// ---------------------------------------------------------------------------

function buildItemMenu(
  node: FinderNode,
  onRename: () => void,
  onTrash: () => void,
  onOpenGetInfo: () => void,
  onOpen: () => void,
): MenuBarMenu {
  return {
    title: 'Item',
    items: [
      { label: 'Open', action: onOpen },
      { separator: true, label: '' },
      { label: 'Get Info', action: onOpenGetInfo },
      { label: 'Rename', action: onRename },
      { separator: true, label: '' },
      { label: 'Move to Trash', action: onTrash },
      { separator: true, label: '' },
      ...tagMenuItemsFor(node).map<MenuBarMenuItem>((item) => ({
        ...item,
        action: () => undefined,
      })),
    ],
  };
}

function buildEmptyAreaMenu(
  onNewFolder: () => void,
  onGetInfo: () => void,
): MenuBarMenu {
  return {
    title: 'Background',
    items: [
      { label: 'New Folder', action: onNewFolder },
      { separator: true, label: '' },
      { label: 'Get Info', action: onGetInfo },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function Finder({ windowId }: { windowId: string }): JSX.Element {
  const nodes = useFinderStore((state) => state.nodes);
  const moveItem = useFinderStore((state) => state.move);
  const moveToTrash = useFinderStore((state) => state.moveToTrash);
  const renameNode = useFinderStore((state) => state.rename);
  const toggleTag = useFinderStore((state) => state.toggleTag);

  const { actions: windowActions } = useWindow(windowId);

  const [nav, setNav] = useState<NavState>({
    stack: [HOME_LOCATION],
    index: 0,
  });
  const currentLocation = nav.stack[nav.index] ?? HOME_LOCATION;

  const [view, setView] = useState<'icon' | 'list'>('icon');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [itemContextMenu, setItemContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [areaContextMenu, setAreaContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [getInfoNodeId, setGetInfoNodeId] = useState<string | null>(null);

  const fileAreaRef = useRef<HTMLDivElement | null>(null);

  // Set window title to current folder name whenever the location changes.
  useEffect(() => {
    windowActions.setTitle(resolveLocationTitle(nodes, currentLocation));
  }, [nodes, currentLocation, windowActions]);

  // -- Items to render -----------------------------------------------------

  const baseItems = useMemo<FinderNode[]>(() => {
    if (currentLocation === PSEUDO_TRASH) return getTrashed(nodes);
    if (currentLocation === 'recents') return getRecents(nodes);
    if (currentLocation === 'airdrop') return [];
    if (isTagLocationId(currentLocation)) {
      return getForTag(nodes, tagIdFromLocation(currentLocation));
    }
    return getChildren(nodes, currentLocation);
  }, [currentLocation, nodes]);

  const items = useMemo<FinderNode[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseItems;
    return baseItems.filter((n) => n.name.toLowerCase().includes(q));
  }, [baseItems, search]);

  // Clear stale selection when the visible items change.
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (items.some((i) => i.id === id)) next.add(id);
      }
      if (activeId && !items.some((i) => i.id === activeId)) {
        setActiveId(null);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [items, activeId]);

  // -- Navigation actions --------------------------------------------------

  const navigate = useCallback((location: string) => {
    setNav((s) => pushLocation(s, location));
    setSearch('');
  }, []);

  const handleBack = useCallback(() => {
    setNav((s) => goBack(s));
  }, []);

  const handleForward = useCallback(() => {
    setNav((s) => goForward(s));
  }, []);

  const openItem = useCallback(
    (node: FinderNode) => {
      if (node.kind === 'folder') {
        navigate(node.id);
      } else {
        // File open is a no-op for this mock, but we surface it via the
        // context-menu's "Open" item; we just bring the window forward.
      }
    },
    [navigate],
  );

  const goToParent = useCallback(() => {
    const location = currentLocation;
    if (
      isPseudoId(location) ||
      isTagLocationId(location) ||
      location === 'root'
    ) {
      return;
    }
    const node = getNodeById(nodes, location);
    if (!node) return;
    if (node.parentId === null) {
      navigate('root');
      return;
    }
    navigate(node.parentId);
  }, [currentLocation, navigate, nodes]);

  // -- Trash / item actions ------------------------------------------------

  const trashSelected = useCallback(() => {
    for (const id of selectedIds) {
      moveToTrash(id);
    }
    if (activeId && !selectedIds.has(activeId)) {
      moveToTrash(activeId);
    }
    setSelectedIds(new Set());
    setActiveId(null);
  }, [selectedIds, activeId, moveToTrash]);

  // -- Context menu handlers ----------------------------------------------

  const openItemContextMenu = useCallback(
    (event: ReactMouseEvent, node: FinderNode) => {
      event.preventDefault();
      event.stopPropagation();
      setAreaContextMenu(null);
      setSelectedIds((prev) => {
        if (prev.has(node.id)) return prev;
        return new Set([node.id]);
      });
      setActiveId(node.id);
      setItemContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [],
  );

  const openAreaContextMenu = useCallback((event: ReactMouseEvent) => {
    event.preventDefault();
    setItemContextMenu(null);
    setAreaContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const startRename = useCallback((node: FinderNode) => {
    setRenamingId(node.id);
    setRenameValue(node.name);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (trimmed) {
      renameNode(renamingId, trimmed);
    }
    setRenamingId(null);
    setRenameValue('');
  }, [renamingId, renameValue, renameNode]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue('');
  }, []);

  const newFolderAt = useCallback(
    (parentId: string | null) => {
      // Quick inline folder creation via the store.
      const id = `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      useFinderStore.setState((state) => ({
        nodes: [
          ...state.nodes,
          {
            id,
            parentId,
            name: 'untitled folder',
            kind: 'folder',
            icon: '📁',
            size: 0,
            modifiedAt: new Date().toISOString(),
            kindLabel: 'Folder',
            tagIds: [],
            inTrash: false,
          },
        ],
      }));
      setRenamingId(id);
      setRenameValue('untitled folder');
    },
    [],
  );

  // -- Drag & drop ---------------------------------------------------------

  const handleItemDragStart = useCallback(
    (event: ReactDragEvent, node: FinderNode) => {
      // If dragging an unselected item, select just it.
      if (!selectedIds.has(node.id)) {
        setSelectedIds(new Set([node.id]));
      }
      event.dataTransfer.setData(FINDER_DRAG_MIME, node.id);
      event.dataTransfer.effectAllowed = 'move';
    },
    [selectedIds],
  );

  const handleSidebarDragOver = useCallback(
    (event: ReactDragEvent, entry: FinderLocationEntry) => {
      if (entry.pseudo && entry.pseudo !== 'trash') return;
      if (!entry.folderId) return;
      const draggedId = isFinderDrag(event);
      if (!draggedId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = entry.pseudo === 'trash' ? 'move' : 'move';
    },
    [],
  );

  const handleSidebarDrop = useCallback(
    (event: ReactDragEvent, entry: FinderLocationEntry) => {
      const draggedId = isFinderDrag(event);
      if (!draggedId) return;
      if (entry.pseudo === PSEUDO_TRASH) {
        event.preventDefault();
        moveToTrash(draggedId);
        return;
      }
      if (entry.folderId) {
        event.preventDefault();
        moveItem(draggedId, entry.folderId);
      }
    },
    [moveItem, moveToTrash],
  );

  // -- Keyboard handling ---------------------------------------------------

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const isMod = event.metaKey || event.ctrlKey;

      // Cmd+Backspace -> move to Trash (real Finder uses Cmd+Delete).
      if (isMod && event.key === 'Backspace') {
        event.preventDefault();
        trashSelected();
        return;
      }

      // Cmd+Up arrow -> parent.
      if (isMod && event.key === 'ArrowUp') {
        event.preventDefault();
        goToParent();
        return;
      }

      // Enter -> open the active item.
      if (event.key === 'Enter') {
        if (activeId) {
          const node = getNodeById(nodes, activeId);
          if (node) {
            event.preventDefault();
            openItem(node);
          }
        }
        return;
      }

      // Backspace -> parent folder (Finder convention).
      if (event.key === 'Backspace') {
        event.preventDefault();
        goToParent();
        return;
      }

      // Arrow nav.
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight'
      ) {
        if (items.length === 0) return;
        event.preventDefault();
        const currentIndex = activeId
          ? items.findIndex((i) => i.id === activeId)
          : -1;
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          nextIndex = Math.min(items.length - 1, currentIndex + 1);
          if (nextIndex < 0) nextIndex = 0;
        } else {
          nextIndex = Math.max(0, currentIndex - 1);
        }
        const next = items[nextIndex];
        if (next) {
          setActiveId(next.id);
          setSelectedIds(new Set([next.id]));
        }
      }
    },
    [activeId, goToParent, items, nodes, openItem, trashSelected],
  );

  // -- Selection / click handling -----------------------------------------

  const handleItemClick = useCallback(
    (event: ReactMouseEvent, node: FinderNode) => {
      event.stopPropagation();
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          return next;
        });
      } else {
        setSelectedIds(new Set([node.id]));
      }
      setActiveId(node.id);
    },
    [],
  );

  const handleItemDoubleClick = useCallback(
    (node: FinderNode) => {
      openItem(node);
    },
    [openItem],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setActiveId(null);
  }, []);

  // -- Context menu action wiring ------------------------------------------

  const handleItemMenuAction = useCallback(
    (item: MenuBarMenuItem) => {
      if (!itemContextMenu) return;
      const node = getNodeById(nodes, itemContextMenu.nodeId);
      if (!node) return;
      const label = item.label.replace(/^\s*[\u2713]\s*/, '').trim();
      switch (label) {
        case 'Open':
          openItem(node);
          return;
        case 'Get Info':
          setGetInfoNodeId(node.id);
          return;
        case 'Rename':
          startRename(node);
          return;
        case 'Move to Trash':
          moveToTrash(node.id);
          return;
        default: {
          // Tag toggle: label is one of the tag names.
          const tag = TAGS.find((t) => t.label === label);
          if (tag) toggleTag(node.id, tag.id);
        }
      }
    },
    [itemContextMenu, nodes, openItem, startRename, moveToTrash, toggleTag],
  );

  const handleAreaMenuAction = useCallback(
    (item: MenuBarMenuItem) => {
      if (!areaContextMenu) return;
      switch (item.label) {
        case 'New Folder': {
          // Determine the parent. In tag/pseudo views, just put it in Documents.
          let parentId: string | null = currentLocation;
          if (
            parentId === 'recents' ||
            parentId === 'airdrop' ||
            parentId === PSEUDO_TRASH ||
            isTagLocationId(parentId) ||
            parentId === 'root'
          ) {
            parentId = 'documents';
          }
          newFolderAt(parentId);
          return;
        }
        case 'Get Info':
          setGetInfoNodeId(currentLocation);
          return;
        default:
          break;
      }
    },
    [areaContextMenu, currentLocation, newFolderAt],
  );

  // -- Render helpers ------------------------------------------------------

  const renderSidebarItem = (entry: FinderLocationEntry): JSX.Element => {
    const isActive = currentLocation === entry.id;
    const isDropTarget = entry.pseudo === PSEUDO_TRASH;
    const classes = ['finder-sidebar__item', isActive ? 'finder-sidebar__item--active' : '']
      .filter(Boolean)
      .join(' ');
    const extraClasses = [
      'finder-sidebar__item',
      isDropTarget ? 'finder-sidebar__item--drop' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const droppable = entry.pseudo !== 'airdrop';
    return (
      <div
        key={entry.id}
        className={isDropTarget ? extraClasses : classes}
        role="button"
        tabIndex={0}
        onClick={() => navigate(entry.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(entry.id);
          }
        }}
        onDragOver={droppable ? (event) => handleSidebarDragOver(event, entry) : undefined}
        onDragLeave={droppable ? () => undefined : undefined}
        onDrop={droppable ? (event) => handleSidebarDrop(event, entry) : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="finder-sidebar__icon" aria-hidden="true">
          {entry.icon}
        </span>
        <span className="finder-sidebar__label">{entry.name}</span>
        {entry.pseudo === PSEUDO_TRASH && trashCount(nodes) > 0 && (
          <span className="finder-sidebar__count">{trashCount(nodes)}</span>
        )}
      </div>
    );
  };

  const renderTagSidebarItem = (tag: { id: string; label: string; color: string }): JSX.Element => {
    const locationId = `${TAG_PREFIX}${tag.id}`;
    const isActive = currentLocation === locationId;
    return (
      <div
        key={tag.id}
        className={[
          'finder-sidebar__item',
          'finder-sidebar__item--tag',
          isActive ? 'finder-sidebar__item--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={0}
        onClick={() => navigate(locationId)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(locationId);
          }
        }}
      >
        <span
          className="finder-sidebar__tag-dot"
          style={{ background: tag.color }}
          aria-hidden="true"
        />
        <span className="finder-sidebar__label">{tag.label}</span>
      </div>
    );
  };

  const canGoBack = nav.index > 0;
  const canGoForward = nav.index < nav.stack.length - 1;

  const pathCrumbs = useMemo<string[]>(() => {
    if (
      isPseudoId(currentLocation) ||
      isTagLocationId(currentLocation) ||
      currentLocation === 'root'
    ) {
      return [resolveLocationTitle(nodes, currentLocation)];
    }
    const crumbs: string[] = [];
    let cursor: string | null = currentLocation;
    let guard = 0;
    while (cursor && guard < nodes.length + 2) {
      const node = getNodeById(nodes, cursor);
      if (!node) break;
      crumbs.unshift(node.name);
      cursor = node.parentId;
      guard += 1;
    }
    return crumbs.length > 0 ? crumbs : ['Finder'];
  }, [currentLocation, nodes]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const getInfoNode = getInfoNodeId ? getNodeById(nodes, getInfoNodeId) : null;
  const infoParent = getInfoNode ? getParent(nodes, getInfoNode.id) : null;

  return (
    <div
      className="finder"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Finder"
    >
      {/* Sidebar */}
      <aside className="finder__sidebar" aria-label="Sidebar">
        <div className="finder-sidebar__section">
          <div className="finder-sidebar__heading">Favorites</div>
          {SIDEBAR_LOCATIONS.favorites.map(renderSidebarItem)}
        </div>
        <div className="finder-sidebar__section">
          <div className="finder-sidebar__heading">Locations</div>
          {SIDEBAR_LOCATIONS.locations.map(renderSidebarItem)}
        </div>
        <div className="finder-sidebar__section">
          <div className="finder-sidebar__heading">Tags</div>
          {TAGS.map(renderTagSidebarItem)}
        </div>
      </aside>

      {/* Main pane: toolbar + path + file area + status bar */}
      <div className="finder__main">
        <div className="finder__toolbar">
          <div className="finder__toolbar-group finder__toolbar-group--nav">
            <IconButton
              size="sm"
              label="Back"
              onClick={handleBack}
            >
              <span
                style={{
                  opacity: canGoBack ? 1 : 0.35,
                  display: 'inline-flex',
                }}
              >
                <ChevronLeft size={16} />
              </span>
            </IconButton>
            <IconButton size="sm" label="Forward" onClick={handleForward}>
              <span
                style={{
                  opacity: canGoForward ? 1 : 0.35,
                  display: 'inline-flex',
                }}
              >
                <ChevronRight size={16} />
              </span>
            </IconButton>
          </div>
          <div className="finder__toolbar-group finder__toolbar-group--view">
            <IconButton
              size="sm"
              label="Icon view"
              active={view === 'icon'}
              onClick={() => setView('icon')}
            >
              <Grid3x3 size={16} />
            </IconButton>
            <IconButton
              size="sm"
              label="List view"
              active={view === 'list'}
              onClick={() => setView('list')}
            >
              <ListIcon size={16} />
            </IconButton>
          </div>
          <div className="finder__toolbar-group finder__toolbar-group--search">
            <Search size={14} className="finder__search-icon" />
            <input
              type="text"
              className="finder__search"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search"
            />
          </div>
          <div className="finder__toolbar-group finder__toolbar-group--actions">
            <IconButton
              size="sm"
              label="Share"
              onClick={() => undefined}
            >
              <Share2 size={16} />
            </IconButton>
            <IconButton size="sm" label="Tag" onClick={() => undefined}>
              <TagIcon size={16} />
            </IconButton>
          </div>
        </div>

        <div className="finder__pathbar" aria-label="Path">
          {pathCrumbs.map((part, idx) => (
            <span key={`${part}-${idx}`} className="finder__pathbar-segment">
              {idx > 0 && <span className="finder__pathbar-sep">/</span>}
              <span className="finder__pathbar-part">{part}</span>
            </span>
          ))}
        </div>

        <div
          ref={fileAreaRef}
          className={`finder__files finder__files--${view}`}
          onClick={clearSelection}
          onContextMenu={openAreaContextMenu}
        >
          {items.length === 0 ? (
            <div className="finder__empty">
              {search.trim()
                ? 'No items match your search.'
                : currentLocation === PSEUDO_TRASH
                  ? 'Trash is empty.'
                  : currentLocation === 'airdrop'
                    ? 'AirDrop is available nearby.'
                    : 'This folder is empty.'}
            </div>
          ) : view === 'icon' ? (
            items.map((node) => (
              <IconTile
                key={node.id}
                node={node}
                selected={selectedIds.has(node.id)}
                active={activeId === node.id}
                renaming={renamingId === node.id}
                renameValue={renameValue}
                onRenameChange={setRenameValue}
                onCommitRename={commitRename}
                onCancelRename={cancelRename}
                onClick={handleItemClick}
                onDoubleClick={handleItemDoubleClick}
                onContextMenu={openItemContextMenu}
                onDragStart={handleItemDragStart}
                onStartRename={startRename}
              />
            ))
          ) : (
            <ListTable
              items={items}
              selectedIds={selectedIds}
              activeId={activeId}
              renamingId={renamingId}
              renameValue={renameValue}
              onRenameChange={setRenameValue}
              onCommitRename={commitRename}
              onCancelRename={cancelRename}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              onItemContextMenu={openItemContextMenu}
              onItemDragStart={handleItemDragStart}
              onStartRename={startRename}
            />
          )}
        </div>

        <div className="finder__statusbar" aria-label="Status">
          <span className="finder__statusbar-count">
            {items.length === 1 ? '1 item' : `${items.length} items`}
            {selectedIds.size > 0 && `, ${selectedIds.size} selected`}
          </span>
          <span className="finder__statusbar-storage">
            <span className="finder__statusbar-storage-dot" aria-hidden="true" />
            499.6 GB available of 500 GB
          </span>
        </div>
      </div>

      {/* Context menus */}
      {itemContextMenu && (
        <ContextMenu
          position={{ x: itemContextMenu.x, y: itemContextMenu.y }}
          menu={buildItemMenu(
            getNodeById(nodes, itemContextMenu.nodeId) as FinderNode,
            () => {
              const n = getNodeById(nodes, itemContextMenu.nodeId);
              if (n) startRename(n);
            },
            () => moveToTrash(itemContextMenu.nodeId),
            () => setGetInfoNodeId(itemContextMenu.nodeId),
            () => {
              const n = getNodeById(nodes, itemContextMenu.nodeId);
              if (n) openItem(n);
            },
          )}
          onClose={() => setItemContextMenu(null)}
          onItemActivated={handleItemMenuAction}
        />
      )}
      {areaContextMenu && (
        <ContextMenu
          position={{ x: areaContextMenu.x, y: areaContextMenu.y }}
          menu={buildEmptyAreaMenu(
            () => {
              const parent = isPseudoId(currentLocation) || isTagLocationId(currentLocation)
                ? 'documents'
                : currentLocation;
              newFolderAt(parent === 'root' ? 'documents' : parent);
            },
            () => setGetInfoNodeId(currentLocation),
          )}
          onClose={() => setAreaContextMenu(null)}
          onItemActivated={handleAreaMenuAction}
        />
      )}

      {/* Get Info dialog */}
      {getInfoNode && (
        <GetInfoDialog
          node={getInfoNode}
          parent={infoParent}
          onClose={() => setGetInfoNodeId(null)}
          onMoveToTrash={() => {
            moveToTrash(getInfoNode.id);
            setGetInfoNodeId(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icon view tile
// ---------------------------------------------------------------------------

interface IconTileProps {
  node: FinderNode;
  selected: boolean;
  active: boolean;
  renaming: boolean;
  renameValue: string;
  onRenameChange: (next: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onClick: (event: ReactMouseEvent, node: FinderNode) => void;
  onDoubleClick: (node: FinderNode) => void;
  onContextMenu: (event: ReactMouseEvent, node: FinderNode) => void;
  onDragStart: (event: ReactDragEvent, node: FinderNode) => void;
  onStartRename: (node: FinderNode) => void;
}

function IconTile({
  node,
  selected,
  active,
  renaming,
  renameValue,
  onRenameChange,
  onCommitRename,
  onCancelRename,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onStartRename,
}: IconTileProps): JSX.Element {
  const classes = [
    'finder-tile',
    selected ? 'finder-tile--selected' : '',
    active ? 'finder-tile--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="button"
      tabIndex={0}
      draggable={!renaming}
      onClick={(event) => onClick(event, node)}
      onDoubleClick={() => onDoubleClick(node)}
      onContextMenu={(event) => onContextMenu(event, node)}
      onDragStart={(event) => onDragStart(event, node)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !renaming) onDoubleClick(node);
      }}
      data-node-id={node.id}
    >
      <div className="finder-tile__icon" aria-hidden="true">
        {node.icon}
      </div>
      {renaming ? (
        <input
          autoFocus
          className="finder-tile__rename"
          value={renameValue}
          onChange={(event) => onRenameChange(event.target.value)}
          onBlur={onCommitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onCommitRename();
            else if (event.key === 'Escape') onCancelRename();
          }}
        />
      ) : (
        <span
          className="finder-tile__label"
          onDoubleClick={(event) => {
            event.stopPropagation();
            onStartRename(node);
          }}
        >
          {node.name}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List view table
// ---------------------------------------------------------------------------

interface ListTableProps {
  items: FinderNode[];
  selectedIds: Set<string>;
  activeId: string | null;
  renamingId: string | null;
  renameValue: string;
  onRenameChange: (next: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onItemClick: (event: ReactMouseEvent, node: FinderNode) => void;
  onItemDoubleClick: (node: FinderNode) => void;
  onItemContextMenu: (event: ReactMouseEvent, node: FinderNode) => void;
  onItemDragStart: (event: ReactDragEvent, node: FinderNode) => void;
  onStartRename: (node: FinderNode) => void;
}

function ListTable({
  items,
  selectedIds,
  activeId,
  renamingId,
  renameValue,
  onRenameChange,
  onCommitRename,
  onCancelRename,
  onItemClick,
  onItemDoubleClick,
  onItemContextMenu,
  onItemDragStart,
  onStartRename,
}: ListTableProps): JSX.Element {
  return (
    <div className="finder-list" role="grid" aria-label="File list">
      <div className="finder-list__head" role="row">
        <div className="finder-list__cell finder-list__cell--name" role="columnheader">
          Name
        </div>
        <div className="finder-list__cell finder-list__cell--date" role="columnheader">
          Date Modified
        </div>
        <div className="finder-list__cell finder-list__cell--size" role="columnheader">
          Size
        </div>
        <div className="finder-list__cell finder-list__cell--kind" role="columnheader">
          Kind
        </div>
      </div>
      <div className="finder-list__body">
        {items.map((node) => {
          const classes = [
            'finder-list__row',
            selectedIds.has(node.id) ? 'finder-list__row--selected' : '',
            activeId === node.id ? 'finder-list__row--active' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={node.id}
              className={classes}
              role="row"
              draggable={renamingId !== node.id}
              onClick={(event) => onItemClick(event, node)}
              onDoubleClick={() => onItemDoubleClick(node)}
              onContextMenu={(event) => onItemContextMenu(event, node)}
              onDragStart={(event) => onItemDragStart(event, node)}
              data-node-id={node.id}
            >
              <div className="finder-list__cell finder-list__cell--name" role="gridcell">
                <span className="finder-list__icon" aria-hidden="true">
                  {node.icon}
                </span>
                {renamingId === node.id ? (
                  <input
                    autoFocus
                    className="finder-list__rename"
                    value={renameValue}
                    onChange={(event) => onRenameChange(event.target.value)}
                    onBlur={onCommitRename}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') onCommitRename();
                      else if (event.key === 'Escape') onCancelRename();
                    }}
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : (
                  <span
                    className="finder-list__name"
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      onStartRename(node);
                    }}
                  >
                    {node.name}
                  </span>
                )}
              </div>
              <div className="finder-list__cell finder-list__cell--date" role="gridcell">
                {formatDate(node.modifiedAt)}
              </div>
              <div className="finder-list__cell finder-list__cell--size" role="gridcell">
                {node.kind === 'folder' ? '--' : formatBytes(node.size)}
              </div>
              <div className="finder-list__cell finder-list__cell--kind" role="gridcell">
                {node.kindLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Get Info dialog
// ---------------------------------------------------------------------------

interface GetInfoDialogProps {
  node: FinderNode;
  parent: FinderNode | null;
  onClose: () => void;
  onMoveToTrash: () => void;
}

function GetInfoDialog({
  node,
  parent,
  onClose,
  onMoveToTrash,
}: GetInfoDialogProps): JSX.Element {
  return (
    <div className="finder-info__backdrop" onClick={onClose} role="presentation">
      <div
        className="finder-info"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`${node.name} info`}
      >
        <div className="finder-info__titlebar">
          <div className="finder-info__icon" aria-hidden="true">
            {node.icon}
          </div>
          <div className="finder-info__title">{node.name}</div>
          <button
            type="button"
            className="finder-info__close"
            onClick={onClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        <div className="finder-info__body">
          <div className="finder-info__row">
            <span className="finder-info__label">Kind:</span>
            <span className="finder-info__value">{node.kindLabel}</span>
          </div>
          <div className="finder-info__row">
            <span className="finder-info__label">Size:</span>
            <span className="finder-info__value">
              {node.kind === 'folder' ? '--' : formatBytes(node.size)}
            </span>
          </div>
          <div className="finder-info__row">
            <span className="finder-info__label">Where:</span>
            <span className="finder-info__value">
              {parent ? parent.name : node.inTrash ? 'Trash' : 'Top level'}
            </span>
          </div>
          <div className="finder-info__row">
            <span className="finder-info__label">Modified:</span>
            <span className="finder-info__value">{formatDate(node.modifiedAt)}</span>
          </div>
          {node.tagIds.length > 0 && (
            <div className="finder-info__row">
              <span className="finder-info__label">Tags:</span>
              <span className="finder-info__value">
                {node.tagIds
                  .map((id) => TAGS.find((t) => t.id === id)?.label ?? id)
                  .join(', ')}
              </span>
            </div>
          )}
          {node.inTrash && (
            <div className="finder-info__row finder-info__row--warning">
              <Info size={14} />
              <span className="finder-info__value">
                This item is in the Trash. Move it back to recover.
              </span>
            </div>
          )}
        </div>
        <div className="finder-info__actions">
          {!node.inTrash && (
            <button
              type="button"
              className="finder-info__btn finder-info__btn--danger"
              onClick={onMoveToTrash}
            >
              <Trash2 size={14} />
              <span>Move to Trash</span>
            </button>
          )}
          <button
            type="button"
            className="finder-info__btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Finder;
