import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

describe('<App />', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('renders the desktop title heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1, name: /tahoe web desktop/i });
    expect(heading).toBeInTheDocument();
  });
});
