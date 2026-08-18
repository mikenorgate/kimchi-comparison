import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";

/**
 * Behavioural test for Step 5 of Phase 7: clicking the Terminal Dock
 * icon must mount a Terminal window whose body is the real Terminal UI
 * (scrollback + prompt), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when
 * an app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Terminal: click the Terminal Dock icon and verify the real Terminal
 * UI is present inside the window layer.
 */
describe("Terminal opens from the Dock", () => {
  it("clicking the Terminal Dock icon opens a Terminal window with the real Terminal UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const terminalDockButton = within(dock).getByRole("button", {
      name: getApp("terminal")?.name ?? "Terminal",
    });

    // Before launch, Terminal is not running.
    expect(terminalDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(terminalDockButton);

    // After launch, the Dock should mark Terminal as running.
    expect(terminalDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Terminal window frame.
    const layer = screen.getByTestId("window-layer");
    const terminalContent = within(layer).getByTestId("app-content-terminal");

    // Inside that frame, the real Terminal component must be present
    // (not the window-manager placeholder body).
    expect(within(terminalContent).getByTestId("terminal")).toBeInTheDocument();
    expect(
      within(terminalContent).queryByTestId("app-placeholder-terminal")
    ).not.toBeInTheDocument();

    // The three regions the user expects from the Terminal window:
    // a scrollback, a prompt line, and an active input field.
    expect(
      within(terminalContent).getByTestId("terminal-scrollback")
    ).toBeInTheDocument();
    expect(
      within(terminalContent).getByTestId("terminal-prompt-line")
    ).toBeInTheDocument();
    expect(
      within(terminalContent).getByTestId("terminal-input")
    ).toBeInTheDocument();
  });

  it("renders the default prompt on first launch and exposes a writable input", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const terminalDockButton = within(dock).getByRole("button", {
      name: getApp("terminal")?.name ?? "Terminal",
    });
    fireEvent.click(terminalDockButton);

    const layer = screen.getByTestId("window-layer");
    const terminalContent = within(layer).getByTestId("app-content-terminal");

    const prompt = within(terminalContent).getByTestId("terminal-prompt");
    expect(prompt.textContent).toBeTruthy();

    const input = within(terminalContent).getByTestId(
      "terminal-input"
    ) as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("typing a command and pressing Enter echoes it into the scrollback", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const terminalDockButton = within(dock).getByRole("button", {
      name: getApp("terminal")?.name ?? "Terminal",
    });
    fireEvent.click(terminalDockButton);

    const layer = screen.getByTestId("window-layer");
    const terminalContent = within(layer).getByTestId("app-content-terminal");
    const scrollback = within(terminalContent).getByTestId(
      "terminal-scrollback"
    );

    const input = within(terminalContent).getByTestId(
      "terminal-input"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // After pressing Enter, the typed command must appear echoed in
    // the scrollback.
    expect(scrollback.textContent ?? "").toContain("help");
  });

  it("does not duplicate the Terminal window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const terminalDockButton = within(dock).getByRole("button", {
      name: getApp("terminal")?.name ?? "Terminal",
    });

    fireEvent.click(terminalDockButton);
    fireEvent.click(terminalDockButton);
    fireEvent.click(terminalDockButton);

    // Exactly one Terminal window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-terminal")).toHaveLength(
      1
    );
  });
});
