import { useCallback, useMemo, useState } from 'react';
import {
  Gamepad2,
  Sword,
  Puzzle,
  Brain,
  Gamepad,
  Play,
} from 'lucide-react';
import SystemIcon from '../SystemIcon.jsx';

/**
 * GamesApp
 *
 * Tahoe-style Games window. Renders a sidebar of game categories (Arcade,
 * Action, Puzzle, Strategy) and a grid of game cards. Each card shows a
 * coloured placeholder cover, the game title, and a short subtitle.
 * Clicking a sidebar category filters the visible cards. Clicking a card
 * selects it.
 *
 * Pure UI mock — no real game assets, no persistence.
 *
 * Exposes `data-testid` hooks used by the test suite:
 *   - games-app
 *   - games-sidebar
 *   - games-category (one per category, with data-category-id)
 *   - games-grid
 *   - games-card (one per game, with data-game-id)
 *   - games-card-cover
 *   - games-card-title
 *   - games-card-subtitle
 *   - games-empty
 */

const CATEGORIES = Object.freeze([
  { id: 'arcade',   label: 'Arcade',   icon: Gamepad2 },
  { id: 'action',   label: 'Action',   icon: Sword },
  { id: 'puzzle',   label: 'Puzzle',   icon: Puzzle },
  { id: 'strategy', label: 'Strategy', icon: Brain },
]);

const DEFAULT_CATEGORY_ID = 'arcade';

const GAMES = Object.freeze([
  {
    id: 'g1',
    title: 'Neon Racer',
    subtitle: 'High-speed arcade driving',
    category: 'arcade',
    color: 'from-fuchsia-500 to-rose-600',
  },
  {
    id: 'g2',
    title: 'Pixel Plumber',
    subtitle: 'Classic side-scrolling jump-and-run',
    category: 'arcade',
    color: 'from-amber-400 to-orange-600',
  },
  {
    id: 'g3',
    title: 'Block Drop',
    subtitle: 'Endless falling-block puzzler',
    category: 'arcade',
    color: 'from-cyan-400 to-blue-700',
  },
  {
    id: 'g4',
    title: 'Blade Runner',
    subtitle: 'Stylised cyberpunk action',
    category: 'action',
    color: 'from-red-500 to-slate-900',
  },
  {
    id: 'g5',
    title: 'Sky Pilots',
    subtitle: 'Aerial dogfighting action',
    category: 'action',
    color: 'from-sky-400 to-indigo-700',
  },
  {
    id: 'g6',
    title: 'Mech Assault',
    subtitle: 'Heavy mech combat simulator',
    category: 'action',
    color: 'from-zinc-500 to-zinc-900',
  },
  {
    id: 'g7',
    title: 'Tile Twist',
    subtitle: 'Sliding-tile brain teaser',
    category: 'puzzle',
    color: 'from-emerald-400 to-teal-700',
  },
  {
    id: 'g8',
    title: 'Match Mint',
    subtitle: 'Calm three-in-a-row relaxer',
    category: 'puzzle',
    color: 'from-lime-400 to-emerald-600',
  },
  {
    id: 'g9',
    title: 'Word Forge',
    subtitle: 'Crossword-style word puzzles',
    category: 'puzzle',
    color: 'from-yellow-400 to-amber-700',
  },
  {
    id: 'g10',
    title: 'Kingdom Keep',
    subtitle: 'Build and defend your realm',
    category: 'strategy',
    color: 'from-purple-500 to-indigo-800',
  },
  {
    id: 'g11',
    title: 'Star Marshal',
    subtitle: '4X space strategy sandbox',
    category: 'strategy',
    color: 'from-violet-500 to-slate-900',
  },
  {
    id: 'g12',
    title: 'Tactical Grid',
    subtitle: 'Turn-based squad tactics',
    category: 'strategy',
    color: 'from-stone-500 to-stone-800',
  },
]);

function GamesApp() {
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [selectedGameId, setSelectedGameId] = useState(null);

  const visibleGames = useMemo(
    () => GAMES.filter((g) => g.category === categoryId),
    [categoryId],
  );

  const handleSelectCategory = useCallback((id) => {
    setCategoryId(id);
    setSelectedGameId(null);
  }, []);

  const handleSelectGame = useCallback((id) => {
    setSelectedGameId((current) => (current === id ? null : id));
  }, []);

  return (
    <div
      data-testid="games-app"
      data-app-id="games"
      data-category={categoryId}
      className="flex h-full w-full bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-900 overflow-hidden"
    >
      {/* Sidebar: categories */}
      <nav
        data-testid="games-sidebar"
        aria-label="Game categories"
        className="w-48 shrink-0 border-r border-black/10 bg-white/70 backdrop-blur-sm overflow-y-auto"
      >
        <div className="flex items-center gap-2 px-3 py-3 border-b border-black/5">
          <span aria-hidden="true" className="text-indigo-500">
            <SystemIcon icon={Gamepad} size="md" strokeWidth={1.5} />
          </span>
          <span className="text-sm font-semibold text-neutral-800">Games</span>
        </div>
        <ul className="flex flex-col py-1">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = category.id === categoryId;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  data-testid="games-category"
                  data-category-id={category.id}
                  data-active={isActive ? 'true' : 'false'}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectCategory(category.id)}
                  className={
                    `w-full flex items-center gap-2 px-3 py-2 text-sm text-left ` +
                    `transition-colors focus:outline-none focus-visible:ring-2 ` +
                    `focus-visible:ring-indigo-400/70 ` +
                    (isActive
                      ? 'bg-indigo-500/10 text-indigo-600 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-200/60')
                  }
                >
                  <span aria-hidden="true">
                    <SystemIcon icon={Icon} size="sm" strokeWidth={1.5} />
                  </span>
                  <span className="truncate">{category.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main content: grid of game cards */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div
          data-testid="games-toolbar"
          className="flex items-center gap-2 px-4 py-3 bg-white/80 border-b border-black/10"
        >
          <div className="text-sm font-semibold text-neutral-800">
            {(CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0]).label}
          </div>
          <div className="flex-1" />
          <div
            data-testid="games-count"
            className="text-xs text-neutral-500"
          >
            {visibleGames.length} games
          </div>
        </div>

        <div
          data-testid="games-grid"
          data-category={categoryId}
          role="list"
          aria-label="Games"
          className={
            `flex-1 min-h-0 overflow-y-auto grid auto-rows-fr ` +
            `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4`
          }
        >
          {visibleGames.length === 0 ? (
            <div
              data-testid="games-empty"
              className="col-span-full flex items-center justify-center text-sm text-neutral-500"
            >
              No games in this category
            </div>
          ) : (
            visibleGames.map((game) => {
              const isSelected = game.id === selectedGameId;
              return (
                <button
                  key={game.id}
                  type="button"
                  data-testid="games-card"
                  data-game-id={game.id}
                  data-game-category={game.category}
                  data-selected={isSelected ? 'true' : 'false'}
                  aria-pressed={isSelected}
                  aria-label={`Play ${game.title}: ${game.subtitle}`}
                  onClick={() => handleSelectGame(game.id)}
                  className={
                    `group relative flex flex-col rounded-lg overflow-hidden ` +
                    `bg-white shadow-sm border border-black/5 text-left ` +
                    `focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ` +
                    `transition-shadow hover:shadow-md ` +
                    (isSelected ? 'ring-2 ring-indigo-400' : '')
                  }
                >
                  <div
                    data-testid="games-card-cover"
                    aria-hidden="true"
                    className={
                      `aspect-[4/3] w-full bg-gradient-to-br ${game.color} ` +
                      `flex items-center justify-center text-white/95`
                    }
                  >
                    <SystemIcon icon={Play} size="lg" strokeWidth={1.75} />
                  </div>
                  <div className="px-3 py-2">
                    <div
                      data-testid="games-card-title"
                      className="text-sm font-semibold text-neutral-900 truncate"
                    >
                      {game.title}
                    </div>
                    <div
                      data-testid="games-card-subtitle"
                      className="text-xs text-neutral-600 truncate"
                    >
                      {game.subtitle}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default GamesApp;
export { CATEGORIES, GAMES, DEFAULT_CATEGORY_ID };
