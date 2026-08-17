'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  title: string;
  color: string;
  width: number;
  height: number;
}

const PHOTOS: Photo[] = [
  { id: '1', title: 'Mountain Lake', color: '#60a5fa', width: 4, height: 3 },
  { id: '2', title: 'Autumn Forest', color: '#f97316', width: 3, height: 4 },
  { id: '3', title: 'City Lights', color: '#8b5cf6', width: 4, height: 3 },
  { id: '4', title: 'Ocean Sunset', color: '#f43f5e', width: 4, height: 3 },
  { id: '5', title: 'Desert Dunes', color: '#eab308', width: 3, height: 4 },
  { id: '6', title: 'Snowy Peaks', color: '#06b6d4', width: 4, height: 3 },
  { id: '7', title: 'Green Valley', color: '#22c55e', width: 4, height: 3 },
  { id: '8', title: 'Urban Geometry', color: '#64748b', width: 3, height: 4 },
  { id: '9', title: 'Golden Hour', color: '#f59e0b', width: 4, height: 3 },
  { id: '10', title: 'Night Sky', color: '#1e293b', width: 4, height: 3 },
  { id: '11', title: 'Cherry Blossom', color: '#ec4899', width: 3, height: 4 },
  { id: '12', title: 'Road Trip', color: '#3b82f6', width: 4, height: 3 },
];

export function Photos() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openPhoto = (index: number) => setSelectedIndex(index);
  const closePhoto = () => setSelectedIndex(null);
  const nextPhoto = () =>
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % PHOTOS.length));
  const prevPhoto = () =>
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + PHOTOS.length) % PHOTOS.length));

  const selectedPhoto = selectedIndex !== null ? PHOTOS[selectedIndex] : null;

  return (
    <div className="flex h-full w-full flex-col bg-background" data-testid="photos">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">Photos</h2>
        <span className="text-sm text-muted-foreground">{PHOTOS.length} items</span>
      </header>

      <div
        className="grid flex-1 auto-rows-fr grid-cols-3 gap-2 overflow-auto p-4 sm:grid-cols-4"
        data-testid="photos-grid"
      >
        {PHOTOS.map((photo, index) => (
          <button
            key={photo.id}
            data-testid={`photos-item-${photo.id}`}
            onClick={() => openPhoto(index)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent"
            style={{ background: photo.color }}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
              <span className="sr-only">{photo.title}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div
          data-testid="photos-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closePhoto}
        >
          <button
            data-testid="photos-lightbox-close"
            onClick={closePhoto}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            data-testid="photos-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            data-testid="photos-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="max-h-[80vh] max-w-[80vw] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              data-testid="photos-lightbox-image"
              className="h-[60vh] w-[60vw] rounded-lg"
              style={{ background: selectedPhoto.color }}
            />
            <p
              data-testid="photos-lightbox-title"
              className="mt-3 text-center text-lg font-medium text-white"
            >
              {selectedPhoto.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
