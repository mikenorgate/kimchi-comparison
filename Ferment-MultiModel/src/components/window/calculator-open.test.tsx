import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";

/**
 * Behavioural test for Step 5 of Phase 7: clicking the Calculator
 * Dock icon must mount a Calculator window whose body is the real
 * Calculator UI (display + keypad), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when
 * an app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Calculator: click the Calculator Dock icon and verify the real
 * Calculator UI is present inside the window layer.
 */
describe("Calculator opens from the Dock", () => {
  it("clicking the Calculator Dock icon opens a Calculator window with the real Calculator UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calcDockButton = within(dock).getByRole("button", {
      name: getApp("calculator")?.name ?? "Calculator",
    });

    // Before launch, Calculator is not running.
    expect(calcDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(calcDockButton);

    // After launch, the Dock should mark Calculator as running.
    expect(calcDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Calculator window frame.
    const layer = screen.getByTestId("window-layer");
    const calcContent = within(layer).getByTestId("app-content-calculator");

    // Inside that frame, the real Calculator component must be
    // present (not the window-manager placeholder body).
    expect(within(calcContent).getByTestId("calculator")).toBeInTheDocument();
    expect(
      within(calcContent).queryByTestId("app-placeholder-calculator")
    ).not.toBeInTheDocument();

    // The two regions the user expects from the Calculator window:
    // a display showing the current value, and a keypad of buttons.
    expect(
      within(calcContent).getByTestId("calculator-display")
    ).toBeInTheDocument();
    expect(
      within(calcContent).getByTestId("calculator-display-value")
    ).toBeInTheDocument();
    expect(
      within(calcContent).getByTestId("calculator-keypad")
    ).toBeInTheDocument();
  });

  it("renders an empty display on first launch (value 0) and exposes the four arithmetic operators", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calcDockButton = within(dock).getByRole("button", {
      name: getApp("calculator")?.name ?? "Calculator",
    });
    fireEvent.click(calcDockButton);

    const layer = screen.getByTestId("window-layer");
    const calcContent = within(layer).getByTestId("app-content-calculator");

    const display = within(calcContent).getByTestId("calculator-display-value");
    expect(display.textContent).toBe("0");

    // The four arithmetic operator keys (+, -, *, /) and the equals
    // key must each be rendered as a distinct button inside the
    // keypad. Use the data-testid selector — the buttons carry
    // spelled-out aria-labels (Add, Subtract, Equals, etc.) while
    // the data-testid mirrors the underlying CalculatorKey string.
    const keypad = within(calcContent).getByTestId("calculator-keypad");
    for (const op of ["+", "-", "*", "/", "="]) {
      expect(within(keypad).getByTestId(`calculator-key-${op}`))
        .toBeInTheDocument();
    }
  });

  it("typing a simple expression updates the display with the evaluated result", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calcDockButton = within(dock).getByRole("button", {
      name: getApp("calculator")?.name ?? "Calculator",
    });
    fireEvent.click(calcDockButton);

    const layer = screen.getByTestId("window-layer");
    const calcContent = within(layer).getByTestId("app-content-calculator");
    const keypad = within(calcContent).getByTestId("calculator-keypad");

    // Compute 7 + 5 = 12 by pressing digit + operator + digit + equals.
    // Use the calculator-key-<key> testid selector so we don't depend
    // on the button's aria-label (the operators carry spelled-out
    // labels like "Add"/"Subtract"/"Equals").
    const press = (key: string): void => {
      fireEvent.click(within(keypad).getByTestId(`calculator-key-${key}`));
    };
    press("7");
    press("+");
    press("5");
    press("=");

    const display = within(calcContent).getByTestId("calculator-display-value");
    expect(display.textContent).toBe("12");
  });

  it("does not duplicate the Calculator window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calcDockButton = within(dock).getByRole("button", {
      name: getApp("calculator")?.name ?? "Calculator",
    });

    fireEvent.click(calcDockButton);
    fireEvent.click(calcDockButton);
    fireEvent.click(calcDockButton);

    // Exactly one Calculator window should exist regardless of how
    // many times the user clicked the icon — Dock clicks on a running
    // app focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-calculator"))
      .toHaveLength(1);
  });
});
