import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Photos from './Photos';

describe('Photos', () => {
  it('renders the photo grid', () => {
    render(<Photos />);
    expect(screen.getByTestId('photos-app')).toBeInTheDocument();
    expect(screen.getByText('Photo 1')).toBeInTheDocument();
    expect(screen.getByText('Photo 20')).toBeInTheDocument();
  });

  it('selects a photo when clicked', () => {
    render(<Photos />);
    fireEvent.click(screen.getByText('Photo 5'));
    expect(screen.getByTestId('photos-selection')).toHaveTextContent('Photo 5 selected');
  });

  it('filters photos by location', () => {
    render(<Photos />);
    const filter = screen.getByLabelText('Filter photos by location');
    fireEvent.change(filter, { target: { value: 'tahoe' } });
    expect(document.querySelectorAll('.photos-item').length).toBe(4);
    expect(screen.getByText('4 items')).toBeInTheDocument();
  });
});
