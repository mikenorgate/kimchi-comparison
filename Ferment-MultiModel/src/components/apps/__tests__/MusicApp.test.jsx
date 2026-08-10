import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import MusicApp, {
  LIBRARY_SECTIONS,
  MOCK_TRACKS,
} from '../MusicApp.jsx';

afterEach(() => {
  cleanup();
});

function renderMusic() {
  return render(<MusicApp />);
}

describe('<MusicApp />', () => {
  it('renders the app root with the canonical data-testid', () => {
    renderMusic();
    const root = screen.getByTestId('music-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'music');
    // Default section is "songs".
    expect(root).toHaveAttribute('data-section', 'songs');
  });

  it('renders the library list with all mock tracks', () => {
    renderMusic();
    const list = screen.getByTestId('music-library-list');
    expect(list).toBeInTheDocument();

    const rows = within(list).getAllByTestId('music-track');
    expect(rows).toHaveLength(MOCK_TRACKS.length);

    const ids = rows.map((row) => row.getAttribute('data-track-id'));
    const expectedIds = MOCK_TRACKS.map((t) => t.id);
    expect(ids).toEqual(expectedIds);
  });

  it('renders a sidebar with each library section', () => {
    renderMusic();
    const sidebar = screen.getByTestId('music-sidebar');
    expect(sidebar).toBeInTheDocument();

    const sections = within(sidebar).getAllByTestId(
      'music-sidebar-section',
    );
    expect(sections).toHaveLength(LIBRARY_SECTIONS.length);

    const sectionIds = sections.map((s) => s.getAttribute('data-section-id'));
    const expectedIds = LIBRARY_SECTIONS.map((s) => s.id);
    expect(sectionIds).toEqual(expectedIds);
  });

  it('marks the default Songs section as active in the sidebar', () => {
    renderMusic();
    const sidebar = screen.getByTestId('music-sidebar');
    const sections = within(sidebar).getAllByTestId(
      'music-sidebar-section',
    );
    const active = sections.find(
      (s) => s.getAttribute('data-section-id') === 'songs',
    );
    expect(active).toHaveAttribute('data-active', 'true');

    // Other sections are not active.
    const others = sections.filter(
      (s) => s.getAttribute('data-section-id') !== 'songs',
    );
    others.forEach((s) => {
      expect(s).toHaveAttribute('data-active', 'false');
    });
  });

  it('renders the now-playing panel with track info and transport controls', () => {
    renderMusic();
    const panel = screen.getByTestId('music-now-playing');
    expect(panel).toBeInTheDocument();

    // Track info nodes are present.
    expect(
      screen.getByTestId('music-now-playing-title'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('music-now-playing-artist'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('music-now-playing-album'),
    ).toBeInTheDocument();

    // Transport + progress are present.
    expect(screen.getByTestId('music-prev')).toBeInTheDocument();
    expect(screen.getByTestId('music-play')).toBeInTheDocument();
    expect(screen.getByTestId('music-next')).toBeInTheDocument();
    expect(screen.getByTestId('music-progress')).toBeInTheDocument();
  });

  it('clicking a track updates the now-playing track info', () => {
    renderMusic();
    const target = MOCK_TRACKS[2];

    const list = screen.getByTestId('music-library-list');
    const row = within(list).getAllByTestId('music-track').find(
      (r) => r.getAttribute('data-track-id') === target.id,
    );
    expect(row).toBeDefined();
    fireEvent.click(row);

    const panel = screen.getByTestId('music-now-playing');
    expect(panel).toHaveAttribute('data-track-id', target.id);

    expect(screen.getByTestId('music-now-playing-title')).toHaveTextContent(
      target.title,
    );
    expect(screen.getByTestId('music-now-playing-artist')).toHaveTextContent(
      target.artist,
    );
    expect(screen.getByTestId('music-now-playing-album')).toHaveTextContent(
      target.album,
    );

    // The clicked track should be marked as selected in the list.
    expect(row).toHaveAttribute('data-selected', 'true');
  });

  it('play/pause toggles the button state and the root data-is-playing flag', () => {
    renderMusic();
    const play = screen.getByTestId('music-play');
    const root = screen.getByTestId('music-app');
    const panel = screen.getByTestId('music-now-playing');

    // Default: paused.
    expect(play).toHaveAttribute('aria-pressed', 'false');
    expect(play).toHaveAttribute('data-state', 'paused');
    expect(root).toHaveAttribute('data-is-playing', 'false');
    expect(panel).toHaveAttribute('data-is-playing', 'false');

    fireEvent.click(play);
    expect(play).toHaveAttribute('aria-pressed', 'true');
    expect(play).toHaveAttribute('data-state', 'playing');
    expect(root).toHaveAttribute('data-is-playing', 'true');
    expect(panel).toHaveAttribute('data-is-playing', 'true');

    fireEvent.click(play);
    expect(play).toHaveAttribute('aria-pressed', 'false');
    expect(play).toHaveAttribute('data-state', 'paused');
    expect(root).toHaveAttribute('data-is-playing', 'false');
    expect(panel).toHaveAttribute('data-is-playing', 'false');
  });

  it('clicking a track also starts playback', () => {
    renderMusic();
    const play = screen.getByTestId('music-play');
    const root = screen.getByTestId('music-app');

    expect(root).toHaveAttribute('data-is-playing', 'false');

    const list = screen.getByTestId('music-library-list');
    const row = within(list).getAllByTestId('music-track')[1];
    fireEvent.click(row);

    expect(play).toHaveAttribute('aria-pressed', 'true');
    expect(play).toHaveAttribute('data-state', 'playing');
    expect(root).toHaveAttribute('data-is-playing', 'true');
  });

  it('selecting a different sidebar section updates the data-section attribute', () => {
    renderMusic();
    const root = screen.getByTestId('music-app');
    expect(root).toHaveAttribute('data-section', 'songs');

    const sidebar = screen.getByTestId('music-sidebar');
    const artistsBtn = within(sidebar)
      .getAllByTestId('music-sidebar-section')
      .find((s) => s.getAttribute('data-section-id') === 'artists');
    expect(artistsBtn).toBeDefined();
    fireEvent.click(artistsBtn);

    expect(root).toHaveAttribute('data-section', 'artists');
    expect(artistsBtn).toHaveAttribute('data-active', 'true');
  });

  it('every track row exposes accessible title/artist labels', () => {
    renderMusic();
    const list = screen.getByTestId('music-library-list');
    const rows = within(list).getAllByTestId('music-track');

    rows.forEach((row) => {
      const trackId = row.getAttribute('data-track-id');
      const track = MOCK_TRACKS.find((t) => t.id === trackId);
      expect(track).toBeDefined();
      expect(row).toHaveTextContent(track.title);
      expect(row).toHaveTextContent(track.artist);
      expect(row).toHaveTextContent(track.duration);
      expect(row.getAttribute('aria-label')).toContain(track.title);
    });
  });
});
