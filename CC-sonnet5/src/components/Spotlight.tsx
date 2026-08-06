import { useEffect, useMemo, useRef, useState } from 'react';
import { APPS } from '../os/appRegistry';
import { useWindowStore } from '../os/windowStore';
import { useFsStore } from '../os/fsStore';
import { useTextEditIntent } from '../os/textEditIntent';
import './spotlight.css';

interface Result {
  id: string;
  label: string;
  sub: string;
  icon: string;
  onSelect: () => void;
}

export default function Spotlight({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useWindowStore((s) => s.openApp);
  const nodes = useFsStore((s) => s.nodes);
  const setPendingFile = useTextEditIntent((s) => s.setPending);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const appResults: Result[] = APPS.filter((a) => a.title.toLowerCase().includes(q)).map((a) => ({
      id: `app-${a.id}`,
      label: a.title,
      sub: 'Application',
      icon: a.icon,
      onSelect: () => {
        openApp(a.id);
        onClose();
      },
    }));
    const fileResults: Result[] = nodes
      .filter((n) => n.type === 'file' && n.name.toLowerCase().includes(q))
      .map((n) => ({
        id: `file-${n.id}`,
        label: n.name,
        sub: 'Document',
        icon: '📝',
        onSelect: () => {
          const windowId = openApp('textedit');
          setPendingFile(windowId, n.id);
          onClose();
        },
      }));
    return [...appResults, ...fileResults].slice(0, 8);
  }, [query, nodes]);

  useEffect(() => setIndex(0), [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') setIndex((i) => Math.min(i + 1, results.length - 1));
    if (e.key === 'ArrowUp') setIndex((i) => Math.max(i - 1, 0));
    if (e.key === 'Enter') results[index]?.onSelect();
  };

  return (
    <div className="spotlight-overlay" onClick={onClose}>
      <div className="spotlight-box" onClick={(e) => e.stopPropagation()}>
        <div className="spotlight-input-row">
          <span className="spotlight-icon">🔍</span>
          <input
            ref={inputRef}
            className="spotlight-input"
            placeholder="Spotlight Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {results.length > 0 && (
          <div className="spotlight-results">
            {results.map((r, i) => (
              <div
                key={r.id}
                className={`spotlight-result ${i === index ? 'active' : ''}`}
                onMouseEnter={() => setIndex(i)}
                onClick={r.onSelect}
              >
                <span className="spotlight-result-icon">{r.icon}</span>
                <div>
                  <div className="spotlight-result-label">{r.label}</div>
                  <div className="spotlight-result-sub">{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
