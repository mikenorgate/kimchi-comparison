import { useState } from 'react';

interface Episode {
  id: string;
  title: string;
  publishedAt: string;
  durationMin: number;
}

interface Podcast {
  id: string;
  title: string;
  author: string;
  description: string;
  art: string;
  background: string;
  episodes: Episode[];
}

const PODCASTS: Podcast[] = [
  {
    id: 'p1',
    title: 'Design Details',
    author: 'Brian Lovin & Marshall Bock',
    description: 'A weekly conversation about design, software, and the people behind them.',
    art: '🎨',
    background: 'linear-gradient(135deg, #0a84ff, #0050d6)',
    episodes: [
      { id: 'e1-1', title: 'Designing for focus', publishedAt: '2025-08-04', durationMin: 48 },
      { id: 'e1-2', title: 'The case for boring UI', publishedAt: '2025-07-28', durationMin: 52 },
      { id: 'e1-3', title: 'Process is a design tool', publishedAt: '2025-07-21', durationMin: 44 },
      { id: 'e1-4', title: 'Reinventing the macOS desktop', publishedAt: '2025-07-14', durationMin: 56 },
    ],
  },
  {
    id: 'p2',
    title: 'Shipped',
    author: 'Eleanor Berger',
    description: 'Stories from indie makers who launched their product to the world.',
    art: '🚀',
    background: 'linear-gradient(135deg, #ff9f0a, #ff5e3a)',
    episodes: [
      { id: 'e2-1', title: 'The two-week MVP', publishedAt: '2025-08-02', durationMin: 38 },
      { id: 'e2-2', title: 'Pricing for strangers', publishedAt: '2025-07-26', durationMin: 41 },
      { id: 'e2-3', title: 'When to stop', publishedAt: '2025-07-19', durationMin: 35 },
    ],
  },
  {
    id: 'p3',
    title: 'Type Theory',
    author: 'Dr. Hannah Liu',
    description: 'Deep dives into programming languages, type systems, and the people who design them.',
    art: '📐',
    background: 'linear-gradient(135deg, #34c759, #1f8a3a)',
    episodes: [
      { id: 'e3-1', title: 'Algebraic effects in practice', publishedAt: '2025-08-05', durationMin: 62 },
      { id: 'e3-2', title: 'Why dependently typed?', publishedAt: '2025-07-29', durationMin: 58 },
      { id: 'e3-3', title: 'The history of Hindley-Milner', publishedAt: '2025-07-22', durationMin: 51 },
    ],
  },
  {
    id: 'p4',
    title: 'The Slow Hour',
    author: 'Mateo Alvarez',
    description: 'Long-form interviews with artists, writers, and thinkers on craft.',
    art: '☕',
    background: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
    episodes: [
      { id: 'e4-1', title: 'On finishing things', publishedAt: '2025-08-01', durationMin: 71 },
      { id: 'e4-2', title: 'Notes on solitude', publishedAt: '2025-07-25', durationMin: 65 },
      { id: 'e4-3', title: 'Writing every day', publishedAt: '2025-07-18', durationMin: 58 },
    ],
  },
];

export function Podcasts(): JSX.Element {
  const [activeId, setActiveId] = useState<string>(PODCASTS[0]!.id);
  const active = PODCASTS.find((p) => p.id === activeId) ?? PODCASTS[0]!;

  const handlePlay = (ep: Episode): void => {
    // Mock playback.
    alert(`Now playing: ${active.title} — ${ep.title} (${ep.durationMin} min, mock)`);
  };

  return (
    <div className="podcasts-root">
      <div className="podcasts-list">
        {PODCASTS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`podcasts-list-item${p.id === activeId ? ' podcasts-list-item--selected' : ''}`}
            onClick={() => setActiveId(p.id)}
            style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
          >
            <div className="podcasts-list-item__art" style={{ background: p.background }}>
              {p.art}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="podcasts-list-item__title">{p.title}</div>
              <div className="podcasts-list-item__sub">{p.author}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="podcasts-detail">
        <div className="podcasts-detail__header">
          <div className="podcasts-detail__art" style={{ background: active.background }}>
            {active.art}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="podcasts-detail__title">{active.title}</div>
            <div className="podcasts-detail__author">{active.author}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              {active.description}
            </div>
          </div>
        </div>
        <div className="podcasts-episodes">
          <div style={{ padding: '12px 16px 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.04, color: 'var(--color-text-secondary)' }}>
            Episodes
          </div>
          {active.episodes.map((ep) => (
            <div className="podcasts-episode" key={ep.id}>
              <button
                type="button"
                className="podcasts-episode__play"
                onClick={() => handlePlay(ep)}
                aria-label={`Play ${ep.title}`}
                title="Play"
              >
                ▶
              </button>
              <div className="podcasts-episode__meta">
                <div className="podcasts-episode__title">{ep.title}</div>
                <div className="podcasts-episode__date">
                  {ep.publishedAt} · {ep.durationMin} min
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Podcasts;
