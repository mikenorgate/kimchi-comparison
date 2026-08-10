import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SettingsApp from '../SettingsApp.jsx';

afterEach(() => {
  cleanup();
});

function renderSettings() {
  return render(<SettingsApp />);
}

describe('<SettingsApp />', () => {
  it('renders the sidebar and the detail pane', () => {
    renderSettings();
    expect(screen.getByTestId('settings-app')).toBeInTheDocument();
    expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('settings-pane')).toBeInTheDocument();
  });

  it('shows the Appearance and Wallpaper categories in the sidebar', () => {
    renderSettings();
    const sidebar = screen.getByTestId('settings-sidebar');
    const buttons = sidebar.querySelectorAll(
      '[data-testid="settings-category"]',
    );
    expect(buttons.length).toBe(3);

    const appearance = Array.from(buttons).find(
      (b) => b.getAttribute('data-category-id') === 'appearance',
    );
    const wallpaper = Array.from(buttons).find(
      (b) => b.getAttribute('data-category-id') === 'wallpaper',
    );
    const dock = Array.from(buttons).find(
      (b) => b.getAttribute('data-category-id') === 'dock',
    );

    expect(appearance).toBeTruthy();
    expect(wallpaper).toBeTruthy();
    expect(dock).toBeTruthy();

    expect(appearance).toHaveTextContent('Appearance');
    expect(wallpaper).toHaveTextContent('Wallpaper');
    expect(dock).toHaveTextContent('Dock & Menu Bar');
  });

  function findCategory(id) {
    return screen
      .getAllByTestId('settings-category')
      .find((b) => b.getAttribute('data-category-id') === id);
  }

  it('defaults to the Appearance category and marks it as selected', () => {
    renderSettings();
    const root = screen.getByTestId('settings-app');
    expect(root).toHaveAttribute('data-active-category', 'appearance');

    const appearanceBtn = findCategory('appearance');
    expect(appearanceBtn).toHaveAttribute('aria-pressed', 'true');
    expect(appearanceBtn).toHaveAttribute('data-selected', 'true');

    // The pane should currently be the appearance pane.
    expect(screen.getByTestId('settings-pane')).toHaveAttribute(
      'data-pane',
      'appearance',
    );
    expect(screen.getByTestId('settings-appearance')).toBeInTheDocument();
  });

  it('switching to Wallpaper updates the pane', () => {
    renderSettings();
    fireEvent.click(findCategory('wallpaper'));

    expect(screen.getByTestId('settings-app')).toHaveAttribute(
      'data-active-category',
      'wallpaper',
    );
    expect(screen.getByTestId('settings-pane')).toHaveAttribute(
      'data-pane',
      'wallpaper',
    );
    expect(screen.getByTestId('settings-wallpaper')).toBeInTheDocument();

    // The Appearance pane should no longer be present.
    expect(
      screen.queryByTestId('settings-appearance'),
    ).not.toBeInTheDocument();
  });

  it('switching to Dock & Menu Bar updates the pane', () => {
    renderSettings();
    fireEvent.click(findCategory('dock'));

    expect(screen.getByTestId('settings-app')).toHaveAttribute(
      'data-active-category',
      'dock',
    );
    expect(screen.getByTestId('settings-pane')).toHaveAttribute(
      'data-pane',
      'dock',
    );
    expect(screen.getByTestId('settings-dock')).toBeInTheDocument();
  });

  it('renders Light, Dark and Auto controls in the Appearance pane', () => {
    renderSettings();
    const controls = screen.getAllByTestId('settings-light-dark-auto');
    expect(controls.length).toBe(3);

    const modes = controls.map((c) => c.getAttribute('data-mode'));
    expect(modes).toEqual(expect.arrayContaining(['light', 'dark', 'auto']));

    // Exactly one mode should be marked as selected by default.
    const selected = controls.filter(
      (c) => c.getAttribute('data-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking a Light/Dark/Auto control updates which one is selected', () => {
    renderSettings();

    const before = screen
      .getAllByTestId('settings-light-dark-auto')
      .find((c) => c.getAttribute('data-selected') === 'true');
    expect(before).toBeDefined();

    // Click "dark".
    const dark = screen
      .getAllByTestId('settings-light-dark-auto')
      .find((c) => c.getAttribute('data-mode') === 'dark');
    fireEvent.click(dark);

    const darkAfter = screen
      .getAllByTestId('settings-light-dark-auto')
      .find((c) => c.getAttribute('data-mode') === 'dark');
    expect(darkAfter).toHaveAttribute('data-selected', 'true');
    expect(darkAfter).toHaveAttribute('aria-checked', 'true');

    // And the previously selected mode should no longer be selected.
    const stillSelected = screen
      .getAllByTestId('settings-light-dark-auto')
      .filter((c) => c.getAttribute('data-selected') === 'true');
    expect(stillSelected).toHaveLength(1);

    // Click "light".
    const light = screen
      .getAllByTestId('settings-light-dark-auto')
      .find((c) => c.getAttribute('data-mode') === 'light');
    fireEvent.click(light);
    expect(light).toHaveAttribute('data-selected', 'true');
  });

  it('renders the accent color swatches and marks exactly one as selected', () => {
    renderSettings();
    const swatches = screen.getAllByTestId('settings-accent-color');
    // 8 accent colours per the spec.
    expect(swatches.length).toBe(8);

    const colors = swatches.map((s) => s.getAttribute('data-color-id'));
    expect(colors).toEqual(
      expect.arrayContaining([
        'blue',
        'purple',
        'pink',
        'red',
        'orange',
        'yellow',
        'green',
        'graphite',
      ]),
    );

    const selected = swatches.filter(
      (s) => s.getAttribute('data-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking an accent color swatch updates the selection', () => {
    renderSettings();
    const green = screen
      .getAllByTestId('settings-accent-color')
      .find((s) => s.getAttribute('data-color-id') === 'green');
    expect(green).toBeDefined();
    fireEvent.click(green);

    expect(green).toHaveAttribute('data-selected', 'true');
    expect(green).toHaveAttribute('aria-checked', 'true');

    const selected = screen
      .getAllByTestId('settings-accent-color')
      .filter((s) => s.getAttribute('data-selected') === 'true');
    expect(selected).toHaveLength(1);

    const purple = screen
      .getAllByTestId('settings-accent-color')
      .find((s) => s.getAttribute('data-color-id') === 'purple');
    expect(purple).toBeDefined();
    expect(purple).toHaveAttribute('data-selected', 'false');
  });

  it('renders wallpaper thumbnails in the Wallpaper pane', () => {
    renderSettings();
    const wallpaperCategory = screen
      .getAllByTestId('settings-category')
      .find((b) => b.getAttribute('data-category-id') === 'wallpaper');
    expect(wallpaperCategory).toBeDefined();
    fireEvent.click(wallpaperCategory);

    const wallpapers = screen.getAllByTestId('settings-wallpaper-thumbnail');
    expect(wallpapers.length).toBeGreaterThan(0);

    // Each thumbnail should expose a preview swatch.
    for (const thumb of wallpapers) {
      const id = thumb.getAttribute('data-wallpaper-id');
      expect(id).toBeTruthy();
      const preview = thumb.querySelector(
        '[data-testid="settings-wallpaper-preview"]',
      );
      expect(preview).not.toBeNull();
    }

    // Exactly one wallpaper is selected by default.
    const selected = wallpapers.filter(
      (t) => t.getAttribute('data-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking a wallpaper thumbnail selects it and deselects the previous one', () => {
    renderSettings();
    const wallpaperCategory = screen
      .getAllByTestId('settings-category')
      .find((b) => b.getAttribute('data-category-id') === 'wallpaper');
    expect(wallpaperCategory).toBeDefined();
    fireEvent.click(wallpaperCategory);

    const before = screen
      .getAllByTestId('settings-wallpaper-thumbnail')
      .find((t) => t.getAttribute('data-selected') === 'true');
    expect(before).toBeDefined();
    const beforeId = before.getAttribute('data-wallpaper-id');

    // Pick a different wallpaper thumbnail.
    const target = screen
      .getAllByTestId('settings-wallpaper-thumbnail')
      .find((t) => t.getAttribute('data-wallpaper-id') !== beforeId);
    expect(target).toBeDefined();
    const targetId = target.getAttribute('data-wallpaper-id');

    fireEvent.click(target);

    const updated = screen
      .getAllByTestId('settings-wallpaper-thumbnail')
      .find((t) => t.getAttribute('data-wallpaper-id') === targetId);
    expect(updated).toBeDefined();
    expect(updated).toHaveAttribute('data-selected', 'true');
    expect(updated).toHaveAttribute('aria-checked', 'true');

    // The previously selected one should no longer be selected.
    const previouslySelected = screen
      .getAllByTestId('settings-wallpaper-thumbnail')
      .find((t) => t.getAttribute('data-wallpaper-id') === beforeId);
    expect(previouslySelected).toBeDefined();
    expect(previouslySelected).toHaveAttribute('data-selected', 'false');
    expect(previouslySelected).toHaveAttribute('aria-checked', 'false');

    // There should still be exactly one selected wallpaper overall.
    const all = screen.getAllByTestId('settings-wallpaper-thumbnail');
    const stillSelected = all.filter(
      (t) => t.getAttribute('data-selected') === 'true',
    );
    expect(stillSelected).toHaveLength(1);
  });
});
