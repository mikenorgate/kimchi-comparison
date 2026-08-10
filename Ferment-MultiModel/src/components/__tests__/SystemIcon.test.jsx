import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Compass } from 'lucide-react';
import SystemIcon from '../SystemIcon.jsx';
import AppIcon, { CURATED_APP_IDS } from '../AppIcon.jsx';

describe('SystemIcon', () => {
  it('renders the Lucide icon into the document', () => {
    const { container } = render(<SystemIcon icon={Compass} size="dock" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container).toBeInTheDocument();
  });

  it('maps the dock size token to 48px', () => {
    const { container } = render(<SystemIcon icon={Compass} size="dock" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('width')).toBe('48');
    expect(svg.getAttribute('height')).toBe('48');
  });

  it('renders AppIcon with appId="safari" at dock size', () => {
    const { container } = render(<AppIcon appId="safari" size="dock" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('width')).toBe('48');
  });

  it('renders every curated app without throwing', () => {
    for (const id of CURATED_APP_IDS) {
      const { container, unmount } = render(<AppIcon appId={id} />);
      const svg = container.querySelector('svg');
      expect(svg, `AppIcon(${id}) should render an svg`).not.toBeNull();
      unmount();
    }
  });

  it('renders nothing for an invalid appId without throwing', () => {
    expect(() => render(<AppIcon appId="not-a-real-app" />)).not.toThrow();
    const { container } = render(<AppIcon appId="not-a-real-app" />);
    expect(container.querySelector('svg')).toBeNull();
  });
});
