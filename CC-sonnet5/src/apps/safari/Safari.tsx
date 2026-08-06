import { useEffect, useRef, useState } from 'react';
import { useAppMenuActions } from '../../os/menuActionStore';
import './safari.css';

const HOME = 'tahoe://newtab';

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed === HOME) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed) && !trimmed.includes(' ')) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&igu=1`;
}

export default function Safari({ windowId }: { windowId: string }) {
  const [history, setHistory] = useState<string[]>([HOME]);
  const [idx, setIdx] = useState(0);
  const [addressInput, setAddressInput] = useState('');
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const current = history[idx];

  useEffect(() => {
    setAddressInput(current === HOME ? '' : current);
    setLoadError(false);
  }, [current]);

  const go = (url: string) => {
    const normalized = normalizeUrl(url);
    const newHistory = [...history.slice(0, idx + 1), normalized];
    setHistory(newHistory);
    setIdx(newHistory.length - 1);
  };

  const back = () => idx > 0 && setIdx(idx - 1);
  const forward = () => idx < history.length - 1 && setIdx(idx + 1);
  const reload = () => {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
  };
  const goHome = () => go(HOME);

  useAppMenuActions(windowId, {
    newTab: goHome,
    back,
    forward,
    home: goHome,
  });

  return (
    <div className="safari">
      <div className="safari-toolbar">
        <button onClick={back} disabled={idx === 0}>
          ‹
        </button>
        <button onClick={forward} disabled={idx >= history.length - 1}>
          ›
        </button>
        <button onClick={reload}>⟳</button>
        <button onClick={goHome}>⌂</button>
        <form
          className="safari-address-form"
          onSubmit={(e) => {
            e.preventDefault();
            go(addressInput || HOME);
          }}
        >
          <input
            className="safari-address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Search or enter website name"
          />
        </form>
      </div>
      <div className="safari-body">
        {current === HOME ? (
          <NewTab onGo={go} />
        ) : (
          <iframe
            ref={iframeRef}
            key={current}
            src={current}
            className="safari-iframe"
            onError={() => setLoadError(true)}
            title="Safari content"
          />
        )}
        {loadError && current !== HOME && (
          <div className="safari-error">This site may not allow being displayed in a frame.</div>
        )}
      </div>
    </div>
  );
}

function NewTab({ onGo }: { onGo: (url: string) => void }) {
  const shortcuts = [
    { label: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { label: 'Example', url: 'https://example.com' },
    { label: 'Google Search', url: 'https://www.google.com/search?q=macos&igu=1' },
    { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  ];
  return (
    <div className="safari-newtab">
      <h2>Favorites</h2>
      <p className="safari-newtab-note">
        Note: some sites block embedding in frames (X-Frame-Options/CSP) and won't load here — that's a browser
        security restriction from the real site, not a bug in this app.
      </p>
      <div className="safari-shortcuts">
        {shortcuts.map((s) => (
          <div key={s.url} className="safari-shortcut" onClick={() => onGo(s.url)}>
            <div className="safari-shortcut-icon">🌐</div>
            <div>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
