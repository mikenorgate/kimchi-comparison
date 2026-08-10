import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import PhotosApp, { PHOTOS } from '../PhotosApp.jsx';

afterEach(() => {
  cleanup();
});

function renderPhotos() {
  return render(<PhotosApp />);
}

describe('<PhotosApp />', () => {
  it('renders the app root with a toolbar and grid', () => {
    renderPhotos();
    const root = screen.getByTestId('photos-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'photos');
    expect(root).toHaveAttribute('data-size', 'grid');

    expect(screen.getByTestId('photos-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('photos-grid')).toBeInTheDocument();
  });

  it('renders a thumbnail for every photo in the library', () => {
    renderPhotos();
    const grid = screen.getByTestId('photos-grid');
    const thumbnails = within(grid).getAllByTestId('photos-thumbnail');
    expect(thumbnails).toHaveLength(PHOTOS.length);

    // Every photo id should be exposed via data-photo-id.
    const ids = thumbnails.map((t) => t.getAttribute('data-photo-id'));
    const expectedIds = PHOTOS.map((p) => p.id);
    expect(ids).toEqual(expectedIds);
  });

  it('does not render the lightbox before any thumbnail is clicked', () => {
    renderPhotos();
    expect(screen.queryByTestId('photos-lightbox')).not.toBeInTheDocument();
    expect(screen.queryByTestId('photos-lightbox-close')).not.toBeInTheDocument();
  });

  it('clicking a thumbnail opens the lightbox with its caption and date', () => {
    renderPhotos();
    const target = PHOTOS[2];

    const grid = screen.getByTestId('photos-grid');
    const allThumbs = within(grid).getAllByTestId('photos-thumbnail');
    const targetThumb = allThumbs.find(
      (t) => t.getAttribute('data-photo-id') === target.id,
    );
    expect(targetThumb).toBeDefined();
    fireEvent.click(targetThumb);

    const lightbox = screen.getByTestId('photos-lightbox');
    expect(lightbox).toBeInTheDocument();

    const caption = screen.getByTestId('photos-lightbox-caption');
    expect(caption).toHaveTextContent(target.caption);

    const date = screen.getByTestId('photos-lightbox-date');
    expect(date).toHaveTextContent(target.date);

    // The lightbox image host should reference the same photo id.
    expect(screen.getByTestId('photos-lightbox-image')).toHaveAttribute(
      'data-photo-id',
      target.id,
    );
  });

  it('the lightbox exposes a close button that hides the lightbox', () => {
    renderPhotos();
    const grid = screen.getByTestId('photos-grid');
    const firstThumb = within(grid).getAllByTestId('photos-thumbnail')[0];
    fireEvent.click(firstThumb);

    expect(screen.getByTestId('photos-lightbox')).toBeInTheDocument();
    expect(screen.getByTestId('photos-lightbox-close')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('photos-lightbox-close'));
    expect(screen.queryByTestId('photos-lightbox')).not.toBeInTheDocument();
  });

  it('clicking on the backdrop closes the lightbox, but not when clicking inside the panel', () => {
    renderPhotos();
    const grid = screen.getByTestId('photos-grid');
    const firstThumb = within(grid).getAllByTestId('photos-thumbnail')[0];
    fireEvent.click(firstThumb);

    const lightbox = screen.getByTestId('photos-lightbox');
    const panel = screen.getByTestId('photos-lightbox-panel');

    // Click inside the panel — should remain open.
    fireEvent.click(panel);
    expect(screen.getByTestId('photos-lightbox')).toBeInTheDocument();

    // Click on the backdrop — should close.
    fireEvent.click(lightbox);
    expect(screen.queryByTestId('photos-lightbox')).not.toBeInTheDocument();
  });

  it('opens a different photo when a second thumbnail is clicked', () => {
    renderPhotos();
    const grid = screen.getByTestId('photos-grid');
    const thumbs = within(grid).getAllByTestId('photos-thumbnail');

    const first = PHOTOS[0];
    const second = PHOTOS[1];

    const firstThumb = thumbs.find(
      (t) => t.getAttribute('data-photo-id') === first.id,
    );
    const secondThumb = thumbs.find(
      (t) => t.getAttribute('data-photo-id') === second.id,
    );

    fireEvent.click(firstThumb);
    expect(screen.getByTestId('photos-lightbox-caption')).toHaveTextContent(
      first.caption,
    );

    // The lightbox is still open; click a different thumbnail underneath.
    fireEvent.click(secondThumb);
    expect(screen.getByTestId('photos-lightbox-caption')).toHaveTextContent(
      second.caption,
    );
    expect(screen.getByTestId('photos-lightbox-date')).toHaveTextContent(
      second.date,
    );
  });

  it('the toolbar contains a grid-size toggle that switches thumbnail density', () => {
    renderPhotos();
    const toggle = screen.getByTestId('photos-grid-size-toggle');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByTestId('photos-grid')).toHaveAttribute(
      'data-size',
      'grid',
    );
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    expect(screen.getByTestId('photos-grid')).toHaveAttribute(
      'data-size',
      'large',
    );
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle);
    expect(screen.getByTestId('photos-grid')).toHaveAttribute(
      'data-size',
      'grid',
    );
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('thumbnails expose caption and date attributes for accessibility', () => {
    renderPhotos();
    const thumbs = within(screen.getByTestId('photos-grid')).getAllByTestId(
      'photos-thumbnail',
    );

    thumbs.forEach((thumb) => {
      const caption = thumb.getAttribute('data-caption');
      const date = thumb.getAttribute('data-date');
      const ariaLabel = thumb.getAttribute('aria-label');
      expect(caption).toBeTruthy();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(ariaLabel).toContain(caption);
    });
  });
});
