import { useMemo, useState } from 'react';
import SystemIcon from '../SystemIcon.jsx';
import {
  FAVORITES,
  LOCATIONS,
  MOCK_LOCATIONS,
  DEFAULT_LOCATION_ID,
  iconForItem,
  getItemsForLocation,
  findSidebarEntry,
} from './data/finderData.js';

/**
 * FinderApp
 *
 * Pure presentational mock of the macOS Finder window. Two-pane layout:
 *   - Left sidebar with two sections (Favorites, Locations) rendered as
 *     a vertical list of selectable entries.
 *   - Right content area populated with mock items for the currently
 *     selected location.
 *
 * The component is self-contained: no filesystem access, no persistence,
 * no global state. Selection is tracked in local React state and the
 * mock data lives in `./data/finderData.js`.
 *
 * Props: none. The component is intended to be mounted directly inside
 * a `<Window>` body by WindowManager when the window's appId is
 * `'finder'`.
 */
function FinderApp() {
  const [selectedId, setSelectedId] = useState(DEFAULT_LOCATION_ID);

  const items = useMemo(() => getItemsForLocation(selectedId), [selectedId]);
  const headerEntry = useMemo(() => findSidebarEntry(selectedId), [selectedId]);
  const headerName = headerEntry ? headerEntry.entry.name : '';

  return (
    <div
      data-testid="finder"
      data-selected={selectedId}
      className="flex h-full w-full text-white/90 text-sm"
    >
      <aside
        data-testid="finder-sidebar"
        aria-label="Finder sidebar"
        className="w-56 shrink-0 overflow-y-auto p-2 border-r border-white/10 glass"
      >
        <SidebarSection
          testId="finder-favorites"
          heading="Favorites"
          entries={FAVORITES}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <SidebarSection
          testId="finder-locations"
          heading="Locations"
          entries={LOCATIONS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <section
        data-testid="finder-main"
        className="flex-1 flex flex-col min-w-0"
      >
        <header
          data-testid="finder-header"
          className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs uppercase tracking-wide text-white/70"
        >
          <span data-testid="finder-location-name">{headerName}</span>
          <span data-testid="finder-item-count" aria-live="polite">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </header>

        <div
          data-testid="finder-grid"
          role="grid"
          aria-label={`Files in ${headerName}`}
          className="flex-1 overflow-y-auto p-4 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3 content-start"
        >
          {items.length === 0 ? (
            <div
              data-testid="finder-empty"
              className="col-span-full text-center text-white/60 py-12"
            >
              This folder is empty.
            </div>
          ) : (
            items.map((item) => (
              <FinderItem
                key={item.id}
                item={item}
                onActivate={() => {
                  if (item.kind === 'folder') {
                    if (
                      Object.prototype.hasOwnProperty.call(
                        MOCK_LOCATIONS,
                        item.id,
                      )
                    ) {
                      setSelectedId(item.id);
                    }
                  }
                }}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SidebarSection({ testId, heading, entries, selectedId, onSelect }) {
  return (
    <div
      data-testid={testId}
      role="group"
      aria-label={heading}
      className="mb-3"
    >
      <div
        data-testid={`${testId}-heading`}
        className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/60"
      >
        {heading}
      </div>
      <ul
        data-testid={`${testId}-list`}
        className="flex flex-col gap-0.5"
      >
        {entries.map((entry) => {
          const isSelected = entry.id === selectedId;
          const Icon = entry.icon;
          return (
            <li key={entry.id}>
              <button
                type="button"
                data-testid={`finder-sidebar-item-${entry.id}`}
                data-selected={isSelected ? 'true' : 'false'}
                aria-pressed={isSelected}
                onClick={() => onSelect(entry.id)}
                className={
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ' +
                  (isSelected
                    ? 'bg-white/25 text-white'
                    : 'hover:bg-white/15 text-white/85')
                }
              >
                <span
                  data-testid={`finder-sidebar-icon-${entry.id}`}
                  aria-hidden="true"
                  className="flex items-center justify-center w-5 h-5 shrink-0 text-white/80"
                >
                  <SystemIcon icon={Icon} size="sm" />
                </span>
                <span className="truncate">{entry.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FinderItem({ item, onActivate }) {
  const Icon = iconForItem(item);
  const isFolder = item.kind === 'folder';
  const handleClick = () => {
    if (typeof onActivate === 'function') {
      onActivate();
    }
  };
  const handleKeyDown = (event) => {
    if (event && (event.key === 'Enter' || event.key === ' ')) {
      if (event.preventDefault) event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      data-testid="finder-item"
      data-item-id={item.id}
      data-item-kind={item.kind}
      data-item-name={item.name}
      role="gridcell"
      aria-label={item.name}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="flex flex-col items-center justify-start gap-1 p-2 rounded-lg hover:bg-white/15 focus:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
    >
      <span
        data-testid="finder-item-icon"
        aria-hidden="true"
        className="flex items-center justify-center w-10 h-10 text-white/85"
      >
        <SystemIcon icon={Icon} size="lg" />
      </span>
      <span
        data-testid="finder-item-name"
        className="w-full text-center text-xs text-white/90 truncate"
      >
        {item.name}
      </span>
      {isFolder ? (
        <span className="sr-only">Folder</span>
      ) : null}
    </button>
  );
}

export default FinderApp;
export { FinderApp };
