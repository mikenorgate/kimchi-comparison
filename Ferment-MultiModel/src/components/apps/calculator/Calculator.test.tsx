import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Calculator from "./Calculator";

/**
 * Scope lookups to the Calculator root so other test files that
 * may render sibling apps (Notes, Mail, etc.) never bleed into
 * these assertions.
 */
function getRoot(): HTMLElement {
  return screen.getByTestId("calculator");
}

function getDisplay(): HTMLElement {
  return screen.getByTestId("calculator-display");
}

function getDisplayValue(): HTMLElement {
  return screen.getByTestId("calculator-display-value");
}

/**
 * Click a keypad button by its `CalculatorKey` value. The data-key
 * attribute on each button is exactly the {@link CalculatorKey}
 * value, so this lookup is independent of label text.
 */
function clickKey(key: string): void {
  fireEvent.click(screen.getByTestId(`calculator-key-${key}`));
}

describe("Calculator", () => {
  beforeEach(() => {
    // jsdom keeps the DOM around between tests; jsdom does not
    // bubble keyboard events to a real focus tree, so we also
    // dispatch them manually when needed.
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the calculator root, display, and keypad", () => {
    render(<Calculator />);
    expect(getRoot()).toBeInTheDocument();
    expect(getDisplay()).toBeInTheDocument();
    expect(screen.getByTestId("calculator-keypad")).toBeInTheDocument();
  });

  it("starts with display '0' and no pending operator", () => {
    render(<Calculator />);
    expect(getDisplayValue().textContent).toBe("0");
    expect(getRoot().getAttribute("data-pending-operator")).toBe("");
    expect(getRoot().getAttribute("data-error")).toBe("false");
    expect(getRoot().getAttribute("data-display")).toBe("0");
  });

  it("renders one button per entry in the CALCULATOR_KEYPAD", () => {
    render(<Calculator />);
    const keypad = screen.getByTestId("calculator-keypad");
    // Each button carries a data-key attribute, so we just count
    // those — no need to enumerate the keypad by hand here.
    expect(keypad.querySelectorAll("[data-key]")).toHaveLength(19);
  });

  it("renders the expected operator labels (÷, ×, −, +)", () => {
    render(<Calculator />);
    expect(screen.getByTestId("calculator-key-/").textContent).toBe("\u00F7");
    expect(screen.getByTestId("calculator-key-*").textContent).toBe("\u00D7");
    expect(screen.getByTestId("calculator-key--").textContent).toBe("\u2212");
    expect(screen.getByTestId("calculator-key-+").textContent).toBe("+");
  });

  it("renders AC, ±, and % function keys", () => {
    render(<Calculator />);
    expect(screen.getByTestId("calculator-key-C").textContent).toBe("AC");
    expect(screen.getByTestId("calculator-key-+/-").textContent).toBe("\u00B1");
    expect(screen.getByTestId("calculator-key-%").textContent).toBe("%");
  });

  it("provides accessible labels for operator and function keys", () => {
    render(<Calculator />);
    expect(screen.getByTestId("calculator-key-+").getAttribute("aria-label")).toBe("Add");
    expect(screen.getByTestId("calculator-key--").getAttribute("aria-label")).toBe("Subtract");
    expect(screen.getByTestId("calculator-key-*").getAttribute("aria-label")).toBe("Multiply");
    expect(screen.getByTestId("calculator-key-/").getAttribute("aria-label")).toBe("Divide");
    expect(screen.getByTestId("calculator-key-=").getAttribute("aria-label")).toBe("Equals");
    expect(screen.getByTestId("calculator-key-C").getAttribute("aria-label")).toBe("Clear");
    expect(screen.getByTestId("calculator-key-+/-").getAttribute("aria-label")).toBe(
      "Toggle sign"
    );
    expect(screen.getByTestId("calculator-key-%").getAttribute("aria-label")).toBe(
      "Percent"
    );
  });

  it("appends digit clicks to the display", () => {
    render(<Calculator />);
    clickKey("1");
    clickKey("2");
    clickKey("3");
    expect(getDisplayValue().textContent).toBe("123");
  });

  it("replaces a leading zero with the first non-zero digit", () => {
    render(<Calculator />);
    clickKey("0");
    clickKey("5");
    expect(getDisplayValue().textContent).toBe("5");
  });

  it("evaluates a 2 + 3 = 5 sequence through button clicks", () => {
    render(<Calculator />);
    clickKey("2");
    clickKey("+");
    clickKey("3");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("5");
  });

  it("evaluates 9 - 4 = 5", () => {
    render(<Calculator />);
    clickKey("9");
    clickKey("-");
    clickKey("4");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("5");
  });

  it("evaluates 6 * 7 = 42", () => {
    render(<Calculator />);
    clickKey("6");
    clickKey("*");
    clickKey("7");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("42");
  });

  it("evaluates 8 / 2 = 4", () => {
    render(<Calculator />);
    clickKey("8");
    clickKey("/");
    clickKey("2");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("4");
  });

  it("chains multiple operations: 2 + 3 + 4 = 9", () => {
    render(<Calculator />);
    clickKey("2");
    clickKey("+");
    clickKey("3");
    clickKey("+");
    clickKey("4");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("9");
  });

  it("starts a new entry after equals (does not append to result)", () => {
    render(<Calculator />);
    clickKey("2");
    clickKey("+");
    clickKey("3");
    clickKey("=");
    // Result is 5; pressing 9 should not yield "59".
    clickKey("9");
    expect(getDisplayValue().textContent).toBe("9");
  });

  it("replaces a pending operator when pressed twice (5 + - 3 = 2)", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("+");
    // No second operand yet; pressing `-` should replace `+` rather
    // than evaluating `5 + 0`.
    clickKey("-");
    clickKey("3");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("2");
  });

  it("surfaces divide-by-zero as 'Error' on the display", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("/");
    clickKey("0");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("Error");
    expect(getRoot().getAttribute("data-error")).toBe("true");
  });

  it("locks further input after a divide-by-zero", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("/");
    clickKey("0");
    clickKey("=");
    // Try to continue calculating — every key should be a no-op
    // while the calculator is in the error state.
    clickKey("7");
    clickKey("+");
    clickKey("8");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("Error");
  });

  it("recovers from the error state via Clear", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("/");
    clickKey("0");
    clickKey("=");
    clickKey("C");
    expect(getDisplayValue().textContent).toBe("0");
    expect(getRoot().getAttribute("data-error")).toBe("false");
    expect(getRoot().getAttribute("data-pending-operator")).toBe("");
  });

  it("clears a partial entry back to '0'", () => {
    render(<Calculator />);
    clickKey("9");
    clickKey("9");
    clickKey("9");
    clickKey("C");
    expect(getDisplayValue().textContent).toBe("0");
  });

  it("clears a staged accumulator and pending operator", () => {
    render(<Calculator />);
    clickKey("2");
    clickKey("+");
    expect(getRoot().getAttribute("data-pending-operator")).toBe("+");
    clickKey("C");
    expect(getRoot().getAttribute("data-pending-operator")).toBe("");
    expect(getDisplayValue().textContent).toBe("0");
  });

  it("shows the pending-operator glyph above the display", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("+");
    expect(
      screen.getByTestId("calculator-display-pending").textContent
    ).toBe("+");
    clickKey("3");
    clickKey("=");
    expect(
      screen.getByTestId("calculator-display-pending").textContent
    ).toBe("");
  });

  it("enters decimals through the '.' button", () => {
    render(<Calculator />);
    clickKey("1");
    clickKey(".");
    clickKey("5");
    expect(getDisplayValue().textContent).toBe("1.5");
  });

  it("does not add a second decimal point", () => {
    render(<Calculator />);
    clickKey("1");
    clickKey(".");
    clickKey(".");
    clickKey("5");
    expect(getDisplayValue().textContent).toBe("1.5");
  });

  it("supports the ± button on the current entry", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("+/-");
    expect(getDisplayValue().textContent).toBe("-5");
    clickKey("+/-");
    expect(getDisplayValue().textContent).toBe("5");
  });

  it("supports the % button on the current entry", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("0");
    clickKey("%");
    expect(getDisplayValue().textContent).toBe("0.5");
  });

  it("negates before the first digit and preserves the accumulator", () => {
    render(<Calculator />);
    clickKey("2");
    clickKey("+");
    clickKey("+/-");
    clickKey("3");
    clickKey("=");
    expect(getDisplayValue().textContent).toBe("-1");
  });

  it("keeps the keypad mounted across state changes", () => {
    render(<Calculator />);
    clickKey("1");
    clickKey("+");
    clickKey("2");
    clickKey("=");
    // The keypad container is rendered once at mount and never
    // unmounted, so the same node still satisfies the lookup.
    expect(screen.getByTestId("calculator-keypad")).toBeInTheDocument();
  });

  it("hides the pending-operator glyph in the error state", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("/");
    clickKey("0");
    clickKey("=");
    expect(
      screen.getByTestId("calculator-display-pending").textContent
    ).toBe("");
  });

  it("supports keyboard input for digits, operators, and Enter", () => {
    render(<Calculator />);
    // jsdom dispatches KeyboardEvent on window when no element has
    // focus, which matches the Calculator's global listener.
    fireEvent.keyDown(window, { key: "2" });
    fireEvent.keyDown(window, { key: "+" });
    fireEvent.keyDown(window, { key: "3" });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(getDisplayValue().textContent).toBe("5");
  });

  it("treats Escape and Backspace as Clear", () => {
    render(<Calculator />);
    clickKey("9");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(getDisplayValue().textContent).toBe("0");

    clickKey("9");
    fireEvent.keyDown(window, { key: "Backspace" });
    expect(getDisplayValue().textContent).toBe("0");
  });

  it("ignores keyboard input when a focused input element is active", () => {
    render(
      <div>
        <input data-testid="other-input" />
        <Calculator />
      </div>
    );
    const input = screen.getByTestId("other-input");
    input.focus();
    fireEvent.keyDown(input, { key: "2" });
    // Calculator should not have responded.
    expect(getDisplayValue().textContent).toBe("0");
  });

  it("uses an initialState prop to boot into a deterministic state", () => {
    render(
      <Calculator
        initialState={{
          display: "42",
          accumulator: 42,
          pendingOperator: null,
          waitingForOperand: true,
          error: false,
        }}
      />
    );
    expect(getDisplayValue().textContent).toBe("42");
    // The next digit press should replace rather than append.
    clickKey("7");
    expect(getDisplayValue().textContent).toBe("7");
  });

  it("exposes the displayed value via the root data-display attribute", () => {
    render(<Calculator />);
    clickKey("4");
    clickKey("2");
    expect(getRoot().getAttribute("data-display")).toBe("42");
  });

  it("marks the display with an error class when divide-by-zero occurs", () => {
    render(<Calculator />);
    clickKey("5");
    clickKey("/");
    clickKey("0");
    clickKey("=");
    expect(getDisplay().className).toContain("calculator__display--error");
    // Recovering via Clear removes the error class.
    clickKey("C");
    expect(getDisplay().className).not.toContain("calculator__display--error");
  });

  it("supports a long chain 10 + 1 - 2 * 3 / 4 = 6.75", () => {
    render(<Calculator />);
    clickKey("1");
    clickKey("0");
    clickKey("+");
    clickKey("1");
    clickKey("-");
    clickKey("2");
    clickKey("*");
    clickKey("3");
    clickKey("/");
    clickKey("4");
    clickKey("=");
    // Left-to-right evaluation: ((10+1)-2)*3/4 = 9*3/4 = 27/4 = 6.75
    expect(getDisplayValue().textContent).toBe("6.75");
  });

  it("renders the 0 key with a gridColumn span style", () => {
    render(<Calculator />);
    const zero = screen.getByTestId("calculator-key-0") as HTMLButtonElement;
    expect(zero.style.gridColumn).toBe("span 2");
  });

  it("applies digit / operator / function kind classes to each button", () => {
    render(<Calculator />);
    const seven = screen.getByTestId("calculator-key-7");
    expect(seven.className).toContain("calculator__key--digit");
    const plus = screen.getByTestId("calculator-key-+");
    expect(plus.className).toContain("calculator__key--operator");
    const clear = screen.getByTestId("calculator-key-C");
    expect(clear.className).toContain("calculator__key--function");
    const dot = screen.getByTestId("calculator-key-.");
    expect(dot.className).toContain("calculator__key--decimal");
  });
});
