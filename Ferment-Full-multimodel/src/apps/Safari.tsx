import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowLeft, ArrowRight, Plus, RefreshCw, X } from 'lucide-react';

import { useWindow } from '../hooks/useWindow';

interface SafariTab {
  /** Unique tab id. */
  id: string;
  /** Visible label in the tab strip (also drives the window title). */
  title: string;
  /** URL or search query displayed in the address bar. */
  url: string;
  /** Normalized URL actually loaded in the iframe. Null = welcome page. */
  loadedUrl: string | null;
  /** Bumped on every "navigate" to force a remount of the iframe element. */
  nonce: number;
}

interface Bookmark {
  id: string;
  label: string;
  url: string;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'apple', label: 'Apple', url: 'https://www.apple.com' },
  { id: 'wiki', label: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { id: 'mdn', label: 'MDN', url: 'https://developer.mozilla.org' },
  { id: 'example', label: 'Example', url: 'https://example.com' },
];

const WELCOME_URL = 'about:welcome';

let tabIdCounter = 0;
function nextTabId(): string {
  tabIdCounter += 1;
  return `safari-tab-${tabIdCounter}`;
}

/** True when the input looks like a URL rather than a search query. */
function isLikelyUrl(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return true;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(trimmed)) return true;
  return false;
}

/** Normalize URL input into something safe to load in an iframe. */
function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  if (isLikelyUrl(trimmed)) {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }
  return null;
}

function makeTab(title: string, url: string): SafariTab {
  return {
    id: nextTabId(),
    title,
    url,
    loadedUrl: normalizeUrl(url),
    nonce: 0,
  };
}

/** Render the built-in welcome page when no real URL is loaded. */
function WelcomePage({ onPickBookmark }: { onPickBookmark: (b: Bookmark) => void }): JSX.Element {
  return (
    <div
      style={{
        height: '100%',
        background:
          'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 50%, #d6e2f0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        color: '#1d1d1f',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div style={{ fontSize: 64 }}>🧭</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>Safari</div>
      <div style={{ fontSize: 13, color: '#6e6e73', maxWidth: 420, textAlign: 'center' }}>
        Welcome to Tahoe Safari. Pick a bookmark above or type a URL in the address bar to
        load a page. Cross-origin sites may not load due to iframe restrictions.
      </div>
      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 8,
          width: 360,
          maxWidth: '100%',
        }}
      >
        {DEFAULT_BOOKMARKS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPickBookmark(b)}
            style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              textAlign: 'left',
              color: '#1d1d1f',
            }}
          >
            <div style={{ fontWeight: 600 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: '#6e6e73', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {b.url}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Safari app — multi-tab browser mock. Tabs live in component-local
 * state and the active tab drives the address bar + iframe. The window
 * title is synced via `useWindow` so the chrome reflects the current
 * tab.
 */
export function Safari({ windowId }: { windowId: string }): JSX.Element {
  const { actions } = useWindow(windowId);

  const [tabs, setTabs] = useState<SafariTab[]>(() => [makeTab('Welcome', WELCOME_URL)]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? '');
  const [addressDraft, setAddressDraft] = useState<string>(WELCOME_URL);
  const [iframeFailed, setIframeFailed] = useState<boolean>(false);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const activeTab = useMemo<SafariTab | undefined>(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId],
  );

  // Sync the window title with the current tab title.
  useEffect(() => {
    if (!activeTab) return;
    actions.setTitle(`Safari — ${activeTab.title}`);
  }, [actions, activeTab]);

  // Keep the address bar input in sync with the active tab.
  useEffect(() => {
    setAddressDraft(activeTab?.url ?? '');
  }, [activeTab]);

  const navigateActiveTab = useCallback(
    (rawInput: string) => {
      const input = rawInput.trim();
      if (input.length === 0) return;
      const loadedUrl = normalizeUrl(input);
      setIframeFailed(false);
      setTabs((current) =>
        current.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                url: input,
                loadedUrl,
                title: loadedUrl
                  ? new URL(loadedUrl, 'https://x/').hostname.replace(/^www\./, '') || input
                  : 'Welcome',
                nonce: t.nonce + 1,
              }
            : t,
        ),
      );
    },
    [activeTabId],
  );

  const handleAddressSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      navigateActiveTab(addressDraft);
    },
    [addressDraft, navigateActiveTab],
  );

  const openNewTab = useCallback(() => {
    const tab = makeTab('New Tab', '');
    setTabs((current) => [...current, tab]);
    setActiveTabId(tab.id);
    setIframeFailed(false);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((current) => {
        const idx = current.findIndex((t) => t.id === id);
        if (idx === -1) return current;
        const next = current.filter((t) => t.id !== id);
        if (next.length === 0) {
          // Always keep at least one tab.
          const fresh = makeTab('Welcome', WELCOME_URL);
          setActiveTabId(fresh.id);
          return [fresh];
        }
        if (id === activeTabId) {
          const fallback = next[idx] ?? next[idx - 1] ?? next[0];
          if (fallback) setActiveTabId(fallback.id);
        }
        return next;
      });
    },
    [activeTabId],
  );

  const reloadActiveTab = useCallback(() => {
    setIframeFailed(false);
    setTabs((current) =>
      current.map((t) => (t.id === activeTabId ? { ...t, nonce: t.nonce + 1 } : t)),
    );
  }, [activeTabId]);

  const selectBookmark = useCallback(
    (bookmark: Bookmark) => {
      setAddressDraft(bookmark.url);
      navigateActiveTab(bookmark.url);
    },
    [navigateActiveTab],
  );

  const focusAddressBar = useCallback(() => {
    addressInputRef.current?.select();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f5f5f7',
        color: '#1d1d1f',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Tab strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          padding: '6px 8px 0 8px',
          background: 'linear-gradient(180deg, #e8eaee 0%, #dcdfe3 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minWidth: 120,
                maxWidth: 200,
                padding: '6px 10px',
                background: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(0,0,0,0.12)',
                borderBottom: isActive ? '1px solid #ffffff' : '1px solid rgba(0,0,0,0.12)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                color: isActive ? '#1d1d1f' : '#6e6e73',
                userSelect: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{ fontSize: 11 }}
              >
                🧭
              </span>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.title || 'New Tab'}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.id);
                }}
                aria-label={`Close ${tab.title || 'tab'}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit',
                  opacity: 0.6,
                }}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={openNewTab}
          aria-label="New tab"
          title="New tab"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: '#6e6e73',
          }}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: '#f5f5f7',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <button
          type="button"
          aria-label="Back"
          disabled={!activeTab || activeTab.loadedUrl === null}
          onClick={focusAddressBar}
          style={toolbarButtonStyle(false)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Forward"
          disabled={!activeTab || activeTab.loadedUrl === null}
          onClick={focusAddressBar}
          style={toolbarButtonStyle(false)}
        >
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Reload"
          onClick={reloadActiveTab}
          style={toolbarButtonStyle(false)}
        >
          <RefreshCw size={14} aria-hidden="true" />
        </button>
        <form
          onSubmit={handleAddressSubmit}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 6,
            padding: '4px 8px',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 11, color: '#6e6e73' }}>🔒</span>
          <input
            ref={addressInputRef}
            type="text"
            value={addressDraft}
            onChange={(event) => setAddressDraft(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            placeholder="Search or enter website name"
            aria-label="Address bar"
            spellCheck={false}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 13,
              background: 'transparent',
              color: '#1d1d1f',
            }}
          />
        </form>
      </div>

      {/* Bookmarks bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          background: '#f5f5f7',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          fontSize: 12,
          overflowX: 'auto',
        }}
      >
        {DEFAULT_BOOKMARKS.map((bookmark) => (
          <button
            key={bookmark.id}
            type="button"
            onClick={() => selectBookmark(bookmark)}
            style={{
              padding: '3px 8px',
              background: 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              color: '#1d1d1f',
            }}
          >
            {bookmark.label}
          </button>
        ))}
      </div>

      {/* Web view */}
      <div style={{ flex: 1, position: 'relative', background: '#ffffff', overflow: 'hidden' }}>
        {activeTab?.loadedUrl ? (
          iframeFailed ? (
            <FallbackMessage url={activeTab.loadedUrl} />
          ) : (
            <iframe
              key={`${activeTab.id}-${activeTab.nonce}`}
              src={activeTab.loadedUrl}
              title={activeTab.title}
              sandbox="allow-scripts allow-forms allow-same-origin"
              style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
              onError={() => setIframeFailed(true)}
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          <WelcomePage onPickBookmark={selectBookmark} />
        )}
        {iframeFailed && activeTab?.loadedUrl && <FallbackMessage url={activeTab.loadedUrl} />}
      </div>
    </div>
  );
}

function toolbarButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 24,
    background: 'transparent',
    border: 'none',
    borderRadius: 4,
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? '#c0c0c5' : '#6e6e73',
  };
}

function FallbackMessage({ url }: { url: string }): JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 24,
        background: '#ffffff',
        color: '#1d1d1f',
        textAlign: 'center',
        fontSize: 13,
      }}
    >
      <div style={{ fontSize: 36 }}>⚠️</div>
      <div style={{ fontWeight: 600 }}>This page could not be displayed</div>
      <div style={{ color: '#6e6e73', maxWidth: 420 }}>
        Safari could not load <code style={{ background: '#f5f5f7', padding: '1px 4px', borderRadius: 3 }}>{url}</code>.
        The site may block embedding or be unreachable from this preview.
      </div>
    </div>
  );
}

export default Safari;
