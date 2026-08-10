/**
 * Mock pages for Safari — bundled, no real network.
 * Each page is identified by a URL-like string and rendered as JSX content.
 */

import type { ComponentType } from 'react';

// ── Mock Page Definitions ─────────────────────────────────────────

export interface MockPage {
  url: string;
  title: string;
  favicon: string;
  render: ComponentType;
}

// ── Start Page ────────────────────────────────────────────────────

function StartPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Start Page</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Favorites</p>
      <div className="grid grid-cols-4 gap-4 max-w-lg">
        {MOCK_PAGES.slice(1).map((page) => (
          <div key={page.url} className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center text-2xl">
              {page.favicon}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300">{page.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Apple-like mock pages ─────────────────────────────────────────

function ApplePage() {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-semibold text-gray-900 dark:text-white">🍎 Apple</span>
        <span className="mx-4">Store</span>
        <span className="mx-4">Mac</span>
        <span className="mx-4">iPad</span>
        <span className="mx-4">iPhone</span>
        <span className="mx-4">Watch</span>
      </div>
      <div className="px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">MacBook Pro</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Mind-blowing. Head-turning.</p>
        <div className="text-2xl">💻✨</div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Mac</h1>
      <div className="space-y-2 text-gray-600 dark:text-gray-300">
        <p><strong>MacBook Pro (Tahoe Web)</strong></p>
        <p>Chip: Apple M3 Pro (mock)</p>
        <p>Memory: 16 GB (mock)</p>
        <p>macOS: Tahoe 26.0 (Build 20A360)</p>
        <p>Serial: WEB000000THT</p>
      </div>
    </div>
  );
}

function SearchPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8">
      <div className="text-5xl mb-6">🔍</div>
      <div className="w-full max-w-md px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400">
        Search the web (mock)...
      </div>
    </div>
  );
}

function NewsPage() {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📰 News</h1>
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Tahoe Liquid Glass Design Wins Awards</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">The new design language has been praised for its translucency and depth...</p>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">New Web App Recreates macOS Experience</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">A faithful recreation of macOS Tahoe runs entirely in the browser...</p>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Tech: The Future of Web Apps</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Modern CSS backdrop-filter enables real glass UIs...</p>
        </div>
      </div>
    </div>
  );
}

function MapsPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-green-50 dark:bg-green-950 p-8">
      <div className="text-5xl mb-4">🗺️</div>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Maps (Mock)</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Location: Cupertino, CA</p>
      <div className="mt-4 w-64 h-32 rounded-lg bg-gradient-to-br from-green-200 to-green-400 dark:from-green-800 dark:to-green-600 flex items-center justify-center">
        <span className="text-3xl">📍</span>
      </div>
    </div>
  );
}

// ── Mock Pages Registry ──────────────────────────────────────────

export const MOCK_PAGES: MockPage[] = [
  { url: 'safari:start', title: 'Start Page', favicon: '🏠', render: StartPage },
  { url: 'apple.com', title: 'Apple', favicon: '🍎', render: ApplePage },
  { url: 'about:mac', title: 'About This Mac', favicon: '💻', render: AboutPage },
  { url: 'search.mock', title: 'Search', favicon: '🔍', render: SearchPage },
  { url: 'news.mock', title: 'News', favicon: '📰', render: NewsPage },
  { url: 'maps.mock', title: 'Maps', favicon: '🗺️', render: MapsPage },
];

export function findPage(url: string): MockPage | undefined {
  // Try exact match first, then prefix match
  return MOCK_PAGES.find((p) => p.url === url)
    ?? MOCK_PAGES.find((p) => url.includes(p.url) || p.url.includes(url));
}

export const BOOKMARKS = MOCK_PAGES.slice(1); // All except start page
