import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Maps from './Maps';

describe('Maps', () => {
  it('renders the map canvas and a default selected place', () => {
    render(<Maps />);
    expect(screen.getByTestId('maps-app')).toBeInTheDocument();
    expect(screen.getByTestId('maps-card-title')).toHaveTextContent('Apple Park');
    expect(screen.getByTestId('maps-card')).toHaveTextContent('One Apple Park Way, Cupertino, CA');
  });

  it('selects a place from the results list', () => {
    render(<Maps />);
    const results = screen.getByTestId('maps-results');
    fireEvent.click(within(results).getByText('Golden Gate Bridge'));
    expect(screen.getByTestId('maps-card-title')).toHaveTextContent('Golden Gate Bridge');
    expect(document.querySelector('.maps-pin.active')).toHaveTextContent('Golden Gate Bridge');
  });

  it('filters places by search query', () => {
    render(<Maps />);
    const input = screen.getByLabelText('Search maps');
    fireEvent.change(input, { target: { value: 'tahoe' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByTestId('maps-card-title')).toHaveTextContent('Lake Tahoe');
    expect(screen.getByTestId('maps-results').children.length).toBe(1);
  });
});
