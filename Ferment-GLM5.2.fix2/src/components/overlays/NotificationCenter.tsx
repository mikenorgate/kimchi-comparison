import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassSurface } from '@/components/glass/GlassSurface'
import { useOverlays } from '@/lib/overlays-context'
import { NOTIFICATIONS, WEATHER } from '@/lib/notification-center-data'

/**
 * macOS Notification Center — slides in from the right edge.
 *
 * - Triggered by clicking the menu-bar clock (or a right-edge swipe in real
 *   macOS; here it's the clock).
 * - Top: large clock widget (current time + date).
 * - Below: weather widget (location, current temp, condition, 5-day forecast).
 * - Below: a scrollable list of mock notifications (app icon, title, body,
 *   time).
 * - Click-outside or Escape closes.
 */
export function NotificationCenter() {
  const { isOpen, close } = useOverlaysState()
  const [now, setNow] = useState(() => new Date())

  // Live clock for the widget (updates every second for the seconds-less
  // display, but keeps the value fresh).
  useEffect(() => {
    if (!isOpen('notification-center')) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen('notification-center') && (
        <>
          {/* Click-away backdrop (transparent) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9600 }}
            onClick={close}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: 360, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              top: 30,
              right: 8,
              bottom: 8,
              width: 340,
              zIndex: 9601,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflowY: 'auto',
              paddingBottom: 10,
            }}
          >
            <ClockWidget now={now} />
            <WeatherWidget />
            <NotificationsList />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------------------------------------------------- */
/* Clock widget                                                                */
/* -------------------------------------------------------------------------- */

function ClockWidget({ now }: { now: Date }) {
  return (
    <GlassSurface
      variant="prominent"
      style={{ borderRadius: 18, padding: '16px 18px' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 200,
              lineHeight: 1,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {clockTime(now)}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginTop: 4,
            }}
          >
            {clockDate(now)}
          </div>
        </div>
        <span style={{ fontSize: 28, opacity: 0.6 }}>🕐</span>
      </div>
    </GlassSurface>
  )
}

function clockTime(d: Date): string {
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

function clockDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/* -------------------------------------------------------------------------- */
/* Weather widget                                                              */
/* -------------------------------------------------------------------------- */

function WeatherWidget() {
  return (
    <GlassSurface
      variant="prominent"
      style={{ borderRadius: 18, padding: '14px 18px' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {WEATHER.location}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 200,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {WEATHER.current}°
            <span style={{ fontSize: 22 }}>{WEATHER.icon}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {WEATHER.condition} · H:{WEATHER.high}° L:{WEATHER.low}°
          </div>
        </div>
      </div>
      {/* Forecast */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 10,
          borderTop: '0.5px solid var(--glass-border-inner)',
        }}
      >
        {WEATHER.forecast.map((day) => (
          <div
            key={day.day}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flex: 1,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {day.day}
            </span>
            <span style={{ fontSize: 18 }}>{day.icon}</span>
            <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
              {day.high}°
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {day.low}°
            </span>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

/* -------------------------------------------------------------------------- */
/* Notifications list                                                          */
/* -------------------------------------------------------------------------- */

function NotificationsList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          padding: '0 4px',
        }}
      >
        Notifications
      </div>
      {NOTIFICATIONS.map((n) => (
        <GlassSurface
          key={n.id}
          variant="regular"
          style={{ borderRadius: 14, padding: '12px 14px' }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(120,120,128,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {n.appIcon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {n.app}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {n.time}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: 1,
                }}
              >
                {n.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {n.body}
              </div>
            </div>
          </div>
        </GlassSurface>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* hook wrapper                                                                 */
/* -------------------------------------------------------------------------- */

function useOverlaysState() {
  const overlays = useOverlays()
  return {
    isOpen: overlays.isOpen,
    close: overlays.close,
  }
}
