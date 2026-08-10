import { useMemo, useState } from 'react';
import { BookOpen, Calendar } from 'lucide-react';

/**
 * JournalApp
 *
 * Two-pane Journal window modelled after macOS Notes / Day One:
 *
 *   Left sidebar  – list of journal entries. Each row shows the mood
 *                   emoji, title, date and a one-line preview of the
 *                   body.
 *   Right pane    – read-only detail view of the selected entry,
 *                   showing the mood badge, title, date and full body.
 *
 * Pure UI mock. No persistence. Mock data is co-located with the
 * component and the first entry is selected by default.
 *
 * Props:
 *   - className (string, optional): extra classes appended to the root.
 */

const ENTRIES = [
  {
    id: 'j1',
    title: 'First day with the new desktop',
    date: 'Today, 9:41 AM',
    mood: '😊',
    body:
      'Spent the morning setting up the Tahoe web desktop. The translucent panels feel surprisingly calm. ' +
      'I like how the dock floats above the wallpaper. ' +
      'Going to try the Messages app next and see if the chat composer feels as nice as the desktop itself.',
  },
  {
    id: 'j2',
    title: 'Coffee and a long walk',
    date: 'Yesterday, 7:12 PM',
    mood: '🌿',
    body:
      'Took the long loop through the park before sunset. The light was perfect. ' +
      'Stopped for an oat milk latte on the way home and started sketching a new dashboard layout. ' +
      'Tomorrow I want to finish the sidebar and maybe revisit the colour palette.',
  },
  {
    id: 'j3',
    title: 'Reading list refresh',
    date: 'Sunday, 10:05 AM',
    mood: '📚',
    body:
      'Cleared out the queue and queued up three new books: one on typography, one on the history of maps, ' +
      'and a novel I have been meaning to read for months. ' +
      'I am going to commit to thirty minutes before bed, no phone.',
  },
  {
    id: 'j4',
    title: 'Bug squashing afternoon',
    date: 'Friday, 4:50 PM',
    mood: '🐛',
    body:
      'Finally tracked down the off-by-one in the message list reducer. ' +
      'Repro was a timing thing tied to the optimistic send path. ' +
      'Added a regression test and pushed the fix. Treat yourself to ramen tonight.',
  },
  {
    id: 'j5',
    title: 'Quiet morning',
    date: 'Wednesday, 6:30 AM',
    mood: '☕',
    body:
      'Woke up before the alarm. Made coffee, opened the window, watched the street wake up. ' +
      'Some days the only plan you need is to be awake for them.',
  },
];

function firstLine(body) {
  if (typeof body !== 'string') return '';
  const newlineIndex = body.indexOf('\n');
  const base = newlineIndex === -1 ? body : body.slice(0, newlineIndex);
  const trimmed = base.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 77).trimEnd()}…`;
}

function JournalApp({ className }) {
  const [selectedId, setSelectedId] = useState(ENTRIES[0].id);

  const selectedEntry = useMemo(
    () => ENTRIES.find((entry) => entry.id === selectedId) ?? null,
    [selectedId],
  );

  function handleSelect(id) {
    setSelectedId(id);
  }

  const rootClassName = [
    'flex',
    'h-full',
    'w-full',
    'text-white/90',
    'text-sm',
    'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-testid="journal-app"
      data-app-id="journal"
      className={rootClassName}
    >
      <aside
        data-testid="journal-entry-list"
        aria-label="Journal entries"
        className="w-80 shrink-0 border-r border-white/10 bg-white/5 overflow-y-auto"
      >
        <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
          <BookOpen aria-hidden="true" className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Journal
          </span>
        </header>
        <ul className="divide-y divide-white/10">
          {ENTRIES.map((entry) => {
            const isActive = entry.id === selectedId;
            const preview = firstLine(entry.body);
            const itemClassName = [
              'flex',
              'flex-col',
              'gap-1',
              'w-full',
              'px-4',
              'py-3',
              'cursor-pointer',
              'transition-colors',
              'text-left',
              isActive
                ? 'bg-white/15'
                : 'hover:bg-white/10',
            ].join(' ');
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  data-testid={`journal-entry-${entry.id}`}
                  data-entry-id={entry.id}
                  data-selected={isActive ? 'true' : 'false'}
                  aria-pressed={isActive}
                  onClick={() => handleSelect(entry.id)}
                  className={itemClassName}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {entry.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-base shrink-0"
                    >
                      {entry.mood}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/60">
                    <Calendar aria-hidden="true" className="w-3 h-3" />
                    <span className="truncate">{entry.date}</span>
                  </span>
                  <span className="text-xs text-white/70 truncate">
                    {preview}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        data-testid="journal-detail"
        aria-label="Journal entry"
        className="flex-1 min-w-0 overflow-y-auto"
      >
        {selectedEntry ? (
          <article className="flex flex-col gap-4 p-6">
            <header className="flex flex-col gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span
                  data-testid="journal-detail-mood"
                  data-mood={selectedEntry.mood}
                  aria-label={`Mood ${selectedEntry.mood}`}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 text-lg"
                >
                  {selectedEntry.mood}
                </span>
                <h2
                  data-testid="journal-detail-title"
                  className="text-xl font-semibold text-white"
                >
                  {selectedEntry.title}
                </h2>
              </div>
              <div
                data-testid="journal-detail-date"
                className="flex items-center gap-1.5 text-xs text-white/70"
              >
                <Calendar aria-hidden="true" className="w-3.5 h-3.5" />
                <span>{selectedEntry.date}</span>
              </div>
            </header>
            <div
              data-testid="journal-detail-body"
              className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap"
            >
              {selectedEntry.body}
            </div>
          </article>
        ) : (
          <div
            data-testid="journal-empty-state"
            className="h-full flex items-center justify-center text-white/60 text-sm"
          >
            Select an entry to read it.
          </div>
        )}
      </section>
    </div>
  );
}

export default JournalApp;
export { JournalApp, ENTRIES };
