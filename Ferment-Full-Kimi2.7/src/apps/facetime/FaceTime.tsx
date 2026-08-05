import { useEffect, useMemo, useState } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Phone,
} from 'lucide-react'
import { contacts } from './data'

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function FaceTime() {
  const [activeContactId, setActiveContactId] = useState<string | null>(null)
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [duration, setDuration] = useState(0)

  const activeContact = useMemo(
    () => contacts.find((c) => c.id === activeContactId) ?? null,
    [activeContactId]
  )

  useEffect(() => {
    if (!isInCall) return
    setDuration(0)
    const interval = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(interval)
  }, [isInCall])

  const startCall = (id: string) => {
    setActiveContactId(id)
    setIsInCall(true)
    setIsMuted(false)
    setIsVideoOff(false)
    setDuration(0)
  }

  const endCall = () => {
    setIsInCall(false)
    setActiveContactId(null)
    setIsMuted(false)
    setIsVideoOff(false)
    setDuration(0)
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="facetime-app"
    >
      {!isInCall ? (
        <div className="flex flex-1 flex-col">
          <div className="flex h-12 items-center border-b border-tahoe-glass-border px-4 font-medium">
            FaceTime
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-3 px-2 text-sm font-semibold text-tahoe-text-secondary">
              Contacts
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => startCall(contact.id)}
                  className="flex items-center gap-3 rounded-tahoe-sm p-2 text-left transition-colors hover:bg-white/5"
                  data-testid={`facetime-contact-${contact.id}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${contact.color}`}
                  >
                    {contact.initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-xs text-tahoe-text-secondary">
                      Video
                    </div>
                  </div>
                  <div className="rounded-full bg-tahoe-green p-2 text-white">
                    <Phone className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative flex flex-1 flex-col bg-black/80 text-white"
          data-testid="facetime-call"
        >
          {/* Remote placeholder */}
          <div
            className="flex flex-1 flex-col items-center justify-center"
            data-testid="facetime-remote-video"
          >
            {activeContact && (
              <div
                className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold text-white ${activeContact.color}`}
              >
                {activeContact.initials}
              </div>
            )}
            <div className="text-xl font-medium" data-testid="facetime-call-name">
              {activeContact?.name}
            </div>
            <div
              className="mt-1 text-sm text-white/70"
              data-testid="facetime-duration"
            >
              {formatDuration(duration)}
            </div>
          </div>

          {/* Local preview placeholder */}
          <div
            className={`absolute right-4 top-4 flex h-28 w-36 items-center justify-center rounded-tahoe-md border border-white/20 text-sm text-white/70 ${
              isVideoOff ? 'bg-black' : 'bg-tahoe-text-secondary/30'
            }`}
            data-testid="facetime-local-video"
          >
            {isVideoOff ? 'Camera off' : 'Camera preview'}
          </div>

          {/* Controls */}
          <div
            className="flex items-center justify-center gap-6 pb-6"
            data-testid="facetime-controls"
          >
            <button
              onClick={() => setIsMuted((m) => !m)}
              className={`rounded-full p-3 ${
                isMuted ? 'bg-tahoe-red text-white' : 'bg-white/20 text-white'
              }`}
              data-testid="facetime-mute"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={() => setIsVideoOff((v) => !v)}
              className={`rounded-full p-3 ${
                isVideoOff
                  ? 'bg-tahoe-red text-white'
                  : 'bg-white/20 text-white'
              }`}
              data-testid="facetime-video"
              aria-label={isVideoOff ? 'Turn video on' : 'Turn video off'}
            >
              {isVideoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={endCall}
              className="rounded-full bg-tahoe-red p-3 text-white hover:opacity-90"
              data-testid="facetime-end"
              aria-label="End call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
