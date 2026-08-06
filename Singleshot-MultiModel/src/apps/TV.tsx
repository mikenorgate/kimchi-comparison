import { useState } from 'react';

interface TVShow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  art: string; // emoji
  background: string;
}

const CATEGORIES = ['Featured', 'Drama', 'Comedy', 'Action', 'Kids', 'Documentary'];

const SHOWS: TVShow[] = [
  {
    id: 's1',
    title: 'Tahoe Nights',
    subtitle: 'Drama · 2024 · 3 seasons',
    description:
      'A character-driven drama set in a fictional mountain town. Follow the residents as they navigate love, loss, and the ever-changing seasons.',
    category: 'Drama',
    art: '🌄',
    background: 'linear-gradient(135deg, #1a2980, #26d0ce)',
  },
  {
    id: 's2',
    title: 'Silicon Rooted',
    subtitle: 'Comedy · 2023 · 2 seasons',
    description:
      'A wry comedy about four friends trying to build a startup without any investors, employees, or viable product.',
    category: 'Comedy',
    art: '💻',
    background: 'linear-gradient(135deg, #f7971e, #ffd200)',
  },
  {
    id: 's3',
    title: 'Storm Front',
    subtitle: 'Action · 2025 · 1 season',
    description:
      'A meteorologist with a side hustle in catching criminals uses her knowledge of weather patterns to stop a string of heists.',
    category: 'Action',
    art: '⛈️',
    background: 'linear-gradient(135deg, #232526, #414345)',
  },
  {
    id: 's4',
    title: 'Cosmic Park',
    subtitle: 'Kids · 2022 · 4 seasons',
    description:
      'An animated adventure series following a group of alien friends exploring the universe, one planet at a time.',
    category: 'Kids',
    art: '🚀',
    background: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
  },
  {
    id: 's5',
    title: 'Deep Blue',
    subtitle: 'Documentary · 2024 · 1 season',
    description:
      'A stunning visual journey into the deepest parts of the ocean, featuring never-before-seen marine life.',
    category: 'Documentary',
    art: '🐋',
    background: 'linear-gradient(135deg, #2980b9, #6dd5fa)',
  },
  {
    id: 's6',
    title: 'Last Train Home',
    subtitle: 'Drama · 2023 · 2 seasons',
    description:
      'A meditation on memory and place, following a writer who returns to her childhood hometown after thirty years away.',
    category: 'Drama',
    art: '🚆',
    background: 'linear-gradient(135deg, #c79081, #dfa579)',
  },
  {
    id: 's7',
    title: 'Office Hours',
    subtitle: 'Comedy · 2024 · 1 season',
    description:
      'A workplace mockumentary set in a mid-sized tech company trying to ship a product that nobody asked for.',
    category: 'Comedy',
    art: '📎',
    background: 'linear-gradient(135deg, #ee9ca7, #ffdde1)',
  },
  {
    id: 's8',
    title: 'Night Shift',
    subtitle: 'Action · 2023 · 3 seasons',
    description:
      'A crew of night-shift paramedics in Los Angeles encounter the weird, the wild, and the profoundly human every night.',
    category: 'Action',
    art: '🚑',
    background: 'linear-gradient(135deg, #0f2027, #2c5364)',
  },
  {
    id: 's9',
    title: 'Planets!',
    subtitle: 'Kids · 2021 · 5 seasons',
    description:
      'A musical journey through the solar system, perfect for curious kids and the grown-ups who love them.',
    category: 'Kids',
    art: '🪐',
    background: 'linear-gradient(135deg, #ff9966, #ff5e62)',
  },
  {
    id: 's10',
    title: 'The Slow Web',
    subtitle: 'Documentary · 2025 · 1 season',
    description:
      'A four-part series about the people building tools for a more thoughtful, less attention-hungry internet.',
    category: 'Documentary',
    art: '🌐',
    background: 'linear-gradient(135deg, #43cea2, #185a9d)',
  },
];

export function TV(): JSX.Element {
  const [category, setCategory] = useState<string>('Featured');
  const [activeShow, setActiveShow] = useState<TVShow | null>(null);

  const filtered = category === 'Featured' ? SHOWS : SHOWS.filter((s) => s.category === category);

  return (
    <div className="tv-root">
      <div className="tv-tabs">
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            className={`tv-tab${category === c ? ' tv-tab--active' : ''}`}
            onClick={() => {
              setCategory(c);
              setActiveShow(null);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {activeShow ? (
        <div className="tv-detail">
          <div className="tv-detail__hero" style={{ background: activeShow.background }}>
            <div className="tv-detail__hero-text">
              <div className="tv-detail__title">{activeShow.title}</div>
              <div className="tv-detail__sub">{activeShow.subtitle}</div>
            </div>
          </div>
          <div className="tv-detail__body">
            <div className="tv-detail__description">{activeShow.description}</div>
            <button
              type="button"
              className="app-btn app-btn--primary tv-detail__play"
              onClick={() => {
                // Mock playback.
                alert(`Now playing: ${activeShow.title} (mock)`);
              }}
            >
              ▶ Play
            </button>
            <button
              type="button"
              className="app-btn"
              style={{ marginLeft: 8 }}
              onClick={() => setActiveShow(null)}
            >
              ← Back to Browse
            </button>
          </div>
        </div>
      ) : (
        <div className="tv-grid">
          {filtered.map((show) => (
            <button
              type="button"
              key={show.id}
              className="tv-thumb"
              onClick={() => setActiveShow(show)}
            >
              <div className="tv-thumb__art" style={{ background: show.background }}>
                {show.art}
              </div>
              <div className="tv-thumb__title">{show.title}</div>
              <div className="tv-thumb__sub">{show.subtitle}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.7)', padding: 16, gridColumn: '1 / -1' }}>
              No shows in this category yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default TV;
