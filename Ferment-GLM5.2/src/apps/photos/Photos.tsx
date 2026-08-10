import { useState } from 'react';

interface Photo { id: string; title: string; gradient: string; }

const SEED_PHOTOS: Photo[] = [
  { id: 'p1', title: 'Beach Sunset', gradient: 'linear-gradient(135deg, #ff6b6b, #feca57, #ffeaa7)' },
  { id: 'p2', title: 'Mountain Lake', gradient: 'linear-gradient(135deg, #48dbfb, #0abde3, #006ba6)' },
  { id: 'p3', title: 'Forest Trail', gradient: 'linear-gradient(135deg, #00b894, #55efc4, #2ecc71)' },
  { id: 'p4', title: 'City Night', gradient: 'linear-gradient(135deg, #2d3436, #636e72, #b2bec3)' },
  { id: 'p5', title: 'Desert Dunes', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055, #d63031)' },
  { id: 'p6', title: 'Aurora', gradient: 'linear-gradient(135deg, #a29bfe, #6c5ce7, #341f97)' },
  { id: 'p7', title: 'Cherry Blossom', gradient: 'linear-gradient(135deg, #ffeaa7, #fab1a0, #fd79a8)' },
  { id: 'p8', title: 'Ocean Deep', gradient: 'linear-gradient(135deg, #00cec9, #0984e3, #2d3436)' },
  { id: 'p9', title: 'Golden Hour', gradient: 'linear-gradient(135deg, #fdcb6e, #e84393, #d35400)' },
  { id: 'p10', title: 'Misty Valley', gradient: 'linear-gradient(135deg, #dfe6e9, #b2bec3, #636e72)' },
  { id: 'p11', title: 'Volcanic', gradient: 'linear-gradient(135deg, #2d3436, #d63031, #fdcb6e)' },
  { id: 'p12', title: 'Spring Meadow', gradient: 'linear-gradient(135deg, #55efc4, #00b894, #6ab04c)' },
];

export function Photos({ appId: _appId }: { appId: string }) {
  const [selected, setSelected] = useState<Photo | null>(null);
  return (
    <div className="flex h-full w-full flex-col" data-testid="photos-root">
      <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 text-sm font-medium text-black/70 dark:text-white/70">Library · {SEED_PHOTOS.length} Photos</div>
      {selected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4" data-testid="photos-viewer">
          <button className="self-start text-sm text-[#0a84ff] mb-2" onClick={() => setSelected(null)} data-testid="photos-back">‹ Back</button>
          <div className="w-full max-w-md aspect-video rounded-xl shadow-lg" style={{ background: selected.gradient }} data-testid="photos-viewer-image" />
          <div className="mt-3 text-sm font-medium text-black/70 dark:text-white/70">{selected.title}</div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-4 gap-2" data-testid="photos-grid">
            {SEED_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                className="aspect-square rounded-lg shadow-md overflow-hidden hover:opacity-80 transition-opacity"
                style={{ background: photo.gradient }}
                onClick={() => setSelected(photo)}
                data-testid={`photo-${photo.id}`}
              >
                <div className="w-full h-full flex items-end p-1">
                  <span className="text-xs text-white/80 font-medium drop-shadow">{photo.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
