import { useCallback, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ListMusic,
  Users,
  Disc3,
  Music2,
  Music,
  Search,
} from 'lucide-react';
import SystemIcon from '../SystemIcon.jsx';

/**
 * MusicApp
 *
 * Tahoe-style Music window modelled after Apple Music.
 *
 * Layout (top to bottom):
 *   - Sidebar (left): library sections (Playlists, Artists, Albums, Songs).
 *   - Main content (centre): heading for the active section plus a list of
 *     mock tracks (title, artist, album, duration). Clicking a row selects
 *     it and updates the now-playing panel.
 *   - Now-playing panel (bottom, sticky): current track info
 *     (title / artist / album), previous / play / next transport controls,
 *     and a progress / scrubber placeholder.
 *
 * Pure UI mock — no real audio, no persistence. State is owned locally.
 *
 * Exposes `data-testid` hooks used by the test suite:
 *   - music-app
 *   - music-sidebar, music-sidebar-section
 *   - music-library, music-library-header, music-library-list, music-track
 *   - music-now-playing, music-now-playing-title, music-now-playing-artist,
 *     music-now-playing-album
 *   - music-prev, music-play, music-next
 *   - music-progress
 */

const LIBRARY_SECTIONS = Object.freeze([
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'artists',   label: 'Artists',   icon: Users },
  { id: 'albums',    label: 'Albums',    icon: Disc3 },
  { id: 'songs',     label: 'Songs',     icon: Music2 },
]);

const DEFAULT_SECTION_ID = 'songs';

const MOCK_TRACKS = Object.freeze([
  { id: 't1',  title: 'Tahoe Sunrise',   artist: 'The Mountains',     album: 'Alpine Echoes',  duration: '3:42' },
  { id: 't2',  title: 'Lakeside Walk',   artist: 'Cove & Co.',        album: 'Quiet Shores',   duration: '4:15' },
  { id: 't3',  title: 'Pinewood Hymn',   artist: 'Northwood Trio',    album: 'Forest Hymns',   duration: '5:08' },
  { id: 't4',  title: 'Neon Boulevard',  artist: 'Skyline',           album: 'After Dark',     duration: '3:21' },
  { id: 't5',  title: 'Driftwood',       artist: 'Haley Vance',       album: 'Tideline',       duration: '4:02' },
  { id: 't6',  title: 'Glacier',         artist: 'The Mountains',     album: 'Alpine Echoes',  duration: '6:14' },
  { id: 't7',  title: 'Campfire Loop',   artist: 'Northwood Trio',    album: 'Forest Hymns',   duration: '3:55' },
  { id: 't8',  title: 'Coastline',       artist: 'Haley Vance',       album: 'Tideline',       duration: '4:33' },
]);

const PLAY_LABEL = 'Play';
const PAUSE_LABEL = 'Pause';

function MusicApp() {
  const [sectionId, setSectionId] = useState(DEFAULT_SECTION_ID);
  const [selectedTrackId, setSelectedTrackId] = useState(
    () => MOCK_TRACKS[0].id,
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSection = useMemo(
    () => LIBRARY_SECTIONS.find((s) => s.id === sectionId) ?? LIBRARY_SECTIONS[0],
    [sectionId],
  );

  const tracksForSection = useMemo(() => {
    if (sectionId === 'songs') return MOCK_TRACKS;
    if (sectionId === 'albums') {
      const seen = new Set();
      const list = [];
      for (const track of MOCK_TRACKS) {
        if (!seen.has(track.album)) {
          seen.add(track.album);
          list.push(track);
        }
      }
      return list;
    }
    if (sectionId === 'artists') {
      const seen = new Set();
      const list = [];
      for (const track of MOCK_TRACKS) {
        if (!seen.has(track.artist)) {
          seen.add(track.artist);
          list.push(track);
        }
      }
      return list;
    }
    // playlists — show all tracks as a single flat list
    return MOCK_TRACKS;
  }, [sectionId]);

  const selectedTrack = useMemo(
    () => MOCK_TRACKS.find((t) => t.id === selectedTrackId) ?? MOCK_TRACKS[0],
    [selectedTrackId],
  );

  const handleSelectSection = useCallback((id) => {
    setSectionId(id);
  }, []);

  const handleSelectTrack = useCallback((id) => {
    setSelectedTrackId(id);
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((current) => !current);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedTrackId((currentId) => {
      const idx = MOCK_TRACKS.findIndex((t) => t.id === currentId);
      const prevIdx = idx <= 0 ? MOCK_TRACKS.length - 1 : idx - 1;
      return MOCK_TRACKS[prevIdx].id;
    });
    setIsPlaying(true);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedTrackId((currentId) => {
      const idx = MOCK_TRACKS.findIndex((t) => t.id === currentId);
      const nextIdx = idx === -1 || idx >= MOCK_TRACKS.length - 1 ? 0 : idx + 1;
      return MOCK_TRACKS[nextIdx].id;
    });
    setIsPlaying(true);
  }, []);

  const playLabel = isPlaying ? PAUSE_LABEL : PLAY_LABEL;

  return (
    <div
      data-testid="music-app"
      data-app-id="music"
      data-section={sectionId}
      data-is-playing={isPlaying ? 'true' : 'false'}
      className="flex h-full w-full bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-900 overflow-hidden"
    >
      {/* Sidebar */}
      <nav
        data-testid="music-sidebar"
        aria-label="Library"
        className="w-48 shrink-0 border-r border-black/10 bg-white/70 backdrop-blur-sm overflow-y-auto"
      >
        <div className="flex items-center gap-2 px-3 py-3 border-b border-black/5">
          <span aria-hidden="true" className="text-rose-500">
            <SystemIcon icon={Music} size="md" strokeWidth={1.5} />
          </span>
          <span className="text-sm font-semibold text-neutral-800">Library</span>
        </div>
        <ul className="flex flex-col py-1">
          {LIBRARY_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === sectionId;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  data-testid="music-sidebar-section"
                  data-section-id={section.id}
                  data-active={isActive ? 'true' : 'false'}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectSection(section.id)}
                  className={
                    `w-full flex items-center gap-2 px-3 py-2 text-sm text-left ` +
                    `transition-colors focus:outline-none focus-visible:ring-2 ` +
                    `focus-visible:ring-rose-400/70 ` +
                    (isActive
                      ? 'bg-rose-500/10 text-rose-600 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-200/60')
                  }
                >
                  <span aria-hidden="true">
                    <SystemIcon icon={Icon} size="sm" strokeWidth={1.5} />
                  </span>
                  <span className="truncate">{section.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main column: header + library + now-playing */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Header */}
        <div
          data-testid="music-header"
          className="flex items-center gap-2 px-4 py-3 bg-white/80 border-b border-black/10"
        >
          <span aria-hidden="true" className="text-neutral-500">
            <SystemIcon icon={Search} size="sm" strokeWidth={1.5} />
          </span>
          <input
            type="text"
            aria-label="Search library"
            placeholder="Search library"
            data-testid="music-search-input"
            className="flex-1 min-w-0 h-8 px-3 text-sm bg-white/80 border border-black/10 rounded-md outline-none focus:ring-2 focus:ring-rose-400/60"
          />
        </div>

        {/* Library list */}
        <div
          data-testid="music-library"
          data-section={sectionId}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-3"
        >
          <div
            data-testid="music-library-header"
            className="flex items-baseline justify-between mb-2"
          >
            <h2 className="text-base font-semibold text-neutral-900">
              {activeSection.label}
            </h2>
            <span
              data-testid="music-library-count"
              className="text-xs text-neutral-500"
            >
              {tracksForSection.length} tracks
            </span>
          </div>
          <div
            data-testid="music-library-list"
            role="list"
            aria-label={`${activeSection.label} tracks`}
            className="bg-white/70 rounded-md border border-black/5 overflow-hidden"
          >
            {tracksForSection.map((track, index) => {
              const isSelected = track.id === selectedTrack.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  data-testid="music-track"
                  data-track-id={track.id}
                  data-track-index={index}
                  data-selected={isSelected ? 'true' : 'false'}
                  aria-current={isSelected ? 'true' : undefined}
                  aria-label={`Play ${track.title} by ${track.artist}`}
                  onClick={() => handleSelectTrack(track.id)}
                  className={
                    `w-full grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1.5fr_1.5fr_auto] ` +
                    `items-center gap-3 px-3 py-2 text-left text-sm border-b border-black/5 ` +
                    `last:border-b-0 transition-colors focus:outline-none ` +
                    `focus-visible:ring-2 focus-visible:ring-rose-400/70 ` +
                    (isSelected
                      ? 'bg-rose-500/10 text-rose-700'
                      : 'text-neutral-800 hover:bg-neutral-100')
                  }
                >
                  <span className="truncate font-medium">{track.title}</span>
                  <span className="hidden sm:block truncate text-neutral-600">
                    {track.artist}
                  </span>
                  <span className="hidden sm:block truncate text-neutral-500">
                    {track.album}
                  </span>
                  <span className="text-xs text-neutral-500 tabular-nums">
                    {track.duration}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Now-playing panel */}
        <div
          data-testid="music-now-playing"
          data-track-id={selectedTrack.id}
          data-is-playing={isPlaying ? 'true' : 'false'}
          className="border-t border-black/10 bg-white/90 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            {/* Track info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-md bg-gradient-to-br from-rose-400 to-amber-400 shrink-0 flex items-center justify-center text-white"
              >
                <SystemIcon
                  icon={Music}
                  size="sm"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <div
                  data-testid="music-now-playing-title"
                  className="text-sm font-medium text-neutral-900 truncate"
                >
                  {selectedTrack.title}
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-600 truncate">
                  <span
                    data-testid="music-now-playing-artist"
                    className="truncate"
                  >
                    {selectedTrack.artist}
                  </span>
                  <span aria-hidden="true" className="text-neutral-400">
                    •
                  </span>
                  <span
                    data-testid="music-now-playing-album"
                    className="truncate"
                  >
                    {selectedTrack.album}
                  </span>
                </div>
              </div>
            </div>

            {/* Transport controls */}
            <div
              data-testid="music-controls"
              role="group"
              aria-label="Playback controls"
              className="flex items-center gap-1"
            >
              <button
                type="button"
                data-testid="music-prev"
                aria-label="Previous track"
                title="Previous"
                onClick={handlePrev}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-700 hover:bg-neutral-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
              >
                <SystemIcon icon={SkipBack} size="sm" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                data-testid="music-play"
                aria-label={playLabel}
                aria-pressed={isPlaying}
                data-state={isPlaying ? 'playing' : 'paused'}
                title={playLabel}
                onClick={handleTogglePlay}
                className={
                  `inline-flex items-center justify-center w-9 h-9 rounded-full ` +
                  `transition-colors focus:outline-none focus-visible:ring-2 ` +
                  `focus-visible:ring-rose-400/70 ` +
                  (isPlaying
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-neutral-900 text-white hover:bg-neutral-700')
                }
              >
                {isPlaying ? (
                  <SystemIcon icon={Pause} size="md" strokeWidth={2} />
                ) : (
                  <SystemIcon icon={Play} size="md" strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                data-testid="music-next"
                aria-label="Next track"
                title="Next"
                onClick={handleNext}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-700 hover:bg-neutral-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
              >
                <SystemIcon icon={SkipForward} size="sm" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Progress / scrubber */}
          <div
            data-testid="music-progress"
            data-progress="0"
            role="progressbar"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            className="px-3 pb-2"
          >
            <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
              <div
                aria-hidden="true"
                className="h-full w-0 bg-rose-500/80"
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-500 tabular-nums">
              <span data-testid="music-progress-current">0:00</span>
              <span data-testid="music-progress-total">{selectedTrack.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicApp;
export {
  LIBRARY_SECTIONS,
  MOCK_TRACKS,
  DEFAULT_SECTION_ID,
  PLAY_LABEL,
  PAUSE_LABEL,
};
