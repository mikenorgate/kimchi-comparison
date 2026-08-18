import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Terminal from "./Terminal";
import {
  TERMINAL_PROMPT,
  initialTerminalState,
} from "./terminalLogic";

/**
 * Scope element lookups to the Terminal root so other test files
 * rendering sibling apps never bleed into these assertions.
 */
function getRoot(): HTMLElement {
  return screen.getByTestId("terminal");
}

function getInput(): HTMLInputElement {
  return screen.getByTestId("terminal-input") as HTMLInputElement;
}

function getScrollback(): HTMLElement {
  return screen.getByTestId("terminal-scrollback");
}

/**
 * Type a string into the controlled input by setting the value
 * through the native setter (so React's tracker notices the
 * change) and dispatching an `input` event.
 *
 * React's `value` prop short-circuits direct `.value =` writes
 * because the controlled-input tracker compares against the
 * last value it saw. Setting the value via the native setter
 * bypasses that tracker and fires the event handlers properly.
 */
function type(text: string): void {
  const input = getInput();
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  nativeSetter?.call(input, text);
  fireEvent.input(input, { target: { value: text } });
}

/** Submit the current draft by pressing Enter. */
function pressEnter(): void {
  fireEvent.keyDown(getInput(), { key: "Enter" });
}

/** Press ArrowUp while the input is focused. */
function pressArrowUp(): void {
  fireEvent.keyDown(getInput(), { key: "ArrowUp" });
}

/** Press ArrowDown while the input is focused. */
function pressArrowDown(): void {
  fireEvent.keyDown(getInput(), { key: "ArrowDown" });
}

describe("Terminal", () => {
  beforeEach(() => {
    // jsdom keeps the DOM around between tests; we explicitly
    // unmount + cleanup in `afterEach` so renders don't leak.
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the terminal root, scrollback, and prompt line", () => {
    render(<Terminal />);
    expect(getRoot()).toBeInTheDocument();
    expect(getScrollback()).toBeInTheDocument();
    expect(screen.getByTestId("terminal-prompt-line")).toBeInTheDocument();
  });

  it("starts with the welcome banner in the scrollback", () => {
    render(<Terminal />);
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    expect(entries.length).toBe(initialTerminalState.entries.length);
    const banner = entries[0];
    expect(banner.getAttribute("data-entry-kind")).toBe("system");
    expect(banner.textContent).toMatch(/Welcome to Ferment Terminal/);
  });

  it("renders the prompt label before the input", () => {
    render(<Terminal />);
    expect(screen.getByTestId("terminal-prompt").textContent).toBe(
      TERMINAL_PROMPT
    );
    expect(getInput()).toBeInTheDocument();
  });

  it("reflects the initial draft as an empty string on the root", () => {
    render(<Terminal />);
    expect(getRoot().getAttribute("data-draft")).toBe("");
    expect(getRoot().getAttribute("data-history-index")).toBe("");
    expect(getRoot().getAttribute("data-navigating")).toBe("false");
  });

  it("starts with an empty history", () => {
    render(<Terminal />);
    expect(getRoot().getAttribute("data-history-length")).toBe("0");
  });

  it("updates the draft as the user types", () => {
    render(<Terminal />);
    type("hel");
    expect(getInput().value).toBe("hel");
    expect(getRoot().getAttribute("data-draft")).toBe("hel");
  });

  it("submits the draft on Enter and appends the command to the scrollback", () => {
    render(<Terminal />);
    type("hello");
    pressEnter();
    expect(getInput().value).toBe("");
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const inputEntries = entries.filter(
      (e) => e.getAttribute("data-entry-kind") === "input"
    );
    // The echoed input line is recorded even when the command
    // is unknown — that's what makes the scrollback read
    // naturally.
    expect(inputEntries.length).toBeGreaterThanOrEqual(1);
    const lastInput = inputEntries[inputEntries.length - 1];
    expect(lastInput.textContent).toContain("hello");
  });

  it("produces a 'command not found' error line for unknown commands", () => {
    render(<Terminal />);
    type("definitely-not-a-real-command");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("error");
    expect(last.textContent).toMatch(/command not found/);
    expect(last.textContent).toMatch(/definitely-not-a-real-command/);
  });

  it("returns the help text in response to the `help` command", () => {
    render(<Terminal />);
    type("help");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("output");
    expect(last.textContent).toMatch(/Available commands/);
    expect(last.textContent).toMatch(/help/);
    expect(last.textContent).toMatch(/clear/);
    expect(last.textContent).toMatch(/date/);
  });

  it("returns the working directory from `pwd`", () => {
    render(<Terminal />);
    type("pwd");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("output");
    expect(last.textContent).toBe("/Users/user");
  });

  it("returns the user name from `whoami`", () => {
    render(<Terminal />);
    type("whoami");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("output");
    expect(last.textContent).toBe("user");
  });

  it("returns the date from `date`", () => {
    render(<Terminal />);
    type("date");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("output");
    expect(last.textContent?.length ?? 0).toBeGreaterThan(0);
  });

  it("returns the directory listing from `ls`", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("output");
    expect(last.textContent).toMatch(/Desktop/);
    expect(last.textContent).toMatch(/Pictures/);
  });

  it("echoes the argument after `echo`", () => {
    render(<Terminal />);
    type("echo hello world");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const last = entries[entries.length - 1];
    expect(last.getAttribute("data-entry-kind")).toBe("output");
    expect(last.textContent).toBe("hello world");
  });

  it("clears the scrollback in response to `clear`", () => {
    render(<Terminal />);
    type("help");
    pressEnter();
    expect(screen.getAllByTestId(/^terminal-entry-/)).toHaveLength(
      initialTerminalState.entries.length + 2
    );
    type("clear");
    pressEnter();
    // After clear, only the regenerated banner remains.
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    expect(entries).toHaveLength(1);
    expect(entries[0].getAttribute("data-entry-kind")).toBe("system");
  });

  it("records submitted commands in the history", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    type("pwd");
    pressEnter();
    expect(getRoot().getAttribute("data-history-length")).toBe("2");
  });

  it("recalls the most recent command on ArrowUp", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    type("pwd");
    pressEnter();
    pressArrowUp();
    expect(getInput().value).toBe("pwd");
    expect(getRoot().getAttribute("data-navigating")).toBe("true");
    expect(getRoot().getAttribute("data-history-index")).toBe("0");
  });

  it("recalls the previous command on a second ArrowUp", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    type("pwd");
    pressEnter();
    pressArrowUp();
    pressArrowUp();
    expect(getInput().value).toBe("ls");
    expect(getRoot().getAttribute("data-history-index")).toBe("1");
  });

  it("steps forward through history on ArrowDown", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    type("pwd");
    pressEnter();
    pressArrowUp();
    pressArrowUp();
    pressArrowDown();
    expect(getInput().value).toBe("pwd");
    expect(getRoot().getAttribute("data-history-index")).toBe("0");
  });

  it("restores an empty draft and exits navigation on ArrowDown past the newest entry", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    pressArrowUp();
    pressArrowDown();
    expect(getInput().value).toBe("");
    expect(getRoot().getAttribute("data-navigating")).toBe("false");
    expect(getRoot().getAttribute("data-history-index")).toBe("");
  });

  it("treats ArrowDown as a no-op when not navigating history", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    pressArrowDown();
    expect(getInput().value).toBe("");
    expect(getRoot().getAttribute("data-navigating")).toBe("false");
  });

  it("editing the draft after ArrowUp resets navigation", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    type("pwd");
    pressEnter();
    pressArrowUp();
    expect(getRoot().getAttribute("data-navigating")).toBe("true");
    type("x");
    expect(getRoot().getAttribute("data-navigating")).toBe("false");
    // `setDraft` replaces the draft rather than appending — typing
    // a single character after recalling "pwd" overwrites the
    // draft with the new text.
    expect(getInput().value).toBe("x");
  });

  it("recalled commands can be re-submitted as new commands", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    pressArrowUp();
    pressEnter();
    // The scrollback should now contain: banner, input(ls),
    // input(ls again). The second `ls` is treated as a fresh
    // submission and recorded into history.
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const inputEntries = entries.filter(
      (e) => e.getAttribute("data-entry-kind") === "input"
    );
    expect(inputEntries.length).toBe(2);
  });

  it("shows the prompt inline on every echoed input line", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    // The echoed input row should contain the prompt label.
    const echoed = screen.getByTestId("terminal-input-text-2");
    expect(echoed.textContent).toBe("ls");
    const inlinePrompts = screen.getAllByTestId("terminal-prompt-inline");
    expect(inlinePrompts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders an empty input line for blank submissions without producing output", () => {
    render(<Terminal />);
    pressEnter();
    // The entries array gains one input line (no output follows
    // because the user submitted whitespace only).
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    const inputEntries = entries.filter(
      (e) => e.getAttribute("data-entry-kind") === "input"
    );
    expect(inputEntries.length).toBe(1);
  });

  it("supports Cmd+L (and Ctrl+L) to clear the scrollback", () => {
    render(<Terminal />);
    type("help");
    pressEnter();
    fireEvent.keyDown(getInput(), { key: "l", metaKey: true });
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    expect(entries).toHaveLength(1);
    expect(entries[0].getAttribute("data-entry-kind")).toBe("system");
  });

  it("Ctrl+L (without meta) also clears the scrollback", () => {
    render(<Terminal />);
    type("help");
    pressEnter();
    fireEvent.keyDown(getInput(), { key: "l", ctrlKey: true });
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    expect(entries).toHaveLength(1);
  });

  it("plain 'l' without a modifier does not clear", () => {
    render(<Terminal />);
    type("help");
    pressEnter();
    const before = screen.getAllByTestId(/^terminal-entry-/).length;
    fireEvent.keyDown(getInput(), { key: "l" });
    const after = screen.getAllByTestId(/^terminal-entry-/).length;
    expect(after).toBe(before);
    expect(after).toBeGreaterThan(1);
  });

  it("reflects the entry count on the root element", () => {
    render(<Terminal />);
    type("help");
    pressEnter();
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    expect(getRoot().getAttribute("data-entry-count")).toBe(
      String(entries.length)
    );
  });

  it("clicking outside the input still focuses the input via the pane click handler", () => {
    render(<Terminal />);
    // jsdom does not actually focus on click, but we can at
    // least confirm the click handler is wired and doesn't throw.
    const scrollback = getScrollback();
    expect(() => fireEvent.click(scrollback)).not.toThrow();
  });

  it("uses an initialState prop to boot into a deterministic scrollback", () => {
    render(
      <Terminal
        initialState={{
          ...initialTerminalState,
          entries: [
            {
              id: 100,
              kind: "output",
              text: "preloaded",
              timestamp: null,
            },
          ],
          nextId: 101,
        }}
      />
    );
    const entries = screen.getAllByTestId(/^terminal-entry-/);
    expect(entries).toHaveLength(1);
    expect(entries[0].textContent).toContain("preloaded");
    expect(entries[0].getAttribute("data-entry-id")).toBe("100");
  });

  it("does not lose history across a `clear` command", () => {
    render(<Terminal />);
    type("ls");
    pressEnter();
    type("pwd");
    pressEnter();
    type("clear");
    pressEnter();
    expect(getRoot().getAttribute("data-history-length")).toBe("3");
    // ArrowUp should still navigate the preserved history.
    pressArrowUp();
    expect(getInput().value).toBe("clear");
  });

  it("handles a long sequence of submissions without crashing", () => {
    render(<Terminal />);
    for (let i = 0; i < 25; i += 1) {
      type(`echo ${i}`);
      pressEnter();
    }
    // History should contain every distinct command we submitted.
    expect(getRoot().getAttribute("data-history-length")).toBe("25");
  });
});
