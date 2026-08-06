import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

export interface WindowChromeProps {
  /** Display title shown in the centre of the title bar. */
  title: string;
  /** App icon (emoji or short text) shown left of the title. */
  icon?: string;
  /** True when the window has focus; affects traffic-light rendering. */
  isFocused: boolean;
  /** Called when the user clicks the close (red) traffic light. */
  onClose?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** Called when the user clicks the minimize (yellow) traffic light. */
  onMinimize?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** Called when the user clicks the maximize (green) traffic light. */
  onMaximize?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** Optional toolbar slot rendered below the title bar. */
  toolbar?: ReactNode;
  /** Optional className merged onto the root element. */
  className?: string;
}

/**
 * WindowChrome — the title bar + traffic lights + optional toolbar for a
 * window. The traffic-light clicks bubble up via callbacks; this
 * component is presentational and does not touch the store itself.
 *
 * macOS renders traffic lights in a faded colour when the window is not
 * focused. We mimic that by reducing saturation on the `--focused=false`
 * branch.
 */
export function WindowChrome({
  title,
  icon,
  isFocused,
  onClose,
  onMinimize,
  onMaximize,
  toolbar,
  className,
}: WindowChromeProps): JSX.Element {
  const rootClasses = [
    'window-chrome',
    isFocused ? 'window-chrome--focused' : 'window-chrome--unfocused',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <div className="window-chrome__titlebar">
        <div className="window-chrome__lights" aria-hidden={false}>
          <button
            type="button"
            className="traffic-light traffic-light--close"
            aria-label="Close window"
            onClick={onClose}
            data-traffic="close"
          >
            <span className="traffic-light__glyph" aria-hidden="true">×</span>
          </button>
          <button
            type="button"
            className="traffic-light traffic-light--minimize"
            aria-label="Minimize window"
            onClick={onMinimize}
            data-traffic="minimize"
          >
            <span className="traffic-light__glyph" aria-hidden="true">−</span>
          </button>
          <button
            type="button"
            className="traffic-light traffic-light--maximize"
            aria-label="Maximize window"
            onClick={onMaximize}
            data-traffic="maximize"
          >
            <span className="traffic-light__glyph" aria-hidden="true">+</span>
          </button>
        </div>
        <div className="window-chrome__title">
          {icon !== undefined && icon !== '' && (
            <span className="window-chrome__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="window-chrome__title-text">{title}</span>
        </div>
        {/* Spacer keeps the title centred when traffic lights are present. */}
        <div className="window-chrome__spacer" aria-hidden="true" />
      </div>
      {toolbar !== undefined && toolbar !== null && (
        <div className="window-chrome__toolbar">{toolbar}</div>
      )}
    </div>
  );
}

export default WindowChrome;
