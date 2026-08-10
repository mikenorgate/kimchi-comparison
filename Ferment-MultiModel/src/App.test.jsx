import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';
import { CURATED_APP_IDS } from './components/AppIcon.jsx';

afterEach(() => {
  cleanup();
});

describe('<App /> integration', () => {
  it('renders the Desktop wallpaper layer', () => {
    render(<App />);
    expect(screen.getByTestId('desktop-root')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-wallpaper')).toBeInTheDocument();
  });

  it('renders the menu bar with the default "Finder" active-app label', () => {
    render(<App />);
    const menuBar = screen.getByTestId('menu-bar');
    expect(menuBar).toBeInTheDocument();
    expect(menuBar.getAttribute('data-active-app')).toBe('Finder');
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Finder',
    );
  });

  it('renders the Dock with all 12 curated app icons', () => {
    render(<App />);
    expect(CURATED_APP_IDS.length).toBe(12);
    expect(screen.getByTestId('dock')).toBeInTheDocument();
    for (const appId of CURATED_APP_IDS) {
      expect(
        screen.getByTestId(`dock-icon-${appId}`),
        `expected dock icon for "${appId}"`,
      ).toBeInTheDocument();
    }
  });

  it('opens Spotlight when Cmd+Space is pressed and closes it on Escape', () => {
    render(<App />);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();

    fireEvent.keyDown(document, { metaKey: true, code: 'Space' });
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('opens Spotlight when Ctrl+Space is pressed', () => {
    render(<App />);
    fireEvent.keyDown(document, { ctrlKey: true, code: 'Space' });
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
  });

  it('updates the menu bar active-app label when a Dock icon is clicked', () => {
    render(<App />);
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'Finder',
    );

    fireEvent.click(screen.getByTestId('dock-icon-safari'));

    const menuBar = screen.getByTestId('menu-bar');
    expect(menuBar.getAttribute('data-active-app')).toBe('safari');
    expect(screen.getByTestId('menu-bar-app-label')).toHaveTextContent(
      'safari',
    );
  });

  it('toggles the Control Center panel when the tray is clicked', () => {
    render(<App />);
    expect(
      screen.queryByTestId('control-center-panel'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(
      screen.queryByTestId('control-center-panel'),
    ).not.toBeInTheDocument();
  });
});
