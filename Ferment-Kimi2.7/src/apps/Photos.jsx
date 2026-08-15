import { useState } from 'react';
import './Photos.css';

const MOCK_PHOTOS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Photo ${i + 1}`,
  color: `hsl(${(i * 47) % 360}, 70%, 65%)`,
  location: ['Lake Tahoe', 'San Francisco', 'Yosemite', 'Big Sur', 'New York', 'London'][i % 6],
  date: new Date(2026, 6, 1 + i).toLocaleDateString(),
}));

export default function Photos() {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [layout, setLayout] = useState('grid');

  const filtered = filter === 'all'
    ? MOCK_PHOTOS
    : MOCK_PHOTOS.filter((p) => p.location.toLowerCase().includes(filter));

  return (
    <div className="photos" data-testid="photos-app">
      <div className="photos-toolbar">
        <div className="photos-segments">
          <button
            className={`photos-segment ${layout === 'grid' ? 'active' : ''}`}
            onClick={() => setLayout('grid')}
            aria-label="Grid view"
          >
            Grid
          </button>
          <button
            className={`photos-segment ${layout === 'list' ? 'active' : ''}`}
            onClick={() => setLayout('list')}
            aria-label="List view"
          >
            List
          </button>
        </div>
        <select
          className="photos-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter photos by location"
        >
          <option value="all">All Photos</option>
          <option value="tahoe">Lake Tahoe</option>
          <option value="francisco">San Francisco</option>
          <option value="yosemite">Yosemite</option>
          <option value="sur">Big Sur</option>
          <option value="york">New York</option>
          <option value="london">London</option>
        </select>
      </div>
      <div className={`photos-body ${layout === 'list' ? 'list' : ''}`}>
        {filtered.map((photo) => (
          <button
            key={photo.id}
            className={`photos-item ${selectedId === photo.id ? 'selected' : ''}`}
            onClick={() => setSelectedId(photo.id)}
            aria-pressed={selectedId === photo.id}
          >
            <div
              className="photos-thumb"
              style={{ background: photo.color }}
              role="img"
              aria-label={photo.title}
            />
            <div className="photos-meta">
              <span className="photos-title">{photo.title}</span>
              <span className="photos-subtitle">{photo.location} · {photo.date}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="photos-status">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        {selectedId ? (
          <span data-testid="photos-selection"> · {MOCK_PHOTOS.find((p) => p.id === selectedId)?.title} selected</span>
        ) : null}
      </div>
    </div>
  );
}
