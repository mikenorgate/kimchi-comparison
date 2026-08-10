import { useState } from 'react';
import { CALENDAR_EVENTS } from '@/data/productivity-data';
import { GlassSurface } from '@/components/glass/GlassSurface';

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Assume a 31-day month starting on Wednesday (index 3).
const START_DAY_INDEX = 3;
const DAYS_IN_MONTH = 31;

export default function CalendarApp({ windowId: _windowId }: { windowId?: string }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  // Build grid cells: leading blanks for the start offset, then days 1..31, plus trailing blanks.
  const cells: (number | null)[] = [
    ...Array(START_DAY_INDEX).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];
  // Pad to a multiple of 7 so the grid stays rectangular.
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const eventsForDay = (day: number) =>
    CALENDAR_EVENTS.filter((e) => e.day === day);

  return (
    <GlassSurface
      variant="regular"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--glass-border-inner)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }} aria-hidden>📅</span>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            August 2026
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            aria-label="Previous month"
            style={navBtnStyle}
            onClick={() => {}}
          >
            ‹
          </button>
          <button
            aria-label="Next month"
            style={navBtnStyle}
            onClick={() => {}}
          >
            ›
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          padding: '8px 8px 0',
          flexShrink: 0,
        }}
      >
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              padding: '6px 0',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          padding: '0 8px 8px',
          flex: 1,
          minHeight: 0,
          alignContent: 'start',
        }}
      >
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} style={cellStyle(null)} />;
          }
          const events = eventsForDay(day);
          const isSelected = selectedDay === day;
          return (
            <button
              key={`day-${day}`}
              onClick={() => setSelectedDay(day)}
              style={cellStyle(isSelected)}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSelected
                    ? 'var(--window-bg)'
                    : 'var(--text-primary)',
                  marginBottom: 4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {events.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      fontSize: 10,
                      padding: '2px 5px',
                      borderRadius: 5,
                      background: `${e.color}33`,
                      color: e.color,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{e.time}</span> {e.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </GlassSurface>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: 20,
  lineHeight: 1,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function cellStyle(isSelected: boolean | null): React.CSSProperties {
  return {
    minHeight: 64,
    padding: 4,
    borderRadius: 8,
    border: 'none',
    background: isSelected ? 'var(--accent)' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };
}
