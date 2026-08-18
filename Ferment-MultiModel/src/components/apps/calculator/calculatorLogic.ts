/**
 * Pure arithmetic logic for the macOS-style Calculator window.
 *
 * The Calculator UI is intentionally split into two layers:
 *
 *   - This module owns the **state machine**. It exports plain
 *     immutable {@link CalculatorState} snapshots plus pure
 *     reducer-style helpers (`digit`, `decimal`, `operator`,
 *     `equals`, `clear`, `negate`, `percent`, `evaluate`). Every
 *     transition takes the current state and returns a brand new
 *     state, so the React component can rely on `useReducer` /
 *     `useState` semantics without having to reason about partial
 *     mutation.
 *   - `Calculator.tsx` owns the **presentation**. It maps user
 *     events (keypad clicks, keyboard shortcuts) to calls into the
 *     helpers below and renders the resulting `display` string.
 *
 * Behavioural notes:
 * - Divide-by-zero surfaces as `error: true` and a display of
 *   "Error". The only transition that escapes error state is
 *   {@link clear}.
 * - Numeric results are normalised through {@link formatNumber},
 *   which clamps floating-point noise via `toPrecision(12)` and
 *   then strips trailing zeros so `1 + 2` renders as `3` rather
 *   than `3.000000000000`.
 * - Operator chaining follows real-Calculator semantics: pressing
 *   an operator while another operator is pending (and no second
 *   operand has been entered yet) **replaces** the pending
 *   operator instead of evaluating. Pressing an operator after
 *   entering a second operand evaluates the previous pair and
 *   stages the new one — so `2 + 3 + =` evaluates `5 + 3`.
 */

/** Supported binary operators. */
export type CalculatorOperator = "+" | "-" | "*" | "/";

/** The keys the UI may dispatch. Excludes "= " for keyboard parity. */
export type CalculatorKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "+"
  | "-"
  | "*"
  | "/"
  | "="
  | "C"
  | "+/-"
  | "%";

/**
 * Snapshot of the calculator at one point in time. The React
 * component re-renders purely from changes to this object — every
 * transition returns a new instance.
 */
export interface CalculatorState {
  /**
   * The string currently shown on the display. Always a finite
   * decimal in `[-\u221E, \u221E]` for non-error states, or the
   * literal string `"Error"` when `error` is `true`.
   */
  readonly display: string;
  /**
   * The left-hand operand that the next {@link equals} (or staged
   * {@link operator}) will combine with the current display value.
   * Carried across presses so chained operations work without
   * recomputing from `display` (which is a string and would lose
   * the numeric history).
   */
  readonly accumulator: number;
  /**
   * The operator staged for the next evaluation. `null` means
   * "nothing pending"; the next operator or equals press will
   * reset it.
   */
  readonly pendingOperator: CalculatorOperator | null;
  /**
   * `true` when the next digit/decimal should replace the display
   * instead of appending. Set after an operator press, after
   * {@link equals}, and after {@link clear}.
   */
  readonly waitingForOperand: boolean;
  /**
   * `true` when the calculator is in an unrecoverable error state
   * (divide-by-zero). The only legal transition out of this state
   * is {@link clear}.
   */
  readonly error: boolean;
}

/**
 * The initial state of a freshly cleared calculator. Exported as a
 * frozen constant so tests can compare against it without rebuilding
 * the object every time.
 */
export const initialCalculatorState: CalculatorState = Object.freeze({
  display: "0",
  accumulator: 0,
  pendingOperator: null,
  waitingForOperand: false,
  error: false,
});

/**
 * Floating-point tolerance used by {@link equalsWhenClose} (and
 * indirectly by divide-by-zero detection). Ten raised to the
 * negative-twelfth matches the precision we expose on the display
 * after {@link formatNumber} and is well below any visually
 * meaningful difference.
 */
export const CALCULATOR_EPSILON = 1e-12;

/**
 * Maximum significant digits the display preserves. Anything beyond
 * this is rounded via {@link Number#toPrecision} so the readout
 * stays a reasonable length even for very large or very small
 * results.
 */
export const CALCULATOR_DISPLAY_PRECISION = 12;

/**
 * Format a finite number for display on the calculator. Trims
 * trailing zeros and clamps to {@link CALCULATOR_DISPLAY_PRECISION}
 * significant digits so the readout never overflows the panel.
 *
 * Non-finite inputs (`Infinity`, `-Infinity`, `NaN`) collapse to
 * `"Error"` so callers can use the same formatter from the divide
 * path without branching.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  if (value === 0) return "0";

  // `toPrecision` rounds to N significant digits, including before
  // the decimal point; for very large or very small magnitudes this
  // is the only way to keep the readout readable. For normal-range
  // numbers we end up with the same string `Number#toString`
  // produces, just with trailing zeros stripped.
  const precise = value.toPrecision(CALCULATOR_DISPLAY_PRECISION);
  // `Number.parseFloat` collapses `"3.00000000000"` back to `3`
  // and `toString` then yields the canonical form. The detour
  // through parseFloat is intentional — calling `toString` on the
  // precision-rounded string directly would leak the trailing
  // zeros that `parseFloat` strips.
  const collapsed = Number.parseFloat(precise);
  if (!Number.isFinite(collapsed)) return "Error";
  return collapsed.toString();
}

/**
 * Apply a binary operator to two operands. Returns `null` for
 * divide-by-zero so callers can transition to the error state
 * without having to know which operator failed.
 */
export function applyOperator(
  left: number,
  operator: CalculatorOperator,
  right: number
): number | null {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (Math.abs(right) <= CALCULATOR_EPSILON) return null;
      return left / right;
    default:
      // Exhaustiveness check — if a new operator is added, this
      // line will surface a TypeScript error here.
      const _exhaustive: never = operator;
      return _exhaustive;
  }
}

/**
 * True iff `a` and `b` are within {@link CALCULATOR_EPSILON} of
 * each other. Used to detect divide-by-zero where `right` is small
 * but not literally `0` (e.g. `1e-15`).
 */
export function equalsWhenClose(a: number, b: number): boolean {
  return Math.abs(a - b) < CALCULATOR_EPSILON;
}

/**
 * Parse the display string back into a number. Safe for any string
 * {@link formatNumber} produces plus the literal `"Error"` (which
 * collapses to `NaN`; callers must check `error` first).
 */
export function displayToNumber(display: string): number {
  return Number.parseFloat(display);
}

/**
 * Transition the state in response to a digit press. Appends to
 * the existing display unless we're waiting for a new operand
 * (right after an operator, equals, or clear), in which case the
 * display is replaced.
 *
 * No-ops when the calculator is in the error state — the user
 * must hit {@link clear} to recover.
 */
export function digit(state: CalculatorState, d: string): CalculatorState {
  if (state.error) return state;
  if (d.length !== 1 || d < "0" || d > "9") return state;

  if (state.waitingForOperand) {
    // Preserve a negate prefix that was applied via `+/-` while
    // we were waiting. The display at this point is the negated
    // accumulator (e.g. "-5") or the staging value "-0". Without
    // this branch the next digit would clobber the prefix and
    // make `2 + ± 3 =` evaluate as `2 + 3 = 5`.
    const prefix = state.display.startsWith("-") ? "-" : "";
    return {
      ...state,
      display: `${prefix}${d}`,
      waitingForOperand: false,
    };
  }

  // Replace a leading zero with the first non-zero digit so the
  // display never reads "07". A leading "0." is preserved because
  // it's a valid start of a decimal.
  if (state.display === "0") {
    return { ...state, display: d };
  }
  if (state.display === "-0") {
    return { ...state, display: `-${d}` };
  }

  // Cap the input length so the user can't out-type the panel.
  // We allow up to 15 characters — enough for any number that
  // survives `formatNumber`'s precision rounding while still
  // fitting the readout on a typical window size.
  if (state.display.length >= 15) {
    return state;
  }

  return { ...state, display: `${state.display}${d}` };
}

/**
 * Transition the state in response to a decimal-point press.
 * Adds `"."` to the current entry if it doesn't already contain
 * one; otherwise this is a no-op.
 */
export function decimal(state: CalculatorState): CalculatorState {
  if (state.error) return state;

  if (state.waitingForOperand) {
    return {
      ...state,
      display: "0.",
      waitingForOperand: false,
    };
  }

  if (state.display.includes(".")) return state;
  return { ...state, display: `${state.display}.` };
}

/**
 * Transition the state in response to an operator press.
 *
 * - If a previous operator is pending and the user hasn't entered
 *   the second operand yet, the new operator **replaces** it (no
 *   evaluation).
 * - Otherwise the previous pending operator is evaluated against
 *   the current display, the result becomes the new accumulator,
 *   and the new operator is staged.
 */
export function operator(
  state: CalculatorState,
  next: CalculatorOperator
): CalculatorState {
  if (state.error) return state;

  // Replace-pending-operator shortcut: just pressed an operator
  // and now pressing another. Real calculators do this so the
  // user can correct their mind without entering a dummy operand.
  if (state.pendingOperator !== null && state.waitingForOperand) {
    return { ...state, pendingOperator: next };
  }

  const currentValue = displayToNumber(state.display);

  // First operator press: stage the accumulator without
  // evaluating (there is nothing pending yet).
  if (state.pendingOperator === null) {
    return {
      ...state,
      accumulator: currentValue,
      pendingOperator: next,
      waitingForOperand: true,
    };
  }

  // Chained operator: evaluate previous pair, then stage new op.
  const result = applyOperator(
    state.accumulator,
    state.pendingOperator,
    currentValue
  );
  if (result === null) {
    return {
      display: "Error",
      accumulator: 0,
      pendingOperator: null,
      waitingForOperand: true,
      error: true,
    };
  }
  return {
    ...state,
    accumulator: result,
    display: formatNumber(result),
    pendingOperator: next,
    waitingForOperand: true,
  };
}

/**
 * Transition the state in response to an equals press. Evaluates
 * the staged operator (if any) against the current display value.
 * Without a pending operator this is a no-op — the accumulator is
 * left untouched and the display stays as-is.
 */
export function equals(state: CalculatorState): CalculatorState {
  if (state.error) return state;
  if (state.pendingOperator === null) return state;

  const currentValue = displayToNumber(state.display);
  const result = applyOperator(
    state.accumulator,
    state.pendingOperator,
    currentValue
  );
  if (result === null) {
    return {
      display: "Error",
      accumulator: 0,
      pendingOperator: null,
      waitingForOperand: true,
      error: true,
    };
  }
  return {
    display: formatNumber(result),
    accumulator: result,
    pendingOperator: null,
    // Mark waiting so subsequent digits start a fresh entry — this
    // matches macOS Calculator where pressing `=` then `5` starts
    // a new computation rather than appending to the result.
    waitingForOperand: true,
    error: false,
  };
}

/**
 * Transition the state in response to a clear press. Always resets
 * to {@link initialCalculatorState}, including from the error
 * state — clear is the only recovery path.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function clear(state: CalculatorState): CalculatorState {
  return { ...initialCalculatorState };
}

/**
 * Transition the state in response to a sign-toggle press. Flips
 * the sign of the current display value. The accumulator and
 * pending operator are untouched.
 *
 * When waiting for a new operand the display flips to "-0" (or
 * back to "0") and stays waiting so the next digit press yields
 * `-{digit}` via {@link digit}'s prefix-preservation branch.
 *
 * A bare `0` outside of the waiting state flips to "-0" so a
 * subsequent digit press yields `-{digit}` rather than the
 * unsigned value — the user pressed the toggle for a reason.
 */
export function negate(state: CalculatorState): CalculatorState {
  if (state.error) return state;

  if (state.waitingForOperand) {
    // Stage the negate without changing the operand the user is
    // about to type.
    if (state.display.startsWith("-")) {
      return {
        ...state,
        display: state.display.slice(1),
        waitingForOperand: true,
      };
    }
    return {
      ...state,
      display: `-${state.display}`,
      waitingForOperand: true,
    };
  }

  if (state.display === "0") {
    return { ...state, display: "-0" };
  }
  if (state.display === "-0") {
    return { ...state, display: "0" };
  }
  if (state.display.startsWith("-")) {
    return { ...state, display: state.display.slice(1) };
  }
  return { ...state, display: `-${state.display}` };
}

/**
 * Transition the state in response to a percent press. Divides
 * the current display value by 100. Matches the simple-Calculator
 * behaviour where `%` is just a divide-by-100 transform on the
 * current entry.
 */
export function percent(state: CalculatorState): CalculatorState {
  if (state.error) return state;
  const currentValue = displayToNumber(state.display);
  const result = currentValue / 100;
  return { ...state, display: formatNumber(result) };
}

/**
 * Dispatch a single {@link CalculatorKey} to the state. This is
 * the entry point used by the React component — keeps the
 * key-to-transition mapping in one place so adding a new key is a
 * one-line change.
 */
export function pressKey(
  state: CalculatorState,
  key: CalculatorKey
): CalculatorState {
  switch (key) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return digit(state, key);
    case ".":
      return decimal(state);
    case "+":
      return operator(state, "+");
    case "-":
      return operator(state, "-");
    case "*":
      return operator(state, "*");
    case "/":
      return operator(state, "/");
    case "=":
      return equals(state);
    case "C":
      return clear(state);
    case "+/-":
      return negate(state);
    case "%":
      return percent(state);
    default:
      const _exhaustive: never = key;
      return _exhaustive;
  }
}

/**
 * Static keypad definition. The order here is the visual order in
 * the UI — row-major, left to right. The React component maps over
 * this list to render the buttons so the grid definition lives in
 * exactly one place.
 *
 * The `kind` field drives the CSS class so function/operator/digit
 * buttons can be styled differently without per-button inspection.
 */
export type CalculatorKeyKind = "digit" | "operator" | "function" | "decimal";

export interface CalculatorKeyDefinition {
  readonly key: CalculatorKey;
  readonly label: string;
  readonly kind: CalculatorKeyKind;
  /** Optional test id override (default: `calculator-key-{key}`). */
  readonly testId?: string;
  /** Optional span hint for the CSS grid (e.g. "0" spans 2 cols). */
  readonly span?: number;
}

/**
 * The default Calculator layout, in render order. Real macOS
 * Calculator orders the keypad as:
 *
 *   row 0: AC,  +/-,  %,    ÷
 *   row 1: 7,   8,    9,    ×
 *   row 2: 4,   5,    6,    −
 *   row 3: 1,   2,    3,    +
 *   row 4: 0 (spans 2),  .,  =
 *
 * The labels use the unicode division and multiplication signs so
 * the keypad reads naturally even without CSS ligatures.
 */
export const CALCULATOR_KEYPAD: readonly CalculatorKeyDefinition[] = [
  { key: "C", label: "AC", kind: "function" },
  { key: "+/-", label: "±", kind: "function" },
  { key: "%", label: "%", kind: "function" },
  { key: "/", label: "÷", kind: "operator" },
  { key: "7", label: "7", kind: "digit" },
  { key: "8", label: "8", kind: "digit" },
  { key: "9", label: "9", kind: "digit" },
  { key: "*", label: "×", kind: "operator" },
  { key: "4", label: "4", kind: "digit" },
  { key: "5", label: "5", kind: "digit" },
  { key: "6", label: "6", kind: "digit" },
  { key: "-", label: "−", kind: "operator" },
  { key: "1", label: "1", kind: "digit" },
  { key: "2", label: "2", kind: "digit" },
  { key: "3", label: "3", kind: "digit" },
  { key: "+", label: "+", kind: "operator" },
  { key: "0", label: "0", kind: "digit", span: 2 },
  { key: ".", label: ".", kind: "decimal" },
  { key: "=", label: "=", kind: "operator" },
] as const;
