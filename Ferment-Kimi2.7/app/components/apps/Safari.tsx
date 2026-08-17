'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Plus,
  X,
  Lock,
  Globe,
  Search,
  Star,
} from 'lucide-react';

export interface Tab {
  id: string;
  url: string;
  title: string;
}

const START_PAGE = {
  url: 'favorites://',
  title: 'Favorites',
};

const MOCK_PAGES: Record<string, { title: string; body: React.ReactNode }> = {
  'favorites://': {
    title: 'Favorites',
    body: (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Globe className="h-8 w-8 text-accent" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold">Safari</h1>
        <p className="mb-8 opacity-60">A fast, energy-efficient browser.</p>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="mb-1 font-semibold">example.com</h2>
            <p className="text-sm opacity-60">A placeholder page for testing the address bar.</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="mb-1 font-semibold">search</h2>
            <p className="text-sm opacity-60">Mock search results for any query.</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="mb-1 font-semibold">Apple</h2>
            <p className="text-sm opacity-60">Innovative products and services.</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="mb-1 font-semibold">GitHub</h2>
            <p className="text-sm opacity-60">Where the world builds software.</p>
          </div>
        </div>
      </div>
    ),
  },
  'example.com': {
    title: 'Example Domain',
    body: (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="mb-4 text-2xl font-semibold">Example Domain</h1>
        <p className="mb-4 opacity-80">
          This domain is for use in illustrative examples in documents. You may use this domain in
          literature without prior coordination or asking for permission.
        </p>
        <p className="opacity-60">
          More information is available on the example.com website.
        </p>
      </div>
    ),
  },
  'search': {
    title: 'Search Results',
    body: (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="mb-6 text-2xl font-semibold">Search Results</h1>
        <div className="space-y-4">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="font-semibold text-accent">Result 1</h2>
            <p className="text-sm opacity-60">A mock search result to demonstrate Safari content.</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="font-semibold text-accent">Result 2</h2>
            <p className="text-sm opacity-60">Another mock result for the interactive browser.</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--window-border)' }}>
            <h2 className="font-semibold text-accent">Result 3</h2>
            <p className="text-sm opacity-60">Yet another placeholder result.</p>
          </div>
        </div>
      </div>
    ),
  },
};

function normalizeUrl(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return START_PAGE.url;
  if (trimmed.includes('://')) return trimmed.split('://')[1] || START_PAGE.url;
  return trimmed;
}

export function Safari() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-1', ...START_PAGE }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [inputUrl, setInputUrl] = useState(START_PAGE.url);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId]
  );

  const page = useMemo(() => {
    const key = normalizeUrl(activeTab.url);
    return MOCK_PAGES[key] ?? MOCK_PAGES['search'];
  }, [activeTab]);

  const updateActiveTab = (patch: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, ...patch } : t)));
  };

  const navigate = (url: string) => {
    const key = normalizeUrl(url);
    const next = { url: key, title: MOCK_PAGES[key]?.title ?? 'Search' };
    updateActiveTab(next);
    setInputUrl(next.url);
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs((prev) => [...prev, { id, ...START_PAGE }]);
    setActiveTabId(id);
    setInputUrl(START_PAGE.url);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (remaining.length === 0) {
        const home = { id: `tab-${Date.now()}`, ...START_PAGE };
        setActiveTabId(home.id);
        setInputUrl(START_PAGE.url);
        return [home];
      }
      if (activeTabId === id) {
        const idx = prev.findIndex((t) => t.id === id);
        const next = remaining[idx] ?? remaining[remaining.length - 1];
        setActiveTabId(next.id);
        setInputUrl(next.url);
      }
      return remaining;
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <div
        className="flex items-center gap-2 border-b px-2 py-1.5"
        style={{ borderColor: 'var(--window-border)' }}
      >
        <div className="flex items-center gap-1">
          <button className="rounded-md p-1 hover:bg-foreground/5" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button className="rounded-md p-1 hover:bg-foreground/5" aria-label="Forward">
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1 hover:bg-foreground/5"
            aria-label="Reload"
            onClick={() => navigate(inputUrl)}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(inputUrl);
          }}
        >
          <Lock className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-40" />
          <input
            data-testid="safari-address-bar"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full rounded-lg border bg-transparent py-1 pl-7 pr-8 text-center text-sm outline-none"
            style={{ borderColor: 'var(--window-border)' }}
          />
          <button
            type="submit"
            data-testid="safari-search-button"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 hover:bg-foreground/5"
          >
            <Search className="h-3 w-3 opacity-60" />
          </button>
        </form>
        <button className="rounded-md p-1 hover:bg-foreground/5" aria-label="Share">
          <Star className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex items-center gap-1 border-b px-2 py-1"
        style={{ borderColor: 'var(--window-border)' }}
        data-testid="safari-tabs"
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-testid={`safari-tab-${tab.id}`}
            onClick={() => {
              setActiveTabId(tab.id);
              setInputUrl(tab.url);
            }}
            className={`group flex max-w-[140px] flex-1 cursor-default items-center justify-between gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
              activeTabId === tab.id ? 'bg-foreground/10 font-medium' : 'hover:bg-foreground/5'
            }`}
          >
            <span className="truncate">{tab.title}</span>
            <button
              data-testid={`safari-close-tab-${tab.id}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="rounded-md p-0.5 opacity-0 group-hover:opacity-100 hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          data-testid="safari-new-tab"
          onClick={addTab}
          className="rounded-md p-1 hover:bg-foreground/5"
          aria-label="New tab"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4" data-testid="safari-page">
        {page.body}
      </div>
    </div>
  );
}
