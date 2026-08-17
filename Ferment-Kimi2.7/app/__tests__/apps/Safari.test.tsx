import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Safari } from '@/app/components/apps/Safari';

describe('Safari', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the address bar, tabs, and default favorites page', () => {
    render(<Safari />);
    expect(screen.getByTestId('safari-address-bar')).toBeTruthy();
    expect(screen.getByTestId('safari-tabs')).toBeTruthy();
    expect(screen.getByTestId('safari-new-tab')).toBeTruthy();
    expect(screen.getByText('Safari')).toBeTruthy();
    expect(screen.getByText('A fast, energy-efficient browser.')).toBeTruthy();
  });

  it('navigates to a mock page when a URL is entered', () => {
    render(<Safari />);
    const addressBar = screen.getByTestId('safari-address-bar') as HTMLInputElement;
    fireEvent.change(addressBar, { target: { value: 'example.com' } });
    fireEvent.click(screen.getByTestId('safari-search-button'));
    expect(screen.getByTestId('safari-page').textContent).toContain('Example Domain');
    expect(addressBar.value).toBe('example.com');
  });

  it('adds and switches tabs', () => {
    render(<Safari />);
    fireEvent.click(screen.getByTestId('safari-new-tab'));
    const tabs = screen.getAllByTestId(/^safari-tab-/);
    expect(tabs.length).toBe(2);
    const addressBar = screen.getByTestId('safari-address-bar') as HTMLInputElement;
    fireEvent.change(addressBar, { target: { value: 'search' } });
    fireEvent.click(screen.getByTestId('safari-search-button'));
    expect(screen.getByTestId('safari-page').textContent).toContain('Search Results');
    fireEvent.click(tabs[0]);
    expect(screen.getByTestId('safari-page').textContent).toContain('A fast, energy-efficient browser.');
  });

  it('closes a tab and falls back to the remaining tab', () => {
    render(<Safari />);
    fireEvent.click(screen.getByTestId('safari-new-tab'));
    expect(screen.getAllByTestId(/^safari-tab-/).length).toBe(2);
    const closeButtons = screen.getAllByTestId(/^safari-close-tab-/);
    fireEvent.click(closeButtons[1]);
    expect(screen.getAllByTestId(/^safari-tab-/).length).toBe(1);
  });
});
