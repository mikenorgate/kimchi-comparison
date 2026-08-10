import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Share2,
  Plus,
  Search,
  Globe,
  Star,
  Mail,
  Music,
  Calendar,
  Image,
  FileText,
  Cloud,
  Newspaper,
  ShoppingBag,
} from 'lucide-react';
import SystemIcon from '../SystemIcon.jsx';

/**
 * SafariApp
 *
 * Tahoe-style Safari browser window rendered as the body content for
 * the `safari` appId inside a `<Window />`. Pure UI mock — no real
 * browsing, no persistence, no network. The component owns its own
 * local React state for tabs, the active tab, and the address bar.
 *
 * Layout (top to bottom):
 *   - Tab bar: list of mock tabs (one by default) plus a new-tab (+)
 *     button. Clicking the new-tab button appends a tab and selects it.
 *     Clicking a tab activates it.
 *   - Toolbar: back, forward, reload, share buttons (Lucide icons).
 *   - Address bar row: editable URL input with a Reader / AA button.
 *   - Content area: mock start page with a centered search/address
 *     suggestion input and a grid of mock favorites/bookmarks.
 *
 * Exposes `data-testid` hooks used by the test suite:
 *   - safari-toolbar, safari-back, safari-forward, safari-reload, safari-share
 *   - safari-address-bar, safari-reader-toggle
 *   - safari-tab-bar, safari-tab, safari-new-tab
 *   - safari-content, safari-favorites, safari-favorite
 *   - safari-search-input
 */

const DEFAULT_TABS = Object.freeze([
  { id: 'start', title: 'Start Page' },
]);

const MOCK_FAVORITES = Object.freeze([
  { id: 'apple', label: 'Apple', icon: Globe, href: 'apple.com' },
  { id: 'mail', label: 'Mail', icon: Mail, href: 'mail.example.com' },
  { id: 'music', label: 'Music', icon: Music, href: 'music.example.com' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: 'calendar.example.com' },
  { id: 'photos', label: 'Photos', icon: Image, href: 'photos.example.com' },
  { id: 'notes', label: 'Notes', icon: FileText, href: 'notes.example.com' },
  { id: 'weather', label: 'Weather', icon: Cloud, href: 'weather.example.com' },
  { id: 'news', label: 'News', icon: Newspaper, href: 'news.example.com' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, href: 'shop.example.com' },
]);

const READER_LABEL = 'Reader';

let tabIdCounter = 0;
function makeTabId() {
  // Avoid pulling crypto.randomUUID into the bundle. A monotonically
  // increasing counter is sufficient for purely in-memory tab ids.
  tabIdCounter += 1;
  return `tab-${tabIdCounter}`;
}

function SafariApp() {
  const [tabs, setTabs] = useState(() => DEFAULT_TABS.map((t) => ({ ...t })));
  const [activeTabId, setActiveTabId] = useState(
    () => DEFAULT_TABS[0].id,
  );
  const [address, setAddress] = useState('startpage://home');
  const [readerActive, setReaderActive] = useState(false);

  const handleSelectTab = useCallback((tabId) => {
    setActiveTabId(tabId);
  }, []);

  const handleAddTab = useCallback(() => {
    setTabs((current) => {
      const newTab = {
        id: makeTabId(),
        title: `Tab ${current.length + 1}`,
      };
      setActiveTabId(newTab.id);
      return [...current, newTab];
    });
  }, []);

  const handleReaderToggle = useCallback(() => {
    setReaderActive((current) => !current);
  }, []);

  const handleAddressChange = useCallback((event) => {
    setAddress(event.target.value);
  }, []);

  const activeTab =
    tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null;

  return (
    <div
      data-testid="safari-app"
      data-app-id="safari"
      className="flex flex-col h-full w-full bg-white/95 text-gray-900 overflow-hidden"
    >
      {/* Tab bar */}
      <div
        data-testid="safari-tab-bar"
        role="tablist"
        aria-label="Browser tabs"
        className="flex items-center gap-1 px-2 py-1 bg-gray-100/90 border-b border-black/10"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Tab: ${tab.title}`}
              data-testid="safari-tab"
              data-tab-id={tab.id}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => handleSelectTab(tab.id)}
              className={
                `max-w-[180px] flex-1 truncate px-3 py-1 text-xs rounded-t-md ` +
                `transition-colors focus:outline-none focus-visible:ring-2 ` +
                `focus-visible:ring-blue-400/70 ` +
                (isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300/80')
              }
            >
              {tab.title}
            </button>
          );
        })}
        <button
          type="button"
          data-testid="safari-new-tab"
          aria-label="New tab"
          title="New tab"
          onClick={handleAddTab}
          className="ml-1 inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-700 hover:bg-gray-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <SystemIcon icon={Plus} size="sm" strokeWidth={1.75} />
        </button>
      </div>

      {/* Toolbar */}
      <div
        data-testid="safari-toolbar"
        role="toolbar"
        aria-label="Browser toolbar"
        className="flex items-center gap-1 px-2 py-1.5 bg-gray-50/90 border-b border-black/10"
      >
        <button
          type="button"
          data-testid="safari-back"
          aria-label="Go back"
          title="Back"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-700 hover:bg-gray-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <SystemIcon icon={ChevronLeft} size="sm" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          data-testid="safari-forward"
          aria-label="Go forward"
          title="Forward"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-700 hover:bg-gray-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <SystemIcon icon={ChevronRight} size="sm" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          data-testid="safari-reload"
          aria-label="Reload page"
          title="Reload"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-700 hover:bg-gray-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <SystemIcon icon={RotateCcw} size="sm" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          data-testid="safari-share"
          aria-label="Share"
          title="Share"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-700 hover:bg-gray-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <SystemIcon icon={Share2} size="sm" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          data-testid="safari-favorite"
          aria-label="Add to favorites"
          title="Add to favorites"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-700 hover:bg-gray-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <SystemIcon icon={Star} size="sm" strokeWidth={1.75} />
        </button>
      </div>

      {/* Address bar */}
      <div
        data-testid="safari-address-bar"
        className="flex items-center gap-2 px-2 py-1.5 bg-gray-50/90 border-b border-black/10"
      >
        <span aria-hidden="true" className="text-gray-500">
          <SystemIcon icon={Globe} size="sm" strokeWidth={1.5} />
        </span>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          aria-label="Address"
          placeholder="Search or enter website"
          data-testid="safari-address-input"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 h-7 px-3 text-sm bg-white/80 border border-black/10 rounded-md outline-none focus:ring-2 focus:ring-blue-400/60"
        />
        <button
          type="button"
          data-testid="safari-reader-toggle"
          aria-label={READER_LABEL}
          aria-pressed={readerActive}
          data-pressed={readerActive ? 'true' : 'false'}
          title={READER_LABEL}
          onClick={handleReaderToggle}
          className={
            `inline-flex items-center justify-center min-w-[2rem] h-7 px-1.5 text-[11px] font-semibold ` +
            `rounded-md transition-colors focus:outline-none focus-visible:ring-2 ` +
            `focus-visible:ring-blue-400/70 ` +
            (readerActive
              ? 'bg-blue-500/90 text-white'
              : 'text-gray-700 hover:bg-gray-300/80')
          }
        >
          AA
        </button>
      </div>

      {/* Content */}
      <div
        data-testid="safari-content"
        data-tab-id={activeTab ? activeTab.id : null}
        className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-gray-100"
      >
        <div
          data-testid="safari-search"
          className="flex flex-col items-center pt-10 px-4"
        >
          <div className="text-2xl font-semibold text-gray-700 mb-3">
            Safari
          </div>
          <div
            data-testid="safari-search-row"
            className="flex items-center gap-2 w-full max-w-xl h-10 px-3 bg-white/90 border border-black/10 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-400/60"
          >
            <span aria-hidden="true" className="text-gray-500">
              <SystemIcon icon={Search} size="sm" strokeWidth={1.5} />
            </span>
            <input
              type="text"
              aria-label="Search the web"
              placeholder="Search the web"
              data-testid="safari-search-input"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div
          data-testid="safari-favorites"
          aria-label="Favorites"
          className="px-6 pb-6 mt-8"
        >
          <div
            data-testid="safari-favorites-header"
            className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
          >
            Favorites
          </div>
          <div
            data-testid="safari-favorites-grid"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
          >
            {MOCK_FAVORITES.map((favorite) => {
              const IconComponent = favorite.icon;
              return (
                <button
                  key={favorite.id}
                  type="button"
                  data-testid="safari-favorite"
                  data-favorite-id={favorite.id}
                  aria-label={favorite.label}
                  title={favorite.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
                    <SystemIcon
                      icon={IconComponent}
                      size="md"
                      strokeWidth={1.5}
                      className="text-blue-600"
                    />
                  </span>
                  <span className="text-xs text-gray-800 truncate max-w-full">
                    {favorite.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SafariApp;
export { DEFAULT_TABS, MOCK_FAVORITES, READER_LABEL };
