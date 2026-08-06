import { useMemo, useState } from 'react';
import { ROOT_ID, useFsStore } from '../../os/fsStore';
import { useWindowStore } from '../../os/windowStore';
import { useTextEditIntent } from '../../os/textEditIntent';
import { useAppMenuActions } from '../../os/menuActionStore';
import './finder.css';

const FAVORITES = [
  { id: ROOT_ID, name: 'Macintosh HD', icon: '💻' },
  { id: 'desktop', name: 'Desktop', icon: '🖥️' },
  { id: 'documents', name: 'Documents', icon: '📄' },
  { id: 'downloads', name: 'Downloads', icon: '⬇️' },
];

export default function Finder({ windowId }: { windowId: string }) {
  const nodes = useFsStore((s) => s.nodes);
  const children = useFsStore((s) => s.children);
  const getPath = useFsStore((s) => s.getPath);
  const createFolder = useFsStore((s) => s.createFolder);
  const remove = useFsStore((s) => s.remove);
  const rename = useFsStore((s) => s.rename);
  const openApp = useWindowStore((s) => s.openApp);
  const setTitle = useWindowStore((s) => s.setTitle);
  const setPendingFile = useTextEditIntent((s) => s.setPending);

  const [currentId, setCurrentId] = useState(ROOT_ID);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'icon' | 'list'>('icon');
  const [history, setHistory] = useState<string[]>([ROOT_ID]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const path = useMemo(() => getPath(currentId), [nodes, currentId]);
  const items = useMemo(() => children(currentId), [nodes, currentId]);

  const navigate = (id: string) => {
    const newHistory = [...history.slice(0, historyIdx + 1), id];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    setCurrentId(id);
    setSelectedId(null);
    setTitle(windowId, path.length ? `Finder` : 'Finder');
  };

  const goBack = () => {
    if (historyIdx === 0) return;
    setHistoryIdx(historyIdx - 1);
    setCurrentId(history[historyIdx - 1]);
  };
  const goForward = () => {
    if (historyIdx >= history.length - 1) return;
    setHistoryIdx(historyIdx + 1);
    setCurrentId(history[historyIdx + 1]);
  };

  useAppMenuActions(windowId, {
    newFolder: () => createFolder(currentId),
    viewIcon: () => setView('icon'),
    viewList: () => setView('list'),
  });

  const openItem = (id: string, type: 'folder' | 'file') => {
    if (type === 'folder') {
      navigate(id);
    } else {
      const newWindowId = openApp('textedit', {});
      setPendingFile(newWindowId, id);
    }
  };

  return (
    <div className="finder">
      <div className="finder-toolbar">
        <button onClick={goBack} disabled={historyIdx === 0}>
          ‹
        </button>
        <button onClick={goForward} disabled={historyIdx >= history.length - 1}>
          ›
        </button>
        <div className="finder-breadcrumb">
          {path.map((p, i) => (
            <span key={p.id}>
              {i > 0 && <span className="finder-sep">›</span>}
              <span className="finder-crumb" onClick={() => navigate(p.id)}>
                {p.name}
              </span>
            </span>
          ))}
        </div>
        <div className="finder-toolbar-actions">
          <button onClick={() => createFolder(currentId)}>New Folder</button>
          <button onClick={() => setView(view === 'icon' ? 'list' : 'icon')}>
            {view === 'icon' ? 'List View' : 'Icon View'}
          </button>
        </div>
      </div>
      <div className="finder-body">
        <div className="finder-sidebar">
          <div className="finder-sidebar-title">Favorites</div>
          {FAVORITES.map((f) => (
            <div
              key={f.id}
              className={`finder-sidebar-item ${currentId === f.id ? 'active' : ''}`}
              onClick={() => navigate(f.id)}
            >
              <span>{f.icon}</span> {f.name}
            </div>
          ))}
        </div>
        <div
          className={`finder-content ${view}`}
          onClick={() => setSelectedId(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {items.length === 0 && <div className="finder-empty">This folder is empty</div>}
          {items.map((item) => (
            <div
              key={item.id}
              className={`finder-item ${selectedId === item.id ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openItem(item.id, item.type);
              }}
            >
              <div className="finder-item-icon">{item.type === 'folder' ? '📁' : '📝'}</div>
              {renamingId === item.id ? (
                <input
                  className="finder-rename-input"
                  autoFocus
                  defaultValue={item.name}
                  onBlur={(e) => {
                    rename(item.id, e.target.value || item.name);
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                />
              ) : (
                <div
                  className="finder-item-name"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (item.type === 'folder') openItem(item.id, item.type);
                  }}
                >
                  {item.name}
                </div>
              )}
              {selectedId === item.id && (
                <div className="finder-item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(item.id);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(item.id);
                      setSelectedId(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="finder-status">{items.length} items</div>
    </div>
  );
}
