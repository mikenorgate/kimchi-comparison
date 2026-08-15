import { useState, useEffect, useMemo, useRef } from 'react';
import { stockApps, getAppById } from '../config/apps';
import { useWindows } from '../context/WindowContext';
import { useTheme } from '../context/ThemeContext';
import './Spotlight.css';

const RECENT_ITEMS = [
  { id: 'recent-1', title: 'Tahoe Design Ideas', subtitle: 'Notes', type: 'note' },
  { id: 'recent-2', title: 'Q3 Roadmap', subtitle: 'Pages', type: 'doc' },
  { id: 'recent-3', title: 'Screenshot.png', subtitle: 'Desktop', type: 'image' },
  { id: 'recent-4', title: 'Team Lunch', subtitle: 'Calendar', type: 'event' },
];

const ACTIONS = [
  { id: 'action-1', title: 'Toggle Dark Mode', subtitle: 'System', shortcut: '⌃⌥⌘T' },
  { id: 'action-2', title: 'Open Home Folder', subtitle: 'Finder', shortcut: '⇧⌘H' },
  { id: 'action-3', title: 'Show Desktop', subtitle: 'Window Manager', shortcut: 'F11' },
  { id: 'action-4', title: 'Lock Screen', subtitle: 'System', shortcut: '⌃⌘Q' },
];

export default function Spotlight({ open, onClose }) {
  const { openWindow } = useWindows();
  const { toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const appResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stockApps
      .filter((app) => app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  const sections = useMemo(() => {
    if (!query.trim()) {
      return [
        { title: 'Recent Items', items: RECENT_ITEMS },
        { title: 'Actions', items: ACTIONS },
      ];
    }
    return [
      { title: 'Applications', items: appResults },
      { title: 'Actions', items: ACTIONS.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())) },
    ];
  }, [query, appResults]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const launch = (item) => {
    if (!item) return;
    if (item.id && getAppById(item.id)) {
      openWindow(item.id);
    } else if (item.title === 'Toggle Dark Mode') {
      toggleTheme();
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      launch(flatItems[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="spotlight-overlay"
      onClick={onClose}
      role="presentation"
      data-testid="spotlight-overlay"
    >
      <div
        className="spotlight-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Spotlight"
      >
        <div className="spotlight-search">
          <span className="spotlight-icon">⌕</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            aria-label="Spotlight search"
            className="spotlight-input"
          />
        </div>
        <div className="spotlight-results">
          {flatItems.length === 0 ? (
            <div className="spotlight-empty">No results</div>
          ) : (
            sections.map((section) =>
              section.items.length > 0 ? (
                <div key={section.title} className="spotlight-section">
                  <div className="spotlight-section-title">{section.title}</div>
                  {section.items.map((item) => {
                    const globalIndex = flatItems.indexOf(item);
                    const isApp = !!getAppById(item.id);
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        className={`spotlight-result ${isSelected ? 'selected' : ''}`}
                        onClick={() => launch(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span
                          className="spotlight-result-icon"
                          style={{ background: isApp ? item.color : '#8E8E93' }}
                        >
                          {isApp ? item.name[0] : item.title[0]}
                        </span>
                        <div className="spotlight-result-meta">
                          <span className="spotlight-result-title">{item.name || item.title}</span>
                          <span className="spotlight-result-subtitle">
                            {item.name ? 'Application' : item.subtitle}
                            {item.shortcut ? ` · ${item.shortcut}` : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null
            )
          )}
        </div>
      </div>
    </div>
  );
}
