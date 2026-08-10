import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Search, FileText } from 'lucide-react';
import SystemIcon from './SystemIcon.jsx';
import AppIcon, { CURATED_APP_IDS } from './AppIcon.jsx';

/**
 * Spotlight
 *
 * Tahoe-style Spotlight search overlay. Renders a modal bar near the
 * top of the viewport with a search input and a filtered results list
 * spanning two sections: the 12 curated apps and a small list of mock
 * documents. Pure UI mock — no real search service, no persistence.
 *
 * Behavior:
 *   - Hidden by default. The component tracks its own open state, but
 *     can be controlled externally via the `isOpen` / `onClose` props.
 *     When `isOpen` is provided, it is treated as the source of truth.
 *   - Cmd+Space / Ctrl+Space toggles the overlay (regardless of whether
 *     the input has focus). When the input does have focus the shortcut
 *     still toggles, matching macOS behavior.
 *   - Escape closes the overlay.
 *   - ArrowUp / ArrowDown move a single selection through the visible
 *     (filtered) results list, wrapping around at the ends.
 *   - Enter activates the current selection: apps invoke
 *     `onOpenApp(appId)`, mock files invoke `onOpenFile(file)` (and the
 *     overlay closes regardless).
 *   - Clicking a result activates it and closes the overlay.
 *   - The search input receives focus as soon as the overlay opens and
 *     is re-focused when the overlay closes and reopens.
 *   - Backdrop clicks close the overlay.
 *
 * Props:
 *   - isOpen (boolean, optional): controlled open state. When omitted,
 *     the component manages its own open state.
 *   - onClose (function, optional): called when the overlay closes via
 *     any mechanism (Escape, shortcut, backdrop, click, Enter).
 *   - onOpenApp (function, optional): called as `onOpenApp(appId)` when
 *     an app result is activated.
 *   - onOpenFile (function, optional): called as `onOpenFile(file)`
 *     when a mock file result is activated. The overlay still closes
 *     when Enter is pressed on a file even if this prop is omitted.
 *   - className (string, optional): extra classes appended to the root
 *     overlay wrapper.
 */

const APP_LABELS = Object.freeze({
  safari: 'Safari',
  messages: 'Messages',
  phone: 'Phone',
  photos: 'Photos',
  notes: 'Notes',
  calendar: 'Calendar',
  calculator: 'Calculator',
  settings: 'Settings',
  games: 'Games',
  journal: 'Journal',
  music: 'Music',
  mail: 'Mail',
});

const MOCK_FILES = Object.freeze([
  { id: 'vacation-plans', name: 'Vacation Plans.txt', kind: 'document' },
  { id: 'budget-2026', name: 'Budget 2026.numbers', kind: 'spreadsheet' },
  { id: 'project-tahoe', name: 'Project Tahoe.pdf', kind: 'pdf' },
  { id: 'notes-archive', name: 'Notes Archive.md', kind: 'document' },
]);

function buildApps() {
  return CURATED_APP_IDS.map((appId) => ({
    id: appId,
    name: APP_LABELS[appId] ?? appId,
    section: 'apps',
  }));
}

function isActivationShortcut(event) {
  if (event.key !== ' ' && event.code !== 'Space') return false;
  return event.metaKey === true || event.ctrlKey === true;
}

function Spotlight({
  isOpen: controlledIsOpen,
  onClose,
  onOpenApp,
  onOpenFile,
  className = '',
}) {
  const apps = useMemo(buildApps, []);

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  const closeOverlay = useCallback(() => {
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [isControlled, onClose]);

  const openOverlay = useCallback(() => {
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  }, [isControlled]);

  const toggleOverlay = useCallback(() => {
    if (isOpen) {
      closeOverlay();
    } else {
      openOverlay();
    }
  }, [isOpen, closeOverlay, openOverlay]);

  // Global keyboard listener: Cmd+Space / Ctrl+Space toggles. Escape
  // closes when the overlay is open. Ignore Escape when the event
  // originated inside the overlay panel — the input handler covers it
  // and we don't want to double-fire `onClose`.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isActivationShortcut(event)) {
        event.preventDefault();
        toggleOverlay();
        return;
      }
      if (isOpen && event.key === 'Escape') {
        const panel = overlayRef.current;
        const insidePanel =
          panel && event.target instanceof Node && panel.contains(event.target);
        if (!insidePanel) {
          event.preventDefault();
          closeOverlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleOverlay, closeOverlay]);

  // Reset state and focus the input whenever the overlay opens.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    setQuery('');
    setSelectedIndex(0);
    // Focus synchronously — refs are populated before effects run.
    const input = inputRef.current;
    if (input && typeof input.focus === 'function') {
      input.focus();
    }
    return undefined;
  }, [isOpen]);

  // Filter results based on the current query.
  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((app) => app.name.toLowerCase().includes(q));
  }, [apps, query]);

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_FILES.slice();
    return MOCK_FILES.filter((file) =>
      file.name.toLowerCase().includes(q),
    );
  }, [query]);

  const flatResults = useMemo(() => {
    const items = [];
    for (const app of filteredApps) {
      items.push({ kind: 'app', data: app });
    }
    for (const file of filteredFiles) {
      items.push({ kind: 'file', data: file });
    }
    return items;
  }, [filteredApps, filteredFiles]);

  const noResults =
    filteredApps.length === 0 && filteredFiles.length === 0;

  // Clamp the selected index whenever the result list shrinks.
  useEffect(() => {
    if (flatResults.length === 0) {
      setSelectedIndex(0);
      return;
    }
    if (selectedIndex >= flatResults.length) {
      setSelectedIndex(flatResults.length - 1);
    }
  }, [flatResults.length, selectedIndex]);

  const handleSelect = useCallback(
    (index) => {
      if (flatResults.length === 0) return;
      const safeIndex = Math.max(0, Math.min(index, flatResults.length - 1));
      setSelectedIndex(safeIndex);
      const item = flatResults[safeIndex];
      if (!item) return;
      if (item.kind === 'app') {
        if (typeof onOpenApp === 'function') {
          onOpenApp(item.data.id);
        }
      } else if (item.kind === 'file') {
        if (typeof onOpenFile === 'function') {
          onOpenFile(item.data);
        }
      }
      closeOverlay();
    },
    [flatResults, onOpenApp, onOpenFile, closeOverlay],
  );

  const handleInputKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (flatResults.length === 0) return;
        setSelectedIndex((current) => (current + 1) % flatResults.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (flatResults.length === 0) return;
        setSelectedIndex((current) => {
          if (current <= 0) return flatResults.length - 1;
          return current - 1;
        });
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSelect(selectedIndex);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
        return;
      }
      // Cmd/Ctrl+Space toggles even when focus is inside the input.
      if (isActivationShortcut(event)) {
        event.preventDefault();
        toggleOverlay();
        return;
      }
    },
    [flatResults.length, selectedIndex, handleSelect, closeOverlay, toggleOverlay],
  );

  const handleBackdropMouseDown = useCallback(
    (event) => {
      if (event.target === overlayRef.current) {
        closeOverlay();
      }
    },
    [closeOverlay],
  );

  if (!isOpen) {
    return null;
  }

  let runningIndex = 0;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      data-testid="spotlight-overlay"
      // Backdrop click closes the modal; the inner panel stops propagation.
      // The dialog remains keyboard-accessible via Escape + Cmd/Ctrl+Space.
      onMouseDown={handleBackdropMouseDown}
      className={`fixed inset-0 z-[60] flex justify-center pt-24 px-4 ` +
        `bg-black/30 backdrop-blur-sm ${className}`.trim()}
    >
      {/* Inner panel stops backdrop mousedown so clicks inside don't close. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight search"
        data-testid="spotlight-panel"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-2xl window-glass overflow-hidden text-gray-900 dark:text-gray-50"
      >
        <div
          data-testid="spotlight-search-row"
          className="flex items-center gap-3 px-4 py-3 border-b border-black/10 dark:border-white/10"
        >
          <span aria-hidden="true" className="text-gray-500 dark:text-gray-300">
            <SystemIcon icon={Search} size="lg" strokeWidth={1.5} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Spotlight Search"
            aria-label="Spotlight search"
            data-testid="spotlight-input"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div
          data-testid="spotlight-results"
          role="listbox"
          aria-label="Spotlight results"
          className="max-h-[55vh] overflow-y-auto py-2"
        >
          {noResults ? (
            <div
              data-testid="spotlight-empty"
              className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              No results
            </div>
          ) : null}

          {filteredApps.length > 0 ? (
            <div data-testid="spotlight-section-apps">
              <div
                data-testid="spotlight-section-header-apps"
                className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Apps
              </div>
              {filteredApps.map((app) => {
                const idx = runningIndex;
                runningIndex += 1;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`app-${app.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`spotlight-result-${app.id}`}
                    data-result-kind="app"
                    data-result-index={idx}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(idx);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={
                      `w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ` +
                      (isSelected
                        ? 'bg-blue-500/20'
                        : 'hover:bg-black/5 dark:hover:bg-white/10')
                    }
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/40 dark:bg-white/10">
                      <AppIcon appId={app.id} size="md" />
                    </span>
                    <span className="text-sm">{app.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {filteredFiles.length > 0 ? (
            <div data-testid="spotlight-section-files">
              <div
                data-testid="spotlight-section-header-files"
                className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Documents
              </div>
              {filteredFiles.map((file) => {
                const idx = runningIndex;
                runningIndex += 1;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`file-${file.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`spotlight-result-${file.id}`}
                    data-result-kind="file"
                    data-result-index={idx}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(idx);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={
                      `w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ` +
                      (isSelected
                        ? 'bg-blue-500/20'
                        : 'hover:bg-black/5 dark:hover:bg-white/10')
                    }
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-200">
                      <SystemIcon icon={FileText} size="md" />
                    </span>
                    <span className="text-sm">{file.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Spotlight;
export { CURATED_APP_IDS, MOCK_FILES, APP_LABELS };
