import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { useOSStore } from '../store/osStore';
import type { AppDefinition } from '../types/os';

/**
 * Full-screen blurred overlay with a search bar and an app grid. Typing
 * filters apps; pressing Escape or clicking the background closes it.
 */
export function Launchpad(): JSX.Element {
  const isOpen = useOSStore((state) => state.launchpadOpen);
  const apps = useOSStore((state) => state.apps);
  const closeLaunchpad = useOSStore((state) => state.closeLaunchpad);
  const launchApp = useOSStore((state) => state.launchApp);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus the search input when the overlay opens.
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      // Defer focus to the next tick so the input is mounted.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOpen]);

  const filtered = useMemo<AppDefinition[]>(() => {
    const all = Object.values(apps);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return all;
    return all.filter(
      (app) =>
        app.name.toLowerCase().includes(trimmed) ||
        app.category.toLowerCase().includes(trimmed),
    );
  }, [apps, query]);

  const handleLaunch = useCallback(
    (app: AppDefinition): void => {
      launchApp(app.id);
      closeLaunchpad();
    },
    [closeLaunchpad, launchApp],
  );

  const handleBackgroundClick = (
    event: ReactMouseEvent<HTMLDivElement>,
  ): void => {
    // Close when clicking outside the inner panel — but ignore clicks on the
    // search input or the grid (which should not dismiss the launchpad).
    if (event.target === event.currentTarget) {
      closeLaunchpad();
    }
  };

  const handleKeyDown = useCallback(
    (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        if (query) {
          setQuery('');
        } else {
          closeLaunchpad();
        }
      }
    },
    [closeLaunchpad, query],
  );

  // Global Escape listener — also handled by App, but this is a defensive
  // double-bind so the launchpad closes reliably.
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen) return <></>;

  return (
    <div
      className="launchpad"
      role="dialog"
      aria-modal="true"
      aria-label="Launchpad"
      onClick={handleBackgroundClick}
      onContextMenu={(event) => event.preventDefault()}
    >
      <input
        ref={inputRef}
        type="text"
        className="launchpad__search"
        placeholder="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && filtered.length > 0) {
            handleLaunch(filtered[0] as AppDefinition);
          }
        }}
        aria-label="Search applications"
      />
      {filtered.length === 0 ? (
        <div className="launchpad__empty">No applications found</div>
      ) : (
        <div className="launchpad__grid">
          {filtered.map((app) => (
            <button
              key={app.id}
              type="button"
              className="launchpad__app"
              onClick={() => handleLaunch(app)}
            >
              <span className="launchpad__app-icon" aria-hidden="true">
                {app.icon}
              </span>
              <span className="launchpad__app-label">{app.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Launchpad;
