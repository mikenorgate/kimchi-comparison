import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import SafariApp, {
  DEFAULT_TABS,
  MOCK_FAVORITES,
} from '../SafariApp.jsx';

afterEach(() => {
  cleanup();
});

describe('<SafariApp />', () => {
  it('renders the toolbar, address bar, tab bar, and content area', () => {
    render(<SafariApp />);
    expect(screen.getByTestId('safari-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('safari-address-bar')).toBeInTheDocument();
    expect(screen.getByTestId('safari-tab-bar')).toBeInTheDocument();
    expect(screen.getByTestId('safari-content')).toBeInTheDocument();
  });

  it('exposes the canonical safari data-testid on the root', () => {
    render(<SafariApp />);
    const root = screen.getByTestId('safari-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'safari');
  });

  it('renders the toolbar controls (back, forward, reload, share)', () => {
    render(<SafariApp />);
    const toolbar = screen.getByTestId('safari-toolbar');
    expect(within(toolbar).getByTestId('safari-back')).toBeInTheDocument();
    expect(within(toolbar).getByTestId('safari-forward')).toBeInTheDocument();
    expect(within(toolbar).getByTestId('safari-reload')).toBeInTheDocument();
    expect(within(toolbar).getByTestId('safari-share')).toBeInTheDocument();
  });

  it('renders at least one default tab and the new-tab button', () => {
    render(<SafariApp />);
    const tabs = screen.getAllByTestId('safari-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(1);
    expect(tabs.length).toBe(DEFAULT_TABS.length);
    expect(screen.getByTestId('safari-new-tab')).toBeInTheDocument();
  });

  it('marks the first default tab as active', () => {
    render(<SafariApp />);
    const tabs = screen.getAllByTestId('safari-tab');
    expect(tabs[0]).toHaveAttribute('data-active', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('adds a new tab when the new-tab button is clicked', () => {
    render(<SafariApp />);
    const before = screen.getAllByTestId('safari-tab').length;
    fireEvent.click(screen.getByTestId('safari-new-tab'));
    const after = screen.getAllByTestId('safari-tab').length;
    expect(after).toBe(before + 1);
  });

  it('adds multiple tabs when the new-tab button is clicked repeatedly', () => {
    render(<SafariApp />);
    const newTabButton = screen.getByTestId('safari-new-tab');
    fireEvent.click(newTabButton);
    fireEvent.click(newTabButton);
    fireEvent.click(newTabButton);
    const tabs = screen.getAllByTestId('safari-tab');
    expect(tabs.length).toBe(DEFAULT_TABS.length + 3);
  });

  it('selects the newly created tab as active', () => {
    render(<SafariApp />);
    fireEvent.click(screen.getByTestId('safari-new-tab'));
    const tabs = screen.getAllByTestId('safari-tab');
    const newTab = tabs[tabs.length - 1];
    expect(newTab).toHaveAttribute('data-active', 'true');
    expect(newTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches the active tab when a different tab is clicked', () => {
    render(<SafariApp />);
    fireEvent.click(screen.getByTestId('safari-new-tab'));
    const tabs = screen.getAllByTestId('safari-tab');
    const firstTab = tabs[0];
    fireEvent.click(firstTab);
    expect(firstTab).toHaveAttribute('data-active', 'true');
    expect(tabs[tabs.length - 1]).toHaveAttribute('data-active', 'false');
  });

  it('renders an editable address bar input', () => {
    render(<SafariApp />);
    const input = screen.getByTestId('safari-address-input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('updates the address bar value as the user types', () => {
    render(<SafariApp />);
    const input = screen.getByTestId('safari-address-input');
    fireEvent.change(input, { target: { value: 'apple.com' } });
    expect(input).toHaveValue('apple.com');
  });

  it('renders the search input inside the content area', () => {
    render(<SafariApp />);
    const searchInput = screen.getByTestId('safari-search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.tagName).toBe('INPUT');
  });

  it('renders the favorites/bookmarks grid with mock entries', () => {
    render(<SafariApp />);
    const favorites = screen.getByTestId('safari-favorites');
    expect(favorites).toBeInTheDocument();
    const items = within(favorites).getAllByTestId('safari-favorite');
    expect(items.length).toBe(MOCK_FAVORITES.length);
  });

  it('renders a Reader / AA toggle button', () => {
    render(<SafariApp />);
    const reader = screen.getByTestId('safari-reader-toggle');
    expect(reader).toBeInTheDocument();
    expect(reader).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(reader);
    expect(reader).toHaveAttribute('aria-pressed', 'true');
  });
});
