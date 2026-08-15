import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlCenter from './ControlCenter';

describe('ControlCenter', () => {
  it('does not render when closed', () => {
    render(<ControlCenter open={false} onClose={() => {}} />);
    expect(screen.queryByTestId('control-center-overlay')).not.toBeInTheDocument();
  });

  it('renders brightness and volume sliders when open', () => {
    render(<ControlCenter open={true} onClose={() => {}} />);
    expect(screen.getByLabelText('Brightness')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
  });

  it('toggles connectivity buttons', () => {
    render(<ControlCenter open={true} onClose={() => {}} />);
    const wifi = screen.getByLabelText('Wi-Fi');
    expect(wifi).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(wifi);
    expect(wifi).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onClose when the overlay is clicked', () => {
    const onClose = vi.fn();
    render(<ControlCenter open={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('control-center-overlay'));
    expect(onClose).toHaveBeenCalled();
  });
});
