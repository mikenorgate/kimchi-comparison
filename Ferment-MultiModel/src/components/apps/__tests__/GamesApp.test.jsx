import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import GamesApp, {
  CATEGORIES,
  GAMES,
  DEFAULT_CATEGORY_ID,
} from '../GamesApp.jsx';

afterEach(() => {
  cleanup();
});

function renderGames() {
  return render(<GamesApp />);
}

function gamesForCategory(categoryId) {
  return GAMES.filter((g) => g.category === categoryId);
}

describe('<GamesApp />', () => {
  it('renders the app root with the canonical data-testid', () => {
    renderGames();
    const root = screen.getByTestId('games-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'games');
    expect(root).toHaveAttribute('data-category', DEFAULT_CATEGORY_ID);
  });

  it('renders a sidebar with every category', () => {
    renderGames();
    const sidebar = screen.getByTestId('games-sidebar');
    expect(sidebar).toBeInTheDocument();

    const categories = within(sidebar).getAllByTestId('games-category');
    expect(categories).toHaveLength(CATEGORIES.length);

    const ids = categories.map((c) => c.getAttribute('data-category-id'));
    const expectedIds = CATEGORIES.map((c) => c.id);
    expect(ids).toEqual(expectedIds);
  });

  it('marks the default category as active', () => {
    renderGames();
    const sidebar = screen.getByTestId('games-sidebar');
    const categories = within(sidebar).getAllByTestId('games-category');

    const active = categories.find(
      (c) => c.getAttribute('data-category-id') === DEFAULT_CATEGORY_ID,
    );
    expect(active).toHaveAttribute('data-active', 'true');

    const others = categories.filter(
      (c) => c.getAttribute('data-category-id') !== DEFAULT_CATEGORY_ID,
    );
    others.forEach((c) => {
      expect(c).toHaveAttribute('data-active', 'false');
    });
  });

  it('renders cards only for the default category on first render', () => {
    renderGames();
    const grid = screen.getByTestId('games-grid');
    const cards = within(grid).getAllByTestId('games-card');

    const expected = gamesForCategory(DEFAULT_CATEGORY_ID);
    expect(cards).toHaveLength(expected.length);

    const ids = cards.map((c) => c.getAttribute('data-game-id'));
    const expectedIds = expected.map((g) => g.id);
    expect(ids).toEqual(expectedIds);
  });

  it('every visible card displays its title and subtitle', () => {
    renderGames();
    const grid = screen.getByTestId('games-grid');
    const cards = within(grid).getAllByTestId('games-card');

    cards.forEach((card) => {
      const gameId = card.getAttribute('data-game-id');
      const game = GAMES.find((g) => g.id === gameId);
      expect(game).toBeDefined();

      const title = within(card).getByTestId('games-card-title');
      const subtitle = within(card).getByTestId('games-card-subtitle');
      const cover = within(card).getByTestId('games-card-cover');

      expect(title).toHaveTextContent(game.title);
      expect(subtitle).toHaveTextContent(game.subtitle);
      expect(cover).toBeInTheDocument();

      // The accessible name should reference both title and subtitle.
      expect(card.getAttribute('aria-label')).toContain(game.title);
      expect(card.getAttribute('aria-label')).toContain(game.subtitle);
    });
  });

  it('clicking a category filters the visible cards', () => {
    renderGames();
    const root = screen.getByTestId('games-app');
    const sidebar = screen.getByTestId('games-sidebar');

    // Switch through every category and confirm the grid reflects the change.
    CATEGORIES.forEach((category) => {
      const btn = within(sidebar)
        .getAllByTestId('games-category')
        .find((c) => c.getAttribute('data-category-id') === category.id);
      expect(btn).toBeDefined();

      fireEvent.click(btn);

      expect(root).toHaveAttribute('data-category', category.id);
      expect(btn).toHaveAttribute('data-active', 'true');

      const grid = screen.getByTestId('games-grid');
      expect(grid).toHaveAttribute('data-category', category.id);

      const cards = within(grid).getAllByTestId('games-card');
      const expected = gamesForCategory(category.id);
      expect(cards).toHaveLength(expected.length);

      const ids = cards.map((c) => c.getAttribute('data-game-id'));
      const expectedIds = expected.map((g) => g.id);
      expect(ids).toEqual(expectedIds);

      // No card from another category should leak through.
      const otherIds = new Set(
        GAMES.filter((g) => g.category !== category.id).map((g) => g.id),
      );
      ids.forEach((id) => {
        expect(otherIds.has(id)).toBe(false);
      });
    });
  });

  it('switching categories marks only the new category as active', () => {
    renderGames();
    const sidebar = screen.getByTestId('games-sidebar');

    const targetBtn = within(sidebar)
      .getAllByTestId('games-category')
      .find((c) => c.getAttribute('data-category-id') === 'puzzle');
    expect(targetBtn).toBeDefined();

    fireEvent.click(targetBtn);

    const categories = within(sidebar).getAllByTestId('games-category');
    const active = categories.filter(
      (c) => c.getAttribute('data-active') === 'true',
    );
    expect(active).toHaveLength(1);
    expect(active[0]).toBe(targetBtn);
  });

  it('cards expose their category via data-game-category', () => {
    renderGames();
    const grid = screen.getByTestId('games-grid');
    const cards = within(grid).getAllByTestId('games-card');

    cards.forEach((card) => {
      const gameId = card.getAttribute('data-game-id');
      const game = GAMES.find((g) => g.id === gameId);
      expect(card).toHaveAttribute('data-game-category', game.category);
    });
  });
});
