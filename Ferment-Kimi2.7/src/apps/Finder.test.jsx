import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Finder from './Finder';

describe('Finder', () => {
  it('switches folders when a sidebar item is clicked', () => {
    render(<Finder />);
    expect(screen.getByText('Screenshot.png')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Applications'));
    expect(screen.getByText('Safari')).toBeInTheDocument();
    expect(screen.queryByText('Screenshot.png')).not.toBeInTheDocument();
  });

  it('toggles between icon and list view', () => {
    render(<Finder />);
    expect(screen.getByRole('button', { name: /icon view/i })).toHaveClass('active');
    fireEvent.click(screen.getByRole('button', { name: /list view/i }));
    expect(screen.getByRole('button', { name: /list view/i })).toHaveClass('active');
    expect(document.querySelector('.finder-list')).toBeInTheDocument();
  });

  it('selects a file on click', () => {
    render(<Finder />);
    fireEvent.click(screen.getByText('Screenshot.png'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });
});
