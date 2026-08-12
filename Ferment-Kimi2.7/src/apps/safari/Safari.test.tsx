import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Safari } from './index';
import { safariFavorites, safariFrequentlyVisited } from '../../data/safariFavorites';

describe('Safari', () => {
  it('renders the start page with favorites and frequently visited sites', () => {
    render(<Safari />);

    expect(screen.getByTestId('safari-start-page')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Frequently Visited')).toBeInTheDocument();

    expect(safariFavorites.length).toBeGreaterThanOrEqual(6);
    for (const favorite of safariFavorites) {
      expect(screen.getByTestId(`safari-favorite-${favorite.id}`)).toHaveTextContent(favorite.title);
    }

    for (const site of safariFrequentlyVisited) {
      expect(screen.getByTestId(`safari-frequent-${site.id}`)).toHaveTextContent(site.title);
    }
  });

  it('navigates to a favorite URL when its tile is clicked', () => {
    render(<Safari />);

    fireEvent.click(screen.getByTestId('safari-favorite-github'));

    expect(screen.getByTestId('safari-page-view')).toBeInTheDocument();
    expect(screen.getByTestId('safari-page-domain')).toHaveTextContent('github.com');
    expect(screen.getByText(/Welcome to github\.com/u)).toBeInTheDocument();
  });

  it('navigates to a URL entered in the address bar', () => {
    render(<Safari />);

    const addressInput = screen.getByTestId('safari-address-input');
    fireEvent.change(addressInput, { target: { value: 'example.com' } });
    fireEvent.submit(addressInput.closest('form') as HTMLFormElement);

    expect(screen.getByTestId('safari-page-view')).toBeInTheDocument();
    expect(screen.getByTestId('safari-page-domain')).toHaveTextContent('example.com');
  });

  it('normalizes addresses without a protocol to https://', () => {
    render(<Safari />);

    const addressInput = screen.getByTestId('safari-address-input');
    fireEvent.change(addressInput, { target: { value: 'wikipedia.org' } });
    fireEvent.submit(addressInput.closest('form') as HTMLFormElement);

    expect(screen.getByTestId('safari-page-domain')).toHaveTextContent('wikipedia.org');
    expect(addressInput).toHaveValue('https://wikipedia.org');
  });

  it('opens a new tab and keeps the previous tab', () => {
    render(<Safari />);

    fireEvent.click(screen.getByTestId('safari-new-tab'));

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('safari-start-page')).toBeInTheDocument();
  });

  it('switches active tab when a tab is clicked', () => {
    render(<Safari />);

    fireEvent.click(screen.getByTestId('safari-new-tab'));

    const addressInput = screen.getByTestId('safari-address-input');
    fireEvent.change(addressInput, { target: { value: 'apple.com' } });
    fireEvent.submit(addressInput.closest('form') as HTMLFormElement);

    expect(screen.getByTestId('safari-page-domain')).toHaveTextContent('apple.com');

    fireEvent.click(screen.getByTestId('safari-tab-0'));

    expect(screen.getByTestId('safari-start-page')).toBeInTheDocument();
    expect(screen.getByTestId('safari-tab-0')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('safari-tab-1')).toHaveAttribute('aria-selected', 'false');
  });

  it('closes a tab and activates another tab', () => {
    render(<Safari />);

    fireEvent.click(screen.getByTestId('safari-new-tab'));
    expect(screen.getAllByRole('tab')).toHaveLength(2);

    fireEvent.click(screen.getByTestId('safari-tab-close-1'));

    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(screen.getByTestId('safari-tab-0')).toHaveAttribute('aria-selected', 'true');
  });
});
