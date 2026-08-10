import { describe, it, expect, vi, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import Spotlight, { CURATED_APP_IDS, MOCK_FILES } from '../Spotlight.jsx';

afterEach(() => {
  cleanup();
});

function activationEvent(opts = {}) {
  return { key: ' ', code: 'Space', ...opts };
}

function ControlledSpotlight({ initialOpen = true, onOpenApp, onOpenFile }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <Spotlight
      isOpen={open}
      onClose={() => setOpen(false)}
      onOpenApp={(id) => {
        if (onOpenApp) onOpenApp(id);
        setOpen(false);
      }}
      onOpenFile={(file) => {
        if (onOpenFile) onOpenFile(file);
        setOpen(false);
      }}
    />
  );
}

describe('<Spotlight /> component', () => {
  it('is hidden by default — renders nothing when isOpen is not set', () => {
    render(<Spotlight />);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('renders the search input and result list when isOpen is true', () => {
    render(<ControlledSpotlight />);
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('spotlight-input')).toBeInTheDocument();
    expect(screen.getByTestId('spotlight-results')).toBeInTheDocument();

    const input = screen.getByTestId('spotlight-input');
    expect(input.getAttribute('placeholder')).toBe('Spotlight Search');
    expect(input.getAttribute('aria-label')).toBe('Spotlight search');
    expect(input.getAttribute('type')).toBe('text');
  });

  it('renders all 12 curated apps in the Apps section by default', () => {
    render(<ControlledSpotlight />);
    expect(CURATED_APP_IDS.length).toBe(12);
    for (const appId of CURATED_APP_IDS) {
      expect(
        screen.getByTestId(`spotlight-result-${appId}`),
      ).toBeInTheDocument();
    }
    expect(screen.getByTestId('spotlight-section-apps')).toBeInTheDocument();
  });

  it('renders the static mock file list in the Documents section by default', () => {
    render(<ControlledSpotlight />);
    expect(MOCK_FILES.length).toBeGreaterThan(0);
    for (const file of MOCK_FILES) {
      expect(
        screen.getByTestId(`spotlight-result-${file.id}`),
      ).toBeInTheDocument();
    }
    expect(screen.getByTestId('spotlight-section-files')).toBeInTheDocument();
  });

  it('opens via Cmd+Space when closed (uncontrolled)', () => {
    render(<Spotlight />);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, activationEvent({ metaKey: true }));
    });
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
  });

  it('opens via Ctrl+Space when closed (uncontrolled)', () => {
    render(<Spotlight />);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, activationEvent({ ctrlKey: true }));
    });
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
  });

  it('closes via Cmd+Space when open (uncontrolled)', () => {
    render(<Spotlight />);
    act(() => {
      fireEvent.keyDown(window, activationEvent({ metaKey: true }));
    });
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, activationEvent({ metaKey: true }));
    });
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('closes via Ctrl+Space when open (uncontrolled)', () => {
    render(<Spotlight />);
    act(() => {
      fireEvent.keyDown(window, activationEvent({ ctrlKey: true }));
    });
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, activationEvent({ ctrlKey: true }));
    });
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('closes when Escape is pressed while open', () => {
    render(<ControlledSpotlight />);
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByTestId('spotlight-input'), { key: 'Escape' });
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('filters apps and mock files by query (case-insensitive substring)', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    fireEvent.change(input, { target: { value: 'saf' } });

    expect(screen.getByTestId('spotlight-result-safari')).toBeInTheDocument();
    expect(
      screen.queryByTestId('spotlight-result-mail'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('spotlight-result-notes'),
    ).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'TAHOE' } });
    expect(
      screen.getByTestId('spotlight-result-project-tahoe'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('spotlight-result-budget-2026'),
    ).not.toBeInTheDocument();
  });

  it('shows all results again when the query is cleared', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    fireEvent.change(input, { target: { value: 'saf' } });
    expect(
      screen.queryByTestId('spotlight-result-mail'),
    ).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    for (const appId of CURATED_APP_IDS) {
      expect(
        screen.getByTestId(`spotlight-result-${appId}`),
      ).toBeInTheDocument();
    }
    for (const file of MOCK_FILES) {
      expect(
        screen.getByTestId(`spotlight-result-${file.id}`),
      ).toBeInTheDocument();
    }
  });

  it('shows a no-results state when the query matches nothing', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    fireEvent.change(input, { target: { value: 'zzz-no-match-xyz' } });
    expect(screen.getByTestId('spotlight-empty')).toBeInTheDocument();
    expect(
      screen.queryByTestId('spotlight-result-safari'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('spotlight-result-project-tahoe'),
    ).not.toBeInTheDocument();
  });

  it('ArrowDown moves the selection forward through the list', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    const safari = screen.getByTestId('spotlight-result-safari');
    expect(safari.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(
      screen.getByTestId('spotlight-result-messages').getAttribute(
        'aria-selected',
      ),
    ).toBe('true');
    expect(safari.getAttribute('aria-selected')).toBe('false');
  });

  it('ArrowUp moves the selection backward through the list', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(
      screen.getByTestId('spotlight-result-safari').getAttribute(
        'aria-selected',
      ),
    ).toBe('true');
  });

  it('ArrowDown wraps around at the end of the list', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    const totalResults = CURATED_APP_IDS.length + MOCK_FILES.length;
    for (let i = 0; i < totalResults - 1; i += 1) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    const lastFile = MOCK_FILES[MOCK_FILES.length - 1];
    expect(
      screen.getByTestId(`spotlight-result-${lastFile.id}`).getAttribute(
        'aria-selected',
      ),
    ).toBe('true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(
      screen.getByTestId('spotlight-result-safari').getAttribute(
        'aria-selected',
      ),
    ).toBe('true');
  });

  it('Enter on a selected app calls onOpenApp(appId) and closes the overlay', () => {
    const handleOpenApp = vi.fn();
    render(<ControlledSpotlight onOpenApp={handleOpenApp} />);
    const input = screen.getByTestId('spotlight-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleOpenApp).toHaveBeenCalledTimes(1);
    expect(handleOpenApp).toHaveBeenCalledWith('messages');
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('Enter on a selected mock file calls onOpenFile(file) and closes the overlay', () => {
    const handleOpenFile = vi.fn();
    render(<ControlledSpotlight onOpenFile={handleOpenFile} />);
    const input = screen.getByTestId('spotlight-input');
    for (let i = 0; i < CURATED_APP_IDS.length; i += 1) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleOpenFile).toHaveBeenCalledTimes(1);
    expect(handleOpenFile.mock.calls[0][0].id).toBe(MOCK_FILES[0].id);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('Enter on a selected mock file still closes the overlay when onOpenFile is omitted', () => {
    render(<ControlledSpotlight />);
    const input = screen.getByTestId('spotlight-input');
    for (let i = 0; i < CURATED_APP_IDS.length; i += 1) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('clicking an app result opens the app and closes the overlay', () => {
    const handleOpenApp = vi.fn();
    render(<ControlledSpotlight onOpenApp={handleOpenApp} />);
    fireEvent.mouseDown(screen.getByTestId('spotlight-result-notes'));
    expect(handleOpenApp).toHaveBeenCalledTimes(1);
    expect(handleOpenApp).toHaveBeenCalledWith('notes');
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('clicking a file result opens the file and closes the overlay', () => {
    const handleOpenFile = vi.fn();
    render(<ControlledSpotlight onOpenFile={handleOpenFile} />);
    fireEvent.mouseDown(screen.getByTestId('spotlight-result-budget-2026'));
    expect(handleOpenFile).toHaveBeenCalledTimes(1);
    expect(handleOpenFile.mock.calls[0][0].id).toBe('budget-2026');
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();
  });

  it('search input is focused when the overlay opens', () => {
    render(<Spotlight />);
    expect(screen.queryByTestId('spotlight-input')).not.toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, activationEvent({ metaKey: true }));
    });
    expect(screen.getByTestId('spotlight-input')).toHaveFocus();
  });

  it('focuses the search input when opened in controlled mode', () => {
    render(<ControlledSpotlight />);
    expect(screen.getByTestId('spotlight-input')).toHaveFocus();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    function Wrapper() {
      const [open, setOpen] = useState(true);
      return (
        <Spotlight
          isOpen={open}
          onClose={() => {
            handleClose();
            setOpen(false);
          }}
        />
      );
    }
    render(<Wrapper />);
    fireEvent.mouseDown(screen.getByTestId('spotlight-overlay'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the panel', () => {
    const handleClose = vi.fn();
    render(
      <Spotlight isOpen onClose={handleClose} />,
    );
    fireEvent.mouseDown(screen.getByTestId('spotlight-panel'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('clears the query and selection when reopened (no persistence)', () => {
    const { rerender } = render(<Spotlight isOpen />);
    const input = screen.getByTestId('spotlight-input');
    fireEvent.change(input, { target: { value: 'saf' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    rerender(<Spotlight isOpen={false} />);
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument();

    rerender(<Spotlight isOpen />);
    const reopenedInput = screen.getByTestId('spotlight-input');
    expect(reopenedInput.getAttribute('value')).toBe('');
    expect(
      screen.getByTestId('spotlight-result-safari').getAttribute(
        'aria-selected',
      ),
    ).toBe('true');
  });

  it('renders a Search icon in the input row', () => {
    render(<ControlledSpotlight />);
    const searchRow = screen.getByTestId('spotlight-search-row');
    expect(searchRow.querySelector('svg')).not.toBeNull();
  });
});
