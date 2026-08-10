/**
 * Spotlight — macOS Spotlight search panel.
 *
 * - Toggled via Cmd+Space or the MenuBar spotlight icon
 * - Centered glass-surface panel with search input
 * - Filters appRegistry by query, launches apps via openWindow
 * - Esc or click-outside closes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { appRegistry } from './appRegistry';
import { useWindowStore } from '@/store/windows';

export interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Spotlight({ isOpen, onClose }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openWindow = useWindowStore((s) => s.openWindow);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Defer focus to after DOM render
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Escape closes spotlight
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    // Capture phase so we intercept before other listeners
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  // No document mousedown listener — the backdrop div handles click-outside.
  // This avoids race conditions with menubar icon clicks.


  // Filter apps by query
  const results = query.trim()
    ? appRegistry.filter((app) =>
        app.name.toLowerCase().includes(query.toLowerCase())
      )
    : appRegistry.slice(0, 6); // Show first 6 apps when empty

  const launchApp = useCallback((appId: string) => {
    openWindow(appId);
    onClose();
  }, [openWindow, onClose]);

  // Keyboard navigation within results
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        launchApp(results[selectedIndex].id);
      }
    }
  }, [results, selectedIndex, launchApp]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center"
      style={{ zIndex: 1200, paddingTop: '20vh', pointerEvents: 'none' }}
    >
      {/* Backdrop: covers full screen below the menubar, click closes spotlight */}
      <div
        className="absolute inset-0"
        style={{ top: 'var(--height-menubar)', pointerEvents: 'auto' }}
        onClick={onClose}
        data-testid="spotlight-backdrop"
      />
      <div
        ref={panelRef}
        className="glass-surface-heavy bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-window w-full max-w-lg mx-4 overflow-hidden relative"
        style={{
          boxShadow: 'var(--shadow-window), var(--shadow-specular)',
          pointerEvents: 'auto',
        }}
        data-testid="spotlight-panel"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5">
          <svg viewBox="0 0 16 16" className="w-5 h-5 opacity-40 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="7" cy="7" r="5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-base text-black dark:text-white placeholder:opacity-40"
            data-testid="spotlight-input"
          />
        </div>

        {/* Results list */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-1" data-testid="spotlight-results">
            {results.map((app, i) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => launchApp(app.id)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    i === selectedIndex
                      ? 'bg-[#0a84ff] text-white'
                      : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  data-testid={`spotlight-result-${app.id}`}
                >
                  <Icon className="w-7 h-7 shrink-0 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{app.name}</div>
                    <div className={`text-xs ${i === selectedIndex ? 'text-white/70' : 'opacity-50'}`}>
                      Application
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No results */}
        {results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm opacity-40" data-testid="spotlight-no-results">
            No results for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
