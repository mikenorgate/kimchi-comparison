import { useState } from 'react'
import { PLAYLIST } from '@/data/media-data'
import { GlassSurface } from '@/components/glass/GlassSurface'

const SIDEBAR_SECTIONS = ['Playlists', 'Albums', 'Songs'] as const

function formatToSeconds(duration: string): number {
  const [m, s] = duration.split(':').map(Number)
  return m * 60 + s
}

export default function MusicApp() {
  const [currentId, setCurrentId] = useState<string>(PLAYLIST[0].id)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  const currentIndex = PLAYLIST.findIndex((t) => t.id === currentId)
  const current = PLAYLIST[currentIndex]
  const totalSeconds = current ? formatToSeconds(current.duration) : 0

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % PLAYLIST.length
    setCurrentId(PLAYLIST[nextIndex].id)
    setProgress(0)
  }

  const playPrev = () => {
    const prevIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length
    setCurrentId(PLAYLIST[prevIndex].id)
    setProgress(0)
  }

  const selectTrack = (id: string) => {
    setCurrentId(id)
    setProgress(0)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!isPlaying) {
      setProgress((p) => (p + 1) % (totalSeconds + 1))
    }
    setIsPlaying((v) => !v)
  }

  const progressPct = totalSeconds > 0 ? (progress / totalSeconds) * 100 : 0

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <GlassSurface
        variant="regular"
        style={{ width: 180, padding: 16, borderRight: '1px solid var(--glass-border-inner)' }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5, marginBottom: 12 }}>
          Library
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SIDEBAR_SECTIONS.map((section) => (
            <div
              key={section}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 14,
                color: 'var(--text-primary)',
              }}
            >
              {section}
            </div>
          ))}
        </nav>
      </GlassSurface>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border-inner)' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Songs</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {PLAYLIST.map((track) => {
            const isActive = track.id === currentId
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 16px',
                  gap: 12,
                  background: isActive ? 'var(--accent)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: isActive ? '#fff' : 'var(--text-primary)',
                  font: 'inherit',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artist}
                  </div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{track.duration}</div>
              </button>
            )
          })}
        </div>

        <GlassSurface
          variant="prominent"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            borderTop: '1px solid var(--glass-border-inner)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {current.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {current.artist}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={playPrev} aria-label="Previous" style={iconBtn}>⏮</button>
            <button type="button" onClick={togglePlay} aria-label="Play/Pause" style={{ ...iconBtn, width: 34, height: 34, fontSize: 16 }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button type="button" onClick={playNext} aria-label="Next" style={iconBtn}>⏭</button>
          </div>

          <div style={{ width: 120 }}>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--glass-border-inner)', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)' }} />
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 14,
}
