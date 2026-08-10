import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ControlCenter, {
  CONTROL_CENTER_TOGGLE_IDS,
  CONTROL_CENTER_SLIDER_IDS,
} from '../ControlCenter.jsx';

afterEach(() => {
  cleanup();
});

describe('<ControlCenter /> component', () => {
  it('renders the tray toggle button', () => {
    render(<ControlCenter />);
    const tray = screen.getByTestId('control-center-tray');
    expect(tray).toBeInTheDocument();
    expect(tray.tagName).toBe('BUTTON');
    expect(tray.getAttribute('aria-label')).toBe('Control Center');
    expect(tray.getAttribute('aria-haspopup')).toBe('dialog');
    expect(tray.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not render the panel by default', () => {
    render(<ControlCenter />);
    expect(
      screen.queryByTestId('control-center-panel'),
    ).not.toBeInTheDocument();
  });

  it('opens the panel when the tray is clicked', () => {
    render(<ControlCenter />);
    const tray = screen.getByTestId('control-center-tray');
    fireEvent.click(tray);

    const panel = screen.getByTestId('control-center-panel');
    expect(panel).toBeInTheDocument();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(tray.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the panel when the tray is clicked a second time', () => {
    render(<ControlCenter />);
    const tray = screen.getByTestId('control-center-tray');

    fireEvent.click(tray);
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument();

    fireEvent.click(tray);
    expect(
      screen.queryByTestId('control-center-panel'),
    ).not.toBeInTheDocument();
    expect(tray.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the panel when Escape is pressed', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.queryByTestId('control-center-panel'),
    ).not.toBeInTheDocument();
  });

  it('keeps the panel open when clicking inside it', () => {
    render(
      <div>
        <ControlCenter />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );

    fireEvent.click(screen.getByTestId('control-center-tray'));
    const panel = screen.getByTestId('control-center-panel');
    expect(panel).toBeInTheDocument();

    // Clicking a child element inside the panel should not close it.
    fireEvent.pointerDown(screen.getByTestId('control-center-toggle-wifi'));
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument();
  });

  it('closes the panel when clicking outside of it', () => {
    render(
      <div>
        <ControlCenter />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );

    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId('outside'));

    expect(
      screen.queryByTestId('control-center-panel'),
    ).not.toBeInTheDocument();
  });

  it('renders all connectivity, media, and quick action rows in the panel', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    expect(
      screen.getByTestId('control-center-row-connectivity'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('control-center-row-media'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('control-center-row-quick'),
    ).toBeInTheDocument();
  });

  it('renders every documented toggle inside the panel', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    for (const id of CONTROL_CENTER_TOGGLE_IDS) {
      const toggle = screen.getByTestId(`control-center-toggle-${id}`);
      expect(
        toggle,
        `expected toggle button for "${id}" to be in the document`,
      ).toBeInTheDocument();
      // Every toggle is a real button with aria-pressed.
      expect(toggle.tagName).toBe('BUTTON');
      expect(toggle.getAttribute('aria-pressed')).toBeTruthy();
    }
  });

  it('renders every documented slider inside the panel', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    for (const id of CONTROL_CENTER_SLIDER_IDS) {
      const input = screen.getByTestId(`control-center-slider-${id}-input`);
      expect(
        input,
        `expected range input for "${id}" to be in the document`,
      ).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
      expect(input.getAttribute('type')).toBe('range');
    }
  });

  it('toggles Wi-Fi on/off and updates aria-pressed + data-pressed + label', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    const wifi = screen.getByTestId('control-center-toggle-wifi');
    expect(wifi.getAttribute('aria-pressed')).toBe('true');
    expect(wifi.getAttribute('data-pressed')).toBe('true');

    fireEvent.click(wifi);

    expect(wifi.getAttribute('aria-pressed')).toBe('false');
    expect(wifi.getAttribute('data-pressed')).toBe('false');
    // Label persists across toggles.
    expect(screen.getByTestId('control-center-toggle-wifi-label'))
      .toHaveTextContent('Wi-Fi');

    // Toggle back on.
    fireEvent.click(wifi);
    expect(wifi.getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles Bluetooth on/off and updates aria-pressed', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    const bt = screen.getByTestId('control-center-toggle-bluetooth');
    expect(bt.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(bt);
    expect(bt.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(bt);
    expect(bt.getAttribute('aria-pressed')).toBe('true');
  });

  it('adjusting the brightness slider updates the value and the displayed text', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    const input = screen.getByTestId('control-center-slider-brightness-input');
    expect(input.value).toBe('80');

    fireEvent.change(input, { target: { value: '40' } });

    expect(input.value).toBe('40');
    expect(
      screen.getByTestId('control-center-slider-brightness-value'),
    ).toHaveTextContent('40%');
  });

  it('adjusting the volume slider updates the value and the displayed text', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    const input = screen.getByTestId('control-center-slider-volume-input');
    expect(input.value).toBe('60');

    fireEvent.change(input, { target: { value: '15' } });

    expect(input.value).toBe('15');
    expect(
      screen.getByTestId('control-center-slider-volume-value'),
    ).toHaveTextContent('15%');
  });

  it('invokes onToggle(id, value) when a toggle changes', () => {
    const handleToggle = vi.fn();
    render(<ControlCenter onToggle={handleToggle} />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    fireEvent.click(screen.getByTestId('control-center-toggle-wifi'));
    expect(handleToggle).toHaveBeenCalledWith('wifi', false);

    fireEvent.click(screen.getByTestId('control-center-toggle-wifi'));
    expect(handleToggle).toHaveBeenCalledWith('wifi', true);

    fireEvent.click(screen.getByTestId('control-center-toggle-airplane'));
    expect(handleToggle).toHaveBeenCalledWith('airplane', true);

    expect(handleToggle).toHaveBeenCalledTimes(3);
  });

  it('does not invoke onToggle for slider changes', () => {
    const handleToggle = vi.fn();
    render(<ControlCenter onToggle={handleToggle} />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    fireEvent.change(
      screen.getByTestId('control-center-slider-brightness-input'),
      { target: { value: '20' } },
    );
    fireEvent.change(
      screen.getByTestId('control-center-slider-volume-input'),
      { target: { value: '20' } },
    );

    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('invokes onClose when the tray is clicked while open', () => {
    const handleClose = vi.fn();
    render(<ControlCenter onClose={handleClose} />);

    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(handleClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when Escape closes the panel', () => {
    const handleClose = vi.fn();
    render(<ControlCenter onClose={handleClose} />);
    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(handleClose).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when an outside pointer event closes the panel', () => {
    const handleClose = vi.fn();
    render(
      <div>
        <ControlCenter onClose={handleClose} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );
    fireEvent.click(screen.getByTestId('control-center-tray'));
    expect(handleClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onClose when the panel is open and a toggle is clicked', () => {
    const handleClose = vi.fn();
    render(<ControlCenter onClose={handleClose} />);
    fireEvent.click(screen.getByTestId('control-center-tray'));

    fireEvent.click(screen.getByTestId('control-center-toggle-wifi'));
    expect(handleClose).not.toHaveBeenCalled();
    // Panel is still open.
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument();
  });

  it('appends an optional className to the root wrapper', () => {
    render(<ControlCenter className="my-tray-class" />);
    const root = screen.getByTestId('control-center-root');
    expect(root.getAttribute('class')).toContain('my-tray-class');
  });

  it('applies a Liquid Glass utility class to the panel', () => {
    render(<ControlCenter />);
    fireEvent.click(screen.getByTestId('control-center-tray'));
    const panel = screen.getByTestId('control-center-panel');
    const cls = panel.getAttribute('class') ?? '';
    // The panel should use the heavier "window-glass" treatment.
    expect(cls).toContain('window-glass');
    expect(cls).toContain('absolute');
  });

  it('does not throw when onToggle and onClose are not provided', () => {
    expect(() => render(<ControlCenter />)).not.toThrow();
    expect(() =>
      fireEvent.click(screen.getByTestId('control-center-tray')),
    ).not.toThrow();
    expect(() =>
      fireEvent.click(screen.getByTestId('control-center-toggle-wifi')),
    ).not.toThrow();
    expect(() =>
      fireEvent.keyDown(window, { key: 'Escape' }),
    ).not.toThrow();
  });

  it('exposes a focusable tray button', () => {
    render(<ControlCenter />);
    const tray = screen.getByTestId('control-center-tray');
    tray.focus();
    expect(tray).toHaveFocus();
  });
});

describe('ControlCenter exports', () => {
  it('exports a frozen array of toggle ids covering connectivity + quick actions', () => {
    expect(Array.isArray(CONTROL_CENTER_TOGGLE_IDS)).toBe(true);
    expect(Object.isFrozen(CONTROL_CENTER_TOGGLE_IDS)).toBe(true);
    expect(CONTROL_CENTER_TOGGLE_IDS).toContain('wifi');
    expect(CONTROL_CENTER_TOGGLE_IDS).toContain('bluetooth');
    expect(CONTROL_CENTER_TOGGLE_IDS).toContain('airplane');
    expect(CONTROL_CENTER_TOGGLE_IDS).toContain('dnd');
    expect(CONTROL_CENTER_TOGGLE_IDS).toContain('flashlight');
    expect(CONTROL_CENTER_TOGGLE_IDS).toContain('screenMirror');
  });

  it('exports a frozen array of slider ids covering brightness and volume', () => {
    expect(Array.isArray(CONTROL_CENTER_SLIDER_IDS)).toBe(true);
    expect(Object.isFrozen(CONTROL_CENTER_SLIDER_IDS)).toBe(true);
    expect(CONTROL_CENTER_SLIDER_IDS).toContain('brightness');
    expect(CONTROL_CENTER_SLIDER_IDS).toContain('volume');
  });
});
