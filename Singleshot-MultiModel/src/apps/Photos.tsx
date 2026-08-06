import { useEffect, useState } from 'react';

interface Photo {
  id: string;
  title: string;
  /** CSS background-image value (gradient). */
  background: string;
  caption: string;
}

const SAMPLE_PHOTOS: Photo[] = [
  { id: 'p1', title: 'Sunrise', background: 'linear-gradient(135deg, #ff9966, #ff5e62)', caption: 'Sunrise over the bay' },
  { id: 'p2', title: 'Forest', background: 'linear-gradient(135deg, #134e5e, #71b280)', caption: 'Hiking in the redwoods' },
  { id: 'p3', title: 'Desert', background: 'linear-gradient(135deg, #f7971e, #ffd200)', caption: 'Sand dunes at golden hour' },
  { id: 'p4', title: 'Ocean', background: 'linear-gradient(135deg, #2980b9, #6dd5fa)', caption: 'Pacific coast' },
  { id: 'p5', title: 'Aurora', background: 'linear-gradient(135deg, #00c6ff, #0072ff, #6a11cb)', caption: 'Northern lights' },
  { id: 'p6', title: 'Mountain', background: 'linear-gradient(135deg, #757f9a, #d7dde8)', caption: 'Alpine ridge' },
  { id: 'p7', title: 'Canyon', background: 'linear-gradient(135deg, #c79081, #dfa579)', caption: 'Antelope canyon' },
  { id: 'p8', title: 'Lake', background: 'linear-gradient(135deg, #43cea2, #185a9d)', caption: 'Mirror lake' },
  { id: 'p9', title: 'Meadow', background: 'linear-gradient(135deg, #a8e063, #56ab2f)', caption: 'Wildflower meadow' },
  { id: 'p10', title: 'Storm', background: 'linear-gradient(135deg, #232526, #414345)', caption: 'Storm rolling in' },
  { id: 'p11', title: 'Sunset', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', caption: 'Sunset at the pier' },
  { id: 'p12', title: 'Glacier', background: 'linear-gradient(135deg, #83a4d4, #b6fbff)', caption: 'Iceland glacier' },
];

export function Photos(): JSX.Element {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number): void => setLightboxIndex(index);
  const closeLightbox = (): void => setLightboxIndex(null);
  const goPrev = (): void => {
    setLightboxIndex((idx) => {
      if (idx === null) return null;
      return (idx - 1 + SAMPLE_PHOTOS.length) % SAMPLE_PHOTOS.length;
    });
  };
  const goNext = (): void => {
    setLightboxIndex((idx) => {
      if (idx === null) return null;
      return (idx + 1) % SAMPLE_PHOTOS.length;
    });
  };

  // Keyboard navigation in the lightbox.
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex]);

  const current = lightboxIndex !== null ? SAMPLE_PHOTOS[lightboxIndex] : null;

  return (
    <div className="photos-root">
      <div className="app-toolbar">
        <span className="app-toolbar__title">Library</span>
        <span className="app-toolbar__spacer" />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {SAMPLE_PHOTOS.length} photos
        </span>
      </div>
      <div className="photos-grid">
        {SAMPLE_PHOTOS.map((photo, idx) => (
          <button
            type="button"
            key={photo.id}
            className="photos-thumb"
            style={{ background: photo.background }}
            onClick={() => openLightbox(idx)}
            aria-label={photo.title}
            title={photo.caption}
          />
        ))}
      </div>

      {current && lightboxIndex !== null && (
        <div className="photos-lightbox" onClick={closeLightbox}>
          <button
            type="button"
            className="photos-lightbox__close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>
          <button
            type="button"
            className="photos-lightbox__nav photos-lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div
            className="photos-lightbox__image"
            style={{ background: current.background, width: 600, height: 400 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="photos-lightbox__nav photos-lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next photo"
          >
            ›
          </button>
          <div className="photos-lightbox__caption">
            {current.caption} ({lightboxIndex + 1} / {SAMPLE_PHOTOS.length})
          </div>
        </div>
      )}
    </div>
  );
}

export default Photos;
