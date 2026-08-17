'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginScreenProps {
  onUnlock: () => void;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function LoginScreen({ onUnlock }: LoginScreenProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-testid="login-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 text-white backdrop-blur-2xl"
    >
      <div className="flex flex-col items-center text-center">
        <div
          data-testid="login-time"
          className="text-8xl font-light tracking-tight"
          suppressHydrationWarning
        >
          {time ? formatClock(time) : '00:00'}
        </div>
        <div
          data-testid="login-date"
          className="mt-2 text-xl font-medium"
          suppressHydrationWarning
        >
          {time ? formatDate(time) : 'Loading...'}
        </div>

        <div className="mt-12 flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-3xl font-semibold shadow-lg">
            U
          </div>
          <div data-testid="login-user" className="mt-3 text-lg font-medium">
            User
          </div>

          <button
            data-testid="login-unlock-button"
            onClick={onUnlock}
            className="mt-4 flex items-center gap-2 rounded-full bg-white/20 px-6 py-2 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/30"
          >
            <Lock className="h-4 w-4" />
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
