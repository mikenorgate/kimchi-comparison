import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FinderApp from '../FinderApp.jsx';
import {
  FAVORITES,
  LOCATIONS,
  DEFAULT_LOCATION_ID,
} from '../data/finderData.js';

afterEach(() => {
  cleanup();
});

function renderFinder() {
  return render(<FinderApp />);
}

describe('<FinderApp />', () => {
  it('renders the sidebar and the file grid', () => {
    renderFinder();
    expect(screen.getByTestId('finder-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('finder-grid')).toBeInTheDocument();
    expect(screen.getByTestId('finder')).toBeInTheDocument();
  });

  it('shows both the Favorites and Locations sections in the sidebar', () => {
    renderFinder();
    const favorites = screen.getByTestId('finder-favorites');
    const locations = screen.getByTestId('finder-locations');

    expect(favorites).toBeInTheDocument();
    expect(locations).toBeInTheDocument();

    expect(favorites).toHaveTextContent('Favorites');
    expect(locations).toHaveTextContent('Locations');

    // Every favorite and location entry should have a corresponding button.
    for (const entry of FAVORITES) {
      expect(
        screen.getByTestId(`finder-sidebar-item-${entry.id}`),
      ).toBeInTheDocument();
    }
    for (const entry of LOCATIONS) {
      expect(
        screen.getByTestId(`finder-sidebar-item-${entry.id}`),
      ).toBeInTheDocument();
    }
  });

  it('uses Lucide icons for sidebar entries', () => {
    renderFinder();
    for (const entry of [...FAVORITES, ...LOCATIONS]) {
      const iconHost = screen.getByTestId(
        `finder-sidebar-icon-${entry.id}`,
      );
      // Each sidebar icon host should render an inline svg (Lucide icons
      // produce a <svg> root element).
      const svg = iconHost.querySelector('svg');
      expect(svg).not.toBeNull();
    }
  });

  it('defaults to the Desktop location and shows its mock items', () => {
    renderFinder();
    expect(screen.getByTestId('finder')).toHaveAttribute(
      'data-selected',
      DEFAULT_LOCATION_ID,
    );

    // Desktop's known mock items from finderData.js.
    const expectedNames = ['screenshot.png', 'notes.txt', 'Project', 'Resume.pdf'];
    for (const name of expectedNames) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }

    // Each rendered item exposes a finder-item node.
    const items = screen.getAllByTestId('finder-item');
    expect(items.length).toBe(expectedNames.length);
  });

  it('renders an icon and a name for each file/folder item', () => {
    renderFinder();
    const items = screen.getAllByTestId('finder-item');
    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      // Every item should expose an icon host and a name element.
      const root = item;
      // Icon is the first child rendered by the FinderItem component.
      const icon = root.querySelector(
        '[data-testid="finder-item-icon"] svg',
      );
      expect(icon).not.toBeNull();

      const name = root.querySelector('[data-testid="finder-item-name"]');
      expect(name).not.toBeNull();
      expect(name.textContent).not.toBe('');

      // data-item-name should mirror the visible label.
      expect(root.getAttribute('data-item-name')).toBe(name.textContent);
    }
  });

  it('updates the grid when a different sidebar item is clicked', () => {
    renderFinder();
    expect(screen.getByTestId('finder')).toHaveAttribute(
      'data-selected',
      'desktop',
    );

    fireEvent.click(screen.getByTestId('finder-sidebar-item-documents'));

    expect(screen.getByTestId('finder')).toHaveAttribute(
      'data-selected',
      'documents',
    );
    // Documents contains unique items that should not appear on Desktop.
    expect(screen.getByText('Budget 2026.numbers')).toBeInTheDocument();
    expect(screen.getByText('Proposal.md')).toBeInTheDocument();

    // And the previously-shown Desktop-only item should be gone.
    expect(screen.queryByText('screenshot.png')).not.toBeInTheDocument();
  });

  it('marks the currently-selected sidebar entry as pressed', () => {
    renderFinder();

    const desktopBtn = screen.getByTestId('finder-sidebar-item-desktop');
    expect(desktopBtn).toHaveAttribute('aria-pressed', 'true');
    expect(desktopBtn).toHaveAttribute('data-selected', 'true');

    const documentsBtn = screen.getByTestId('finder-sidebar-item-documents');
    expect(documentsBtn).toHaveAttribute('aria-pressed', 'false');
    expect(documentsBtn).toHaveAttribute('data-selected', 'false');

    fireEvent.click(documentsBtn);

    expect(documentsBtn).toHaveAttribute('aria-pressed', 'true');
    expect(desktopBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to a Location (iCloud Drive / Macintosh HD) when clicked', () => {
    renderFinder();
    fireEvent.click(screen.getByTestId('finder-sidebar-item-icloud'));
    expect(screen.getByTestId('finder')).toHaveAttribute(
      'data-selected',
      'icloud',
    );
    // iCloud mock contains a Keynote folder.
    expect(screen.getByText('Keynote Presentation')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('finder-sidebar-item-macintosh-hd'));
    expect(screen.getByTestId('finder')).toHaveAttribute(
      'data-selected',
      'macintosh-hd',
    );
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('exposes data-item-kind and aria-label for every grid item, and clicking a grid item does not crash', () => {
    renderFinder();
    const items = screen.getAllByTestId('finder-item');
    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      const id = item.getAttribute('data-item-id');
      const kind = item.getAttribute('data-item-kind');
      const label = item.getAttribute('aria-label');
      expect(id).toBeTruthy();
      expect(kind === 'file' || kind === 'folder').toBe(true);
      expect(label).toBe(item.getAttribute('data-item-name'));
    }

    // Clicking a folder item in the grid must not throw. In this mock
    // none of the folder ids are top-level locations, so selection
    // should stay on the default location.
    const firstItem = items[0];
    fireEvent.click(firstItem);
    expect(screen.getByTestId('finder')).toHaveAttribute(
      'data-selected',
      DEFAULT_LOCATION_ID,
    );
  });

  it('reflects the location name in the header and item count', () => {
    renderFinder();
    expect(screen.getByTestId('finder-location-name')).toHaveTextContent(
      'Desktop',
    );

    const initialCount = screen.getAllByTestId('finder-item').length;
    expect(screen.getByTestId('finder-item-count')).toHaveTextContent(
      `${initialCount} items`,
    );

    fireEvent.click(screen.getByTestId('finder-sidebar-item-applications'));
    expect(screen.getByTestId('finder-location-name')).toHaveTextContent(
      'Applications',
    );

    const newCount = screen.getAllByTestId('finder-item').length;
    expect(screen.getByTestId('finder-item-count')).toHaveTextContent(
      `${newCount} items`,
    );
  });
});
