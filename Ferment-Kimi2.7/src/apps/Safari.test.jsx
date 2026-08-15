import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Safari from './Safari';

describe('Safari', () => {
  it('switches active tab when a tab is clicked', () => {
    render(<Safari />);
    expect(screen.getByText('Innovation at every layer.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Tahoe'));
    expect(screen.getByText('Liquid Glass comes to Mac.')).toBeInTheDocument();
  });

  it('navigates when typing in the address bar and submitting', () => {
    render(<Safari />);
    const input = screen.getByLabelText('Address and search');
    fireEvent.change(input, { target: { value: 'music.apple.com' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('Over 100 million songs.')).toBeInTheDocument();
  });

  it('navigates when a favorite is clicked', () => {
    render(<Safari />);
    fireEvent.click(screen.getByText('iCloud'));
    expect(screen.getByText('Store. Share. Access anywhere.')).toBeInTheDocument();
  });
});
