"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

/**
 * Safari window content.
 *
 * The component owns:
 *
 * - A toolbar with back/forward navigation buttons, a refresh button,
 *   and a rounded address-bar input.
 * - A history stack plus a current-index pointer so back/forward move
 *   through previously-visited URLs without navigating the host page.
 * - A sandboxed `<iframe>` that loads the currently-active URL. The
 *   iframe is forced to remount via a derived `key` whenever the user
 *   navigates to a new URL or hits refresh, so each navigation gets a
 *   fresh document context.
 * - A load timeout / error fallback. If the iframe does not fire
 *   `onLoad` within `LOAD_TIMEOUT_MS`, the component assumes the site
 *   refused to be framed and replaces the iframe with a friendly
 *   placeholder that surfaces the attempted URL.
 *
 * The address bar is driven by local input state so the user can type
 * freely; navigation only happens when they commit the value (Enter
 * key, or future form-submit paths).
 */
export interface SafariProps {
  /**
   * URL displayed in the address bar on first render. Defaults to a
   * safe, well-known site (`https://example.com`) so the address bar
   * is non-empty when the component is mounted without props.
   */
  readonly initialUrl?: string;
}

/**
 * The address bar starts empty when a caller intentionally passes an
 * empty string (e.g. a future "home page" affordance), but the
 * default initial paint always shows a real URL.
 */
const DEFAULT_INITIAL_URL = "https://example.com";

/**
 * How long the component waits for an iframe `load` (or `error`)
 * event before giving up and showing the "cannot be framed"
 * fallback. Sites that set `X-Frame-Options: DENY` or
 * `Content-Security-Policy: frame-ancestors 'none'` typically never
 * fire either event in the parent window, so a timeout is the most
 * reliable signal.
 */
const LOAD_TIMEOUT_MS = 5000;

/**
 * Render a Safari window. The wrapper carries the `data-url`
 * attribute so tests (and the window manager) can read the current
 * address without scraping the input element. The toolbar mirrors
 * the macOS Safari layout: three chrome buttons on the left, a
 * full-width rounded address bar, then a flexible spacer region
 * reserved for future controls.
 */
export default function Safari({
  initialUrl,
}: SafariProps): JSX.Element {
  const startUrl = initialUrl ?? DEFAULT_INITIAL_URL;

  // History stack plus a pointer. The stack is always non-empty while
  // the component is mounted: the very first render seeds it with the
  // initial URL.
  const [history, setHistory] = useState<string[]>(() => [startUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Address-bar input state. Decoupled from the committed URL so the
  // user can type freely; only Enter commits.
  const [addressInput, setAddressInput] = useState<string>(startUrl);

  // Refresh counter. Combined with the URL into a React `key` on the
  // iframe so a refresh truly tears the document down and rebuilds
  // it, instead of just re-rendering with stale state.
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // `true` when the most recent iframe load attempt failed (timeout
  // or explicit error event). Cleared on a new navigation attempt.
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  // Keep the active timer in a ref so we can cancel it when the
  // iframe finally loads (or when the user navigates away before the
  // timeout fires).
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLoadTimer = useCallback((): void => {
    if (loadTimerRef.current !== null) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }, []);

  const currentUrl = history[historyIndex] ?? startUrl;

  // Whenever the active URL (or refresh counter) changes, reset the
  // fallback state and arm a fresh load timer. Cancelling the
  // previous timer prevents a stale callback from clearing a newer
  // iframe's load.
  useEffect(() => {
    cancelLoadTimer();
    setLoadFailed(false);
    loadTimerRef.current = setTimeout(() => {
      loadTimerRef.current = null;
      setLoadFailed(true);
    }, LOAD_TIMEOUT_MS);
    return cancelLoadTimer;
  }, [currentUrl, refreshCounter, cancelLoadTimer]);

  // Keep the address-bar input in sync with the active URL when the
  // user navigates via back/forward/refresh. The local input value is
  // allowed to diverge from `currentUrl` while the user is typing;
  // committing an Enter key resets it.
  useEffect(() => {
    setAddressInput(currentUrl);
    // We intentionally exclude `addressInput` from the deps — this
    // effect should react to navigation, not to the user typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, refreshCounter]);

  const handleAddressChange = (event: {
    target: { value: string };
  }): void => {
    setAddressInput(event.target.value);
  };

  /**
   * Commit the address-bar value as a navigation. If the value is
   * unchanged we treat the Enter press as a refresh rather than a
   * no-op so users can re-trigger a load from the keyboard.
   */
  const commitNavigation = useCallback((): void => {
    const next = addressInput.trim();
    if (next.length === 0) {
      return;
    }
    const isSameAsCurrent = next === currentUrl;

    if (isSameAsCurrent) {
      // Treat Enter on the current URL as a soft refresh — bump the
      // counter without growing the history stack.
      cancelLoadTimer();
      setLoadFailed(false);
      setRefreshCounter((counter) => counter + 1);
      return;
    }

    setHistory((prev) => {
      // Drop any forward history (the user is branching off from the
      // current entry) and append the new URL.
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, next];
    });
    setHistoryIndex((idx) => idx + 1);
  }, [addressInput, currentUrl, historyIndex, cancelLoadTimer]);

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitNavigation();
    }
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const handleBack = useCallback((): void => {
    if (!canGoBack) {
      return;
    }
    setHistoryIndex((idx) => Math.max(0, idx - 1));
  }, [canGoBack]);

  const handleForward = useCallback((): void => {
    if (!canGoForward) {
      return;
    }
    setHistoryIndex((idx) => Math.min(history.length - 1, idx + 1));
  }, [canGoForward, history.length]);

  const handleRefresh = useCallback((): void => {
    cancelLoadTimer();
    setLoadFailed(false);
    setRefreshCounter((counter) => counter + 1);
  }, [cancelLoadTimer]);

  const handleIframeLoad = useCallback((): void => {
    cancelLoadTimer();
    setLoadFailed(false);
  }, [cancelLoadTimer]);

  const handleIframeError = useCallback((): void => {
    cancelLoadTimer();
    setLoadFailed(true);
  }, [cancelLoadTimer]);

  // The key combines URL + refresh counter so both a new URL and a
  // refresh remount the iframe. Without this, React would happily
  // reuse the same DOM node across navigations, and onLoad would
  // never fire for the new document.
  const iframeKey = useMemo(
    () => `${currentUrl}#${refreshCounter}`,
    [currentUrl, refreshCounter]
  );

  return (
    <div
      className="safari"
      data-testid="safari"
      data-url={currentUrl}
      data-history-length={history.length}
      data-history-index={historyIndex}
      data-refresh-counter={refreshCounter}
    >
      <header
        className="safari__toolbar"
        data-testid="safari-toolbar"
      >
        <button
          type="button"
          className="safari__toolbar-button"
          data-testid="safari-back"
          aria-label="Go back"
          disabled={!canGoBack}
          onClick={handleBack}
          title="Go back"
        >
          {"\u2039"}
        </button>
        <button
          type="button"
          className="safari__toolbar-button"
          data-testid="safari-forward"
          aria-label="Go forward"
          disabled={!canGoForward}
          onClick={handleForward}
          title="Go forward"
        >
          {"\u203A"}
        </button>
        <button
          type="button"
          className="safari__toolbar-button"
          data-testid="safari-refresh"
          aria-label="Reload page"
          onClick={handleRefresh}
          title="Reload page"
        >
          {"\u21BB"}
        </button>
        <input
          type="text"
          className="safari__address-bar"
          data-testid="safari-address"
          value={addressInput}
          onChange={handleAddressChange}
          onKeyDown={handleAddressKeyDown}
          aria-label="Address"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </header>

      <main
        className="safari__viewport"
        data-testid="safari-webview"
        data-webview-url={currentUrl}
        aria-label="Web content"
      >
        {loadFailed ? (
          <div
            className="safari__fallback"
            data-testid="safari-fallback"
            role="alert"
          >
            <p className="safari__fallback-title">
              This site cannot be framed
            </p>
            <p className="safari__fallback-body">
              {currentUrl}
            </p>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            className="safari__iframe"
            data-testid="safari-iframe"
            src={currentUrl}
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
            title={`Content from ${currentUrl}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </main>
    </div>
  );
}
