import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { Music } from '@/app/components/apps/Music';

describe('Music', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('renders the player chrome and song list', () => {
    render(<Music />);
    expect(screen.getByTestId('music')).toBeTruthy();
    expect(screen.getByTestId('music-artwork')).toBeTruthy();
    expect(screen.getByTestId('music-play-pause')).toBeTruthy();
    expect(screen.getByTestId('music-song-list')).toBeTruthy();
  });

  it('displays the first song by default', () => {
    render(<Music />);
    expect(screen.getByTestId('music-title').textContent).toBe('Sierra Sunrise');
    expect(screen.getByTestId('music-artist').textContent).toBe('Tahoe Collective');
  });

  it('toggles play and pause', () => {
    render(<Music />);
    const playPause = screen.getByTestId('music-play-pause');
    expect(playPause.getAttribute('aria-label')).toBe('Play');
    fireEvent.click(playPause);
    expect(playPause.getAttribute('aria-label')).toBe('Pause');
    fireEvent.click(playPause);
    expect(playPause.getAttribute('aria-label')).toBe('Play');
  });

  it('advances progress while playing', () => {
    vi.useFakeTimers();
    render(<Music />);
    fireEvent.click(screen.getByTestId('music-play-pause'));
    expect(screen.getByTestId('music-current-time').textContent).toBe('0:00');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('music-current-time').textContent).toBe('0:03');
  });

  it('skips to the next track', () => {
    render(<Music />);
    fireEvent.click(screen.getByTestId('music-next'));
    expect(screen.getByTestId('music-title').textContent).toBe('Pine Forest');
  });

  it('skips to the previous track', () => {
    render(<Music />);
    fireEvent.click(screen.getByTestId('music-prev'));
    expect(screen.getByTestId('music-title').textContent).toBe('Mountain Pass');
  });

  it('selects and plays a song from the list', () => {
    render(<Music />);
    fireEvent.click(screen.getByTestId('music-song-4'));
    expect(screen.getByTestId('music-title').textContent).toBe('Ocean Air');
    expect(screen.getByTestId('music-play-pause').getAttribute('aria-label')).toBe('Pause');
  });
});
