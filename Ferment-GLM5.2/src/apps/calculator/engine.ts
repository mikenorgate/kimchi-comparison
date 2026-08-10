/**
 * Calculator Arithmetic Engine
 *
 * A pure-function calculator engine that handles:
 * - Digit input (0-9, decimal point)
 * - Binary operations (+, -, ×, ÷)
 * - Unary operations (±, %)
 * - Clear (AC), toggle sign, percent
 * - Chained operations (2 + 3 × 4 = 20 — standard calculator logic)
 * - Error state (division by zero)
 *
 * The engine is stateful: each action transitions the internal state
 * and returns a new display string.
 */

// ── Types ─────────────────────────────────────────────────────────

export type Operator = '+' | '-' | '×' | '÷';

export type CalculatorAction =
  | { type: 'digit'; value: string }
  | { type: 'operator'; value: Operator }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'decimal' }
  | { type: 'toggle-sign' }
  | { type: 'percent' };

interface CalculatorState {
  /** Current display value (string for rendering) */
  display: string;
  /** Previous operand (stored when an operator is pressed) */
  previous: number | null;
  /** Pending operator */
  operator: Operator | null;
  /** Whether the next digit starts a new number (after operator or equals) */
  waitingForNewInput: boolean;
  /** Whether the calculator is in error state */
  error: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return 'Error';
  // Avoid floating point artifacts: round to 10 decimal places
  const rounded = Math.round(n * 1e10) / 1e10;
  // Format: remove trailing zeros, limit significant digits
  const str = String(rounded);
  if (str.length > 12) {
    // Use exponential for very large/small numbers
    if (Math.abs(rounded) > 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return rounded.toPrecision(10).replace(/\.?0+$/, '');
  }
  return str;
}

function compute(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? Infinity : a / b;
  }
}

// ── Initial State ─────────────────────────────────────────────────

export function createInitialState(): CalculatorState {
  return {
    display: '0',
    previous: null,
    operator: null,
    waitingForNewInput: false,
    error: false,
  };
}

// ── Reducer ───────────────────────────────────────────────────────

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  // If in error state, only Clear works
  if (state.error && action.type !== 'clear') {
    return state;
  }

  switch (action.type) {
    case 'clear':
      return createInitialState();

    case 'digit': {
      if (state.waitingForNewInput) {
        return { ...state, display: action.value, waitingForNewInput: false };
      }
      if (state.display === '0') {
        return { ...state, display: action.value };
      }
      if (state.display.length < 12) {
        return { ...state, display: state.display + action.value };
      }
      return state;
    }

    case 'decimal': {
      if (state.waitingForNewInput) {
        return { ...state, display: '0.', waitingForNewInput: false };
      }
      if (state.display.includes('.')) return state;
      return { ...state, display: state.display + '.' };
    }

    case 'operator': {
      const current = parseFloat(state.display);
      if (state.previous === null) {
        return {
          ...state,
          previous: current,
          operator: action.value,
          waitingForNewInput: true,
        };
      }
      // If we already have a pending operation and aren't waiting for new input,
      // compute the intermediate result first
      if (state.operator && !state.waitingForNewInput) {
        const result = compute(state.previous, current, state.operator);
        if (!isFinite(result) || isNaN(result)) {
          return { ...createInitialState(), display: 'Error', error: true };
        }
        return {
          ...state,
          display: formatNumber(result),
          previous: result,
          operator: action.value,
          waitingForNewInput: true,
        };
      }
      // Waiting for new input — just change the operator
      return { ...state, operator: action.value };
    }

    case 'equals': {
      if (state.operator === null || state.previous === null) return state;
      const current = parseFloat(state.display);
      const result = compute(state.previous, current, state.operator);
      if (!isFinite(result) || isNaN(result)) {
        return { ...createInitialState(), display: 'Error', error: true };
      }
      return {
        ...createInitialState(),
        display: formatNumber(result),
        waitingForNewInput: true,
      };
    }

    case 'toggle-sign': {
      if (state.display === '0' || state.display === 'Error') return state;
      if (state.display.startsWith('-')) {
        return { ...state, display: state.display.slice(1) };
      }
      return { ...state, display: '-' + state.display };
    }

    case 'percent': {
      const current = parseFloat(state.display);
      const result = current / 100;
      return { ...state, display: formatNumber(result) };
    }

    default:
      return state;
  }
}
