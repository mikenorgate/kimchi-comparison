"use client";

import { useCallback, useMemo, useReducer, useEffect } from "react";
import {
  CALCULATOR_KEYPAD,
  initialCalculatorState,
  pressKey,
  type CalculatorKey,
  type CalculatorKeyDefinition,
  type CalculatorState,
} from "./calculatorLogic";

/**
 * Calculator window content.
 *
 * Renders a macOS-Calculator-inspired layout:
 *
 *   | display (current value + pending operator) | keypad |
 *
 * The component owns a single piece of state — a
 * {@link CalculatorState} snapshot — and dispatches every key
 * press through the pure `pressKey` reducer in
 * `calculatorLogic.ts`. Because the reducer is a pure function, the
 * same state machine is unit-tested independently of React in
 * `calculatorLogic.test.ts`; this file only adds the keyboard and
 * UI wiring.
 *
 * Behavioural notes:
 * - Display formats are driven entirely by the reducer — the
 *   component never reformats numbers itself. The only formatting
 *   applied here is the right-aligned reading of the display.
 * - When a binary operator is pending, the display shows a tiny
 *   "op" indicator (e.g. "+") so the user can see what's queued.
 *   The indicator is purely derived from state; it never owns its
 *   own state.
 * - The keypad is laid out from the {@link CALCULATOR_KEYPAD}
 *   constant, so the visual ordering, labels, and CSS-grid spans
 *   all live in one place.
 * - Keyboard support: digits, decimal point, `+`, `-`, `*`, `/`,
 *   `Enter` / `=`, `Backspace` (treated as clear per the spec),
 *   and `Escape` are all wired up. Keyboard shortcuts respect
 *   focus: if the user is typing into another input on the page
 *   the Calculator doesn't intercept.
 * - The component is the only place that calls `useReducer` — the
 *   reducer wrapper is local because it's a one-liner that closes
 *   over the (already pure) `pressKey` helper.
 */
export interface CalculatorProps {
  /**
   * Optional starting state. Defaults to {@link initialCalculatorState}.
   * Tests can pass a smaller fixture to drive specific branches
   * without rebuilding every transition.
   */
  readonly initialState?: CalculatorState;
}

/**
 * Tiny reducer that wraps {@link pressKey}. Hoisted out of the
 * component body so `useReducer` doesn't recreate the function on
 * every render (React tolerates this, but it spams the devtools).
 */
function reducer(state: CalculatorState, key: CalculatorKey): CalculatorState {
  return pressKey(state, key);
}

/**
 * Map a {@link CalculatorKeyDefinition} to a `data-*` attribute
 * that the test suite can assert against. Kept here (rather than
 * in `calculatorLogic`) because test ids are a UI concern, not a
 * domain concern.
 */
function testIdForKey(def: CalculatorKeyDefinition): string {
  return def.testId ?? `calculator-key-${def.key}`;
}

/**
 * Translate a `KeyboardEvent` into a {@link CalculatorKey}. Returns
 * `null` when the keystroke doesn't map to a Calculator button —
 * the caller should treat that as "do nothing".
 *
 * Note: we deliberately don't dispatch on `event.code` ("Numpad7"
 * etc.) because the underlying numeric value already differs by
 * row in the keypad; matching on `event.key` keeps the mapping
 * trivial for both the top row and the numeric keypad.
 */
function keyFromKeyboardEvent(event: KeyboardEvent): CalculatorKey | null {
  // `event.key` is uppercase when shift is held, so we normalise
  // before comparing against the operator set.
  const k = event.key;
  if (k >= "0" && k <= "9") {
    // The range check above proves `k` is a single digit string,
    // which is a member of the `CalculatorKey` union. The cast
    // here is just to satisfy TypeScript — the runtime check is
    // exhaustive over all ten digit characters.
    return k as CalculatorKey;
  }
  switch (k) {
    case ".":
      return ".";
    case "+":
      return "+";
    case "-":
      return "-";
    case "*":
      return "*";
    case "/":
      return "/";
    case "=":
      return "=";
    case "Enter":
      return "=";
    case "Backspace":
      return "C";
    case "Escape":
      return "C";
    default:
      return null;
  }
}

export default function Calculator({
  initialState,
}: CalculatorProps): JSX.Element {
  // `useReducer` is overkill here (a single state field, no
  // derived children), but it keeps the call sites clean — every
  // button click is just `dispatch(key)`.
  const [state, dispatch] = useReducer(
    reducer,
    initialState ?? initialCalculatorState
  );

  /**
   * Map an input click to a {@link CalculatorKey} dispatch.
   * Extracted so the JSX in the button list stays declarative.
   */
  const handleKeyClick = useCallback((key: CalculatorKey) => {
    dispatch(key);
  }, []);

  /**
   * Global keyboard shortcut handler. Mounted via
   * `useEffect` so it cleans itself up on unmount; we only
   * intercept the event when no input element is focused so
   * typing in another field doesn't accidentally feed the
   * Calculator.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Don't steal keys from text inputs / number inputs / the
      // contenteditable editor in Notes etc. Without this guard,
      // typing "2+2=4" in Notes would have updated the
      // Calculator in the background.
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = keyFromKeyboardEvent(event);
      if (key === null) return;
      event.preventDefault();
      dispatch(key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  /**
   * The pending-operator glyph shown above the main display.
   * `null` when no operator is queued. Cached with `useMemo` so
   * the JSX doesn't recompute the lookup on every render.
   */
  const pendingOpGlyph = useMemo<string | null>(() => {
    if (state.pendingOperator === null) return null;
    const def = CALCULATOR_KEYPAD.find((d) => d.key === state.pendingOperator);
    return def?.label ?? null;
  }, [state.pendingOperator]);

  return (
    <div
      className="calculator"
      data-testid="calculator"
      data-error={state.error ? "true" : "false"}
      data-pending-operator={state.pendingOperator ?? ""}
      data-display={state.display}
    >
      <Display
        display={state.display}
        pendingOperatorGlyph={pendingOpGlyph}
        error={state.error}
      />
      <Keypad onKey={handleKeyClick} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

interface DisplayProps {
  readonly display: string;
  readonly pendingOperatorGlyph: string | null;
  readonly error: boolean;
}

/**
 * The readout at the top of the Calculator. Renders the current
 * numeric value (or "Error") right-aligned, plus a small glyph
 * indicating the staged operator. The pending-operator badge is
 * purely decorative — the source of truth lives on the state.
 */
function Display({
  display,
  pendingOperatorGlyph,
  error,
}: DisplayProps): JSX.Element {
  return (
    <div
      className={
        "calculator__display" + (error ? " calculator__display--error" : "")
      }
      data-testid="calculator-display"
      data-error={error ? "true" : "false"}
      aria-live="polite"
    >
      <span
        className="calculator__display-pending"
        data-testid="calculator-display-pending"
        aria-hidden="true"
      >
        {pendingOperatorGlyph ?? ""}
      </span>
      <span
        className="calculator__display-value"
        data-testid="calculator-display-value"
      >
        {display}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Keypad
// ---------------------------------------------------------------------------

interface KeypadProps {
  readonly onKey: (key: CalculatorKey) => void;
}

/**
 * Renders the 4-column keypad from {@link CALCULATOR_KEYPAD}.
 * Buttons receive a `kind`-derived CSS class so the visual
 * styling can distinguish digits, operators, functions, and the
 * decimal point without per-button inspection.
 */
function Keypad({ onKey }: KeypadProps): JSX.Element {
  return (
    <div
      className="calculator__keypad"
      data-testid="calculator-keypad"
      role="group"
      aria-label="Calculator keypad"
    >
      {CALCULATOR_KEYPAD.map((def) => (
        <KeyButton
          key={def.key}
          def={def}
          onClick={() => onKey(def.key)}
        />
      ))}
    </div>
  );
}

interface KeyButtonProps {
  readonly def: CalculatorKeyDefinition;
  readonly onClick: () => void;
}

/**
 * One keypad button. Renders the labelled button with a stable
 * `data-testid`, a `kind`-driven class, and an `aria-label`
 * describing the action (the visible label is a unicode glyph
 * which isn't ideal for screen readers, so we spell it out).
 */
function KeyButton({ def, onClick }: KeyButtonProps): JSX.Element {
  const testId = testIdForKey(def);
  const ariaLabel = ariaLabelFor(def);
  const style =
    typeof def.span === "number"
      ? { gridColumn: `span ${def.span}` }
      : undefined;
  return (
    <button
      type="button"
      className={`calculator__key calculator__key--${def.kind}`}
      data-testid={testId}
      data-key={def.key}
      data-kind={def.kind}
      style={style}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {def.label}
    </button>
  );
}

/**
 * Produce a screen-reader-friendly label for a key. The visible
 * label uses unicode glyphs (÷, ×, ±) which VoiceOver pronounces
 * poorly, so we spell out the action in `aria-label`.
 */
function ariaLabelFor(def: CalculatorKeyDefinition): string {
  switch (def.key) {
    case "+":
      return "Add";
    case "-":
      return "Subtract";
    case "*":
      return "Multiply";
    case "/":
      return "Divide";
    case "=":
      return "Equals";
    case "C":
      return "Clear";
    case "+/-":
      return "Toggle sign";
    case "%":
      return "Percent";
    case ".":
      return "Decimal point";
    default:
      return def.key;
  }
}
