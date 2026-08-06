import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Search as SearchIcon } from 'lucide-react';

import { useOSStore } from '../store/osStore';

interface FileEntry {
  id: string;
  name: string;
  kind: 'folder' | 'file' | 'image' | 'document';
}

const MOCK_FILES: FileEntry[] = [
  { id: 'file-1', name: 'Annual Report.pdf', kind: 'document' },
  { id: 'file-2', name: 'Vacation Photos', kind: 'folder' },
  { id: 'file-3', name: 'Meeting Notes.txt', kind: 'file' },
  { id: 'file-4', name: 'Family Photo.jpg', kind: 'image' },
  { id: 'file-5', name: 'Project Roadmap.pdf', kind: 'document' },
  { id: 'file-6', name: 'Receipts', kind: 'folder' },
];

const FILE_ICONS: Record<FileEntry['kind'], string> = {
  folder: '📁',
  file: '📄',
  image: '🖼️',
  document: '📃',
};

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  kind: 'app' | 'file';
}

function fileIcon(kind: FileEntry['kind']): string {
  return FILE_ICONS[kind];
}

function describeFileKind(kind: FileEntry['kind']): string {
  switch (kind) {
    case 'folder':
      return 'Folder';
    case 'file':
      return 'Document';
    case 'image':
      return 'Image';
    case 'document':
      return 'PDF';
  }
}

/**
 * Centered search overlay (Cmd+Space). Searches apps + mock files, supports
 * arrow-key navigation and Enter to launch/open. Escape closes.
 */
export function Spotlight(): JSX.Element {
  const isOpen = useOSStore((state) => state.spotlightOpen);
  const apps = useOSStore((state) => state.apps);
  const closeSpotlight = useOSStore((state) => state.closeSpotlight);
  const launchApp = useOSStore((state) => state.launchApp);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOpen]);

  const results = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Show a curated "top hits" list when the query is empty.
      const appHits: SearchResult[] = Object.values(apps)
        .slice(0, 4)
        .map((app) => ({
          id: `app-${app.id}`,
          title: app.name,
          subtitle: 'Application',
          icon: app.icon,
          kind: 'app' as const,
        }));
      return appHits;
    }
    const appHits: SearchResult[] = Object.values(apps)
      .filter((app) => app.name.toLowerCase().includes(trimmed))
      .map((app) => ({
        id: `app-${app.id}`,
        title: app.name,
        subtitle: 'Application',
        icon: app.icon,
        kind: 'app' as const,
      }));
    const fileHits: SearchResult[] = MOCK_FILES.filter((file) =>
      file.name.toLowerCase().includes(trimmed),
    ).map((file) => ({
      id: `file-${file.id}`,
      title: file.name,
      subtitle: describeFileKind(file.kind),
      icon: fileIcon(file.kind),
      kind: 'file' as const,
    }));
    return [...appHits, ...fileHits];
  }, [apps, query]);

  // Keep selectedIndex in range when results change.
  useEffect(() => {
    setSelectedIndex((current) => {
      if (results.length === 0) return 0;
      if (current >= results.length) return results.length - 1;
      return current;
    });
  }, [results]);

  const activate = useCallback(
    (result: SearchResult): void => {
      if (result.kind === 'app') {
        const appId = result.id.replace(/^app-/, '');
        launchApp(appId);
      }
      // For files we have no opener in Chunk 3; just close the overlay.
      closeSpotlight();
    },
    [closeSpotlight, launchApp],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((current) => (current + 1) % results.length);
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((current) =>
            current <= 0 ? results.length - 1 : current - 1,
          );
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const result = results[selectedIndex];
        if (result) activate(result);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeSpotlight();
      }
    },
    [activate, closeSpotlight, results, selectedIndex],
  );

  const handleBackgroundMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      // Close on background click only — ignore clicks inside the panel.
      if (event.target === event.currentTarget) {
        closeSpotlight();
      }
    },
    [closeSpotlight],
  );

  if (!isOpen) return <></>;

  return (
    <div
      className="spotlight"
      role="dialog"
      aria-modal="true"
      aria-label="Spotlight search"
      onMouseDown={handleBackgroundMouseDown}
    >
      <div className="spotlight__panel">
        <div className="spotlight__input-row">
          <SearchIcon aria-hidden="true" />
          <input
            ref={inputRef}
            className="spotlight__input"
            placeholder="Spotlight Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Spotlight search"
            aria-controls="spotlight-results"
            aria-activedescendant={
              results[selectedIndex]
                ? `spotlight-result-${results[selectedIndex].id}`
                : undefined
            }
            role="combobox"
            aria-expanded
            aria-autocomplete="list"
          />
        </div>
        <div className="spotlight__results" role="listbox" id="spotlight-results">
          {results.length === 0 ? (
            <div className="spotlight__empty">No results</div>
          ) : (
            results.map((result, index) => {
              const classes = [
                'spotlight__result',
                index === selectedIndex ? 'spotlight__result--selected' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <div
                  key={result.id}
                  id={`spotlight-result-${result.id}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={classes}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    activate(result);
                  }}
                >
                  <span className="spotlight__result-icon" aria-hidden="true">
                    {result.icon}
                  </span>
                  <span className="spotlight__result-text">
                    <span className="spotlight__result-title">{result.title}</span>
                    <span className="spotlight__result-subtitle">
                      {result.subtitle}
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Spotlight;
