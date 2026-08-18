"use client";

import type {
  CSSProperties,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
} from "react";

/**
 * Default size used when the window manager hasn't supplied explicit
 * width/height. Chosen to roughly match the Finder window that opens
 * on first boot, and sized so the title bar + a couple of rows of
 * content are visible without scrolling on a 13" laptop display.
 */
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 500;

interface WindowProps {
  /**
   * Title shown in the window's title bar. Falls back to an empty
   * string when omitted so the bar layout stays consistent for
   * unbranded utility windows.
   */
  readonly title?: string;
  /**
   * Optional app icon shown immediately to the right of the traffic
   * lights. Accepts any node so callers can pass emoji glyphs from
   * the app registry or richer React elements later.
   */
  readonly icon?: ReactNode;
  /**
   * Fired when the close (red) traffic light is clicked. When omitted
   * the button renders as a decorative element and is hidden from the
   * accessibility tree, matching the native behaviour of an unhandled
   * window.
   */
  readonly onClose?: () => void;
  /** Fired when the minimize (yellow) traffic light is clicked. */
  readonly onMinimize?: () => void;
  /** Fired when the maximize (green) traffic light is clicked. */
  readonly onMaximize?: () => void;
  /**
   * Whether this window currently has focus. Drives the traffic-light
   * saturation, title-bar opacity, and a `data-active` attribute so
   * the window manager can target styling from the outside if needed.
   */
  readonly isActive?: boolean;
  /** Window body. Rendered inside the content slot below the title bar. */
  readonly children?: ReactNode;
  /** Optional explicit width. Defaults to {@link DEFAULT_WIDTH}. */
  readonly width?: number | string;
  /** Optional explicit height. Defaults to {@link DEFAULT_HEIGHT}. */
  readonly height?: number | string;
  /**
   * Extra class names appended to the root frame. Useful for the
   * window manager to flag maximised/minimised states without forking
   * the component.
   */
  readonly className?: string;
  /** Optional inline styles for positioning left/top from the manager. */
  readonly style?: CSSProperties;
  /**
   * Optional pointerdown handler attached to the title bar. The window
   * manager wires this up to its drag-to-move gesture so the title bar
   * becomes the grabbable region without forking the frame.
   */
  readonly onTitleBarPointerDown?: PointerEventHandler<HTMLElement>;
  /** Accessible label for the root frame. Defaults to the title. */
  readonly ariaLabel?: string;
}

/**
 * Reusable macOS-style window frame.
 *
 * Renders a translucent, rounded-corner frame with a title bar
 * containing three traffic-light buttons (close / minimize /
 * maximize), an optional app icon and title, and a content slot for
 * the caller to mount the app body. This step intentionally stops at
 * the visual frame: drag-to-move and resize handles will be wired up
 * by the window manager in a later phase.
 *
 * The component is fully testable in jsdom — it uses no browser-only
 * layout APIs and exposes `data-*` hooks for state assertions.
 */
export default function Window({
  title = "",
  icon,
  onClose,
  onMinimize,
  onMaximize,
  isActive = true,
  children,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className,
  style,
  ariaLabel,
  onTitleBarPointerDown,
}: WindowProps): JSX.Element {
  const handleClose: MouseEventHandler<HTMLButtonElement> = () => {
    onClose?.();
  };
  const handleMinimize: MouseEventHandler<HTMLButtonElement> = () => {
    onMinimize?.();
  };
  const handleMaximize: MouseEventHandler<HTMLButtonElement> = () => {
    onMaximize?.();
  };

  const frameStyle: CSSProperties = {
    width,
    height,
    ...style,
  };

  const rootClassName = [
    "window",
    isActive ? "window--active" : "window--inactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={rootClassName}
      data-testid="window"
      data-active={isActive ? "true" : "false"}
      style={frameStyle}
      role="group"
      aria-label={ariaLabel ?? (title || "Window")}
    >
      <header
        className="window__titlebar"
        data-testid="window-titlebar"
        onPointerDown={onTitleBarPointerDown}
      >
        <div
          className="window__lights"
          data-testid="window-lights"
          aria-label="Window controls"
        >
          <TrafficLight
            kind="close"
            active={isActive}
            onClick={handleClose}
            ariaLabel="Close window"
            testId="window-close"
          />
          <TrafficLight
            kind="minimize"
            active={isActive}
            onClick={handleMinimize}
            ariaLabel="Minimize window"
            testId="window-minimize"
          />
          <TrafficLight
            kind="maximize"
            active={isActive}
            onClick={handleMaximize}
            ariaLabel="Maximize window"
            testId="window-maximize"
          />
        </div>
        <div className="window__title" data-testid="window-title">
          {icon !== undefined ? (
            <span
              className="window__icon"
              data-testid="window-icon"
              aria-hidden="true"
            >
              {icon}
            </span>
          ) : null}
          <span className="window__title-text">{title}</span>
        </div>
        <div className="window__spacer" aria-hidden="true" />
      </header>
      <div className="window__body" data-testid="window-body">
        {children}
      </div>
    </section>
  );
}

interface TrafficLightProps {
  readonly kind: "close" | "minimize" | "maximize";
  readonly active: boolean;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
  readonly ariaLabel: string;
  readonly testId: string;
}

/**
 * A single circular traffic-light button. Uses semantic <button> so
 * the click handler wiring stays obvious, but renders the hover glyph
 * (X / − / +) as inline SVG so it can be sized and themed in CSS
 * without bitmap assets.
 */
function TrafficLight({
  kind,
  active,
  onClick,
  ariaLabel,
  testId,
}: TrafficLightProps): JSX.Element {
  return (
    <button
      type="button"
      className={`window__light window__light--${kind}${
        active ? "" : " window__light--inactive"
      }`}
      data-testid={testId}
      data-kind={kind}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="window__light-glyph" aria-hidden="true">
        <TrafficLightGlyph kind={kind} />
      </span>
    </button>
  );
}

interface TrafficLightGlyphProps {
  readonly kind: "close" | "minimize" | "maximize";
}

/** Inline SVG glyphs revealed on hover, matching native macOS. */
function TrafficLightGlyph({ kind }: TrafficLightGlyphProps): JSX.Element {
  if (kind === "close") {
    return (
      <svg
        viewBox="0 0 12 12"
        width="8"
        height="8"
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  if (kind === "minimize") {
    return (
      <svg
        viewBox="0 0 12 12"
        width="8"
        height="8"
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M2.5 6 L9.5 6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 12 12"
      width="8"
      height="8"
      focusable="false"
      aria-hidden="true"
    >
      <path
        d="M6 2.5 L6 9.5 M2.5 6 L9.5 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
