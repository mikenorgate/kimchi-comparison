/**
 * Safari — macOS Tahoe browser shell with mock pages.
 *
 * Features:
 * - Tab bar: open/close/switch tabs, new tab button
 * - Bookmarks bar: clickable bookmarks that navigate
 * - Start page: shown on new tabs with favorite shortcuts
 * - Address bar: type a URL to navigate to mock pages
 * - Back/forward navigation within tab history
 * - No real network — all pages are bundled mock content
 */

import { useState, useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { MOCK_PAGES, BOOKMARKS, findPage } from './mock-pages';

// ── Types ─────────────────────────────────────────────────────────

interface SafariTab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
}

interface SafariProps {
  appId: string;
}

// ── Helpers ───────────────────────────────────────────────────────

let tabCounter = 0;

function createTab(url = 'safari:start'): SafariTab {
  const page = findPage(url);
  return {
    id: `safari-tab-${tabCounter++}`,
    url,
    title: page?.title ?? 'New Tab',
    history: [url],
    historyIndex: 0,
  };
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'safari:start';

  // Direct match against known pages
  const exact = MOCK_PAGES.find((p) => p.url === trimmed);
  if (exact) return exact.url;

  // Try adding common prefixes
  const withCom = trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const match = MOCK_PAGES.find(
    (p) => p.url.includes(withCom) || withCom.includes(p.url),
  );
  if (match) return match.url;

  // If it looks like a search query (has spaces or no dots), go to search
  if (trimmed.includes(' ') || !trimmed.includes('.')) {
    return 'search.mock';
  }

  return trimmed;
}

// ── Main Safari Component ────────────────────────────────────────

export function Safari({ appId: _appId }: SafariProps) {
  const [tabs, setTabs] = useState<SafariTab[]>([createTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [addressBarValue, setAddressBarValue] = useState('');
  const addressBarRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const currentPage = findPage(activeTab.url);
  const PageContent = currentPage?.render ?? MOCK_PAGES[0].render;

  const updateTab = useCallback((tabId: string, updates: Partial<SafariTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  }, []);

  const navigateTo = useCallback((tabId: string, url: string) => {
    const normalized = normalizeUrl(url);
    const page = findPage(normalized);
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        const newHistory = t.history.slice(0, t.historyIndex + 1);
        newHistory.push(normalized);
        return {
          ...t,
          url: normalized,
          title: page?.title ?? normalized,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),
    );
    setAddressBarValue('');
  }, []);

  const goBack = useCallback(() => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const url = activeTab.history[newIndex];
      const page = findPage(url);
      updateTab(activeTabId, {
        url,
        historyIndex: newIndex,
        title: page?.title ?? url,
      });
    }
  }, [activeTab, activeTabId, updateTab]);

  const goForward = useCallback(() => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const url = activeTab.history[newIndex];
      const page = findPage(url);
      updateTab(activeTabId, {
        url,
        historyIndex: newIndex,
        title: page?.title ?? url,
      });
    }
  }, [activeTab, activeTabId, updateTab]);

  const addTab = useCallback(() => {
    const newTab = createTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setAddressBarValue('');
  }, []);

  const closeTab = useCallback((tabId: string) => {
    let newActiveId = activeTabId;
    setTabs((prev) => {
      if (prev.length <= 1) {
        const fresh = createTab();
        newActiveId = fresh.id;
        return [fresh];
      }
      const filtered = prev.filter((t) => t.id !== tabId);
      if (tabId === activeTabId) {
        newActiveId = filtered[filtered.length - 1].id;
      }
      return filtered;
    });
    setActiveTabId(newActiveId);
  }, [activeTabId]);

  const handleAddressBarKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigateTo(activeTabId, addressBarValue);
    }
    if (e.key === 'Escape') {
      setAddressBarValue('');
      (e.target as HTMLInputElement).blur();
    }
  }, [activeTabId, addressBarValue, navigateTo]);

  const handleAddressBarFocus = useCallback(() => {
    setAddressBarValue(activeTab.url);
    setTimeout(() => addressBarRef.current?.select(), 0);
  }, [activeTab.url]);

  return (
    <div className="flex flex-col h-full w-full" data-testid="safari-root">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5" data-testid="safari-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-1.5 px-3 py-1 rounded-md cursor-pointer text-xs max-w-40 ${
              tab.id === activeTabId
                ? 'bg-white/80 dark:bg-gray-700/80 text-black dark:text-white'
                : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            onClick={() => { setActiveTabId(tab.id); setAddressBarValue(''); }}
            data-testid={`safari-tab-${tab.id}`}
          >
            <span className="text-xs">{findPage(tab.url)?.favicon ?? '🌐'}</span>
            <span className="truncate">{tab.title}</span>
            <button
              className="rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-black/10 dark:hover:bg-white/10 text-black/40 dark:text-white/40"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              data-testid={`safari-tab-close-${tab.id}`}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="px-2 py-1 text-xs text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80"
          onClick={addTab}
          data-testid="safari-new-tab"
        >
          +
        </button>
      </div>

      {/* Toolbar with navigation + address bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5 dark:border-white/5 bg-black/3 dark:bg-white/3">
        <button
          className="text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80 disabled:opacity-20 px-1"
          onClick={goBack}
          disabled={activeTab.historyIndex === 0}
          data-testid="safari-back"
        >
          ‹
        </button>
        <button
          className="text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80 disabled:opacity-20 px-1"
          onClick={goForward}
          disabled={activeTab.historyIndex >= activeTab.history.length - 1}
          data-testid="safari-forward"
        >
          ›
        </button>
        <div className="flex-1 flex items-center gap-1 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10">
          <span className="text-xs text-black/40 dark:text-white/40">🔒</span>
          <input
            ref={addressBarRef}
            type="text"
            placeholder="Search or enter website name"
            className="flex-1 bg-transparent text-sm text-black/80 dark:text-white/80 outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
            value={addressBarValue}
            onChange={(e) => setAddressBarValue(e.target.value)}
            onKeyDown={handleAddressBarKeyDown}
            onFocus={handleAddressBarFocus}
            data-testid="safari-address-bar"
          />
        </div>
      </div>

      {/* Bookmarks bar */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-black/5 dark:border-white/5 bg-black/3 dark:bg-white/3 overflow-x-auto" data-testid="safari-bookmarks">
        {BOOKMARKS.map((bookmark) => (
          <button
            key={bookmark.url}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 whitespace-nowrap"
            onClick={() => navigateTo(activeTabId, bookmark.url)}
            data-testid={`safari-bookmark-${bookmark.url.replace(/[^a-z0-9]/gi, '-')}`}
          >
            <span className="text-xs">{bookmark.favicon}</span>
            <span>{bookmark.title}</span>
          </button>
        ))}
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden" data-testid="safari-content">
        <PageContent />
      </div>
    </div>
  );
}
