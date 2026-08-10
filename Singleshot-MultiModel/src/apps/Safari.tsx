import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  RotateCw,
  ShieldCheck,
  X,
  Star,
} from 'lucide-react';
import { useAppDataStore } from '../stores/appDataStore';
import { useWindowStore } from '../stores/windowStore';

interface SafariProps {
  windowId: string;
}

const HOMEPAGE_URL = 'tahoe://home';

interface HistoryEntry {
  /** Canonical url for navigation. Use HOMEPAGE_URL for the welcome page. */
  url: string;
  /** Human-friendly label shown in the address bar and recorded in recents. */
  title: string;
}

function normalizeInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return HOMEPAGE_URL;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('about:')) return trimmed;
  // Bare host (e.g. "example.com") or "host/path" → assume https.
  return `https://${trimmed}`;
}

function deriveTitle(url: string): string {
  if (url === HOMEPAGE_URL) return 'Welcome';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') || url;
  } catch {
    return url;
  }
}

function HomePage({ onPick }: { onPick: (url: string) => void }) {
  const tiles = [
    { label: 'Apple', url: 'https://www.apple.com' },
    { label: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { label: 'Hacker News', url: 'https://news.ycombinator.com' },
    { label: 'MDN', url: 'https://developer.mozilla.org' },
  ];
  return (
    <div
      data-testid="safari-homepage"
      className="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 text-slate-800"
    >
      <div className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <Compass className="h-7 w-7 text-blue-500" />
        <span>Welcome to Safari</span>
      </div>
      <p className="max-w-md text-center text-sm text-slate-600">
        Type a URL in the address bar and press Enter or Return. Some sites may
        block embedding in a sandboxed iframe — that is expected.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <button
            key={tile.url}
            type="button"
            data-testid={`safari-home-tile-${tile.label}`}
            onClick={() => onPick(tile.url)}
            className="flex h-20 w-32 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow"
          >
            <span className="text-sm font-medium text-slate-800">{tile.label}</span>
            <span className="mt-1 truncate text-[10px] text-slate-500">{tile.url}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        <span>Sandboxed browsing — your activity stays on this device.</span>
      </div>
    </div>
  );
}

export default function Safari({ windowId }: SafariProps) {
  const recent = useAppDataStore((s) => s.safariRecent);
  const addRecent = useAppDataStore((s) => s.addRecentUrl);
  const clearRecent = useAppDataStore((s) => s.clearRecentUrls);
  const setWindowTitle = useWindowStore((s) => s.setTitle);

  const [history, setHistory] = useState<HistoryEntry[]>([
    { url: HOMEPAGE_URL, title: 'Welcome' },
  ]);
  const [index, setIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [draft, setDraft] = useState(() =>
    (history[0]?.url === HOMEPAGE_URL ? '' : history[0]?.url) ?? ''
  );
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const current = history[index] ?? { url: HOMEPAGE_URL, title: 'Welcome' };
  const canBack = index > 0;
  const canForward = index < history.length - 1;
  const onHome = current.url === HOMEPAGE_URL;

  // Sync the address bar draft with the current entry so the bar always
  // reflects where we actually are.
  useEffect(() => {
    setDraft(current.url === HOMEPAGE_URL ? '' : current.url);
  }, [current.url]);

  // Update the window title as the page changes.
  useEffect(() => {
    const title = onHome ? 'Safari — Welcome' : `Safari — ${current.title}`;
    setWindowTitle(windowId, title);
  }, [current.title, onHome, setWindowTitle, windowId]);

  const navigate = useCallback(
    (raw: string, recordRecent: boolean) => {
      const url = normalizeInput(raw);
      if (url === HOMEPAGE_URL) {
        // Going home: don't store in recents.
        const nextHistory = history.slice(0, index + 1);
        nextHistory.push({ url: HOMEPAGE_URL, title: 'Welcome' });
        setHistory(nextHistory);
        setIndex(nextHistory.length - 1);
        setReloadKey((k) => k + 1);
        return;
      }
      const title = deriveTitle(url);
      const nextHistory = history.slice(0, index + 1);
      nextHistory.push({ url, title });
      setHistory(nextHistory);
      setIndex(nextHistory.length - 1);
      setReloadKey((k) => k + 1);
      if (recordRecent) {
        addRecent(url, title);
      }
    },
    [addRecent, history, index],
  );

  const goBack = useCallback(() => {
    if (!canBack) return;
    setIndex((i) => Math.max(0, i - 1));
  }, [canBack]);

  const goForward = useCallback(() => {
    if (!canForward) return;
    setIndex((i) => Math.min(history.length - 1, i + 1));
  }, [canForward, history.length]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const goHome = useCallback(() => {
    navigate(HOMEPAGE_URL, false);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    navigate(draft, true);
  };

  const recentSorted = useMemo(() => recent, [recent]);

  return (
    <div
      data-testid="safari-root"
      data-window-id={windowId}
      className="flex h-full w-full flex-col bg-slate-50 text-slate-800"
    >
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="safari-back"
            onClick={goBack}
            disabled={!canBack}
            aria-label="Go back"
            className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            data-testid="safari-forward"
            onClick={goForward}
            disabled={!canForward}
            aria-label="Go forward"
            className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            data-testid="safari-reload"
            onClick={reload}
            disabled={onHome}
            aria-label="Reload page"
            className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center"
          data-testid="safari-address-form"
        >
          <div className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <input
              ref={addressInputRef}
              type="text"
              inputMode="url"
              data-testid="safari-address"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search or enter website name"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              aria-label="Address bar"
            />
            {draft && (
              <button
                type="button"
                data-testid="safari-clear"
                onClick={() => setDraft('')}
                aria-label="Clear address"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>
        <button
          type="button"
          data-testid="safari-home"
          onClick={goHome}
          aria-label="Go to homepage"
          className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
        >
          <Star className="h-4 w-4" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-56 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 sm:block">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Recents
            </h2>
            {recentSorted.length > 0 && (
              <button
                type="button"
                data-testid="safari-clear-recent"
                onClick={() => clearRecent()}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {recentSorted.length === 0 ? (
            <p className="text-xs italic text-slate-400">
              No recent URLs yet. Try entering a website above.
            </p>
          ) : (
            <ul data-testid="safari-recent-list" className="space-y-1">
              {recentSorted.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    data-testid={`safari-recent-${entry.id}`}
                    onClick={() => navigate(entry.url, true)}
                    className="flex w-full flex-col rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100"
                  >
                    <span className="truncate font-medium text-slate-800">
                      {entry.title || deriveTitle(entry.url)}
                    </span>
                    <span className="truncate text-[11px] text-slate-500">{entry.url}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="relative flex-1 overflow-hidden bg-white">
          {onHome ? (
            <HomePage onPick={(url) => navigate(url, true)} />
          ) : (
            <iframe
              key={`${reloadKey}-${current.url}`}
              data-testid="safari-frame"
              title={current.title}
              src={current.url}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-full w-full border-0 bg-white"
            />
          )}
        </main>
      </div>
    </div>
  );
}
