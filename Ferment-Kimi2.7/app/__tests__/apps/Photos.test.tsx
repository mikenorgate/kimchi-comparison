import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Photos } from '@/app/components/apps/Photos';

describe('Photos', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the photo grid with all items', () => {
    render(<Photos />);
    expect(screen.getByTestId('photos')).toBeTruthy();
    expect(screen.getByTestId('photos-grid')).toBeTruthy();
    expect(screen.getByTestId('photos-item-1')).toBeTruthy();
    expect(screen.getByTestId('photos-item-12')).toBeTruthy();
  });

  it('shows the item count', () => {
    render(<Photos />);
    expect(screen.getByText('12 items')).toBeTruthy();
  });

  it('opens the lightbox when a photo is clicked', () => {
    render(<Photos />);
    fireEvent.click(screen.getByTestId('photos-item-3'));
    expect(screen.getByTestId('photos-lightbox')).toBeTruthy();
    expect(screen.getByTestId('photos-lightbox-image')).toBeTruthy();
    expect(screen.getByTestId('photos-lightbox-title').textContent).toBe('City Lights');
  });

  it('closes the lightbox when the close button is clicked', () => {
    render(<Photos />);
    fireEvent.click(screen.getByTestId('photos-item-2'));
    expect(screen.getByTestId('photos-lightbox')).toBeTruthy();
    fireEvent.click(screen.getByTestId('photos-lightbox-close'));
    expect(screen.queryByTestId('photos-lightbox')).toBeFalsy();
  });

  it('navigates to the next photo in the lightbox', () => {
    render(<Photos />);
    fireEvent.click(screen.getByTestId('photos-item-1'));
    expect(screen.getByTestId('photos-lightbox-title').textContent).toBe('Mountain Lake');
    fireEvent.click(screen.getByTestId('photos-lightbox-next'));
    expect(screen.getByTestId('photos-lightbox-title').textContent).toBe('Autumn Forest');
  });

  it('navigates to the previous photo in the lightbox', () => {
    render(<Photos />);
    fireEvent.click(screen.getByTestId('photos-item-2'));
    expect(screen.getByTestId('photos-lightbox-title').textContent).toBe('Autumn Forest');
    fireEvent.click(screen.getByTestId('photos-lightbox-prev'));
    expect(screen.getByTestId('photos-lightbox-title').textContent).toBe('Mountain Lake');
  });
});
