import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import type { ReactElement } from 'react';
import type { SafariPageMode, SafariState, SafariTab } from './types';
import {
  safariFavorites,
  safariFrequentlyVisited,
} from '../../data/safariFavorites';

function BackIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ForwardIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ReloadIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function ReaderIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function ShareIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98" />
      <path d="M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function CloseIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SafariIcon({ className = 'h-6 w-6' }: { className?: string }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 4l2 8-2 8-2-8 2-8z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M4 12l8-2 8 2-8 2-8-2z"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  );
}

let nextTabId = 1;

function generateTabId(): string {
  nextTabId += 1;
  return `tab-${nextTabId}`;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//iu.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase();
}

function createStartTab(id: string): SafariTab {
  return {
    id,
    title: 'Start Page',
    url: '',
    mode: 'start' satisfies SafariPageMode,
    history: [],
    historyIndex: -1,
  };
}

function initialState(): SafariState {
  const firstTab = createStartTab(generateTabId());
  return {
    tabs: [firstTab],
    activeTabId: firstTab.id,
  };
}

export function Safari() {
  const [state, setState] = useState<SafariState>(initialState);
  const [addressValue, setAddressValue] = useState('');
  const [startQuery, setStartQuery] = useState('');

  const activeTab = useMemo(
    () => state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0],
    [state],
  );

  useEffect(() => {
    if (!activeTab) {
      setAddressValue('');
      return;
    }
    setAddressValue(activeTab.mode === 'page' ? activeTab.url : '');
  }, [activeTab]);

  const canGoBack = activeTab?.mode === 'page' && activeTab.historyIndex > 0;
  const canGoForward =
    activeTab?.mode === 'page' &&
    activeTab.historyIndex < activeTab.history.length - 1;

  function updateActiveTab(updater: (tab: SafariTab) => SafariTab): void {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === prev.activeTabId ? updater(tab) : tab,
      ),
    }));
  }

  function navigateToUrl(rawUrl: string): void {
    const url = normalizeUrl(rawUrl);
    if (!url) {
      return;
    }
    const domain = getDomain(url);
    updateActiveTab((tab) => {
      const nextHistory = tab.history.slice(0, tab.historyIndex + 1);
      nextHistory.push(url);
      return {
        ...tab,
        mode: 'page',
        url,
        title: domain,
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
      };
    });
  }

  function goBack(): void {
    if (!canGoBack || !activeTab) {
      return;
    }
    updateActiveTab((tab) => {
      const nextIndex = tab.historyIndex - 1;
      const url = tab.history[nextIndex];
      return {
        ...tab,
        url,
        title: getDomain(url),
        historyIndex: nextIndex,
      };
    });
  }

  function goForward(): void {
    if (!canGoForward || !activeTab) {
      return;
    }
    updateActiveTab((tab) => {
      const nextIndex = tab.historyIndex + 1;
      const url = tab.history[nextIndex];
      return {
        ...tab,
        url,
        title: getDomain(url),
        historyIndex: nextIndex,
      };
    });
  }

  function reload(): void {
    // Visual placeholder: the current URL stays in place.
  }

  function openNewTab(): void {
    setState((prev) => {
      const newTab = createStartTab(generateTabId());
      return {
        tabs: [...prev.tabs, newTab],
        activeTabId: newTab.id,
      };
    });
  }

  function closeTab(tabId: string): void {
    setState((prev) => {
      if (prev.tabs.length === 1) {
        const replacement = createStartTab(generateTabId());
        return {
          tabs: [replacement],
          activeTabId: replacement.id,
        };
      }

      const nextTabs = prev.tabs.filter((tab) => tab.id !== tabId);
      const nextActiveId =
        prev.activeTabId === tabId
          ? nextTabs[nextTabs.length - 1].id
          : prev.activeTabId;
      return {
        tabs: nextTabs,
        activeTabId: nextActiveId,
      };
    });
  }

  function switchTab(tabId: string): void {
    setState((prev) => ({
      ...prev,
      activeTabId: tabId,
    }));
  }

  function handleAddressSubmit(event: FormEvent): void {
    event.preventDefault();
    navigateToUrl(addressValue);
  }

  function handleStartSearchSubmit(event: FormEvent): void {
    event.preventDefault();
    navigateToUrl(startQuery);
    setStartQuery('');
  }

  function renderTab(tab: SafariTab, index: number) {
    const isActive = tab.id === state.activeTabId;
    const label = tab.mode === 'page' ? tab.title : 'Start Page';

    function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        switchTab(tab.id);
      }
    }

    return (
      <div
        key={tab.id}
        role="tab"
        tabIndex={0}
        aria-selected={isActive}
        data-testid={`safari-tab-${index}`}
        onClick={() => switchTab(tab.id)}
        onKeyDown={handleTabKeyDown}
        className={[
          'group flex min-w-[5.5rem] max-w-[10rem] flex-1 cursor-default items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors outline-none focus:ring-2 focus:ring-tahoe-blue/50',
          isActive
            ? 'bg-tahoe-glass-light text-tahoe-text'
            : 'text-tahoe-muted hover:bg-tahoe-glass/40 hover:text-tahoe-text',
        ].join(' ')}
      >
        <span className="truncate">{label}</span>
        <button
          type="button"
          aria-label={`Close ${label} tab`}
          data-testid={`safari-tab-close-${index}`}
          onClick={(event) => {
            event.stopPropagation();
            closeTab(tab.id);
          }}
          className="rounded-md p-0.5 text-tahoe-muted opacity-60 hover:bg-tahoe-red/10 hover:text-tahoe-red group-hover:opacity-100"
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  function renderTabBar() {
    return (
      <div
        data-testid="safari-tab-bar"
        className="flex items-center gap-1 border-b border-tahoe-border/50 bg-tahoe-glass/30 px-2 py-1.5 backdrop-blur-md"
      >
        <div className="flex flex-1 items-center gap-1 overflow-x-auto pr-2">
          {state.tabs.map(renderTab)}
        </div>
        <button
          type="button"
          aria-label="New tab"
          data-testid="safari-new-tab"
          onClick={openNewTab}
          className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-tahoe-muted transition-colors hover:bg-tahoe-glass/50 hover:text-tahoe-text"
        >
          <PlusIcon />
        </button>
      </div>
    );
  }

  function renderAddressBar() {
    return (
      <div
        data-testid="safari-address-bar"
        className="flex items-center gap-2 border-b border-tahoe-border/50 bg-tahoe-glass/20 px-3 py-2"
      >
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Back"
            data-testid="safari-nav-back"
            disabled={!canGoBack}
            onClick={goBack}
            className="rounded-md p-1.5 text-tahoe-text transition-colors hover:bg-tahoe-glass/50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <BackIcon />
          </button>
          <button
            type="button"
            aria-label="Forward"
            data-testid="safari-nav-forward"
            disabled={!canGoForward}
            onClick={goForward}
            className="rounded-md p-1.5 text-tahoe-text transition-colors hover:bg-tahoe-glass/50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ForwardIcon />
          </button>
          <button
            type="button"
            aria-label="Reload"
            data-testid="safari-nav-reload"
            onClick={reload}
            className="rounded-md p-1.5 text-tahoe-text transition-colors hover:bg-tahoe-glass/50"
          >
            <ReloadIcon />
          </button>
        </div>
        <form className="flex flex-1" onSubmit={handleAddressSubmit}>
          <input
            type="text"
            aria-label="Address"
            data-testid="safari-address-input"
            placeholder="Search or enter address"
            value={addressValue}
            onChange={(event) => setAddressValue(event.target.value)}
            className="w-full rounded-full border border-tahoe-border/50 bg-tahoe-glass/60 px-4 py-1 text-sm text-tahoe-text placeholder:text-tahoe-muted focus:outline-none focus:ring-2 focus:ring-tahoe-blue/50"
          />
        </form>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Reader view"
            data-testid="safari-reader-button"
            className="rounded-md p-1.5 text-tahoe-text transition-colors hover:bg-tahoe-glass/50"
          >
            <ReaderIcon />
          </button>
          <button
            type="button"
            aria-label="Share"
            data-testid="safari-share-button"
            className="rounded-md p-1.5 text-tahoe-text transition-colors hover:bg-tahoe-glass/50"
          >
            <ShareIcon />
          </button>
        </div>
      </div>
    );
  }

  function renderFavoriteTile(favorite: (typeof safariFavorites)[number]) {
    return (
      <button
        key={favorite.id}
        type="button"
        data-testid={`safari-favorite-${favorite.id}`}
        onClick={() => navigateToUrl(favorite.url)}
        className="flex flex-col items-center gap-2 rounded-xl border border-transparent p-3 transition-colors hover:bg-tahoe-glass/40 hover:border-tahoe-border/30"
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold text-white shadow-sm"
          style={{ backgroundColor: favorite.color }}
        >
          {getInitial(favorite.title)}
        </div>
        <span className="text-xs text-tahoe-text">{favorite.title}</span>
      </button>
    );
  }

  function renderStartPage() {
    return (
      <div
        data-testid="safari-start-page"
        className="flex min-h-full flex-col items-center justify-center gap-8 p-6"
      >
        <form
          className="w-full max-w-md"
          onSubmit={handleStartSearchSubmit}
        >
          <input
            type="text"
            aria-label="Search or enter address"
            data-testid="safari-start-search"
            placeholder="Search or enter address"
            value={startQuery}
            onChange={(event) => setStartQuery(event.target.value)}
            className="w-full rounded-full border border-tahoe-border/50 bg-tahoe-glass/60 px-5 py-2.5 text-center text-sm text-tahoe-text placeholder:text-tahoe-muted shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-tahoe-blue/50"
          />
        </form>

        <div className="w-full max-w-2xl">
          <h2 className="mb-3 text-center text-sm font-semibold text-tahoe-muted">
            Favorites
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {safariFavorites.map(renderFavoriteTile)}
          </div>
        </div>

        <div className="w-full max-w-2xl">
          <h2 className="mb-3 text-sm font-semibold text-tahoe-muted">
            Frequently Visited
          </h2>
          <div className="flex flex-wrap gap-2">
            {safariFrequentlyVisited.map((site) => (
              <button
                key={site.id}
                type="button"
                data-testid={`safari-frequent-${site.id}`}
                onClick={() => navigateToUrl(site.url)}
                className="rounded-lg border border-tahoe-border/50 bg-tahoe-glass/40 px-3 py-1.5 text-sm text-tahoe-text transition-colors hover:bg-tahoe-glass/60"
              >
                {site.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderPageView() {
    const domain = activeTab?.url ? getDomain(activeTab.url) : '';
    const initial = getInitial(domain);

    return (
      <div
        data-testid="safari-page-view"
        className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tahoe-blue text-2xl font-bold text-white shadow-md">
          {initial}
        </div>
        <h2
          data-testid="safari-page-domain"
          className="text-xl font-semibold text-tahoe-text"
        >
          {domain}
        </h2>
        <p className="max-w-md text-sm text-tahoe-muted">
          Welcome to {domain}. This is a simulated page view for the Tahoe Web
          Desktop Safari app.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-b-2xl bg-tahoe-glass/20 text-tahoe-text">
      {renderTabBar()}
      {renderAddressBar()}
      <div className="flex-1 overflow-auto">
        {activeTab?.mode === 'start' ? renderStartPage() : renderPageView()}
      </div>
    </div>
  );
}

export default Safari;
