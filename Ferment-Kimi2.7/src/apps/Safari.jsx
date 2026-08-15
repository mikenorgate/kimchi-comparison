import { useState } from 'react';
import './Safari.css';

const DEFAULT_TABS = [
  { id: 't1', title: 'Apple', url: 'www.apple.com' },
  { id: 't2', title: 'Tahoe', url: 'www.apple.com/macos/tahoe' },
];

const FAVORITES = [
  { id: 'f1', name: 'Apple', url: 'www.apple.com', color: '#555555' },
  { id: 'f2', name: 'News', url: 'www.apple.com/newsroom', color: '#ff2d55' },
  { id: 'f3', name: 'Maps', url: 'maps.apple.com', color: '#34c759' },
  { id: 'f4', name: 'iCloud', url: 'www.icloud.com', color: '#007aff' },
  { id: 'f5', name: 'Music', url: 'music.apple.com', color: '#ff3b30' },
];

const MOCK_PAGES = {
  'www.apple.com': {
    title: 'Apple',
    heading: 'Innovation at every layer.',
    body: 'Discover the latest Mac, iPad, iPhone, and Apple Watch. Experience macOS Tahoe with Liquid Glass.',
    bg: 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)',
  },
  'www.apple.com/macos/tahoe': {
    title: 'macOS Tahoe',
    heading: 'Liquid Glass comes to Mac.',
    body: 'A whole new look with depth, transparency, and light. Your desktop has never felt this alive.',
    bg: 'linear-gradient(135deg, #e0f2fe 0%, #f0e9ff 100%)',
  },
  'maps.apple.com': {
    title: 'Apple Maps',
    heading: 'Explore the world around you.',
    body: 'Detailed city experiences, immersive walking directions, and curated Guides.',
    bg: 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)',
  },
  'www.icloud.com': {
    title: 'iCloud',
    heading: 'Store. Share. Access anywhere.',
    body: 'Keep your photos, files, notes, and more safe and up to date across all your devices.',
    bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1f5fe 100%)',
  },
  'music.apple.com': {
    title: 'Apple Music',
    heading: 'Over 100 million songs.',
    body: 'Stream your favorite tracks, discover new artists, and listen across all your devices.',
    bg: 'linear-gradient(135deg, #ffebee 0%, #fff3e0 100%)',
  },
  'www.apple.com/newsroom': {
    title: 'Apple Newsroom',
    heading: 'The latest Apple news.',
    body: 'Press releases, updates, and stories from Apple around the world.',
    bg: 'linear-gradient(135deg, #fffde7 0%, #f1f8e9 100%)',
  },
};

function getPage(url) {
  const key = Object.keys(MOCK_PAGES)
    .sort((a, b) => b.length - a.length)
    .find((k) => url.includes(k));
  return MOCK_PAGES[key] || {
    title: url,
    heading: url,
    body: 'This mock page demonstrates Safari navigation. Enter any URL to load this placeholder.',
    bg: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)',
  };
}

export default function Safari() {
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState('t1');
  const [urlInput, setUrlInput] = useState('');

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const page = getPage(activeTab.url);

  const navigateTo = (url) => {
    const formatted = url.startsWith('http') ? url.replace(/^https?:\/\//, '') : url;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: formatted, title: getPage(formatted).title } : t))
    );
    setUrlInput('');
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id) {
        setActiveTabId(next[0].id);
      }
      return next;
    });
  };

  const addTab = () => {
    const newTab = { id: `t${Date.now()}`, title: 'New Tab', url: 'apple.com' };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  return (
    <div className="safari">
      <div className="safari-toolbar">
        <div className="safari-controls">
          <button className="safari-control" aria-label="Back">‹</button>
          <button className="safari-control" aria-label="Forward">›</button>
          <button className="safari-control safari-refresh" aria-label="Reload">↻</button>
        </div>
        <form
          className="safari-address"
          onSubmit={(e) => {
            e.preventDefault();
            navigateTo(urlInput || activeTab.url);
          }}
        >
          <span className="safari-lock">🔒</span>
          <input
            type="text"
            value={urlInput || activeTab.url}
            onChange={(e) => setUrlInput(e.target.value)}
            onFocus={() => setUrlInput(activeTab.url)}
            className="safari-url-input"
            aria-label="Address and search"
          />
        </form>
        <button className="safari-share" aria-label="Share">⇧</button>
      </div>

      <div className="safari-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`safari-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="safari-tab-title">{tab.title}</span>
            <span
              className="safari-tab-close"
              onClick={(e) => closeTab(e, tab.id)}
              role="button"
              aria-label={`Close ${tab.title}`}
            >
              ×
            </span>
          </button>
        ))}
        <button className="safari-new-tab" onClick={addTab} aria-label="New tab">
          +
        </button>
      </div>

      <div className="safari-favorites">
        {FAVORITES.map((fav) => (
          <button
            key={fav.id}
            className="safari-favorite"
            onClick={() => navigateTo(fav.url)}
          >
            <span className="safari-favorite-icon" style={{ background: fav.color }}>
              {fav.name[0]}
            </span>
            <span className="safari-favorite-name">{fav.name}</span>
          </button>
        ))}
      </div>

      <div
        className="safari-content"
        style={{ background: page.bg }}
      >
        <div className="safari-page">
          <h1 className="safari-page-title">{page.heading}</h1>
          <p className="safari-page-body">{page.body}</p>
          <div className="safari-page-actions">
            <button className="safari-page-button">Learn more</button>
            <button className="safari-page-button secondary">Buy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
