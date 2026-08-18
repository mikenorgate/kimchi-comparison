import { describe, it, expect } from "vitest";
import {
  CALCULATOR_EPSILON,
  CALCULATOR_KEYPAD,
  applyOperator,
  clear,
  decimal,
  digit,
  displayToNumber,
  equals,
  equalsWhenClose,
  formatNumber,
  initialCalculatorState,
  negate,
  operator,
  percent,
  pressKey,
} from "./calculatorLogic";
import type {
  CalculatorKey,
  CalculatorOperator,
  CalculatorState,
} from "./calculatorLogic";

/**
 * Convenience helper: run a sequence of key presses against a
 * fresh state and return the resulting state. Keeps the
 * per-test bodies declarative — they read like the keys the user
 * would actually press.
 */
function runKeys(keys: readonly CalculatorKey[]): CalculatorState {
  return keys.reduce(pressKey, initialCalculatorState);
}

describe("calculatorLogic — initial state", () => {
  it("starts at display '0' with no pending operator", () => {
    expect(initialCalculatorState.display).toBe("0");
    expect(initialCalculatorState.accumulator).toBe(0);
    expect(initialCalculatorState.pendingOperator).toBeNull();
    expect(initialCalculatorState.waitingForOperand).toBe(false);
    expect(initialCalculatorState.error).toBe(false);
  });

  it("is exposed as a frozen constant", () => {
    expect(Object.isFrozen(initialCalculatorState)).toBe(true);
  });
});

describe("calculatorLogic — digit entry", () => {
  it("appends digits to the display when not waiting for an operand", () => {
    const state = runKeys(["1", "2", "3"]);
    expect(state.display).toBe("123");
    expect(state.error).toBe(false);
  });

  it("replaces a leading '0' with the first non-zero digit", () => {
    const state = runKeys(["0", "5"]);
    expect(state.display).toBe("5");
  });

  it("replaces a leading '-0' with the signed first non-zero digit", () => {
    const state = runKeys(["+/-", "0", "5"]);
    expect(state.display).toBe("-5");
  });

  it("replaces the display when waiting for an operand", () => {
    const state = runKeys(["5", "+", "7"]);
    // After pressing `+` we are waiting for the second operand, so
    // the next digit press replaces "0" rather than appending.
    expect(state.display).toBe("7");
    expect(state.waitingForOperand).toBe(false);
  });

  it("ignores digit presses that aren't 0-9", () => {
    const state = digit(initialCalculatorState, "a");
    expect(state).toBe(initialCalculatorState);
  });

  it("caps the display length to prevent overflow", () => {
    // 16 digits is well above the input cap; the last append
    // should be a no-op rather than corrupting the value.
    const state = runKeys([
      "1", "2", "3", "4", "5",
      "6", "7", "8", "9", "0",
      "1", "2", "3", "4", "5",
      "6",
    ]);
    // Cap is 15 characters; pressing 16 should cap at 15.
    expect(state.display.length).toBeLessThanOrEqual(15);
    // And the leading digits are still what we asked for.
    expect(state.display.startsWith("123456789012345")).toBe(true);
  });
});

describe("calculatorLogic — decimal entry", () => {
  it("starts a new display with '0.' after a pending operator", () => {
    const state = runKeys(["5", "+", "."]);
    expect(state.display).toBe("0.");
    expect(state.waitingForOperand).toBe(false);
  });

  it("appends a decimal point when none exists yet", () => {
    const state = runKeys(["1", "2", "."]);
    expect(state.display).toBe("12.");
  });

  it("does not add a second decimal point", () => {
    const state = runKeys(["1", "2", ".", "3", ".", "4"]);
    expect(state.display).toBe("12.34");
  });
});

describe("calculatorLogic — operators and equals", () => {
  it("evaluates a single addition", () => {
    const state = runKeys(["2", "+", "3", "="]);
    expect(state.display).toBe("5");
    expect(state.error).toBe(false);
  });

  it("evaluates a single subtraction", () => {
    const state = runKeys(["9", "-", "4", "="]);
    expect(state.display).toBe("5");
  });

  it("evaluates a single multiplication", () => {
    const state = runKeys(["6", "*", "7", "="]);
    expect(state.display).toBe("42");
  });

  it("evaluates a single division", () => {
    const state = runKeys(["8", "/", "2", "="]);
    expect(state.display).toBe("4");
  });

  it("chains multiple operations with the right associativity", () => {
    // 2 + 3 + 4 = 9: pressing + after entering 3 evaluates the
    // first pair (5) and stages the next operator.
    const state = runKeys(["2", "+", "3", "+", "4", "="]);
    expect(state.display).toBe("9");
  });

  it("respects mixed precedence left-to-right", () => {
    // 2 + 3 * 4 = 20 under left-to-right (no precedence) — the
    // Calculator intentionally evaluates in entry order.
    const state = runKeys(["2", "+", "3", "*", "4", "="]);
    expect(state.display).toBe("20");
  });

  it("replaces a pending operator when no operand has been entered yet", () => {
    const state = runKeys(["5", "+", "-", "3", "="]);
    // The second operator replaces the first; 5 - 3 = 2.
    expect(state.display).toBe("2");
    expect(state.pendingOperator).toBeNull();
  });

  it("clears the pending operator after equals", () => {
    const state = runKeys(["2", "+", "3", "="]);
    expect(state.pendingOperator).toBeNull();
    // Subsequent digits start a fresh entry.
    const next = digit(state, "9");
    expect(next.display).toBe("9");
  });

  it("ignores equals when no operator is pending", () => {
    const state = runKeys(["2", "3", "="]);
    expect(state.display).toBe("23");
    expect(state.accumulator).toBe(0);
    expect(state.pendingOperator).toBeNull();
  });

  it("starts a fresh entry after equals (does not append)", () => {
    const state = runKeys(["2", "+", "3", "=", "9"]);
    expect(state.display).toBe("9");
  });
});

describe("calculatorLogic — divide by zero", () => {
  it("transitions to the error state on direct divide-by-zero", () => {
    const state = runKeys(["5", "/", "0", "="]);
    expect(state.display).toBe("Error");
    expect(state.error).toBe(true);
    expect(state.pendingOperator).toBeNull();
  });

  it("treats near-zero divisors as zero within epsilon", () => {
    // Construct a state where the right operand is a value just
    // below the epsilon threshold, then evaluate a division.
    const state: CalculatorState = {
      ...initialCalculatorState,
      accumulator: 1,
      pendingOperator: "/",
      display: CALCULATOR_EPSILON.toString(),
      waitingForOperand: false,
    };
    const next = equals(state);
    expect(next.error).toBe(true);
    expect(next.display).toBe("Error");
  });

  it("locks further inputs while in error", () => {
    const state = runKeys(["5", "/", "0", "="]);
    expect(state.error).toBe(true);
    // Digits, operators, equals, negate, percent are no-ops.
    expect(digit(state, "7")).toBe(state);
    expect(decimal(state)).toBe(state);
    expect(operator(state, "+")).toBe(state);
    expect(equals(state)).toBe(state);
    expect(negate(state)).toBe(state);
    expect(percent(state)).toBe(state);
  });
});

describe("calculatorLogic — clear", () => {
  it("resets to initial state", () => {
    const state = runKeys(["1", "2", "3", "+", "4", "5"]);
    const cleared = clear(state);
    expect(cleared).toEqual(initialCalculatorState);
    expect(cleared.display).toBe("0");
    expect(cleared.accumulator).toBe(0);
    expect(cleared.pendingOperator).toBeNull();
    expect(cleared.waitingForOperand).toBe(false);
    expect(cleared.error).toBe(false);
  });

  it("is the only path out of the error state", () => {
    const state = runKeys(["5", "/", "0", "="]);
    expect(state.error).toBe(true);
    const cleared = clear(state);
    expect(cleared.error).toBe(false);
    expect(cleared.display).toBe("0");
  });

  it("returns a new object rather than mutating the input", () => {
    const state = runKeys(["1", "+", "2"]);
    const cleared = clear(state);
    expect(cleared).not.toBe(state);
    expect(state.display).not.toBe("0"); // original untouched
  });
});

describe("calculatorLogic — negate", () => {
  it("flips the sign of a positive display", () => {
    const state = runKeys(["5", "+/-"]);
    expect(state.display).toBe("-5");
  });

  it("flips the sign of a negative display back to positive", () => {
    const state = runKeys(["5", "+/-", "+/-"]);
    expect(state.display).toBe("5");
  });

  it("flips '0' to '-0' so the next digit press yields -digit", () => {
    const next = negate(initialCalculatorState);
    expect(next.display).toBe("-0");
    // Subsequent digits take the negative prefix with them.
    const afterDigit = digit(next, "5");
    expect(afterDigit.display).toBe("-5");
  });

  it("preserves the accumulator and pending operator", () => {
    const state = runKeys(["2", "+", "3", "+/-"]);
    expect(state.display).toBe("-3");
    expect(state.accumulator).toBe(2);
    expect(state.pendingOperator).toBe("+");
  });
});

describe("calculatorLogic — percent", () => {
  it("divides the display by 100", () => {
    const state = runKeys(["5", "0", "%"]);
    expect(state.display).toBe("0.5");
  });

  it("handles a percent on a negative display", () => {
    const state = runKeys(["2", "5", "+/-", "%"]);
    expect(state.display).toBe("-0.25");
  });

  it("does not consume the pending operator", () => {
    const state = runKeys(["2", "+", "5", "0", "%"]);
    expect(state.display).toBe("0.5");
    expect(state.pendingOperator).toBe("+");
    expect(state.accumulator).toBe(2);
  });
});

describe("calculatorLogic — formatting", () => {
  it("strips trailing zeros from integer-valued results", () => {
    expect(formatNumber(3)).toBe("3");
    expect(formatNumber(42)).toBe("42");
  });

  it("preserves a single trailing zero when meaningful", () => {
    expect(formatNumber(0.5)).toBe("0.5");
  });

  it("renders 0 as '0'", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-0)).toBe("0");
  });

  it("collapses non-finite values to 'Error'", () => {
    expect(formatNumber(Infinity)).toBe("Error");
    expect(formatNumber(-Infinity)).toBe("Error");
    expect(formatNumber(NaN)).toBe("Error");
  });

  it("rounds very long fractions to display precision", () => {
    const display = formatNumber(1 / 3);
    // 0.333333333333 rounds to 0.333333333333 at 12 sig digits.
    expect(display).toBe("0.333333333333");
  });

  it("parses display strings back to numbers", () => {
    expect(displayToNumber("0")).toBe(0);
    expect(displayToNumber("-5")).toBe(-5);
    expect(displayToNumber("3.14")).toBeCloseTo(3.14, 12);
    expect(Number.isNaN(displayToNumber("Error"))).toBe(true);
  });
});

describe("calculatorLogic — applyOperator and equalsWhenClose", () => {
  it("applies addition correctly", () => {
    expect(applyOperator(2, "+", 3)).toBe(5);
  });

  it("applies subtraction correctly", () => {
    expect(applyOperator(9, "-", 4)).toBe(5);
  });

  it("applies multiplication correctly", () => {
    expect(applyOperator(6, "*", 7)).toBe(42);
  });

  it("applies division correctly", () => {
    expect(applyOperator(8, "/", 2)).toBe(4);
  });

  it("returns null on divide-by-zero", () => {
    expect(applyOperator(5, "/", 0)).toBeNull();
  });

  it("detects near-equality within epsilon", () => {
    expect(equalsWhenClose(0, 1e-15)).toBe(true);
    expect(equalsWhenClose(0, 1e-3)).toBe(false);
    expect(equalsWhenClose(1, 1 + 1e-15)).toBe(true);
  });
});

describe("calculatorLogic — keypad definition", () => {
  it("exposes 19 keys (digits, ops, C, +/-, %, ., =)", () => {
    expect(CALCULATOR_KEYPAD).toHaveLength(19);
  });

  it("has every digit 0-9 exactly once", () => {
    const digits = CALCULATOR_KEYPAD.filter((k) => k.kind === "digit").map(
      (k) => k.key
    );
    expect(digits.sort()).toEqual(
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].sort()
    );
  });

  it("has every binary operator exactly once", () => {
    const ops: CalculatorOperator[] = ["+", "-", "*", "/"];
    for (const op of ops) {
      const count = CALCULATOR_KEYPAD.filter((k) => k.key === op).length;
      expect(count).toBe(1);
    }
  });

  it("marks the 0 key as spanning 2 columns", () => {
    const zero = CALCULATOR_KEYPAD.find((k) => k.key === "0");
    expect(zero?.span).toBe(2);
  });
});

describe("calculatorLogic — pressKey dispatch", () => {
  it("routes every key to the right helper", () => {
    // spot-check: '7' dispatches to digit, '+/-' to negate, '%' to
    // percent, '.' to decimal, 'C' to clear, '=' to equals, '+' to
    // operator.
    expect(pressKey(initialCalculatorState, "7")).toEqual(
      digit(initialCalculatorState, "7")
    );
    expect(pressKey(initialCalculatorState, ".")).toEqual(
      decimal(initialCalculatorState)
    );
    expect(pressKey(initialCalculatorState, "+")).toEqual(
      operator(initialCalculatorState, "+")
    );
    expect(pressKey(initialCalculatorState, "=")).toEqual(
      equals(initialCalculatorState)
    );
    expect(pressKey(initialCalculatorState, "C")).toEqual(
      clear(initialCalculatorState)
    );
    expect(pressKey(initialCalculatorState, "+/-")).toEqual(
      negate(initialCalculatorState)
    );
    expect(pressKey(initialCalculatorState, "%")).toEqual(
      percent(initialCalculatorState)
    );
  });

  it("supports a full 2 + 3 = 5 round-trip", () => {
    expect(runKeys(["2", "+", "3", "="]).display).toBe("5");
  });

  it("supports a full 7 - 4 = 3 round-trip", () => {
    expect(runKeys(["7", "-", "4", "="]).display).toBe("3");
  });

  it("supports a full 6 * 7 = 42 round-trip", () => {
    expect(runKeys(["6", "*", "7", "="]).display).toBe("42");
  });

  it("supports a full 8 / 2 = 4 round-trip", () => {
    expect(runKeys(["8", "/", "2", "="]).display).toBe("4");
  });
});
