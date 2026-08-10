import { useMemo, useState } from 'react';
import { FileText, Folder } from 'lucide-react';

/**
 * NotesApp
 *
 * Two-pane Notes window modelled after the macOS Notes app:
 *
 *   Left sidebar  - list of notes. Each row shows the title, the
 *                   folder it lives in, the date it was last edited
 *                   and a one-line preview of the body.
 *   Right pane    - read-only detail view of the selected note,
 *                   showing the folder badge, title, date and full
 *                   body. Multi-line bodies are rendered with
 *                   whitespace preserved.
 *
 * Pure UI mock. No persistence. Mock data is co-located with the
 * component and the first note is selected by default.
 *
 * Props:
 *   - className (string, optional): extra classes appended to the root.
 */

const NOTES = [
  {
    id: 'n1',
    title: 'Tahoe desktop launch checklist',
    date: 'Today, 10:00 AM',
    folder: 'Notes',
    body:
      'Things to double-check before flipping the switch:\n' +
      '\n' +
      '  - Translucent panels render correctly on Safari and Chrome.\n' +
      '  - Dock magnification and bounce animations feel smooth.\n' +
      '  - Window snap zones do not fight the top menu bar.\n' +
      '  - Reduce-motion preference is honoured.\n' +
      '\n' +
      'Once all four are green we can ship the build.',
  },
  {
    id: 'n2',
    title: 'Recipes to try this week',
    date: 'Yesterday, 7:32 PM',
    folder: 'iCloud',
    body:
      'Pulled these from the cooking magazine on the train:\n' +
      '\n' +
      '  1. Miso butter pasta with crispy garlic breadcrumbs.\n' +
      '  2. One-pan roast chicken with lemon and smoked paprika.\n' +
      '  3. Cold soba noodle salad with cucumber and sesame.\n' +
      '\n' +
      'Pick one for tomorrow night. Need to defrost the chicken tonight.',
  },
  {
    id: 'n3',
    title: 'Bookshelf wishlist',
    date: 'Sunday, 9:14 AM',
    folder: 'iCloud',
    body:
      'A short list so I do not forget by the time I get to the shop:\n' +
      '\n' +
      '  - "The Glass Bead Game" - finally.\n' +
      '  - "A Pattern Language" - paperback edition.\n' +
      '  - "The Mushroom at the End of the World" - for the train.\n' +
      '\n' +
      'Budget: under forty dollars.',
  },
  {
    id: 'n4',
    title: 'Weekend trip outline',
    date: 'Friday, 4:48 PM',
    folder: 'Notes',
    body:
      'Drive down Saturday morning, back Sunday evening.\n' +
      '\n' +
      'Stops:\n' +
      '  - Bakery on the hill for coffee and pastries.\n' +
      '  - Short hike to the lookout before lunch.\n' +
      '  - Quiet cafe with a fireplace in the afternoon.\n' +
      '\n' +
      'Pack the wool blanket and the small thermos.',
  },
  {
    id: 'n5',
    title: 'Random ideas',
    date: 'Wednesday, 11:02 AM',
    folder: 'Notes',
    body:
      'Brain dump:\n' +
      '\n' +
      '  - Side project: keyboard-driven dashboard for habit tracking.\n' +
      '  - Try writing morning pages for a full week and see what shifts.\n' +
      '  - Build a small recipe card printer using thermal paper.\n' +
      '  - Send a postcard to gran on Sunday.',
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

function NotesApp({ className }) {
  const [selectedId, setSelectedId] = useState(NOTES[0].id);

  const selectedNote = useMemo(
    () => NOTES.find((note) => note.id === selectedId) ?? null,
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
      data-testid="notes-app"
      data-app-id="notes"
      className={rootClassName}
    >
      <aside
        data-testid="notes-list"
        aria-label="Notes"
        className="w-80 shrink-0 border-r border-white/10 bg-white/5 overflow-y-auto"
      >
        <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
          <FileText aria-hidden="true" className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Notes
          </span>
        </header>
        <ul className="divide-y divide-white/10">
          {NOTES.map((note) => {
            const isActive = note.id === selectedId;
            const preview = firstLine(note.body);
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
              <li key={note.id}>
                <button
                  type="button"
                  data-testid={`notes-item-${note.id}`}
                  data-note-id={note.id}
                  data-selected={isActive ? 'true' : 'false'}
                  aria-pressed={isActive}
                  onClick={() => handleSelect(note.id)}
                  className={itemClassName}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {note.title}
                    </span>
                    <span className="text-[10px] text-white/60 shrink-0">
                      {note.date}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/60">
                    <Folder aria-hidden="true" className="w-3 h-3" />
                    <span className="truncate">{note.folder}</span>
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
        data-testid="notes-detail"
        aria-label="Note"
        className="flex-1 min-w-0 overflow-y-auto"
      >
        {selectedNote ? (
          <article className="flex flex-col gap-4 p-6">
            <header className="flex flex-col gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span
                  data-testid="notes-detail-folder"
                  data-folder={selectedNote.folder}
                  aria-label={`Folder ${selectedNote.folder}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-white/85"
                >
                  <Folder aria-hidden="true" className="w-3 h-3" />
                  <span>{selectedNote.folder}</span>
                </span>
                <h2
                  data-testid="notes-detail-title"
                  className="text-xl font-semibold text-white"
                >
                  {selectedNote.title}
                </h2>
              </div>
              <div
                data-testid="notes-detail-date"
                className="text-xs text-white/70"
              >
                {selectedNote.date}
              </div>
            </header>
            <div
              data-testid="notes-detail-body"
              className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap"
            >
              {selectedNote.body}
            </div>
          </article>
        ) : (
          <div
            data-testid="notes-empty-state"
            className="h-full flex items-center justify-center text-white/60 text-sm"
          >
            Select a note to read it.
          </div>
        )}
      </section>
    </div>
  );
}

export default NotesApp;
export { NotesApp, NOTES };
