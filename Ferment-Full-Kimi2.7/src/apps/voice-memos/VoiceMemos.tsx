import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  Square,
  Mic,
  Trash2,
  Plus,
  MoreHorizontal,
} from 'lucide-react'
import { sampleRecordings } from './data'
import type { Recording } from './types'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTimer(seconds: number) {
  return new Date(seconds * 1000).toISOString().slice(14, 19)
}

function generateWaveform(seed: string) {
  const bars = 48
  const values: number[] = []
  let value = 0
  for (let i = 0; i < seed.length; i++) {
    value = (value + seed.charCodeAt(i)) % 997
  }
  for (let i = 0; i < bars; i++) {
    value = (value * 9301 + 49297) % 233280
    const normalized = value / 233280
    values.push(Math.max(0.15, normalized))
  }
  return values
}

export function VoiceMemos() {
  const [recordings, setRecordings] = useState<Recording[]>(sampleRecordings)
  const [selectedId, setSelectedId] = useState<string>(sampleRecordings[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  const selectedRecording = useMemo(
    () => recordings.find((r) => r.id === selectedId) ?? recordings[0],
    [recordings, selectedId]
  )

  const waveform = useMemo(
    () => generateWaveform(selectedRecording?.id ?? 'default'),
    [selectedRecording]
  )

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setRecordingSeconds(0)
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    const newRecording: Recording = {
      id: `rec-${Date.now()}`,
      title: `New Recording ${recordings.length + 1}`,
      date: 'Just now',
      duration: recordingSeconds || 1,
    }
    setRecordings((prev) => [newRecording, ...prev])
    setSelectedId(newRecording.id)
    setRecordingSeconds(0)
  }, [recordings.length, recordingSeconds])

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      setSelectedId((current) =>
        current === id ? filtered[0]?.id ?? '' : current
      )
      return filtered
    })
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isPlaying || !selectedRecording) return
    intervalRef.current = setInterval(() => {
      setPlaybackProgress((p) => {
        if (p >= selectedRecording.duration) {
          setIsPlaying(false)
          return 0
        }
        return p + 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, selectedRecording])

  useEffect(() => {
    if (!isRecording) return
    intervalRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRecording])

  useEffect(() => {
    setPlaybackProgress(0)
    setIsPlaying(false)
  }, [selectedId])

  return (
    <div
      className="flex h-full bg-tahoe-surface text-tahoe-text overflow-hidden"
      data-testid="voice-memos-app"
    >
      <div
        className="w-56 flex flex-col border-r border-white/10 bg-tahoe-glass/30"
        data-testid="voice-memos-sidebar"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <span className="text-sm font-semibold">All Recordings</span>
          <button
            onClick={startRecording}
            className="p-1.5 rounded-md hover:bg-white/10 text-tahoe-red"
            aria-label="Record new memo"
            data-testid="voice-memos-record"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {recordings.map((recording) => (
            <button
              key={recording.id}
              onClick={() => setSelectedId(recording.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedId === recording.id
                  ? 'bg-tahoe-accent text-white'
                  : 'hover:bg-white/10'
              }`}
              data-testid={`voice-memo-${recording.id}`}
            >
              <div className="font-medium truncate">{recording.title}</div>
              <div className="text-xs opacity-70 truncate">{recording.date}</div>
              <div className="text-xs opacity-70">{formatDuration(recording.duration)}</div>
            </button>
          ))}
          {recordings.length === 0 && (
            <p
              className="text-sm text-tahoe-text-secondary px-2"
              data-testid="voice-memos-empty"
            >
              No recordings
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2
            className="text-lg font-semibold truncate"
            data-testid="voice-memos-title"
          >
            {selectedRecording?.title ?? 'Voice Memos'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-md hover:bg-white/10 text-tahoe-text-secondary"
              aria-label="More options"
              data-testid="voice-memos-more"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {selectedRecording && (
              <button
                onClick={() => deleteRecording(selectedRecording.id)}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-tahoe-text-secondary hover:text-red-400"
                aria-label="Delete recording"
                data-testid="voice-memos-delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {isRecording ? (
            <>
              <div
                className="text-4xl font-light tabular-nums text-tahoe-red"
                data-testid="voice-memos-timer"
              >
                {formatTimer(recordingSeconds)}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tahoe-red animate-pulse" />
                <span className="text-sm text-tahoe-text-secondary">Recording</span>
              </div>
              <button
                onClick={stopRecording}
                className="p-4 rounded-full bg-tahoe-red text-white hover:brightness-110"
                aria-label="Stop recording"
                data-testid="voice-memos-stop"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            </>
          ) : (
            <>
              <div className="w-full max-w-md flex items-end gap-1 h-32 px-2">
                {waveform.map((height, index) => {
                  const progressRatio = selectedRecording
                    ? playbackProgress / selectedRecording.duration
                    : 0
                  const active = index / waveform.length <= progressRatio
                  return (
                    <div
                      key={index}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        height: `${height * 100}%`,
                        backgroundColor: active
                          ? 'var(--color-tahoe-accent)'
                          : 'var(--color-tahoe-text-secondary)',
                        opacity: active ? 1 : 0.5,
                      }}
                      data-testid={`voice-memos-wave-${index}`}
                    />
                  )
                })}
              </div>

              <div
                className="text-2xl font-light tabular-nums text-tahoe-text-secondary"
                data-testid="voice-memos-progress"
              >
                {formatDuration(playbackProgress)} /{' '}
                {formatDuration(selectedRecording?.duration ?? 0)}
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={startRecording}
                  className="p-3 rounded-full hover:bg-white/10 text-tahoe-text-secondary"
                  aria-label="Record"
                  data-testid="voice-memos-record-large"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  disabled={!selectedRecording}
                  className="p-4 rounded-full bg-tahoe-accent text-white hover:brightness-110 disabled:opacity-50"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  data-testid="voice-memos-play-pause"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={stopPlayback}
                  className="p-3 rounded-full hover:bg-white/10 text-tahoe-text-secondary"
                  aria-label="Stop"
                  data-testid="voice-memos-stop-playback"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
