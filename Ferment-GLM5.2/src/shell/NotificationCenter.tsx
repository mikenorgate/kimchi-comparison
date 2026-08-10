/**
 * NotificationCenter — macOS Tahoe Notification Center panel.
 *
 * - Toggled from the MenuBar Notification Center icon
 * - Right-aligned glass panel below the menu bar
 * - Shows mock notifications, a calendar widget, and a weather widget
 * - Esc or click-outside closes
 */

import { useState, useEffect, useRef } from 'react';

export interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  app: string;
  title: string;
  body: string;
  time: string;
}

// ── Mock notifications ──────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    app: 'Messages',
    title: 'Alex Chen',
    body: 'Hey, are we still on for lunch tomorrow?',
    time: '2m ago',
  },
  {
    id: 'n2',
    app: 'Mail',
    title: 'GitHub',
    body: 'Your pull request #142 was approved',
    time: '15m ago',
  },
  {
    id: 'n3',
    app: 'Calendar',
    title: 'Team Standup',
    body: 'Starts in 30 minutes — Conference Room B',
    time: '9:00 AM',
  },
  {
    id: 'n4',
    app: 'Reminders',
    title: 'Pick up groceries',
    body: 'Milk, eggs, bread, and coffee beans',
    time: '1h ago',
  },
];

// ── Calendar Widget ──────────────────────────────────────────────

function CalendarWidget() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateNum = now.getDate();

  return (
    <div
      className="rounded-2xl p-4 flex flex-col items-center justify-center bg-gradient-to-br from-[#ff453a] to-[#ff9f0a] text-white"
      style={{ aspectRatio: '1.4' }}
      data-testid="nc-calendar-widget"
    >
      <div className="text-xs font-medium opacity-80">{dayName}</div>
      <div className="text-5xl font-bold leading-none mt-1">{dateNum}</div>
    </div>
  );
}

// ── Weather Widget ───────────────────────────────────────────────

function WeatherWidget() {
  return (
    <div
      className="rounded-2xl p-4 bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] text-white"
      data-testid="nc-weather-widget"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs opacity-80">Cupertino</div>
          <div className="text-3xl font-bold">72°</div>
          <div className="text-xs opacity-80">Sunny</div>
        </div>
        <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="20" cy="20" r="8" fill="#ffd60a" stroke="#ffd60a" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={20 + Math.cos(rad) * 11}
                y1={20 + Math.sin(rad) * 11}
                x2={20 + Math.cos(rad) * 14}
                y2={20 + Math.sin(rad) * 14}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-[10px] opacity-80">
        <span>H:78° L:64°</span>
        <span>72°</span>
      </div>
    </div>
  );
}

// ── Notification Card ────────────────────────────────────────────

function NotificationCard({ notif }: { notif: Notification }) {
  return (
    <div
      className="rounded-xl p-3 bg-white/10 hover:bg-white/15 transition-colors"
      data-testid={`nc-notification-${notif.id}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-white/60 uppercase tracking-wide">{notif.app}</span>
        <span className="text-[10px] text-white/40">{notif.time}</span>
      </div>
      <div className="text-sm font-semibold text-white">{notif.title}</div>
      <div className="text-xs text-white/70 mt-0.5 line-clamp-2">{notif.body}</div>
    </div>
  );
}

// ── NotificationCenter ────────────────────────────────────────────

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  // No document mousedown listener — the backdrop div handles click-outside.
  // This avoids race conditions with menubar icon clicks.

  // Clear all notifications
  const clearAll = () => setNotifications([]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 w-screen h-screen"
      style={{ zIndex: 1150, pointerEvents: 'none' }}
    >
      {/* Backdrop: covers full screen below the menubar, click closes panel */}
      <div
        className="absolute inset-0"
        style={{ top: 'var(--height-menubar)', pointerEvents: 'auto' }}
        onClick={onClose}
        data-testid="notification-center-backdrop"
      />
      <div
        ref={panelRef}
        className="glass-surface-heavy bg-white/50 dark:bg-gray-900/50 rounded-2xl shadow-panel m-2 p-3 overflow-y-auto relative"
        style={{
          width: '340px',
          marginTop: 'calc(var(--height-menubar) + 4px)',
          maxHeight: 'calc(100vh - var(--height-menubar) - 80px)',
          boxShadow: 'var(--shadow-panel), var(--shadow-specular)',
          pointerEvents: 'auto',
        }}
        data-testid="notification-center-panel"
      >
        {/* Widgets row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <CalendarWidget />
          <WeatherWidget />
        </div>

        {/* Notifications header */}
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-semibold text-white/80">Notifications</span>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[10px] text-white/50 hover:text-white/80 transition-colors"
              data-testid="nc-clear-all"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex flex-col gap-2" data-testid="nc-notification-list">
          {notifications.map((notif) => (
            <NotificationCard key={notif.id} notif={notif} />
          ))}
        </div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <div className="text-center py-8 text-xs text-white/40" data-testid="nc-empty">
            No New Notifications
          </div>
        )}
      </div>
    </div>
  );
}
