import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowProvider } from '../context/WindowContext';
import Spotlight from './Spotlight';

function renderWithProvider(ui) {
  return render(<WindowProvider>{ui}</WindowProvider>);
}

describe('Spotlight', () => {
  it('renders search input and recent items when open', () => {
    renderWithProvider(<Spotlight open={true} onClose={() => {}} />);
    expect(screen.getByLabelText('Spotlight search')).toBeInTheDocument();
    expect(screen.getByText('Recent Items')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('filters applications when typing a query', () => {
    renderWithProvider(<Spotlight open={true} onClose={() => {}} />);
    const input = screen.getByLabelText('Spotlight search');
    fireEvent.change(input, { target: { value: 'safari' } });
    expect(screen.getByText('Safari')).toBeInTheDocument();
    expect(screen.getByText('Application')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    renderWithProvider(<Spotlight open={true} onClose={onClose} />);
    fireEvent.keyDown(screen.getByLabelText('Spotlight search'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    renderWithProvider(<Spotlight open={false} onClose={() => {}} />);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });
});
