'use client';

import { useShell } from '@/app/lib/shellContext';
import { X, Plus } from 'lucide-react';

export function SpacesView() {
  const { state, toggleSpaces } = useShell();

  return (
    <div
      data-testid="spaces-view"
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center bg-black/70 p-8 text-white backdrop-blur-xl"
      onClick={toggleSpaces}
    >
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold">Mission Control</h2>
          <p className="text-sm text-white/60">{state.windows.length} open windows</p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6">
          <button
            data-testid="spaces-desktop-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleSpaces();
            }}
            className="group relative aspect-video w-80 overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 shadow-2xl transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
              <span className="text-lg font-semibold">Desktop 1</span>
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              Active
            </div>
          </button>

          <button
            data-testid="spaces-add-desktop"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex aspect-video w-80 items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 text-white/60 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Desktop
          </button>
        </div>
      </div>

      <button
        data-testid="spaces-close"
        onClick={(e) => {
          e.stopPropagation();
          toggleSpaces();
        }}
        className="absolute right-6 top-6 rounded-full bg-white/10 p-2 hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
